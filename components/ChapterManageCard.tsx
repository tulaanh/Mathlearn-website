"use client";

import Link from "next/link";
import type { ChapterData } from "@/lib/chapter-types";

export default function ChapterManageCard({
  chapter,
  onDelete,
  isDeleting,
}: {
  chapter: ChapterData;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}) {
  const docCount = chapter.items.filter((i) => i.itemType === "document").length;
  const quizCount = chapter.items.filter((i) => i.itemType === "quiz").length;

  return (
    <div className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e]">
      {/* Badges */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
          {chapter.subject}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {chapter.grade}
        </span>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-bold leading-snug text-slate-900 dark:text-white">
        {chapter.title}
      </h3>

      {/* Description */}
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {chapter.description || "Chưa có mô tả."}
      </p>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>📄 {docCount} tài liệu</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span>✓ {quizCount} bài kiểm tra</span>
      </div>

      {/* Updated */}
      <p className="mb-4 text-xs text-slate-400 dark:text-slate-500">
        Cập nhật: {new Date(chapter.updatedAt).toLocaleDateString("vi-VN")}
      </p>

      {/* Actions */}
      <div className="mt-auto flex items-center gap-2">
        <Link
          href={`/quan-ly/chuong/${chapter.id}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
        >
          ✏️ Sửa
        </Link>
        {onDelete && (
          <button
            onClick={() => onDelete(chapter.id)}
            disabled={isDeleting}
            className="rounded-lg border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
          >
            {isDeleting ? "Đang xóa..." : "🗑 Xóa"}
          </button>
        )}
      </div>
    </div>
  );
}
