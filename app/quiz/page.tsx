import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { topics } from "@/data/topics";
import { getPublishedTestDocumentCards } from "@/lib/documents";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import TestCard from "@/components/TestCard";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import { DOCS_PAGE_SIZE } from "@/lib/documents";

export const metadata: Metadata = {
  title: "Đề kiểm tra & Luyện tập Toán trực tuyến",
  description:
    "Tổng hợp các bài kiểm tra, đề thi thử trắc nghiệm Toán bám sát chương trình. Hệ thống tự động chấm điểm ngay sau khi nộp bài và xem lời giải.",
  openGraph: {
    title: "Đề kiểm tra & Luyện tập Toán trực tuyến",
    description:
      "Tổng hợp các bài kiểm tra, đề thi thử trắc nghiệm Toán bám sát chương trình. Hệ thống tự động chấm điểm ngay sau khi nộp bài và xem lời giải.",
    type: "website",
    siteName: "MathLearn",
  },
  twitter: {
    card: "summary",
    title: "Đề kiểm tra & Luyện tập Toán trực tuyến",
    description:
      "Tổng hợp các bài kiểm tra, đề thi thử trắc nghiệm Toán bám sát chương trình. Hệ thống tự động chấm điểm ngay sau khi nộp bài và xem lời giải.",
  },
};

type Props = { searchParams: Promise<{ topic?: string; page?: string }> };

export default async function TestsPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <div className="mx-auto max-w-4xl"><SupabaseConfigNotice /></div>;
  const { user } = await getCurrentUser();
  if (!user) return <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"><h1 className="text-2xl font-bold dark:text-white">Cần đăng nhập</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Hãy đăng nhập để làm bài kiểm tra và xem điểm.</p><Link href="/dang-nhap" className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white">Đăng nhập</Link></div>;
  const { topic, page } = await searchParams;
  const currentPage = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="mb-2 text-sm font-medium text-indigo-600">LUYỆN TẬP & ĐÁNH GIÁ</p><h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Bài kiểm tra</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Làm bài, nộp bài và nhận điểm tự động trên thang điểm 10.</p></div><Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">← Về tổng quan</Link></div>
      <div className="mb-6 flex flex-wrap gap-2"><Link href="/quiz" className={`rounded-full px-4 py-2 text-sm font-semibold ${!topic ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>Tất cả</Link>{topics.map((item) => <Link key={item.id} href={`/quiz?topic=${item.id}`} className={`rounded-full px-4 py-2 text-sm font-semibold ${topic === item.id ? "bg-indigo-600 text-white" : "border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>{item.name}</Link>)}</div>
      
      <Suspense key={`${topic}-${currentPage}`} fallback={<TestsPageSkeleton />}>
        <TestListContainer topic={topic} page={currentPage} />
      </Suspense>
    </div>
  );
}

async function TestListContainer({ topic, page }: { topic?: string; page: number }) {
  const { items: tests, total } = await getPublishedTestDocumentCards(topic, page);
  const questionCount = tests.reduce((sum, card) => sum + card.questionCount, 0);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-purple-100 bg-purple-50 p-4 dark:border-purple-950 dark:bg-purple-950/40"><p className="text-xs font-semibold text-purple-600">TỔNG BÀI KIỂM TRA</p><strong className="mt-1 block text-2xl text-purple-700 dark:text-purple-300">{tests.length}</strong></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">TỔNG CÂU HỎI</p><strong className="mt-1 block text-2xl dark:text-white">{questionCount}</strong><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Chấm tự động khi nộp bài</p></div><div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">CHỦ ĐỀ</p><strong className="mt-1 block text-2xl dark:text-white">{new Set(tests.flatMap((card) => card.topics.map((t) => t.id))).size}</strong><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Có thể gắn nhiều chủ đề/bài</p></div></div>
      {tests.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700">Chưa có bài kiểm tra nào đã đăng trong chủ đề này.</div> : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{tests.map((card) => <TestCard key={card.id} card={card} />)}</div>
          <Pagination basePath="/quiz" params={{ topic }} page={page} total={total} pageSize={DOCS_PAGE_SIZE} />
        </>
      )}
    </>
  );
}

function TestsPageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-20 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-44 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
