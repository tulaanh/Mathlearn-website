import Link from "next/link";
import { redirect } from "next/navigation";
import { DOCS_PAGE_SIZE, getTeacherDocumentCards } from "@/lib/documents";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import DocumentManageCard from "@/components/DocumentManageCard";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Quản lý tài liệu" };

type DocumentFilter = "all" | "normal" | "test";

type Props = { searchParams: Promise<{ page?: string; type?: string }> };

const filters: { value: DocumentFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "normal", label: "Tài liệu" },
  { value: "test", label: "Bài kiểm tra" },
];

export default async function ManageDocumentsPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const filter: DocumentFilter = sp.type === "normal" || sp.type === "test" ? sp.type : "all";
  const documentType = filter === "all" ? undefined : filter;
  const { items: documents, total } = await getTeacherDocumentCards(page, documentType);

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Quản lý tài liệu</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Tạo tài liệu Toán, thêm hình ảnh, gán nhiều chủ đề và đăng cho học sinh.</p></div><Link href="/quan-ly/tai-lieu/them" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">+ Thêm tài liệu</Link></div>
      <div className="mb-6 flex flex-wrap gap-2" aria-label="Lọc loại nội dung">
        {filters.map((item) => {
          const isActive = filter === item.value;
          const href = item.value === "all" ? "/quan-ly/tai-lieu" : `/quan-ly/tai-lieu?type=${item.value}`;
          return <Link key={item.value} href={href} className={`rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${isActive ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-400"}`} aria-current={isActive ? "page" : undefined}>{item.label}</Link>;
        })}
      </div>
      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700"><p className="text-sm text-slate-500">{filter === "all" ? "Chưa có tài liệu nào." : `Chưa có ${filter === "test" ? "bài kiểm tra" : "tài liệu"} nào.`}</p><Link href="/quan-ly/tai-lieu/them" className="mt-4 inline-block font-semibold text-indigo-600">Tạo tài liệu đầu tiên →</Link></div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{documents.map((card) => <DocumentManageCard key={card.id} card={card} />)}</div>
          <Pagination basePath="/quan-ly/tai-lieu" params={{ type: documentType }} page={page} total={total} pageSize={DOCS_PAGE_SIZE} />
        </>
      )}
    </div>
  );
}
