/** Skeleton trang chi tiết chương — hiện ngay khi bấm vào thẻ chương. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Link quay lại */}
      <div className="mb-3 h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Khung thông tin chương */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mb-2 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mb-5 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-10 rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Tiêu đề nội dung chương */}
      <div className="mb-4 h-6 w-40 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Danh sách bài học */}
      <div className="grid gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"
          >
            <div className="mb-3 flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
