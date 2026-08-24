import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { topics } from "@/data/topics";
import { getPublishedDocumentCards } from "@/lib/documents";
import { getCurrentUser } from "@/lib/supabase/server";
import DocumentCard from "@/components/DocumentCard";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { DOCS_PAGE_SIZE } from "@/lib/documents";

export const metadata = { title: "Thư viện tài liệu" };

type Props = { searchParams: Promise<{ topic?: string; page?: string }> };

export default async function DocumentsPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-4xl"><SupabaseConfigNotice /></div>;
  const { user, profile } = await getCurrentUser();
  if (!user) return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"><h1 className="text-2xl font-bold dark:text-white">Cần đăng nhập</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy đăng nhập để xem tài liệu học tập.</p><Link href="/dang-nhap" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Đăng nhập</Link></div>;
  if (profile?.role !== "teacher") redirect("/lo-trinh");
  const { topic, page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Thư viện tài liệu</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Xem trước các tài liệu đã đăng cho học sinh theo khối lớp và chủ đề.</p></div><Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">← Về tổng quan</Link></div>
      <div className="mb-6 flex flex-wrap gap-2"><Link href="/tai-lieu" className={`rounded-full px-4 py-2 text-sm font-semibold ${!topic ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>Tất cả</Link>{topics.map((item) => <Link key={item.id} href={`/tai-lieu?topic=${item.id}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${topic === item.id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>{item.name}</Link>)}</div>
      
      <Suspense key={`${topic}-${currentPage}`} fallback={<DocumentsListSkeleton />}>
        <DocumentListContainer topic={topic} page={currentPage} />
      </Suspense>
    </div>
  );
}

async function DocumentListContainer({ topic, page }: { topic?: string; page: number }) {
  const { items, total } = await getPublishedDocumentCards(topic, page);
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">Chưa có tài liệu đã đăng trong chủ đề này.</div>;
  }
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((card) => <DocumentCard key={card.id} card={card} />)}
      </div>
      <Pagination basePath="/tai-lieu" params={{ topic }} page={page} total={total} pageSize={DOCS_PAGE_SIZE} />
    </>
  );
}

function DocumentsListSkeleton() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-44 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
      ))}
    </div>
  );
}
