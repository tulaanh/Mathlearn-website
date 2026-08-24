"use client";

import Link from "next/link";
import type { LearningPathData } from "@/lib/path-types";
import { useProgress } from "@/lib/progress";
import ProgressBar from "./ProgressBar";
import { getDynamicItemKey } from "./ChapterCardDynamic";

export default function PathCard({ path }: { path: LearningPathData }) {
  const { progress } = useProgress();

  const allItems = path.chapters.flatMap((chapter) => chapter.items);
  const totalItems = allItems.length;
  const doneCount = allItems.filter((item) => {
    const key = getDynamicItemKey(item);
    return (progress[key] ?? 0) === 100;
  }).length;

  const percent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <Link
      href={`/lo-trinh/${path.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e] dark:hover:border-indigo-500/60"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
          {path.subject}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {path.grade}
        </span>
      </div>

      <h2 className="mb-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
        🧭 {path.title}
      </h2>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {path.description || "Chưa có mô tả."}
      </p>

      <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>📚 {path.chapters.length} chương</span>
        <span>
          {doneCount}/{totalItems} hoàn thành
        </span>
      </div>

      <ProgressBar percent={percent} />

      <span className="mt-4 text-sm font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
        Vào lộ trình →
      </span>
    </Link>
  );
}
