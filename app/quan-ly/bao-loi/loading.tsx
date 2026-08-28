export default function ReportLoading() {
  return (
    <div className="mx-auto max-w-[1380px] animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-4 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="h-8 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-4 w-96 rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#131b2e]" />
        ))}
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#131b2e]" />
        ))}
      </div>
    </div>
  );
}
