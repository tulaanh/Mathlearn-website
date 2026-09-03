import type { Topic } from "@/lib/types";
import { DIFFICULTY_META } from "@/lib/question-bank-types";

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Mọi dạng câu" },
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng / Sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

type Props = {
  currentTab: "all" | "saved";
  currentSearch: string;
  currentGrade: string;
  currentTopic: string;
  currentDifficulty: string;
  currentType: string;
  grades: string[];
  topics: Topic[];
  hasFilter: boolean;
  setParam: (key: string, value: string) => void;
  clearAllFilters: () => void;
};

export default function BankFilterBar({
  currentTab,
  currentSearch,
  currentGrade,
  currentTopic,
  currentDifficulty,
  currentType,
  grades,
  topics,
  hasFilter,
  setParam,
  clearAllFilters,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2.5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const value = (new FormData(e.currentTarget).get("q") as string) ?? "";
            setParam("q", value.trim());
          }}
          className="flex min-w-[220px] flex-1 gap-2"
        >
          <input
            name="q"
            defaultValue={currentSearch}
            placeholder={currentTab === "saved" ? "🔍 Tìm trong câu hỏi đã lưu..." : "🔍 Tìm kiếm câu hỏi..."}
            className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          <button
            type="submit"
            className="h-10 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
          >
            Tìm
          </button>
        </form>

        <select
          value={currentGrade}
          onChange={(e) => setParam("grade", e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Mọi khối lớp</option>
          {grades.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <select
          value={currentTopic}
          onChange={(e) => setParam("topic", e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Mọi chủ đề</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <select
          value={currentDifficulty}
          onChange={(e) => setParam("difficulty", e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          <option value="">Mọi mức độ</option>
          {DIFFICULTY_META.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={currentType}
          onChange={(e) => setParam("type", e.target.value)}
          className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {hasFilter && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="h-10 rounded-xl border border-slate-300 px-3.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
