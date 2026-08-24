"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DocumentTestResult } from "@/lib/document-types";

const RESULT_KEY_PREFIX = "document-test-result-";

function normalizeStoredResult(raw: string): DocumentTestResult | null {
  const parsed = JSON.parse(raw) as Partial<DocumentTestResult>;
  if (typeof parsed.correctCount !== "number" || typeof parsed.totalAutoGraded !== "number") return null;
  const totalPoints = typeof parsed.totalPoints === "number" ? parsed.totalPoints : parsed.totalAutoGraded;
  const earnedPoints = typeof parsed.earnedPoints === "number" ? parsed.earnedPoints : parsed.correctCount;
  return { ...parsed, totalPoints, earnedPoints } as DocumentTestResult;
}

/**
 * Trang kết quả của bài kiểm tra (tài liệu loại 'test').
 * Đọc kết quả tạm từ sessionStorage — không có database lưu điểm.
 */
export default function ExamResultView({ documentId, title }: { documentId: string; title: string }) {
  const [result, setResult] = useState<DocumentTestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${RESULT_KEY_PREFIX}${documentId}`);
      setResult(raw ? normalizeStoredResult(raw) : null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  if (loading) {
    return <p className="py-20 text-center text-slate-500 dark:text-slate-400">Đang tải kết quả…</p>;
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-4 text-4xl">🤔</p>
        <h1 className="mb-2 text-xl font-bold dark:text-white">Chưa có kết quả nào</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Bạn chưa nộp bài kiểm tra này trên trình duyệt hiện tại.</p>
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
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={`/quiz/${documentId}`} className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700">
          🔄 Làm lại
        </Link>
        <Link href="/quiz" className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#0d1322]">
          📋 Chọn bài khác
        </Link>
      </div>
      <p className="mt-4 text-xs text-slate-400">Kết quả chỉ lưu tạm trên trình duyệt của bạn.</p>
    </div>
  );
}
