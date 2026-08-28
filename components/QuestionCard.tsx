import { memo } from "react";
import type { Quiz } from "@/lib/types";
import LazyMathText from "./LazyMathText";

const letters = ["A", "B", "C", "D", "E", "F"];

const QuestionCard = memo(function QuestionCard({
  question,
  index,
  selectedId,
  onSelect,
  onReport,
}: {
  question: Quiz["questions"][number];
  index: number;
  selectedId?: string;
  onSelect: (questionId: string, optionId: string) => void;
  onReport?: (question: Quiz["questions"][number]) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
      <legend className="sr-only">Câu {index + 1}</legend>
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-900 dark:text-white">
          <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {index + 1}
          </span>
          <LazyMathText text={question.text} inline />
        </p>
        {onReport && (
          <button
            type="button"
            onClick={() => onReport(question)}
            title="Báo lỗi câu hỏi này"
            className="shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            <span>🚩</span>
            <span className="hidden sm:inline">Báo lỗi</span>
          </button>
        )}
      </div>

      <div className="grid gap-2.5">
        {question.options.map((option, i) => {
          const isSelected = selectedId === option.id;
          return (
            <label
              key={option.id}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                isSelected
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-950 ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-white dark:ring-indigo-400/30"
                  : "border-slate-200/80 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-[#0d1322] dark:text-slate-200 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={isSelected}
                onChange={() => onSelect(question.id, option.id)}
                className="h-4 w-4 accent-indigo-600 dark:accent-indigo-400"
              />
              <span className={`font-semibold transition-colors ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>
                {letters[i]}.
              </span>
              <span>
                <LazyMathText text={option.text} inline />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

export default QuestionCard;
