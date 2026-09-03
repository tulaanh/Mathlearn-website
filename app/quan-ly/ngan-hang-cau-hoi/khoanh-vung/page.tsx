import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import PdfRegionEditor from "@/components/pdf-layout/PdfRegionEditor";

export const metadata = { title: "Khoanh vùng PDF" };

export default async function PdfRegionPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/quiz");
  return <div className="mx-auto max-w-[1500px]"><div className="mb-6"><Link href="/quan-ly/ngan-hang-cau-hoi" className="text-sm font-semibold text-indigo-600">← Quay lại ngân hàng câu hỏi</Link><p className="mb-2 mt-4 text-sm font-medium text-indigo-600">CÔNG CỤ XỬ LÝ TÀI LIỆU</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Khoanh vùng hình vẽ và bảng trong PDF</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">DocLayOut-YOLO chỉ tự động tìm ảnh, hình vẽ, đồ thị và bảng trong PDF; bảng cũng được xử lý như ảnh crop. Hãy kiểm tra/chỉnh khung, thêm vùng thủ công nếu cần rồi đóng gói PDF, ảnh trang và regions.json để chuyển cho Antigravity. Chữ không được tự động khoanh vùng.</p></div><PdfRegionEditor /></div>;
}
