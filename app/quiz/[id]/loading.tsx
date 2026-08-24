/** Skeleton trang bài kiểm tra — hiện ngay khi bấm vào link làm bài. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      {/* Khung đầu bài */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        <div className="h-6 w-36 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-3 h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      {/* Khung các câu hỏi */}
      <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="mt-2 h-10 w-full rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
}
