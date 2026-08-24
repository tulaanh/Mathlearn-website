export default function ProgressBar({
  percent,
  showLabel = true,
}: {
  percent: number;
  showLabel?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const color =
    clamped === 100
      ? "bg-emerald-500"
      : clamped > 0
        ? "bg-indigo-500"
        : "bg-slate-300 dark:bg-slate-600";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {/* Dùng scaleX thay vì width để chạy trên compositor, không kích layout lại */}
        <div
          className={`h-full w-full origin-left rounded-full transition-transform duration-500 ${color}`}
          style={{ transform: `scaleX(${clamped / 100})` }}
        />
      </div>
      {showLabel && (
        <span
          className={`w-10 shrink-0 text-right text-xs font-bold ${
            clamped === 100
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
}
