export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse" role="status" aria-label="Đang tải chương">
      <span className="sr-only">Đang tải chương...</span>
      <div className="mb-3 h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-16 w-full rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
