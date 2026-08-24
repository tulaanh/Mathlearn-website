"use client";

import { useEffect } from "react";
import type { DocumentFormBlock } from "@/lib/document-types";
import { getTopicsByIds } from "@/data/topics";
import { resolvePreviewImageSrc } from "@/lib/document-preview";
import MathText from "./MathText";
import QuizBlock from "./QuizBlock";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  grade: string;
  status: "draft" | "published";
  selectedTopics: string[];
  blocks: DocumentFormBlock[];
};

/**
 * Bản xem trước tài liệu ngay trong trình soạn thảo, bố cục giống hệt
 * DocumentViewer nhưng hỗ trợ thêm ảnh chưa upload (object URL cục bộ)
 * và các khối đang soạn dở (placeholder thay vì bỏ qua).
 */
export default function DocumentPreviewModal(p: Props) {
  useEffect(() => {
    if (!p.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") p.onClose();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [p.open, p.onClose]);

  if (!p.open) return null;

  const topicNames = getTopicsByIds(p.selectedTopics).map((t) => t.name);
  const displayTitle = p.title.trim() || "(Chưa có tiêu đề)";
  const displayDescription = p.description.trim();

  const hasContent = p.blocks.some((b) => {
    if (b.type === "text") return Boolean(b.content.trim());
    if (b.type === "lesson") return Boolean(b.title.trim() && b.content.trim());
    if (b.type === "quiz") return Boolean(b.title.trim() && b.questions.some((q) => q.text.trim()));
    return Boolean(b.file || b.storagePath);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950"
      role="dialog"
      aria-modal="true"
      aria-label="Xem trước tài liệu"
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
            BẢN XEM TRƯỚC
          </span>
          <span className="hidden truncate text-xs text-slate-500 sm:inline dark:text-slate-400">
            Nội dung chưa được lưu vào hệ thống
          </span>
        </div>
        <button
          type="button"
          onClick={p.onClose}
          className="shrink-0 rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ✕ Đóng
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:py-8">
        <article className="mx-auto max-w-3xl">
          <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Toán</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{p.grade}</span>
              {topicNames.map((name) => (
                <span key={name} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{name}</span>
              ))}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300"}`}>
                {p.status === "published" ? "Sẽ đăng công khai" : "Sẽ lưu nháp"}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{displayTitle}</h1>
            {displayDescription && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{displayDescription}</p>}
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-8">
            {!hasContent && <p className="text-sm text-slate-500">Tài liệu chưa có nội dung để xem trước.</p>}
            {p.blocks.map((b, i) => {
              if (b.type === "text") {
                if (!b.content.trim()) return null;
                return (
                  <section key={i} className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
                    <MathText text={b.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />
                  </section>
                );
              }
              if (b.type === "lesson") {
                if (!b.title.trim() && !b.content.trim()) return null;
                return (
                  <section key={i} className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
                    <div className="mb-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/70 dark:text-green-300">Bài giảng</span>
                      {b.title.trim() && <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{b.title}</h3>}
                      {b.description?.trim() && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{b.description}</p>}
                    </div>
                    {b.content.trim() && <MathText text={b.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />}
                  </section>
                );
              }
              if (b.type === "quiz") {
                const quizQuestions = b.questions.filter((q) => q.text.trim());
                if (!b.title.trim() || !quizQuestions.length) return null;
                return (
                  <QuizBlock
                    key={i}
                    block={{ type: "quiz", title: b.title, description: b.description, questions: quizQuestions, position: i }}
                  />
                );
              }
              // Khối ảnh
              const src = resolvePreviewImageSrc(b);
              return (
                <figure key={i}>
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={b.altText || "Hình ảnh tài liệu Toán"} loading="lazy" decoding="async" className="max-h-[720px] w-full rounded-xl object-contain" />
                  ) : (
                    <div className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400 dark:border-slate-700">
                      🖼 Chưa chọn ảnh cho phần này
                    </div>
                  )}
                  {b.caption.trim() && <figcaption className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">{b.caption}</figcaption>}
                </figure>
              );
            })}
          </div>
        </article>
      </div>

    </div>
  );
}
