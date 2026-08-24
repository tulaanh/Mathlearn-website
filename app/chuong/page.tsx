import Link from "next/link";
import { getChapters } from "@/lib/chapters";
import ChapterCardDynamic from "@/components/ChapterCardDynamic";

export const metadata = { title: "Chương học" };

export default async function ChaptersPage() {
  const chapters = await getChapters();

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">LỘ TRÌNH HỌC TẬP</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Chương học
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Khám phá các chương và học theo lộ trình của bạn.
          </p>
        </div>
        <Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">
          ← Về tổng quan
        </Link>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <span className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white">
          Tất cả chương
        </span>
        <span className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          {chapters.length} chương học
        </span>
      </div>

      {chapters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700 bg-white dark:bg-[#131b2e]">
          <div className="mx-auto mb-4 text-5xl">📚</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Chưa có chương học nào. Nội dung sẽ xuất hiện khi giáo viên thêm chương mới.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {chapters.map((chapter) => (
            <ChapterCardDynamic key={chapter.id} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}
