import { memo } from "react";
import type { DocumentTestAnswers, DocumentBlock } from "@/lib/document-types";
import QuestionPalette from "../QuestionPalette";

type QuizBlock = Extract<DocumentBlock, { type: "quiz" }>;

type ExamHeaderNavProps = {
  answered: number;
  total: number;
  canSubmit: boolean;
  paletteOpen: boolean;
  onTogglePalette: () => void;
  onSubmit: () => void;
  quizBlocks: QuizBlock[];
  answers: DocumentTestAnswers;
  flagged: Record<string, boolean>;
  onJumpToQuestion: (id: string) => void;
};

const ExamHeaderNav = memo(function ExamHeaderNav({
  answered,
  total,
  canSubmit,
  paletteOpen,
  onTogglePalette,
  onSubmit,
  quizBlocks,
  answers,
  flagged,
  onJumpToQuestion,
}: ExamHeaderNavProps) {
  return (
    <div className="sticky bottom-4 mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-[#131b2e]/90">
      {/* Bảng câu hỏi thu gọn cho màn hình nhỏ */}
      {paletteOpen && (
        <div className="mb-3 max-h-[55vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#131b2e] lg:hidden">
          <QuestionPalette quizBlocks={quizBlocks} answers={answers} flagged={flagged} onJump={onJumpToQuestion} />
        </div>
      )}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Đã trả lời{" "}
          <strong className={total > 0 && answered === total ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}>
            {answered}/{total}
          </strong>{" "}
          ý
        </span>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <button
            type="button"
            onClick={onTogglePalette}
            className="w-full shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#0d1322] sm:w-auto lg:hidden"
          >
            {paletteOpen ? "✕ Đóng danh sách" : "📋 Câu hỏi"}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className={`w-full rounded-xl px-6 py-3 font-semibold text-white shadow-xs transition-colors sm:w-auto ${
              canSubmit ? "bg-purple-600 hover:bg-purple-700" : "cursor-not-allowed bg-slate-300 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            {canSubmit ? "✅ Nộp bài & xem điểm" : `Còn ${total - answered} ý chưa trả lời`}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ExamHeaderNav;
