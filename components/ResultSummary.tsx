"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Quiz } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import LazyMathText from "./LazyMathText";

const letters = ["A", "B", "C", "D", "E", "F"];

export default function ResultSummary({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`quiz-result-${quiz.id}`);
      setAnswers(raw ? (JSON.parse(raw) as Record<string, string>) : null);
    } catch {
      setAnswers(null);
    } finally {
      setLoading(false);
    }
  }, [quiz.id]);

  if (loading) {
    return (
      <p className="py-20 text-center text-slate-500 dark:text-slate-400">
        Đang tải kết quả…
      </p>
    );
  }

  // Chưa có bài nộp (truy cập trực tiếp trang kết quả)
  if (!answers) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-4 text-4xl">🤔</p>
        <h1 className="mb-2 text-xl font-bold">Chưa có kết quả nào</h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
          Bạn chưa làm bài test này. Hãy bắt đầu để xem kết quả nhé!
        </p>
        <Link
          href={`/quiz/${quiz.id}`}
          className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Làm bài ngay
        </Link>
      </div>
    );
  }

  return <ResultBody quiz={quiz} answers={answers} />;
}

function ResultBody({
  quiz,
  answers,
}: {
  quiz: Quiz;
  answers: Record<string, string>;
}) {
  const total = quiz.questions.length;
  const correctCount = quiz.questions.filter(
    (q) => answers[q.id] === q.correctOptionId,
  ).length;
  const percent = Math.round((correctCount / total) * 100);

  // Lưu điểm tốt nhất vào tiến trình học tập (localStorage)
  const { setPercent } = useProgress();
  useEffect(() => {
    setPercent(`quiz:${quiz.id}`, percent);
  }, [quiz.id, percent, setPercent]);

  const feedback =
    percent === 100
      ? { emoji: "🏆", text: "Xuất sắc! Hoàn hảo tuyệt đối!", color: "text-emerald-600 dark:text-emerald-400" }
      : percent >= 80
        ? { emoji: "🎉", text: "Rất tốt! Tiếp tục phát huy nhé!", color: "text-emerald-600 dark:text-emerald-400" }
        : percent >= 50
          ? { emoji: "💪", text: "Khá ổn! Cần ôn thêm một chút.", color: "text-amber-600 dark:text-amber-400" }
          : { emoji: "📖", text: "Đừng nản! Hãy xem lại lý thuyết và thử lại.", color: "text-rose-600 dark:text-rose-400" };

  const circumference = 2 * Math.PI * 54;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tổng quan điểm */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-8 text-center shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="relative mx-auto mb-4 h-36 w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="10" className="stroke-slate-100 dark:stroke-slate-800" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="#6366f1"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - correctCount / total)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{percent}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {correctCount}/{total} câu đúng
            </span>
          </div>
        </div>

        <h1 className={`mb-1 text-xl font-bold ${feedback.color}`}>
          {feedback.emoji} {feedback.text}
        </h1>
        <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">{quiz.title}</p>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={`/quiz/${quiz.id}/in?mode=solution`}
            className="rounded-xl border border-indigo-300 bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
          >
            🖨 In đề & Lời giải (PDF)
          </Link>
          <Link
            href={`/quiz/${quiz.id}`}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700"
          >
            🔄 Làm lại
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#0d1322]"
          >
            📋 Chọn bài khác
          </Link>
        </div>
      </div>

      {/* Chi tiết từng câu */}
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Xem lại chi tiết</h2>
      <QuestionReview quiz={quiz} answers={answers} />
    </div>
  );
}

function QuestionReview({
  quiz,
  answers,
}: {
  quiz: Quiz;
  answers: Record<string, string>;
}) {
  return (
    <div className="grid gap-4">
      {quiz.questions.map((question, index) => {
        const userOptionId = answers[question.id];
        const isCorrect = userOptionId === question.correctOptionId;

        return (
          <div
            key={question.id}
            className={`rounded-2xl border bg-white p-5 shadow-xs transition-colors dark:bg-[#131b2e] ${
              isCorrect
                ? "border-emerald-200 dark:border-emerald-900/60"
                : "border-rose-200 dark:border-rose-900/60"
            }`}
          >
            <p className="mb-3 font-semibold text-slate-900 dark:text-white">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white dark:bg-slate-700">
                {index + 1}
              </span>
              {isCorrect ? "✅" : "❌"} <LazyMathText text={question.text} inline />
            </p>

            <div className="grid gap-1.5 pl-9 text-sm">
              {question.options.map((option, i) => {
                const isUserChoice = option.id === userOptionId;
                const isAnswer = option.id === question.correctOptionId;
                let cls = "border-slate-100 text-slate-500 dark:border-slate-800/80 dark:text-slate-400";
                if (isAnswer)
                  cls = "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-800/80 dark:bg-emerald-950/40 dark:text-emerald-300";
                else if (isUserChoice)
                  cls = "border-rose-300 bg-rose-50 text-rose-700 line-through dark:border-rose-800/80 dark:bg-rose-950/40 dark:text-rose-300";

                return (
                  <div key={option.id} className={`rounded-lg border px-3 py-2 ${cls}`}>
                    <strong>{letters[i]}.</strong> <LazyMathText text={option.text} inline />
                    {isAnswer && <span className="ml-2">← Đáp án đúng</span>}
                    {isUserChoice && !isAnswer && (
                      <span className="ml-2">(bạn chọn)</span>
                    )}
                  </div>
                );
              })}
            </div>

            {question.explanation && (
              <p className="mt-3 rounded-xl bg-indigo-50/80 px-4 py-2.5 pl-12 text-sm text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-200">
                💡 <strong>Giải thích:</strong>{" "}
                <LazyMathText text={question.explanation} inline />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
