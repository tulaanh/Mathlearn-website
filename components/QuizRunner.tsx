"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { Quiz } from "@/lib/types";
import QuestionCard from "./QuestionCard";
import ReportQuestionModal from "./ReportQuestionModal";

export default function QuizRunner({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reportingQuestion, setReportingQuestion] = useState<Quiz["questions"][number] | null>(null);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total;

  const handleSelect = useCallback((questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }, []);

  function handleSubmit() {
    if (!allAnswered) return;
    // Lưu đáp án tạm thời để trang kết quả đọc lại
    sessionStorage.setItem(
      `quiz-result-${quiz.id}`,
      JSON.stringify(answers),
    );
    router.push(`/quiz/${quiz.id}/result`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tiêu đề bài test */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href="/"
            className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            ← Về danh sách bài test
          </Link>
          <Link
            href={`/quiz/${quiz.id}/in`}
            className="flex items-center gap-1 rounded-lg border border-purple-300 bg-purple-50/60 px-3 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-950/70"
          >
            🖨 Xuất PDF / In đề
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{quiz.title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {quiz.subject} • {quiz.grade} • {total} câu hỏi
        </p>
      </div>

      {/* Danh sách câu hỏi */}
      <div className="grid gap-5">
        {quiz.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            selectedId={answers[question.id]}
            onSelect={handleSelect}
            onReport={(q) => setReportingQuestion(q)}
          />
        ))}
      </div>

      {/* Thanh nộp bài */}
      <div className="sticky bottom-4 mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-[#131b2e]/90">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Đã trả lời{" "}
            <strong className={allAnswered ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}>
              {answeredCount}/{total}
            </strong>{" "}
            câu
          </span>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`w-full rounded-xl px-6 py-3 font-semibold text-white shadow-xs transition-colors sm:w-auto ${
              allAnswered
                ? "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                : "cursor-not-allowed bg-slate-300 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            {allAnswered ? "✅ Nộp bài" : `Còn ${total - answeredCount} câu chưa trả lời`}
          </button>
        </div>
      </div>

      {/* Modal báo lỗi câu hỏi */}
      {reportingQuestion && (
        <ReportQuestionModal
          isOpen={!!reportingQuestion}
          question={{ id: reportingQuestion.id, text: reportingQuestion.text }}
          documentInfo={{ id: quiz.id, title: quiz.title }}
          onClose={() => setReportingQuestion(null)}
        />
      )}
    </div>
  );
}
