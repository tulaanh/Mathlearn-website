export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse" role="status" aria-label="Đang tải bài kiểm tra">
      <span className="sr-only">Đang tải bài kiểm tra...</span>
      <div className="mb-4 h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
