export default function QuizPrintLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse print:!hidden">
      <div className="mb-6 h-28 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="h-[600px] rounded-2xl bg-white p-8 dark:bg-slate-900">
        <div className="mb-6 h-20 border-b border-slate-200 dark:border-slate-800" />
        <div className="space-y-6">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
