import Link from "next/link";
import type { MathEvent } from "@/lib/event-types";
import { eventStatus, formatEventDate, getEventTypeMeta } from "@/lib/event-types";
import EventCountdown from "./EventCountdown";

export default function EventCard({ event }: { event: MathEvent }) {
  const state = eventStatus(event);
  const active = state === "published" && new Date(event.startAt).getTime() <= Date.now();
  const typeMeta = getEventTypeMeta(event.eventType);
  return (
    <Link
      href={`/su-kien/${event.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e] dark:hover:border-violet-500/60"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{typeMeta.icon} {typeMeta.label}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{event.grade}</span>
      </div>
      <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-violet-600 dark:text-white dark:group-hover:text-violet-400">{event.title}</h2>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">{event.description || typeMeta.description}</p>
      <div className="mt-5 space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <p>🗓️ {formatEventDate(event.startAt)} → {formatEventDate(event.endAt)}</p>
        <p>{typeMeta.icon} {event.bosses.length ? `${event.bosses.length} mục tiêu` : "Sự kiện theo tiến độ"} · 🎯 {event.activities.length} hoạt động</p>
        {active && <p className="font-bold text-emerald-600 dark:text-emerald-400"><EventCountdown target={event.endAt} label="⏱️ Còn" /></p>}
        {!active && state !== "ended" && <p className="font-bold text-amber-600 dark:text-amber-400">⏳ Sắp bắt đầu</p>}
        {state === "ended" && <p className="font-bold text-slate-500">✅ Đã kết thúc</p>}
      </div>
      <span className="mt-5 text-sm font-bold text-violet-600 group-hover:underline dark:text-violet-400">Xem sự kiện →</span>
    </Link>
  );
}
