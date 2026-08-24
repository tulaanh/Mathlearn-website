export default function Loading() {
  return (
    <div
      className="mx-auto w-full max-w-[1380px] animate-pulse"
      role="status"
      aria-label="Đang tải trang"
    >
      <span className="sr-only">Đang tải trang...</span>
      <div className="mb-7 h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-44 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
        ))}
      </div>
    </div>
  );
}
