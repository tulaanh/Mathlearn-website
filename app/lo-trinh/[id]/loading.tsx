/** Skeleton trang chi tiết lộ trình — hiện ngay khi bấm vào thẻ lộ trình. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      {/* Link quay lại */}
      <div className="mb-3 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Khung thông tin lộ trình */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mb-2 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Tiêu đề danh sách chương */}
      <div className="mb-4 h-6 w-44 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Lưới thẻ chương */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-6 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="mb-2 h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mb-4 h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mb-1 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
