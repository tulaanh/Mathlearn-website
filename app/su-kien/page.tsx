import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getEvents } from "@/lib/events";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import EventCard from "@/components/EventCard";

export const metadata = { title: "Sự kiện" };
export const dynamic = "force-dynamic";

export default async function EventsPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user } = await getCurrentUser();
  if (!user) return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"><p className="text-5xl">⚔️</p><h1 className="mt-4 text-2xl font-bold dark:text-white">Đăng nhập để tham gia</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy đăng nhập để xem và tham gia các sự kiện học tập.</p><Link href="/dang-nhap" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">Đăng nhập ngay</Link></div>;
  const events = await getEvents();
  return <div className="mx-auto max-w-[1380px]"><div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-violet-600">THỬ THÁCH TOÁN HỌC</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sự kiện</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Giải câu toán để cùng mọi người hoàn thành các thử thách sự kiện.</p></div><Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">← Về tổng quan</Link></div>{!events.length ? <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><p className="text-5xl">🗺️</p><p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Chưa có sự kiện nào đang mở.</p></div> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{events.map((event) => <EventCard key={event.id} event={event} />)}</div>}</div>;
}
