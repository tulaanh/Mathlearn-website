import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getEventById, getEventLeaderboard } from "@/lib/events";
import { formatEventDate, eventStatus, EVENT_TYPE_META } from "@/lib/event-types";
import EventBossBoard from "@/components/EventBossBoard";
import EventActivityList from "@/components/EventActivityList";
import EventLeaderboard from "@/components/EventLeaderboard";
import EventCountdown from "@/components/EventCountdown";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  return { title: event?.title ?? "Sự kiện" };
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return <p>Website chưa được cấu hình Supabase.</p>;
  const { user } = await getCurrentUser();
  if (!user) return <p>Vui lòng đăng nhập để xem sự kiện.</p>;
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();
  const leaderboard = await getEventLeaderboard(id);
  const state = eventStatus(event);
  const typeMeta = EVENT_TYPE_META[event.eventType];
  return <div className="mx-auto max-w-[1380px]"><Link href="/su-kien" className="mb-5 inline-block text-sm font-bold text-indigo-600 hover:underline">← Tất cả sự kiện</Link><div className="mb-7 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-6 shadow-sm dark:border-violet-900/50 dark:from-violet-950/40 dark:via-[#131b2e] dark:to-rose-950/20 sm:p-8"><div className="flex flex-col justify-between gap-5 md:flex-row"><div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{typeMeta.icon} {typeMeta.label}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{event.grade}</span></div><h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{event.title}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{event.description || typeMeta.description}</p></div><div className="shrink-0 rounded-2xl bg-white/80 p-4 text-sm shadow-sm dark:bg-slate-900/60"><p>🗓️ {formatEventDate(event.startAt)}</p><p className="mt-1">🏁 {formatEventDate(event.endAt)}</p>{state === "published" && <p className="mt-3 font-bold text-emerald-600 dark:text-emerald-400"><EventCountdown target={event.endAt} label="⏱️ Còn" /></p>}{state === "ended" && <p className="mt-3 font-bold text-slate-500">✅ Đã kết thúc</p>}</div></div></div><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"><div className="space-y-6">{event.eventType === "boss_battle" ? <section><h2 className="mb-4 text-xl font-extrabold text-slate-900 dark:text-white">👾 Các boss</h2><EventBossBoard bosses={event.bosses} /></section> : <section className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/50 p-6 dark:border-violet-900/60 dark:bg-violet-950/20"><h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{typeMeta.icon} {typeMeta.label}</h2><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Bộ hoạt động và bảng điểm cho loại sự kiện này đang được chuẩn bị.</p></section>}<section><h2 className="mb-4 text-xl font-extrabold text-slate-900 dark:text-white">🎯 Hoạt động</h2><EventActivityList activities={event.activities} bosses={event.bosses} eventType={event.eventType} /></section></div><EventLeaderboard eventType={event.eventType} eventId={event.id} initialRows={leaderboard} /></div></div>;
}
