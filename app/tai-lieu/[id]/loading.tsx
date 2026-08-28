export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse" role="status" aria-label="Đang tải tài liệu">
      <span className="sr-only">Đang tải tài liệu...</span>
      <div className="mb-2 h-9 w-72 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-6 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}
