"use client";

import Link from "next/link";
import { quizzes } from "@/data/quizzes";
import { useProgress } from "@/lib/progress";
import ChapterCardDynamic, { getDynamicItemKey } from "./ChapterCardDynamic";
import QuizCard from "./QuizCard";
import ProgressBar from "./ProgressBar";
import type { ChapterData } from "@/lib/chapter-types";

// Tính tiến trình của 1 chương động
function getChapterProgressPercent(chapter: ChapterData, progress: Record<string, number>): number {
  if (chapter.items.length === 0) return 0;
  const sum = chapter.items.reduce((acc, item) => {
    const key = getDynamicItemKey(item);
    return acc + (progress[key] ?? 0);
  }, 0);
  return Math.round(sum / chapter.items.length);
}

export default function HomeTabs({ chapters = [] }: { chapters?: ChapterData[] }) {
  const { progress } = useProgress();

  // Danh sách tất cả các mục học tập trong các chương
  const allItems = chapters.flatMap((chapter) => chapter.items);
  
  const getValue = (item: (typeof allItems)[number]) => {
    const key = getDynamicItemKey(item);
    return progress[key] ?? 0;
  };

  const done = allItems.filter((item) => getValue(item) === 100).length;
  const overall = allItems.length
    ? Math.round(allItems.reduce((total, item) => total + getValue(item), 0) / allItems.length)
    : 0;

  const current = chapters.find((chapter) => getChapterProgressPercent(chapter, progress) < 100) ?? chapters[0];

  return (
    <div className="mx-auto max-w-[1380px]">
      {/* Header Chào Mừng */}
      <section className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Hôm nay bạn muốn học gì nào?</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Chào mừng bạn quay lại! 👋
          </h1>
        </div>
        <Link
          href="/lo-trinh"
          className="w-fit rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700 hover:shadow-indigo-500/30 dark:shadow-none"
        >
          Tiếp tục học →
        </Link>
      </section>

      {/* 3 Thẻ Thống Kê */}
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 p-5 text-white shadow-md shadow-indigo-500/10">
          <p className="text-sm text-indigo-100 font-medium">Tiến độ tổng quan</p>
          <strong className="mt-2 block text-3xl font-extrabold">{overall}%</strong>
          <div className="mt-3">
            <ProgressBar percent={overall} showLabel={false} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
          <p className="text-sm text-slate-500 dark:text-slate-400">Nội dung học tập đã xong</p>
          <strong className="mt-2 block text-3xl font-extrabold dark:text-white">
            {done}
            <span className="text-base text-slate-400 font-normal">/{allItems.length}</span>
          </strong>
          <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Cố gắng duy trì nhé! 🚀</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
          <p className="text-sm text-slate-500 dark:text-slate-400">Bài kiểm tra ôn luyện</p>
          <strong className="mt-2 block text-3xl font-extrabold dark:text-white">{quizzes.length}</strong>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ôn tập mỗi ngày để tiến bộ</p>
        </div>
      </section>

      {/* Lộ Trình & Side Widgets */}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="min-w-0 space-y-6">
          {/* Lộ trình hiện tại */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold dark:text-white">Lộ trình hiện tại</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tiếp tục chinh phục kiến thức của bạn</p>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                Đang học
              </span>
            </div>

            {current ? (
              <>
                <p className="mb-3 font-bold text-slate-900 dark:text-slate-100">{current.title}</p>
                <ProgressBar percent={getChapterProgressPercent(current, progress)} />
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>📖 {current.items.length} nội dung</span>
                  <Link
                    href={`/chuong/${current.id}`}
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
                  >
                    Học tiếp →
                  </Link>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Chưa có chương học nào — nội dung sẽ xuất hiện khi gia sư thêm chương và bài kiểm tra mới.
              </p>
            )}
          </section>

          {/* Chương đang học */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Chương đang học</h2>
              <Link href="/lo-trinh" className="text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Xem tất cả
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chapters.map((chapter) => (
                <ChapterCardDynamic key={chapter.id} chapter={chapter} compact />
              ))}
              {chapters.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 sm:col-span-2 lg:col-span-3 dark:border-slate-800">
                  Chưa có chương học nào.
                </p>
              )}
            </div>
          </section>

          {/* Bài kiểm tra gợi ý */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Bài kiểm tra gợi ý</h2>
              <Link href="/quiz" className="text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Xem tất cả
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.slice(0, 2).map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} compact />
              ))}
              {quizzes.length === 0 && (
                <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 sm:col-span-2 dark:border-slate-800">
                  Chưa có bài kiểm tra nào.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets Right */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
            <h2 className="mb-5 text-lg font-bold dark:text-white">Tiến độ học tập</h2>
            
            {/* Vòng Tròn Tiến Độ */}
            <div
              className="mx-auto mb-5 flex h-40 w-40 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(#6366f1 ${overall * 3.6}deg, rgba(99, 102, 241, 0.15) 0deg)`,
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white transition-colors dark:bg-[#131b2e]">
                <strong className="text-2xl font-extrabold text-slate-900 dark:text-white">{overall}%</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Hoàn thành</span>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Đã học xong</span>
                <b className="text-slate-900 dark:text-white">{done}</b>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Bài kiểm tra</span>
                <b className="text-slate-900 dark:text-white">{quizzes.length}</b>
              </div>
            </div>
            <Link
              href="/lo-trinh"
              className="mt-5 block rounded-xl border border-indigo-200 py-2.5 text-center text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
            >
              Xem chi tiết
            </Link>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
            <h2 className="text-lg font-bold dark:text-white">Mục tiêu hôm nay 🏆</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Hoàn thành một bài học và làm một bài kiểm tra để duy trì nhịp học.
            </p>
            {current ? (
              <Link href={`/chuong/${current.id}`} className="mt-4 block text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Bắt đầu ngay →
              </Link>
            ) : (
              <Link href="/lo-trinh" className="mt-4 block text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">
                Xem lộ trình học tập →
              </Link>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
