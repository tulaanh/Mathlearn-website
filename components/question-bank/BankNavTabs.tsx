type Props = {
  currentTab: "all" | "saved";
  switchTab: (tab: "all" | "saved") => void;
  totalAll?: number;
  savedCount: number;
  hasActiveQuestions: boolean;
  expandAll: boolean;
  onToggleExpandAll: () => void;
};

export default function BankNavTabs({
  currentTab,
  switchTab,
  totalAll,
  savedCount,
  hasActiveQuestions,
  expandAll,
  onToggleExpandAll,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => switchTab("all")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            currentTab === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          <span>🏦 Tất cả câu hỏi</span>
          {totalAll !== undefined && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === "all"
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {totalAll}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => switchTab("saved")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
            currentTab === "saved"
              ? "bg-amber-500 text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          <span>⭐ Câu hỏi đã lưu</span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
              currentTab === "saved"
                ? "bg-white/25 text-white"
                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
            }`}
          >
            {savedCount}
          </span>
        </button>
      </div>

      {hasActiveQuestions && (
        <button
          type="button"
          onClick={onToggleExpandAll}
          className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
        >
          💡 {expandAll ? "Ẩn tất cả lời giải" : "Hiện tất cả lời giải"}
        </button>
      )}
    </div>
  );
}
