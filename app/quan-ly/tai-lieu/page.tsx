import Link from "next/link";
import { redirect } from "next/navigation";
import { DOCS_PAGE_SIZE, getTeacherDocumentCards } from "@/lib/documents";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import DocumentManageCard from "@/components/DocumentManageCard";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Quản lý tài liệu" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function ManageDocumentsPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const { items: documents, total } = await getTeacherDocumentCards(page);

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Quản lý tài liệu</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tạo tài liệu Toán, thêm hình ảnh, gán nhiều chủ đề và đăng cho học sinh.</p></div><Link href="/quan-ly/tai-lieu/them" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">+ Thêm tài liệu</Link></div>
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><p className="text-sm text-slate-500">Chưa có tài liệu nào.</p><Link href="/quan-ly/tai-lieu/them" className="mt-4 inline-block font-semibold text-indigo-600">Tạo tài liệu đầu tiên →</Link></div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{documents.map((card) => <DocumentManageCard key={card.id} card={card} />)}</div>
          <Pagination basePath="/quan-ly/tai-lieu" params={{}} page={page} total={total} pageSize={DOCS_PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
