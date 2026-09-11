/** Skeleton trang game Treo cổ Trung Thu — hiện ngay khi bấm vào mục trò chơi. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse">
      <div className="mb-7">
        <div className="mb-2 h-4 w-36 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-2 h-4 w-80 max-w-full rounded bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="h-[420px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e] lg:col-span-3" />
        <div className="h-[420px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e] lg:col-span-2" />
      </div>
      <div className="mt-5 h-32 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e]" />
    </div>
  );
}
