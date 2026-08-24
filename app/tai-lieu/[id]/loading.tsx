/** Skeleton trang tài liệu — hiện ngay khi bấm vào link tài liệu thay vì
 *  giữ nguyên trang cũ chờ server render xong (cảm giác lag khi điều hướng). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="mb-4 h-4 w-44 rounded bg-slate-200 dark:bg-slate-800" />

      {/* Khung tiêu đề tài liệu */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        <div className="mb-4 flex gap-2">
          <div className="h-6 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="h-6 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Khung nội dung các khối bài giảng */}
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20"
          >
            <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
