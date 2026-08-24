"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudyDocument } from "@/lib/document-types";
import type { ChapterNavigation } from "@/lib/chapter-types";
import { getDocumentImageUrl } from "@/lib/document-url";
import QuizBlock from "./QuizBlock";
import LazyMathText from "./LazyMathText";
import DocumentNextStep from "./DocumentNextStep";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";

export default function DocumentViewer({
  document,
  navigation = null,
}: {
  document: StudyDocument;
  navigation?: ChapterNavigation | null;
}) {
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);

  // Tập hợp danh sách tất cả các ảnh trong tài liệu để có thể lướt qua lại
  const imageBlocks = document.blocks.filter((b): b is Extract<typeof b, { type: "image" }> => b.type === "image");
  const docImages: ZoomImageItem[] = imageBlocks.map((b) => ({
    src: getDocumentImageUrl(b.storagePath),
    caption: b.caption || b.altText,
  }));

  return (
    <article className="mx-auto max-w-3xl">
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Toán</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{document.grade}</span>
            {document.topics.map((topic) => <span key={topic.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{topic.name}</span>)}
          </div>
          <Link
            href={`/tai-lieu/${document.id}/in`}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
          >
            ⬇ Xuất PDF
          </Link>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{document.title}</h1>
        {document.description && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{document.description}</p>}
      </div>

      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {document.blocks.map((block) => {
          if (block.type === "text") {
            return (
              <section key={block.id ?? block.position} className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
                <LazyMathText text={block.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />
              </section>
            );
          }
          if (block.type === "lesson") {
            return (
              <section key={block.id ?? block.position} className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
                <div className="mb-3">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/70 dark:text-green-300">Bài giảng</span>
                  <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{block.title}</h3>
                  {block.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.description}</p>}
                </div>
                <LazyMathText text={block.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />
              </section>
            );
          }
          if (block.type === "quiz") {
            return <QuizBlock key={block.id ?? block.position} block={block} />;
          }

          const src = getDocumentImageUrl(block.storagePath);
          const imgIndex = imageBlocks.findIndex((b) => b === block);
          return (
            <figure key={block.id ?? block.position} className="group relative text-center">
              <img
                src={src}
                alt={block.altText}
                loading="lazy"
                decoding="async"
                onClick={() => setZoomState({ images: docImages, initialIndex: Math.max(0, imgIndex) })}
                className="mx-auto max-h-[720px] w-full cursor-zoom-in rounded-xl object-contain shadow-xs transition-transform hover:scale-[1.005]"
                title="Bấm để phóng to ảnh"
              />
              {block.caption && <figcaption className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">{block.caption}</figcaption>}
            </figure>
          );
        })}
        {document.blocks.length === 0 && <p className="text-sm text-slate-500">Tài liệu chưa có nội dung.</p>}
      </div>

      <DocumentNextStep document={document} navigation={navigation} />

      {/* Modal phóng to ảnh */}
      {zoomState && (
        <ImageZoomModal
          images={zoomState.images}
          initialIndex={zoomState.initialIndex}
          onClose={() => setZoomState(null)}
        />
      )}
    </article>
  );
}
