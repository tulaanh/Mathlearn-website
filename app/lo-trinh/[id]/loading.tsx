export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-[1380px] animate-pulse" role="status" aria-label="Đang tải lộ trình">
      <span className="sr-only">Đang tải lộ trình...</span>
      <div className="mb-2 h-9 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-14 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
