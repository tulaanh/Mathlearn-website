import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import DocumentEditor from "@/components/DocumentEditor";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Thêm tài liệu" };

export default async function AddDocumentPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");
  return <div className="mx-auto max-w-4xl"><Link href="/quan-ly/tai-lieu" className="mb-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">← Về quản lý tài liệu</Link><div className="mb-7"><p className="mb-2 text-sm font-medium text-indigo-600">TẠO NỘI DUNG</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Thêm tài liệu Toán</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Bắt đầu nhanh từ mẫu có sẵn hoặc mã JSON, rồi soạn các phần văn bản, hình ảnh, bài giảng và câu hỏi tương tác.</p></div><DocumentEditor /></div>;
}
