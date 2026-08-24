import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getLearningPathById } from "@/lib/learning-paths";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import PathEditor from "@/components/PathEditor";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const path = await getLearningPathById(id);
  return { title: path ? `Sửa: ${path.title}` : "Không tìm thấy lộ trình" };
}

export default async function EditPathPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const { id } = await params;
  const path = await getLearningPathById(id);
  if (!path) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <Link
          href="/quan-ly/lo-trinh"
          className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Quay lại quản lý lộ trình
        </Link>
        <p className="mb-2 text-sm font-medium text-indigo-600">CHỈNH SỬA LỘ TRÌNH</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Sửa lộ trình
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Cập nhật tên, mô tả và khối lớp của lộ trình. Gán chương vào lộ trình tại trang Quản lý chương.
        </p>
      </div>
      <PathEditor initialData={path} />
    </div>
  );
}
