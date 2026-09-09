"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DocumentTestResult, DocumentTestAnswers } from "@/lib/document-types";
import { loadExamResult, saveExamResult } from "@/lib/exam-draft";
import { useProfile } from "./ProfileProvider";

/**
 * Trang kết quả của bài kiểm tra (tài liệu loại 'test').
 * Ưu tiên đọc kết quả từ localStorage theo userId, nếu chưa có thì nạp từ Database.
 */
export default function ExamResultView({ documentId, title }: { documentId: string; title: string }) {
  const { userId } = useProfile();
  const [result, setResult] = useState<DocumentTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchResult() {
      // 1. Kiểm tra bộ nhớ local theo tài khoản
      const localRes = loadExamResult(documentId, userId);
      if (localRes) {
        if (isMounted) {
          setResult(localRes);
          setLoading(false);
        }
        return;
      }

      // 2. Nếu chưa có trên máy và đã đăng nhập, nạp từ Database Supabase
      if (userId) {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          if (supabase) {
            const { data, error } = await supabase
              .from("user_exam_results")
              .select("*")
              .eq("user_id", userId)
              .eq("document_id", documentId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (!error && data && isMounted) {
              const dbResult: DocumentTestResult = {
                answers: (data.answers as DocumentTestAnswers) || {},
                correctCount: data.correct_count,
                totalAutoGraded: data.total_questions,
                earnedPoints: Number(data.earned_points),
                totalPoints: Number(data.total_points),
                percent: data.percent,
                score: Number(data.score),
              };
              setResult(dbResult);
              saveExamResult(documentId, dbResult, userId);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Lỗi khi nạp kết quả bài thi từ Database:", e);
        }
      }

      if (isMounted) {
        setResult(null);
        setLoading(false);
      }
    }

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [documentId, userId]);

  if (loading) {
    return <p className="py-20 text-center text-slate-500 dark:text-slate-400">Đang tải kết quả…</p>;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-4 text-4xl">🤔</p>
        <h1 className="mb-2 text-xl font-bold dark:text-white">Chưa có kết quả nào</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Bạn chưa làm hoặc chưa nộp bài kiểm tra này.</p>
        <Link href={`/quiz/${documentId}`} className="inline-block rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">
          Làm bài ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-purple-200 bg-white p-8 text-center shadow-sm transition-colors dark:border-purple-900 dark:bg-slate-900">
      <p className="text-4xl">{result.percent >= 50 ? "🎉" : "📖"}</p>
      <h1 className="mt-2 text-xl font-bold dark:text-white">Kết quả: {title}</h1>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <span className="rounded-2xl bg-purple-50 px-6 py-4 dark:bg-purple-950/40">
          <strong className="block text-4xl font-extrabold text-purple-700 dark:text-purple-300">{result.score.toFixed(1)}</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">thang điểm 10</span>
        </span>
        <span className="rounded-2xl bg-slate-50 px-6 py-4 dark:bg-slate-800">
          <strong className="block text-4xl font-extrabold dark:text-white">{result.percent}%</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            đạt {result.earnedPoints}/{result.totalPoints} điểm · đúng {result.correctCount}/{result.totalAutoGraded} ý
          </span>
        </span>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={`/quiz/${documentId}/in?mode=solution`}
          className="rounded-xl border border-indigo-300 bg-white px-6 py-3 font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
        >
          🖨 In đề & Lời giải (PDF)
        </Link>
        <Link href={`/quiz/${documentId}`} className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">
          🔄 Làm lại
        </Link>
        <Link href="/quiz" className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#0d1322]">
          📋 Chọn bài khác
        </Link>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        {userId ? "✓ Kết quả đã được lưu đồng bộ vào tài khoản của bạn." : "Kết quả chỉ lưu tạm trên trình duyệt của bạn."}
      </p>
    </div>
  );
}
