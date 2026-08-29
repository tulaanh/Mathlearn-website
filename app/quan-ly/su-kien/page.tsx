import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getEvents } from "@/lib/events";
import { eventStatus, formatEventDate, EVENT_TYPE_META } from "@/lib/event-types";

export const metadata = { title: "Quản lý sự kiện" };
export const dynamic = "force-dynamic";

export default async function ManageEventsPage() {
  if (!isSupabaseConfigured()) return <p>Website chưa được cấu hình Supabase.</p>;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/su-kien");
  const events = await getEvents(true);
  return <div className="mx-auto max-w-[1380px]"><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-violet-600">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Quản lý sự kiện</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tạo sự kiện, boss và các thử thách toán học.</p></div><Link href="/quan-ly/su-kien/them" className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700">+ Tạo sự kiện</Link></div>{!events.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">Chưa có sự kiện nào.</div> : <div className="space-y-3">{events.map((event) => <div key={event.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">{EVENT_TYPE_META[event.eventType].icon} {EVENT_TYPE_META[event.eventType].label} · {eventStatus(event)}</span><h2 className="font-bold text-slate-900 dark:text-white">{EVENT_TYPE_META[event.eventType].icon} {event.title}</h2></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{event.grade} · {formatEventDate(event.startAt)} → {formatEventDate(event.endAt)} · {EVENT_TYPE_META[event.eventType].label} · {event.activities.length} hoạt động</p></div><Link href={`/su-kien/${event.id}`} className="rounded-lg border border-indigo-200 px-4 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-400">Xem sự kiện</Link></div>)}</div>}</div>;
}
