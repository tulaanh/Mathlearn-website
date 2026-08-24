import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getDocumentById, getPublishedTestOptions } from "@/lib/documents";
import DocumentEditor, { type TestOption } from "@/components/DocumentEditor";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const document = await getDocumentById(id);
  return { title: document ? `Sửa: ${document.title}` : "Không tìm thấy tài liệu" };
}

export default async function EditDocumentPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) notFound();

  const options = await getPublishedTestOptions();
  // Đảm bảo các bài kiểm tra đang đính kèm (kể cả khi chưa xuất bản) vẫn xuất hiện trong danh sách
  const testOptions: TestOption[] = [...options];
  for (const attached of document.attachedTests ?? []) {
    if (!testOptions.some((t) => t.id === attached.id)) {
      testOptions.unshift({ ...attached, grade: document.grade });
    }
  }

  return <div className="mx-auto max-w-4xl"><Link href="/quan-ly/tai-lieu" className="mb-4 inline-block text-sm font-semibold text-indigo-600 hover:underline">← Về quản lý tài liệu</Link><div className="mb-7"><p className="mb-2 text-sm font-medium text-indigo-600">CHỈNH SỬA NỘI DUNG</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sửa tài liệu</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Cập nhật thông tin, nội dung hoặc thay đổi bài kiểm tra đính kèm của tài liệu.</p></div><DocumentEditor initialData={document} testOptions={testOptions} /></div>;
}
