"use client";

import { memo } from "react";
import type { DocumentBlock, DocumentTestAnswers, DocumentTestResult, QuizQuestion } from "@/lib/document-types";
import { isQuestionCorrect, questionFullyAnswered, questionType } from "@/lib/exam-scoring";

type QuizBlock = Extract<DocumentBlock, { type: "quiz" }>;

type QuestionPaletteProps = {
  quizBlocks: QuizBlock[];
  answers: DocumentTestAnswers;
  /** Khóa = question.id, giá trị true khi câu đang được đánh dấu "xem sau". */
  flagged: Record<string, boolean>;
  onJump: (questionId: string) => void;
  result?: DocumentTestResult | null;
  filterMode?: "all" | "wrong" | "correct";
  onSelectFilter?: (mode: "all" | "wrong" | "correct") => void;
};

/** Màu ô câu hỏi khi chưa nộp bài: trắng = chưa làm, vàng = xem sau, xanh = đã làm. */
function chipClassesPreSubmit(essay: boolean, done: boolean, flagged: boolean): string {
  if (flagged && done) return "border-amber-400 bg-emerald-500 text-white ring-2 ring-amber-400 hover:bg-emerald-600";
  if (flagged) return "border-amber-500 bg-amber-400 text-amber-950 hover:bg-amber-300 dark:border-amber-400";
  if (essay) return "border-dashed border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400";
  if (done) return "border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600 dark:border-emerald-400";
  return "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500";
}

/** Màu ô câu hỏi sau khi nộp bài: đỏ = sai, xanh = đúng, tự luận = nét đứt. */
function chipClassesPostSubmit(essay: boolean, isCorrect: boolean | null, isFaded: boolean): string {
  const fadeClass = isFaded ? "opacity-45 hover:opacity-100" : "";
  if (essay) {
    return `border-dashed border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400 ${fadeClass}`;
  }
  if (isCorrect) {
    return `border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600 dark:border-emerald-400 shadow-2xs ${fadeClass}`;
  }
  return `border-rose-600 bg-rose-500 text-white hover:bg-rose-600 dark:border-rose-400 shadow-2xs ${fadeClass}`;
}

function statusLabel(q: QuizQuestion, done: boolean, flagged: boolean, isPostSubmit: boolean, isCorrect: boolean | null): string {
  if (questionType(q) === "essay") return flagged ? "Tự luận · Xem sau" : "Tự luận";
  if (isPostSubmit) {
    return isCorrect ? "Làm đúng ✓" : "Làm sai ✕";
  }
  if (done && flagged) return "Đã làm · Xem sau";
  if (done) return "Đã làm";
  if (flagged) return "Xem sau";
  return "Chưa làm";
}

/** Bảng điều hướng câu hỏi: chia theo từng phần quiz, bấm để cuộn tới câu. */
const QuestionPalette = memo(function QuestionPalette({
  quizBlocks,
  answers,
  flagged,
  onJump,
  result,
  filterMode = "all",
  onSelectFilter,
}: QuestionPaletteProps) {
  const gradeable = quizBlocks.flatMap((b) => b.questions.filter((q) => questionType(q) !== "essay"));
  const doneCount = gradeable.filter((q) => questionFullyAnswered(q, answers)).length;
  const hasEssay = quizBlocks.some((b) => b.questions.some((q) => questionType(q) === "essay"));

  const isPostSubmit = !!result;
  const correctCount = isPostSubmit
    ? gradeable.filter((q) => isQuestionCorrect(q, answers) === true).length
    : 0;
  const wrongCount = isPostSubmit
    ? gradeable.filter((q) => isQuestionCorrect(q, answers) === false).length
    : 0;

  return (
    <div className="space-y-3.5">
      {/* Tiêu đề & thống kê */}
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh sách câu hỏi</h3>
          {!isPostSubmit && gradeable.length > 0 && (
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {doneCount}/{gradeable.length} câu
            </span>
          )}
          {isPostSubmit && (
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {gradeable.length} câu
            </span>
          )}
        </div>
        {isPostSubmit && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-rose-600 dark:text-rose-400">✕ {wrongCount} sai</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">✓ {correctCount} đúng</span>
          </div>
        )}
      </div>

      {/* Bộ lọc nhanh trong Bảng câu hỏi khi đã nộp bài */}
      {isPostSubmit && onSelectFilter && (
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1 text-[11px] font-bold dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => onSelectFilter("wrong")}
            title="Chỉ hiển thị các câu làm sai"
            className={`rounded-lg py-1 px-1 text-center transition-all ${
              filterMode === "wrong"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-rose-700 hover:bg-rose-100/70 dark:text-rose-300 dark:hover:bg-rose-950/40"
            }`}
          >
            Sai ({wrongCount})
          </button>
          <button
            type="button"
            onClick={() => onSelectFilter("all")}
            title="Hiển thị tất cả câu hỏi"
            className={`rounded-lg py-1 px-1 text-center transition-all ${
              filterMode === "all"
                ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            Tất cả ({gradeable.length})
          </button>
          <button
            type="button"
            onClick={() => onSelectFilter("correct")}
            title="Chỉ hiển thị các câu làm đúng"
            className={`rounded-lg py-1 px-1 text-center transition-all ${
              filterMode === "correct"
                ? "bg-emerald-500 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-100/70 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            }`}
          >
            Đúng ({correctCount})
          </button>
        </div>
      )}

      {/* Danh sách nút theo từng phần */}
      {quizBlocks.map((block) => {
        const gradeableInBlock = block.questions.filter((q) => questionType(q) !== "essay");
        const doneInBlock = gradeableInBlock.filter((q) => questionFullyAnswered(q, answers)).length;
        const wrongInBlock = isPostSubmit
          ? gradeableInBlock.filter((q) => isQuestionCorrect(q, answers) === false).length
          : 0;

        return (
          <section key={block.id ?? block.position}>
            <p className="mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {block.title || "Phần câu hỏi"}
              {!isPostSubmit && gradeableInBlock.length > 0 && (
                <span className="ml-1.5 font-semibold text-slate-400 dark:text-slate-500">
                  ({doneInBlock}/{gradeableInBlock.length})
                </span>
              )}
              {isPostSubmit && gradeableInBlock.length > 0 && (
                <span className={`ml-1.5 font-semibold ${wrongInBlock > 0 ? "text-rose-500 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  ({wrongInBlock > 0 ? `${wrongInBlock} sai` : "Đúng 100%"})
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {block.questions.map((q, qi) => {
                const essay = questionType(q) === "essay";
                const done = questionFullyAnswered(q, answers);
                const flag = !!flagged[q.id];
                const isCorrect = isPostSubmit ? isQuestionCorrect(q, answers) : null;
                const label = statusLabel(q, done, flag, isPostSubmit, isCorrect);

                // Mờ nhẹ các ô không khớp bộ lọc đang chọn để làm nổi bật ô đang xem
                const isFaded =
                  isPostSubmit &&
                  ((filterMode === "wrong" && isCorrect === true) ||
                    (filterMode === "correct" && isCorrect === false));

                const classes = isPostSubmit
                  ? chipClassesPostSubmit(essay, isCorrect, isFaded)
                  : chipClassesPreSubmit(essay, done, flag);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(q.id)}
                    title={`Câu ${qi + 1} — ${label}`}
                    aria-label={`Câu ${qi + 1} (${label})`}
                    className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-all ${classes}`}
                  >
                    {qi + 1}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Chú giải màu */}
      <div className="space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-800">
        {!isPostSubmit ? (
          <>
            <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-block h-3.5 w-3.5 rounded border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900" />
              Chưa làm
            </p>
            <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-block h-3.5 w-3.5 rounded border border-amber-500 bg-amber-400 dark:border-amber-400" />
              Xem sau
            </p>
            <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="inline-block h-3.5 w-3.5 rounded border border-emerald-600 bg-emerald-500 dark:border-emerald-400" />
              Đã làm
            </p>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="inline-block h-3.5 w-3.5 rounded border border-rose-600 bg-rose-500 dark:border-rose-400" />
              Làm sai ({wrongCount} câu)
            </p>
            <p className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="inline-block h-3.5 w-3.5 rounded border border-emerald-600 bg-emerald-500 dark:border-emerald-400" />
              Làm đúng ({correctCount} câu)
            </p>
          </>
        )}
        {hasEssay && (
          <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-block h-3.5 w-3.5 rounded border border-dashed border-slate-300 bg-transparent dark:border-slate-600" />
            Tự luận (không chấm tự động)
          </p>
        )}
      </div>
    </div>
  );
});

export default QuestionPalette;

