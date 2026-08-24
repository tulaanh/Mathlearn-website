"use client";

import Link from "next/link";
import { useEffect } from "react";
import type { StudyDocument } from "@/lib/document-types";
import type { ChapterNavigation } from "@/lib/chapter-types";
import { documentProgressKey, documentTestProgressKey, useProgress } from "@/lib/progress";

/**
 * Khối cuối trang tài liệu: thẻ bài kiểm tra đính kèm (nếu có) gộp chung với trạng
 * thái hoàn thành và gợi ý bài kế tiếp — luôn duy nhất MỘT thẻ hành động để tránh
 * trùng lặp CTA làm bài test.
 * - Tài liệu có test đính kèm: nộp bài = hoàn thành (tự ghi nhận khi quay lại trang này).
 * - Tài liệu thường: học sinh bấm "Hoàn thành bài học".
 */
export default function DocumentNextStep({
  document,
  navigation,
}: {
  document: Pick<StudyDocument, "id" | "attachedTest">;
  navigation: ChapterNavigation | null;
}) {
  const { progress, setPercent } = useProgress();

  const attachedTest = document.attachedTest ?? null;
  const docKey = documentProgressKey(document.id);
  const testKey = attachedTest ? documentTestProgressKey(attachedTest.id) : null;
  // "Đã nộp" = key tồn tại trong tiến trình (điểm có thể là 0 ngay sau khi nộp)
  const testSubmitted = !testKey || testKey in progress;
  const isDone = (progress[docKey] ?? 0) === 100;

  // Nộp bài test đính kèm là coi như hoàn thành tài liệu
  useEffect(() => {
    if (testKey && testSubmitted && !isDone) setPercent(docKey, 100);
  }, [testKey, testSubmitted, isDone, docKey, setPercent]);

  // Thẻ bài kiểm tra đính kèm: hiện khi chưa nộp, hoặc khi tài liệu không thuộc
  // chương nào (giữ lối vào bài test sau khi nộp vì không có thẻ bài kế tiếp)
  if (attachedTest && (!testSubmitted || !navigation)) {
    return (
      <section className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-purple-300 bg-gradient-to-r from-purple-50 to-indigo-50 p-5 shadow-xs transition hover:shadow-md dark:border-purple-800/60 dark:from-purple-950/40 dark:to-indigo-950/40">
        <div className="min-w-0">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              testSubmitted
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                : "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300"
            }`}
          >
            {testSubmitted ? "✓ Đã nộp bài" : "Bài kiểm tra đính kèm"}
          </span>
          <h3 className="mt-2 truncate text-lg font-bold text-slate-900 dark:text-white">{attachedTest.title}</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kiểm tra kiến thức vừa học, chấm điểm tự động thang 10.</p>
          {navigation && !testSubmitted && (
            <p className="mt-1 text-sm font-medium text-purple-700 dark:text-purple-300">
              🔒 Nộp bài để hoàn thành bài học
              {navigation.nextItem ? (
                <>
                  {" "}— sau đó chuyển sang <strong>{navigation.nextItem.title}</strong>
                </>
              ) : (
                <> — hoàn thành luôn chương &quot;{navigation.chapterTitle}&quot;</>
              )}
            </p>
          )}
        </div>
        <Link
          href={`/quiz/${attachedTest.id}${navigation ? `?chuong=${navigation.chapterId}` : ""}`}
          className="shrink-0 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700"
        >
          {testSubmitted ? "Làm lại →" : "Làm bài →"}
        </Link>
      </section>
    );
  }

  if (!navigation) return null;

  // Chưa hoàn thành (tài liệu không có test đính kèm)
  if (!isDone) {
    return (
      <section className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50/70 p-5 text-center shadow-xs transition-colors dark:border-emerald-800/60 dark:bg-emerald-950/30 sm:p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Đã đọc xong bài học này?</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Bài {navigation.currentIndex + 1}/{navigation.totalItems} trong chương &quot;{navigation.chapterTitle}&quot;
          {navigation.nextItem && (
            <>
              {" "}· Bài kế tiếp:{" "}
              <strong className="text-slate-700 dark:text-slate-200">{navigation.nextItem.title}</strong>
            </>
          )}
        </p>
        <button
          type="button"
          onClick={() => setPercent(docKey, 100)}
          className="mt-4 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
        >
          ✅ Hoàn thành bài học
        </button>
      </section>
    );
  }

  // Đã hoàn thành — gợi ý bài kế tiếp hoặc chốt chương
  return (
    <section className="mt-6 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-5 shadow-xs transition-colors dark:border-emerald-800/60 dark:from-emerald-950/40 dark:to-teal-950/40 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
            🎉 Đã hoàn thành
          </span>
          {navigation.nextItem ? (
            <>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Bài kế tiếp: {navigation.nextItem.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Chương &quot;{navigation.chapterTitle}&quot; · bài {navigation.currentIndex + 1}/{navigation.totalItems}
              </p>
            </>
          ) : (
            <>
              <h3 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                Bạn đã hoàn thành toàn bộ chương &quot;{navigation.chapterTitle}&quot;! 🏆
              </h3>
              {navigation.nextChapter && (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Chương kế tiếp:{" "}
                  <strong className="text-slate-700 dark:text-slate-200">{navigation.nextChapter.title}</strong>
                </p>
              )}
            </>
          )}
        </div>
        {navigation.nextItem ? (
          <Link
            href={navigation.nextItem.url}
            className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Chuyển ngay →
          </Link>
        ) : navigation.nextChapter ? (
          <Link
            href={`/chuong/${navigation.nextChapter.id}`}
            className="shrink-0 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            Sang chương kế →
          </Link>
        ) : (
          <Link
            href={`/chuong/${navigation.chapterId}`}
            className="shrink-0 rounded-xl border border-emerald-500 px-6 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-950/60"
          >
            Về danh sách chương
          </Link>
        )}
      </div>
      {attachedTest && (
        <Link
          href={`/quiz/${attachedTest.id}?chuong=${navigation.chapterId}`}
          className="mt-3 inline-block text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
        >
          📝 Làm lại bài kiểm tra đính kèm
        </Link>
      )}
    </section>
  );
}
