"use client";

import Link from "next/link";
import type { ChapterData } from "@/lib/chapter-types";
import { getChapterItemUrl } from "@/lib/chapter-types";
import { useProgress } from "@/lib/progress";
import ProgressBar from "./ProgressBar";
import { getDynamicItemKey } from "./ChapterCardDynamic";

export default function ChapterDetailDynamic({ chapter }: { chapter: ChapterData }) {
  const { progress, setPercent } = useProgress();

  const totalItems = chapter.items.length;
  const doneCount = chapter.items.filter((item) => {
    const key = getDynamicItemKey(item);
    return (progress[key] ?? 0) === 100;
  }).length;

  const percent = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Quay lại */}
      <Link
        href="/chuong"
        className="mb-3 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Về danh sách chương học
      </Link>

      {/* Thông tin chương */}
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
          {chapter.description || "Chưa có mô tả."}
        </p>

        {/* Tiến trình chương */}
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

      {/* Danh sách nội dung */}
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        📖 Nội dung chương
      </h2>
      <div className="grid gap-4">
        {chapter.items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white p-8 text-center dark:border-slate-800/80 dark:bg-[#131b2e]">
            <p className="text-sm text-slate-500">Chương này chưa có nội dung bài học.</p>
          </div>
        ) : (
          chapter.items.map((item, index) => {
            const key = getDynamicItemKey(item);
            const itemPercent = progress[key] ?? 0;
            const isDone = itemPercent === 100;

            const isQuiz = item.itemType === "quiz";
            const isTestDoc = item.itemType === "document" && item.documentType === "test";
            const isNormalDoc = item.itemType === "document" && item.documentType === "normal";

            // Link học tập kèm ngữ cảnh chương (?chuong=) để trang đích gợi ý đúng bài kế tiếp
            const learnUrl = getChapterItemUrl(item, chapter.id);

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition-colors dark:bg-[#131b2e] ${
                  isDone
                    ? "border-emerald-300 dark:border-emerald-800/80"
                    : "border-slate-200/80 dark:border-slate-800/80"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    <span
                      className={`mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white ${
                        isDone ? "bg-emerald-500" : "bg-indigo-600"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                    {item.title}
                    <span className="ml-2 inline-flex gap-1.5 align-middle">
                      {isNormalDoc && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                          Tài liệu lý thuyết
                        </span>
                      )}
                      {(isQuiz || isTestDoc) && (
                        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-950/70 dark:text-violet-300">
                          Bài kiểm tra
                        </span>
                      )}
                    </span>
                  </div>

                  {isDone && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
                      Hoàn thành
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mb-4 pl-9 text-sm text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                )}

                {/* ProgressBar cho bài học */}
                <div className="mb-4 pl-9">
                  <ProgressBar percent={itemPercent} />
                </div>

                {/* Nút hành động */}
                <div className="pl-9">
                  {isNormalDoc ? (
                    isDone ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          🎉 Bạn đã hoàn thành bài học này
                        </span>
                        <Link
                          href={learnUrl}
                          className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          Xem lại tài liệu
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          href={learnUrl}
                          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                          📖 Đọc tài liệu
                        </Link>
                        <button
                          onClick={() => setPercent(key, 100)}
                          className="rounded-xl border border-indigo-500 px-5 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/60"
                        >
                          ✅ Đánh dấu đã học
                        </button>
                      </div>
                    )
                  ) : (
                    <Link
                      href={learnUrl}
                      className="inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      {itemPercent > 0
                        ? `🔄 Làm lại (điểm tốt nhất: ${itemPercent}%)`
                        : "📝 Làm bài test"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
