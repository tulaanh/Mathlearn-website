"use client";

import Link from "next/link";
import type { ChapterData, ChapterItem } from "@/lib/chapter-types";
import { useProgress } from "@/lib/progress";
import ProgressBar from "./ProgressBar";

export function getDynamicItemKey(item: ChapterItem): string {
  if (item.itemType === "quiz") return `quiz:${item.quizId}`;
  if (item.documentType === "test") return `document-quiz:${item.documentId}`;
  return `document:${item.documentId}`;
}

export default function ChapterCardDynamic({
  chapter,
  compact = false,
}: {
  chapter: ChapterData;
  compact?: boolean;
}) {
  const { progress } = useProgress();

  const docCount = chapter.items.filter((i) => i.itemType === "document").length;
  const quizCount = chapter.items.filter((i) => i.itemType === "quiz").length;

  // Calculate completion progress
  const totalItems = chapter.items.length;
  const doneCount = chapter.items.filter((item) => {
    const key = getDynamicItemKey(item);
    return (progress[key] ?? 0) === 100;
  }).length;

  const percent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <Link
      href={`/chuong/${chapter.id}`}
      className={`group flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e] dark:hover:border-indigo-500/60 ${
        compact ? "p-4" : "p-6"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
          {chapter.subject}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {chapter.grade}
        </span>
      </div>

      <h2 className="mb-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
        {chapter.title}
      </h2>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {chapter.description || "Chưa có mô tả."}
      </p>

      {/* Chapter statistics */}
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex gap-2">
          {docCount > 0 && <span>📄 {docCount} tài liệu</span>}
          {quizCount > 0 && <span>✓ {quizCount} bài test</span>}
          {totalItems === 0 && <span>Trống</span>}
        </div>
        <span>
          {doneCount}/{totalItems} hoàn thành
        </span>
      </div>

      <ProgressBar percent={percent} />

      <span className="mt-4 text-sm font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
        Vào học →
      </span>
    </Link>
  );
}
