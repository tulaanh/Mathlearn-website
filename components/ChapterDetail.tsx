"use client";

import Link from "next/link";
import { getTopicsByIds } from "@/data/topics";
import type { Chapter } from "@/lib/types";
import { chapterPercent, lessonKey, useProgress } from "@/lib/progress";
import ProgressBar from "./ProgressBar";

export default function ChapterDetail({ chapter }: { chapter: Chapter }) {
  const { progress, setPercent } = useProgress();
  const percent = chapterPercent(chapter, progress);

  return (
    <div className="mx-auto max-w-3xl">
      {/* Tiêu đề chương */}
      <a
        href="/"
        className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Về trang chủ
      </a>

      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            {chapter.subject}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {chapter.grade}
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          {chapter.title}
        </h1>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
          {chapter.description}
        </p>

        {/* Tiến trình toàn chương */}
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span>📊 Tiến trình chương</span>
          <span
            className={
              percent === 100
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-indigo-600 dark:text-indigo-400"
            }
          >
            {percent}%
          </span>
        </div>
        <div className="mt-2">
          <ProgressBar percent={percent} showLabel={false} />
        </div>
      </div>

      {/* Danh sách bài học */}
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        📖 Danh sách bài học
      </h2>
      <div className="grid gap-4">
        {chapter.lessons.map((lesson, index) => {
          const key = lessonKey(lesson);
          const lessonPercent = progress[key] ?? 0;
          const isDone = lessonPercent === 100;

          return (
            <div
              key={lesson.id}
              className={`rounded-2xl border bg-white p-5 shadow-xs transition-colors dark:bg-[#131b2e] ${
                isDone
                  ? "border-emerald-300 dark:border-emerald-800/80"
                  : "border-slate-200/80 dark:border-slate-800/80"
              }`}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <p className="font-semibold text-slate-900 dark:text-white">
                  <span
                    className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${
                      isDone ? "bg-emerald-500" : "bg-indigo-600"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>
                  {lesson.title}
                  {lesson.quizId && (
                    <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 align-middle text-[11px] font-semibold text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">
                      Có bài test
                    </span>
                  )}
                </p>
                {isDone && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                    Hoàn thành
                  </span>
                )}
              </div>

              {lesson.description && (
                <p className="mb-3 pl-9 text-sm text-slate-600 dark:text-slate-400">
                  {lesson.description}
                </p>
              )}

              {lesson.topicIds && lesson.topicIds.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-1.5 pl-9">
                  {getTopicsByIds(lesson.topicIds).map((topic) => (
                    <span
                      key={topic.id}
                      className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
                    >
                      {topic.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Tiến trình bài học */}
              <div className="mb-4 pl-9">
                <ProgressBar percent={lessonPercent} />
              </div>

              {/* Hành động */}
              <div className="pl-9">
                {lesson.quizId ? (
                  <Link
                    href={`/quiz/${lesson.quizId}`}
                    className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    {lessonPercent > 0
                      ? `🔄 Làm lại (điểm tốt nhất: ${lessonPercent}%)`
                      : "📝 Làm bài test"}
                  </Link>
                ) : isDone ? (
                  <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    🎉 Bạn đã hoàn thành bài học này
                  </span>
                ) : (
                  <button
                    onClick={() => setPercent(key, 100)}
                    className="rounded-xl border border-indigo-500 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                  >
                    ✅ Đánh dấu đã học
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
