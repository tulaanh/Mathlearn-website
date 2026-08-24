"use client";

import { memo } from "react";
import type { DocumentBlock, DocumentTestAnswers, QuizQuestion } from "@/lib/document-types";
import { questionFullyAnswered, questionType } from "@/lib/exam-scoring";

type QuizBlock = Extract<DocumentBlock, { type: "quiz" }>;

type QuestionPaletteProps = {
  quizBlocks: QuizBlock[];
  answers: DocumentTestAnswers;
  /** Khóa = question.id, giá trị true khi câu đang được đánh dấu "xem sau". */
  flagged: Record<string, boolean>;
  onJump: (questionId: string) => void;
};

/** Màu ô câu hỏi: trắng = chưa làm, vàng = xem sau, xanh = đã làm.
 *  Câu vừa "đã làm" vừa "xem sau" nền xanh + viền vàng; tự luận nét đứt. */
function chipClasses(essay: boolean, done: boolean, flagged: boolean): string {
  if (flagged && done) return "border-amber-400 bg-emerald-500 text-white ring-2 ring-amber-400 hover:bg-emerald-600";
  if (flagged) return "border-amber-500 bg-amber-400 text-amber-950 hover:bg-amber-300 dark:border-amber-400";
  if (essay) return "border-dashed border-slate-300 bg-transparent text-slate-500 hover:border-slate-400 dark:border-slate-600 dark:text-slate-400";
  if (done) return "border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600 dark:border-emerald-400";
  return "border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-500";
}

function statusLabel(q: QuizQuestion, done: boolean, flagged: boolean): string {
  if (questionType(q) === "essay") return flagged ? "Tự luận · Xem sau" : "Tự luận";
  if (done && flagged) return "Đã làm · Xem sau";
  if (done) return "Đã làm";
  if (flagged) return "Xem sau";
  return "Chưa làm";
}

/** Bảng điều hướng câu hỏi: chia theo từng phần quiz, bấm để cuộn tới câu. */
const QuestionPalette = memo(function QuestionPalette({ quizBlocks, answers, flagged, onJump }: QuestionPaletteProps) {
  const gradeable = quizBlocks.flatMap((b) => b.questions.filter((q) => questionType(q) !== "essay"));
  const doneCount = gradeable.filter((q) => questionFullyAnswered(q, answers)).length;
  const hasEssay = quizBlocks.some((b) => b.questions.some((q) => questionType(q) === "essay"));

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Danh sách câu hỏi</h3>
        {gradeable.length > 0 && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {doneCount}/{gradeable.length} câu
          </span>
        )}
      </div>

      {quizBlocks.map((block) => {
        const gradeableInBlock = block.questions.filter((q) => questionType(q) !== "essay");
        const doneInBlock = gradeableInBlock.filter((q) => questionFullyAnswered(q, answers)).length;
        return (
          <section key={block.id ?? block.position}>
            <p className="mb-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
              {block.title || "Phần câu hỏi"}
              {gradeableInBlock.length > 0 && (
                <span className="ml-1.5 font-semibold text-slate-400 dark:text-slate-500">
                  ({doneInBlock}/{gradeableInBlock.length})
                </span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {block.questions.map((q, qi) => {
                const essay = questionType(q) === "essay";
                const done = questionFullyAnswered(q, answers);
                const flag = !!flagged[q.id];
                const label = statusLabel(q, done, flag);
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => onJump(q.id)}
                    title={`Câu ${qi + 1} — ${label}`}
                    aria-label={`Câu ${qi + 1} (${label})`}
                    className={`h-9 w-9 rounded-lg border text-sm font-semibold transition-colors ${chipClasses(essay, done, flag)}`}
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
        {hasEssay && (
          <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="inline-block h-3.5 w-3.5 rounded border border-dashed border-slate-300 bg-transparent dark:border-slate-600" />
            Tự luận (làm trên giấy)
          </p>
        )}
      </div>
    </div>
  );
});

export default QuestionPalette;
