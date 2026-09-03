import { memo, useMemo, useState } from "react";
import Link from "next/link";
import type { DocumentTestResult, QuizQuestion, DocumentTestAnswers } from "@/lib/document-types";
import type { TestNextStep } from "@/lib/chapter-types";
import { isUnitCorrect, questionType, statementKey, statementsOf } from "@/lib/exam-scoring";

type ExamResultBannerProps = {
  documentId: string;
  result: DocumentTestResult;
  questions: QuizQuestion[];
  answers: DocumentTestAnswers;
  onRetry: () => void;
  nextStep?: TestNextStep | null;
  onSaveBatch: (qs: QuizQuestion[]) => number;
};

/** Bảng kết quả hiển thị sau khi nộp bài: điểm thang 10, phần trăm, số ý đúng và tính năng lưu câu hỏi. */
const ExamResultBanner = memo(function ExamResultBanner({
  documentId,
  result,
  questions,
  answers,
  onRetry,
  nextStep = null,
  onSaveBatch,
}: ExamResultBannerProps) {
  const [saveMessage, setSaveMessage] = useState("");

  const wrongQuestions = useMemo(() => {
    return questions.filter((q) => {
      const qType = questionType(q);
      if (qType === "essay") return false;
      if (qType === "true_false") {
        return !statementsOf(q).every((s) => isUnitCorrect(q, statementKey(q.id, s.id), answers));
      }
      return !isUnitCorrect(q, q.id, answers);
    });
  }, [questions, answers]);

  const handleSaveWrong = () => {
    if (!wrongQuestions.length) return;
    const count = onSaveBatch(wrongQuestions);
    setSaveMessage(`Đã lưu ${count} câu làm sai vào Ngân hàng câu hỏi!`);
    setTimeout(() => setSaveMessage(""), 5000);
  };

  const handleSaveAll = () => {
    if (!questions.length) return;
    const count = onSaveBatch(questions);
    setSaveMessage(`Đã lưu ${count} câu hỏi vào Ngân hàng câu hỏi!`);
    setTimeout(() => setSaveMessage(""), 5000);
  };

  const feedback =
    result.percent === 100
      ? { emoji: "🏆", text: "Xuất sắc! Hoàn hảo tuyệt đối!", color: "text-emerald-600 dark:text-emerald-400" }
      : result.percent >= 80
        ? { emoji: "🎉", text: "Rất tốt! Tiếp tục phát huy nhé!", color: "text-emerald-600 dark:text-emerald-400" }
        : result.percent >= 50
          ? { emoji: "💪", text: "Khá ổn! Cần ôn thêm một chút.", color: "text-amber-600 dark:text-amber-400" }
          : { emoji: "📖", text: "Đừng nản! Hãy xem lại tài liệu và thử lại.", color: "text-rose-600 dark:text-rose-400" };

  const nav = nextStep?.navigation ?? null;
  const nextUrl = nav?.nextItem?.url ?? (nav?.nextChapter ? `/chuong/${nav.nextChapter.id}` : nav ? `/chuong/${nav.chapterId}` : null);
  const nextLabel = nav?.nextItem
    ? `➡️ Bài tiếp theo: ${nav.nextItem.title}`
    : nav?.nextChapter
      ? "🎉 Hoàn thành chương! Sang chương kế tiếp →"
      : nav
        ? "🎉 Hoàn thành chương! Xem lại chương →"
        : null;

  return (
    <section className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 text-center shadow-sm dark:border-purple-900 dark:from-purple-950/30 dark:to-indigo-950/30 sm:p-8">
      <p className="text-4xl">{feedback.emoji}</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Đã nộp bài — kết quả của bạn</h2>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
          <strong className={`block text-4xl font-extrabold ${feedback.color}`}>{result.score.toFixed(1)}</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">thang điểm 10</span>
        </span>
        <span className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
          <strong className="block text-4xl font-extrabold text-slate-900 dark:text-white">{result.percent}%</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            đạt {result.earnedPoints}/{result.totalPoints} điểm · đúng {result.correctCount}/{result.totalAutoGraded} ý
          </span>
        </span>
      </div>
      <p className={`mt-4 text-sm font-semibold ${feedback.color}`}>{feedback.text}</p>

      {/* Tiện ích lưu câu hỏi vào ngân hàng câu hỏi */}
      <div className="mt-6 rounded-2xl border border-indigo-200/80 bg-white/90 p-4 text-left shadow-2xs backdrop-blur-xs dark:border-indigo-900/60 dark:bg-slate-900/90">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
              <span>🏦</span>
              <span>Lưu câu hỏi vào Ngân hàng câu hỏi</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Lưu lại câu hỏi để xem lại đáp án, lời giải chi tiết và ôn tập bất cứ lúc nào.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {wrongQuestions.length > 0 && (
              <button
                type="button"
                onClick={handleSaveWrong}
                className="rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition-colors hover:bg-amber-600"
              >
                ⭐ Lưu {wrongQuestions.length} câu làm sai
              </button>
            )}
            <button
              type="button"
              onClick={handleSaveAll}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
            >
              ⭐ Lưu tất cả ({questions.length} câu)
            </button>
            <Link
              href="/ngan-hang-cau-hoi"
              className="rounded-xl px-2 py-2 text-xs font-bold text-indigo-600 transition-colors hover:underline dark:text-indigo-400"
            >
              Đến Ngân hàng câu hỏi →
            </Link>
          </div>
        </div>
        {saveMessage && (
          <p className="mt-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            ✓ {saveMessage}
          </p>
        )}
      </div>

      {/* Gợi ý chuyển bài kế tiếp trong chương sau khi nộp bài */}
      {nextUrl && nextLabel && (
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          {nextStep?.parentDocument && nav && (
            <Link
              href={`/tai-lieu/${nextStep.parentDocument.id}?chuong=${nav.chapterId}`}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-[#0d1322]"
            >
              ← Quay lại bài học
            </Link>
          )}
          <Link
            href={nextUrl}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            {nextLabel}
          </Link>
        </div>
      )}

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Link
          href={`/quiz/${documentId}/in?mode=solution`}
          className="rounded-xl border border-indigo-300 bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-slate-800"
        >
          🖨 In đề & Lời giải chi tiết (PDF)
        </Link>
        <button type="button" onClick={onRetry} className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700">
          🔄 Làm lại
        </button>
        <Link href="/quiz" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#0d1322]">
          📋 Chọn bài khác
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-400">Kết quả chỉ hiển thị trên máy của bạn, không gửi lên máy chủ.</p>
    </section>
  );
});

export default ExamResultBanner;
