import { memo } from "react";
import type { Quiz } from "@/lib/types";

const letters = ["A", "B", "C", "D", "E", "F"];

const QuestionCard = memo(function QuestionCard({
  question,
  index,
  selectedId,
  onSelect,
}: {
  question: Quiz["questions"][number];
  index: number;
  selectedId?: string;
  onSelect: (questionId: string, optionId: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
      <legend className="sr-only">Câu {index + 1}</legend>
      <p className="mb-4 font-semibold text-slate-900 dark:text-white">
        <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
          {index + 1}
        </span>
        {question.text}
      </p>

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
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

export default QuestionCard;
