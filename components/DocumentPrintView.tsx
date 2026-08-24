"use client";

import { useState } from "react";
import Link from "next/link";
import type { StudyDocument, QuizQuestion } from "@/lib/document-types";
import { getDocumentImageUrl } from "@/lib/document-url";
import { resolveAllExplanationImages } from "@/lib/document-preview";
import MathText from "./MathText";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Ảnh đính kèm câu hỏi (nếu có). */
function QuestionImage({ question }: { question: QuizQuestion }) {
  if (!question.imageStoragePath) return null;
  return (
    <figure className="my-2 break-inside-avoid text-center">
      <img src={getDocumentImageUrl(question.imageStoragePath)} alt={question.imageCaption || "Ảnh câu hỏi"} className="mx-auto max-h-72" />
      {question.imageCaption && <figcaption className="mt-1 text-center text-xs italic">{question.imageCaption}</figcaption>}
    </figure>
  );
}

/** Hộp giải thích chỉ in khi bật "Hiện đáp án". */
function ExplanationBox({ question }: { question: QuizQuestion }) {
  const hasText = Boolean(question.explanation?.trim());
  const images = resolveAllExplanationImages(question);
  if (!hasText && images.length === 0) return null;
  return (
    <div className="mt-2 break-inside-avoid rounded border border-slate-400 p-2.5 text-sm">
      <div className="font-bold">Giải thích: </div>
      {images.length > 0 && (
        <div className={images.length === 1 ? "my-2 space-y-2" : "my-2 grid grid-cols-2 gap-2"}>
          {images.map((img, idx) => (
            <figure key={idx} className="break-inside-avoid text-center">
              <img
                src={img.src}
                alt={img.caption || `Ảnh lời giải ${idx + 1}`}
                className="mx-auto max-h-72 object-contain"
              />
              {img.caption && (
                <figcaption className="mt-1 text-center text-xs italic">{img.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
      {hasText && <MathText text={question.explanation!} className="inline" />}
    </div>
  );
}

/** Một câu hỏi dạng tĩnh dành cho bản in (không tương tác). */
function PrintQuestion({ question, index, showAnswers }: { question: QuizQuestion; index: number; showAnswers: boolean }) {
  const qType = question.type || "multiple_choice";
  const options = question.options ?? [];
  const correctIndex = Math.max(0, options.findIndex((o) => o.id === question.correctOptionId));

  return (
    <div className="mb-5 break-inside-avoid">
      <div className="font-semibold leading-7">
        <span>Câu {index}. </span>
        <MathText text={question.text} className="inline font-semibold" />
      </div>
      <QuestionImage question={question} />

      {qType === "multiple_choice" && (
        <ul className="mt-1 space-y-0.5 pl-6">
          {options.map((opt, i) => {
            const isCorrect = showAnswers && i === correctIndex;
            return (
              <li key={opt.id} className={isCorrect ? "font-bold" : undefined}>
                {OPTION_LETTERS[i] ?? String.fromCharCode(65 + i)}. <MathText text={opt.text} className="inline" />
                {isCorrect && " ✓"}
              </li>
            );
          })}
        </ul>
      )}

      {qType === "true_false" && (
        <ol className="mt-1 list-decimal space-y-0.5 pl-10">
          {(question.statements ?? []).map((s) => (
            <li key={s.id} className="leading-7">
              <MathText text={s.text} className="inline" />
              {showAnswers ? (
                <span className="font-bold"> — {s.correctVal === "false" ? "Sai" : "Đúng"}</span>
              ) : (
                <span> ……… (Đ/S)</span>
              )}
            </li>
          ))}
        </ol>
      )}

      {qType === "short_answer" && (
        <div className="mt-2 pl-6 italic">
          {showAnswers && question.correctAnswer?.trim() ? (
            <>
              Đáp án: <span className="font-bold not-italic"><MathText text={question.correctAnswer} className="inline font-bold" /></span>
            </>
          ) : (
            "Đáp án: …………………………………………………………"
          )}
        </div>
      )}

      {qType === "essay" && !showAnswers && (
        <div className="mt-4 space-y-6 pl-6">
          <div className="border-b border-slate-400" />
          <div className="border-b border-slate-400" />
          <div className="border-b border-slate-400" />
        </div>
      )}

      {showAnswers && <ExplanationBox question={question} />}
    </div>
  );
}

/** Bản trình bày chuẩn A4 để in hoặc lưu PDF qua hộp thoại in của trình duyệt. */
export default function DocumentPrintView({ document }: { document: StudyDocument }) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="mx-auto max-w-3xl print:max-w-none">
      {/* Thanh công cụ chỉ hiện trên màn hình, bị ẩn khi in */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href={`/tai-lieu/${document.id}`} className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
          ← Quay lại tài liệu
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={(e) => setShowAnswers(e.target.checked)}
              className="h-4 w-4 accent-indigo-600"
            />
            Hiện đáp án và giải thích
          </label>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
          >
            🖨 In / Lưu PDF
          </button>
        </div>
      </div>

      {/* Trang in: luôn nền trắng chữ đen kể cả khi web đang ở chế độ tối (xem .print-sheet trong globals.css) */}
      <article className="print-sheet rounded-2xl bg-white p-8 shadow-sm print:rounded-none print:p-0 print:shadow-none">
        <header className="border-b border-slate-300 pb-4 text-center">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">{document.title}</h1>
          <p className="mt-1 text-sm">{[document.grade, ...document.topics.map((t) => t.name)].filter(Boolean).join(" · ")}</p>
          {document.description && <p className="mt-1 text-sm italic">{document.description}</p>}
        </header>

        <div className="mt-6">
          {document.blocks.map((block) => {
            if (block.type === "text") {
              return <MathText key={block.id ?? block.position} text={block.content} className="mb-4 text-base leading-8" />;
            }
            if (block.type === "lesson") {
              return (
                <section key={block.id ?? block.position} className="mb-5">
                  <h2 className="text-lg font-bold">{block.title}</h2>
                  {block.description && <p className="text-sm italic">{block.description}</p>}
                  <MathText text={block.content} className="mt-1 text-base leading-8" />
                </section>
              );
            }
            if (block.type === "quiz") {
              return (
                <section key={block.id ?? block.position} className="mb-6">
                  <h2 className="text-lg font-bold">{block.title}</h2>
                  {block.description && <p className="text-sm italic">{block.description}</p>}
                  <div className="mt-2">
                    {block.questions
                      .filter((q) => q.text.trim())
                      .map((q, i) => (
                        <PrintQuestion key={q.id} question={q} index={i + 1} showAnswers={showAnswers} />
                      ))}
                  </div>
                </section>
              );
            }
            return (
              <figure key={block.id ?? block.position} className="my-4 break-inside-avoid text-center">
                <img src={getDocumentImageUrl(block.storagePath)} alt={block.altText} className="mx-auto max-h-[500px]" />
                {block.caption && <figcaption className="mt-1 text-sm italic">{block.caption}</figcaption>}
              </figure>
            );
          })}
          {document.blocks.length === 0 && <p>Tài liệu chưa có nội dung.</p>}
        </div>

        <footer className="mt-8 border-t border-slate-200 pt-2 text-right text-xs text-slate-400 print:hidden" suppressHydrationWarning>
          MathLearn — {new Date().toLocaleDateString("vi-VN")}
        </footer>
      </article>
    </div>
  );
}
