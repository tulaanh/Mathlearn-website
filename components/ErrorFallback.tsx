"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

/** Giao diện lỗi dùng chung cho các error boundary của App Router (hỗ trợ Dark Mode). */
export default function ErrorFallback({ error, reset }: Props) {
  return (
    <section className="mx-auto flex max-w-lg flex-col items-center gap-5 py-16 text-center sm:py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl dark:bg-red-950/40">
        ⚠️
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Đã có lỗi xảy ra
        </h1>
        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Trang bạn đang xem gặp sự cố ngoài ý muốn. Đừng lo — hãy thử tải lại,
          hoặc quay về trang chủ nếu lỗi vẫn tiếp diễn.
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-slate-400 dark:text-slate-500">
            Mã lỗi: {error.digest}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          <span aria-hidden>↻</span> Thử lại
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
        >
          <span aria-hidden>🏠</span> Về trang chủ
        </Link>
      </div>
    </section>
  );
}
