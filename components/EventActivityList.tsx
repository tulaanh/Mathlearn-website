import Link from "next/link";
import type { EventActivity, EventBoss } from "@/lib/event-types";
import { formatDuration, EVENT_TYPE_META } from "@/lib/event-types";

export default function EventActivityList({ activities, bosses, eventType = "boss_battle" }: { activities: EventActivity[]; bosses: EventBoss[]; eventType?: keyof typeof EVENT_TYPE_META }) {
  const meta = EVENT_TYPE_META[eventType];
  if (!activities.length) return <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">Sự kiện chưa có hoạt động nào.</p>;
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
        const boss = bosses.find((item) => item.id === activity.bossId);
        const unavailable = activity.questionPoolCount === 0;
        return (
          <div key={activity.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e] sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{index + 1}</span><h3 className="text-base font-bold text-slate-900 dark:text-white">{activity.title}</h3></div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{activity.description || meta.description}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500 dark:text-slate-400"><span>⏱️ {formatDuration(activity.timeLimitSeconds)}</span><span>📝 {activity.questionCount || activity.questionPoolCount} câu</span><span>{meta.icon} {boss ? `${meta.label}: ${boss.name}` : "Hoạt động luyện tập"}</span>{activity.maxAttempts > 0 && <span>🔁 {Math.max(0, activity.maxAttempts - activity.myAttempts)}/{activity.maxAttempts} lượt</span>}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {activity.myTotalScore > 0 && <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{meta.icon} {activity.myTotalScore} {meta.scoreLabel}</span>}
              {unavailable ? <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-500 dark:bg-slate-800">Chưa có câu hỏi</span> : <Link href={`/su-kien/${activity.eventId}/hoat-dong/${activity.id}`} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-violet-700">⚔️ Tham gia</Link>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
