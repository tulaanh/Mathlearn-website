import Link from "next/link";

type Props = {
  currentTab: "all" | "saved";
  hasFilter: boolean;
  switchTab: (tab: "all" | "saved") => void;
  clearAllFilters: () => void;
};

export default function BankEmptyState({ currentTab, hasFilter, switchTab, clearAllFilters }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-[#131b2e]">
      <div className="mx-auto mb-3 text-4xl">{currentTab === "saved" ? "⭐" : "🔍"}</div>
      <p className="text-base font-bold text-slate-800 dark:text-slate-200">
        {currentTab === "saved"
          ? hasFilter
            ? "Không tìm thấy câu hỏi đã lưu nào khớp bộ lọc"
            : "Bạn chưa lưu câu hỏi nào vào Ngân hàng câu hỏi"
          : "Không tìm thấy câu hỏi phù hợp"}
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {currentTab === "saved"
          ? hasFilter
            ? "Hãy thử điều chỉnh lại từ khóa hoặc các tiêu chí bộ lọc."
            : "Sau khi nộp bài tập hoặc làm xong bài kiểm tra, bạn có thể bấm '⭐ Lưu vào ngân hàng' để ôn tập lại tại đây."
          : "Hãy thử thay đổi từ khóa hoặc điều chỉnh các tiêu chí bộ lọc."}
      </p>
      {currentTab === "saved" && !hasFilter && (
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/quiz"
            className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-purple-700"
          >
            Làm bài kiểm tra ngay →
          </Link>
          <button
            type="button"
            onClick={() => switchTab("all")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Khám phá kho câu hỏi chung
          </button>
        </div>
      )}
      {hasFilter && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
        >
          Đặt lại tất cả bộ lọc
        </button>
      )}
    </div>
  );
}
