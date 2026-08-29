import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import EventAdminForm from "@/components/EventAdminForm";

export const metadata = { title: "Tạo sự kiện" };

export default async function AddEventPage() {
  if (!isSupabaseConfigured()) return <p>Website chưa được cấu hình Supabase.</p>;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/su-kien");
  return <div className="mx-auto max-w-4xl"><Link href="/quan-ly/su-kien" className="mb-5 inline-block text-sm font-bold text-indigo-600 hover:underline">← Quản lý sự kiện</Link><div className="mb-7"><p className="mb-2 text-sm font-medium text-violet-600">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Tạo sự kiện mới</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tạo một sự kiện và hoạt động đầu tiên từ ngân hàng câu hỏi. Các loại trồng cây và đua race sẽ được bật ở phase tiếp theo.</p></div><EventAdminForm /></div>;
}
