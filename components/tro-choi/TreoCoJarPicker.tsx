"use client";

import { formatTreocoCountdown } from "@/lib/treoco-state";

type Props = {
  /** true khi chưa thể chọn hũ (đang hồi chiếu hoặc đang có câu mở). */
  disabled: boolean;
  loadingJar: number | null;
  remainingMs: number;
  /** null khi chưa mount xong (chưa biết thời gian server) — chỉ hiện khối chờ. */
  nowReady: boolean;
  onChoose: (jarId: number) => void;
};

const JARS = [
  { id: 1, emoji: "🏮", lid: "bg-rose-800 dark:bg-rose-900", body: "from-amber-200 to-amber-400 border-amber-400 dark:from-amber-900/70 dark:to-amber-700/70 dark:border-amber-600", hover: "hover:border-amber-500 dark:hover:border-amber-400" },
  { id: 2, emoji: "🥮", lid: "bg-violet-900 dark:bg-violet-800", body: "from-violet-200 to-violet-400 border-violet-400 dark:from-violet-900/70 dark:to-violet-700/70 dark:border-violet-600", hover: "hover:border-violet-500 dark:hover:border-violet-400" },
  { id: 3, emoji: "🎑", lid: "bg-sky-900 dark:bg-sky-800", body: "from-sky-200 to-sky-400 border-sky-400 dark:from-sky-900/70 dark:to-sky-700/70 dark:border-sky-600", hover: "hover:border-sky-500 dark:hover:border-sky-400" },
];

/** 3 hũ bí mật: độ khó (Dễ / Trung bình / Khó) được xáo trộn ngẫu nhiên phía server. */
export default function TreoCoJarPicker({ disabled, loadingJar, remainingMs, nowReady, onChoose }: Props) {
  const cooling = nowReady && remainingMs > 0;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#131b2e]">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Hũ bí mật · giải toán lấy lượt
      </h2>

      {cooling ? (
        <div className="mt-3 rounded-xl bg-slate-100 px-4 py-3 text-center dark:bg-slate-800/60">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
            ⏳ Câu toán tiếp theo sau {formatTreocoCountdown(remainingMs)}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            Trả lời đúng: chờ 3 phút · Trả lời sai: chờ 10 phút
          </p>
        </div>
      ) : (
        nowReady && (
          <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-center dark:bg-emerald-950/40">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              ✨ Đã đến giờ giải toán — chọn 1 hũ bất kỳ!
            </p>
          </div>
        )
      )}

      <div className="mt-4 grid grid-cols-3 gap-3">
        {JARS.map((jar) => {
          const isDisabled = disabled || cooling || jar.id === loadingJar;
          return (
            <button
              key={jar.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onChoose(jar.id)}
              aria-label={cooling ? `Hũ số ${jar.id} đang hồi chiêu` : `Chọn hũ số ${jar.id}`}
              className={`group flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-3 transition-all dark:border-slate-700 dark:bg-slate-800/60 ${
                isDisabled
                  ? "cursor-not-allowed opacity-50 grayscale-[30%]"
                  : `cursor-pointer hover:-translate-y-1 hover:shadow-md ${jar.hover}`
              }`}
            >
              <div className="relative">
                <div className={`mx-auto h-3.5 w-16 rounded-md ${jar.lid}`} />
                <div
                  className={`-mt-0.5 flex h-20 w-20 items-center justify-center rounded-b-[2.2rem] rounded-t-lg border-2 bg-gradient-to-b text-4xl ${jar.body}`}
                >
                  {jar.id === loadingJar ? <span className="animate-pulse">⏳</span> : jar.emoji}
                </div>
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Hũ {jar.id}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        Mỗi hũ ẩn một mức độ khó (Dễ / Trung bình / Khó) được xáo trộn ngẫu nhiên sau mỗi lượt.
      </p>
    </div>
  );
}
