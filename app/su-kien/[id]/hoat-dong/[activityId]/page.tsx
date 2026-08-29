import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getEventById } from "@/lib/events";
import EventActivityRunner from "@/components/EventActivityRunner";

export const dynamic = "force-dynamic";

export default async function EventActivityPage({ params }: { params: Promise<{ id: string; activityId: string }> }) {
  if (!isSupabaseConfigured()) return <p>Website chưa được cấu hình Supabase.</p>;
  const { user } = await getCurrentUser();
  if (!user) return <p>Vui lòng đăng nhập để tham gia.</p>;
  const { id, activityId } = await params;
  const event = await getEventById(id);
  const activity = event?.activities.find((item) => item.id === activityId);
  if (!event || !activity) notFound();
  return <><Link href={`/su-kien/${id}`} className="mb-5 inline-block text-sm font-bold text-indigo-600 hover:underline">← Quay lại sự kiện</Link><EventActivityRunner eventId={id} activityId={activity.id} activityTitle={activity.title} /></>;
}
