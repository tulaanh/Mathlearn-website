"use client";

import { memo, useCallback, useEffect, useState } from "react";
import type { DocumentBlock, QuizQuestion } from "@/lib/document-types";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import {
  clearQuizBlockDraft,
  loadQuizBlockDraft,
  saveQuizBlockDraft,
} from "@/lib/exam-draft";
import LazyMathText from "./LazyMathText";
import DebouncedInput from "./DebouncedInput";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

function usableOptions(opts?: QuizQuestion["options"]) {
  if (!opts) return [];
  const seen = new Set<string>();
  return opts.filter((o) => {
    if (!o.text || !o.text.trim()) return false;
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return o;
  });
}

function statementsOf(q: QuizQuestion) {
  return q.statements ?? (q.options ?? []).map((o) => ({ id: o.id, text: o.text, correctVal: o.correctVal === "false" ? ("false" as const) : ("true" as const) }));
}

function statementKey(questionId: string, statementId: string) {
  return `${questionId}:${statementId}`;
}

/** Các khóa answer mà một câu hỏi dùng (id câu hỏi + id từng mệnh đề Đúng/Sai). */
function questionAnswerKeys(q: QuizQuestion): string[] {
  if (q.type !== "true_false") return [q.id];
  return [q.id, ...statementsOf(q).map((s) => statementKey(q.id, s.id))];
}

type QuizQuestionRowProps = {
  question: QuizQuestion;
  index: number;
  answers: Record<string, string>;
  submitted: boolean;
  showExplanation: boolean;
  onAnswer: (key: string, value: string) => void;
  onToggleExplanation: (questionId: string) => void;
  onZoomImage: (images: ZoomImageItem[], initialIndex: number) => void;
};

/** Chỉ so sánh answer của riêng câu này để câu khác không phải re-render khi trả lời. */
function quizQuestionRowPropsEqual(prev: QuizQuestionRowProps, next: QuizQuestionRowProps) {
  if (
    prev.question !== next.question ||
    prev.index !== next.index ||
    prev.submitted !== next.submitted ||
    prev.showExplanation !== next.showExplanation ||
    prev.onAnswer !== next.onAnswer ||
    prev.onToggleExplanation !== next.onToggleExplanation ||
    prev.onZoomImage !== next.onZoomImage
  ) {
    return false;
  }
  return questionAnswerKeys(next.question).every((k) => prev.answers[k] === next.answers[k]);
}

/** Một câu hỏi tương tác trong khối: trắc nghiệm, đúng/sai, điền ngắn, tự luận. */
const QuizQuestionRow = memo(function QuizQuestionRow({
  question: q,
  index: qi,
  answers,
  submitted,
  showExplanation,
  onAnswer,
  onToggleExplanation,
  onZoomImage,
}: QuizQuestionRowProps) {
  const qType = q.type || "multiple_choice";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="font-semibold text-slate-800 dark:text-slate-100">{qi + 1}. <LazyMathText inline text={q.text} /></div>

      {(() => {
        const imgSrc = resolveQuestionImageSrc(q);
        if (!imgSrc) return null;
        return (
          <figure className="my-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={q.imageCaption || "Hình ảnh câu hỏi"}
              loading="lazy"
              decoding="async"
              onClick={() => onZoomImage([{ src: imgSrc, caption: q.imageCaption }], 0)}
              className="mx-auto max-h-72 w-full cursor-zoom-in rounded-lg object-contain shadow-xs transition-transform hover:scale-[1.01]"
              title="Bấm để phóng to ảnh đề bài"
            />
            {q.imageCaption && <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">{q.imageCaption}</figcaption>}
          </figure>
        );
      })()}

      {qType === "multiple_choice" && (
        <div className="mt-3 space-y-2">
          {usableOptions(q.options).map((opt, oi) => {
            const selected = answers[q.id] === opt.id;
            const isCorrect = opt.id === q.correctOptionId;
            let style = "border-slate-300 hover:border-indigo-400 dark:border-slate-700";
            if (submitted && isCorrect) style = "border-green-500 bg-green-50 dark:bg-green-950/30";
            else if (submitted && selected && !isCorrect) style = "border-red-500 bg-red-50 dark:bg-red-950/30";
            else if (selected) style = "border-indigo-500 bg-indigo-500/15 text-indigo-950 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-white";
            return (
              <button
                key={opt.id}
                type="button"
                disabled={submitted}
                onClick={() => onAnswer(q.id, opt.id)}
                className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors disabled:cursor-default ${style}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold transition-colors ${selected && !submitted ? "bg-indigo-500/20 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{optionLabels[oi] ?? opt.id}</span>
                <span className={`${selected && !submitted ? "text-indigo-950 dark:text-white font-medium" : "text-slate-700 dark:text-slate-200"}`}><LazyMathText inline text={opt.text} /></span>
                {submitted && isCorrect && <span className="ml-auto font-bold text-green-600">✓ Đúng</span>}
                {submitted && selected && !isCorrect && <span className="ml-auto font-bold text-red-600">✗ Sai</span>}
              </button>
            );
          })}
        </div>
      )}

      {qType === "true_false" && (
        <div className="mt-3 space-y-3">
          {statementsOf(q).map((statement, si) => {
            const answerKey = statementKey(q.id, statement.id);
            const selected = answers[answerKey];
            const options = [
              { id: "true", text: "Đúng" },
              { id: "false", text: "Sai" },
            ];
            return (
              <div key={statement.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div className="text-sm text-slate-700 dark:text-slate-200"><span className="mr-2 font-bold text-slate-500">{String.fromCharCode(97 + si)}.</span><LazyMathText inline text={statement.text} /></div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {options.map((option) => {
                    const isSelected = selected === option.id;
                    const isCorrect = option.id === statement.correctVal;
                    let style = "border-slate-200 hover:border-indigo-400 dark:border-slate-700";
                    if (submitted && isCorrect) style = "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300";
                    else if (submitted && isSelected && !isCorrect) style = "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300";
                    else if (isSelected) style = "border-indigo-500 bg-indigo-500/15 text-indigo-950 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-white font-semibold";
                    return <button key={option.id} type="button" disabled={submitted} onClick={() => onAnswer(answerKey, option.id)} className={`rounded-lg border p-2 text-sm font-semibold transition-colors disabled:cursor-default ${style}`}>
                      {option.text}{submitted && isCorrect && " ✓"}{submitted && isSelected && !isCorrect && " ✗"}
                    </button>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {qType === "short_answer" && (
        <div className="mt-3 space-y-2">
          <DebouncedInput
            disabled={submitted}
            placeholder={submitted ? "Chưa có câu trả lời" : "Nhập câu trả lời ngắn của bạn..."}
            value={answers[q.id] ?? ""}
            onCommit={(v) => onAnswer(q.id, v)}
            className={`h-11 w-full rounded-xl border px-4 text-sm dark:bg-slate-950 dark:text-white ${
              submitted
                ? (answers[q.id] ?? "").trim().toLowerCase() === (q.correctAnswer ?? "").trim().toLowerCase()
                  ? "border-green-500 bg-green-50/30 dark:bg-green-950/20"
                  : "border-red-500 bg-red-50/30 dark:bg-red-950/20"
                : "border-slate-300 focus:border-indigo-500 dark:border-slate-700"
            }`}
          />
          {submitted && (
            <div className="text-xs">
              {(answers[q.id] ?? "").trim().toLowerCase() === (q.correctAnswer ?? "").trim().toLowerCase() ? (
                <span className="font-bold text-green-600">✓ Trả lời chính xác!</span>
              ) : (
                <span className="text-slate-500">
                  <span className="font-bold text-red-600">✗ Chưa đúng.</span> Đáp án chính xác là:{" "}
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
                    {q.correctAnswer && <LazyMathText text={q.correctAnswer} inline />}
                  </span>
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {qType === "essay" && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          ✏️ Câu hỏi tự luận — Làm bài ra giấy/vở và đối chiếu với lời giải bên dưới.
        </div>
      )}

      {(() => {
        const expImages = resolveAllExplanationImages(q);
        const hasExplanation = Boolean(q.explanation?.trim() || expImages.length > 0);
        if (!hasExplanation) return null;
        return (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => onToggleExplanation(q.id)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950/70"
            >
              💡 {showExplanation ? "Ẩn hướng dẫn giải / giải thích" : "Xem hướng dẫn giải / giải thích"}
            </button>
            {showExplanation && (
              <div className="mt-2 space-y-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                {expImages.length > 0 && (
                  <div className={expImages.length === 1 ? "space-y-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
                    {expImages.map((img, imgIdx) => (
                      <figure key={imgIdx} className="group relative text-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.src}
                          alt={img.caption || `Hình ảnh lời giải ${imgIdx + 1}`}
                          loading="lazy"
                          decoding="async"
                          onClick={() => onZoomImage(expImages, imgIdx)}
                          className="mx-auto max-h-80 w-full cursor-zoom-in rounded-lg object-contain shadow-xs transition-transform hover:scale-[1.01] hover:shadow-md"
                          title="Bấm để phóng to và xem chi tiết ảnh"
                        />
                        {img.caption && (
                          <figcaption className="mt-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                            {img.caption}
                          </figcaption>
                        )}
                      </figure>
                    ))}
                  </div>
                )}
                {q.explanation?.trim() && <LazyMathText text={q.explanation} />}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}, quizQuestionRowPropsEqual);

export default function QuizBlock({ block }: { block: Extract<DocumentBlock, { type: "quiz" }> }) {
  const questions: QuizQuestion[] = Array.isArray(block.questions) ? block.questions : [];
  const blockKey = block.id || `${block.position}_${block.title}`;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [visibleExplanations, setVisibleExplanations] = useState<Record<string, boolean>>({});
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Khôi phục câu trả lời từ localStorage khi load
  useEffect(() => {
    const draft = loadQuizBlockDraft(blockKey);
    if (draft) {
      if (draft.answers) setAnswers(draft.answers);
      if (draft.submitted) setSubmitted(true);
    }
    setHasInitialized(true);
  }, [blockKey]);

  // Tự động lưu câu trả lời vào localStorage
  useEffect(() => {
    if (!hasInitialized) return;
    if (Object.keys(answers).length > 0 || submitted) {
      saveQuizBlockDraft(blockKey, { answers, submitted });
    } else {
      clearQuizBlockDraft(blockKey);
    }
  }, [blockKey, answers, submitted, hasInitialized]);

  /** Callback ổn định để QuizQuestionRow memo hoạt động: trả lời 1 câu không re-render cả block. */
  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers((a) => ({ ...a, [key]: value }));
  }, []);
  const toggleExplanation = useCallback((questionId: string) => {
    setVisibleExplanations((s) => ({ ...s, [questionId]: !s[questionId] }));
  }, []);
  const openZoom = useCallback((images: ZoomImageItem[], initialIndex: number) => {
    setZoomState({ images, initialIndex });
  }, []);

  const responseCount = (q: QuizQuestion) => q.type === "true_false" ? statementsOf(q).length : (q.type === "essay" ? 0 : 1);
  const autoGradedQuestions = questions.filter(q => q.type !== "essay");
  const total = autoGradedQuestions.reduce((sum, q) => sum + responseCount(q), 0);
  const correctCount = submitted
    ? autoGradedQuestions.reduce((sum, q) => {
        if (q.type === "true_false") return sum + statementsOf(q).filter((s) => answers[statementKey(q.id, s.id)] === s.correctVal).length;
        const studentAns = answers[q.id];
        if (q.type === "short_answer") return sum + ((studentAns ?? "").trim().toLowerCase() === (q.correctAnswer ?? "").trim().toLowerCase() ? 1 : 0);
        return sum + (studentAns === q.correctOptionId ? 1 : 0);
      }, 0)
    : 0;
  const answeredCount = autoGradedQuestions.reduce((sum, q) => sum + (q.type === "true_false" ? statementsOf(q).filter((s) => answers[statementKey(q.id, s.id)]).length : answers[q.id] ? 1 : 0), 0);

  return (
    <section className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5 dark:border-purple-900 dark:bg-purple-950/20">
      <div className="mb-4">
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">Câu hỏi tương tác</span>
        <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{block.title}</h3>
        {block.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.description}</p>}
      </div>

      <div className="space-y-6">
        {questions.map((q, qi) => (
          <QuizQuestionRow
            key={q.id}
            question={q}
            index={qi}
            answers={answers}
            submitted={submitted}
            showExplanation={!!visibleExplanations[q.id]}
            onAnswer={setAnswer}
            onToggleExplanation={toggleExplanation}
            onZoomImage={openZoom}
          />
        ))}
      </div>

      {total > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {!submitted ? (
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              disabled={answeredCount < total}
              className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Nộp bài
            </button>
          ) : (
            <>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                Kết quả: {correctCount}/{total} ý đúng 🎉
              </p>
              <button
                type="button"
                onClick={() => {
                  clearQuizBlockDraft(blockKey);
                  setAnswers({});
                  setSubmitted(false);
                }}
                className="rounded-xl border border-purple-300 px-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950/40"
              >
                Làm lại
              </button>
            </>
          )}
          {!submitted && answeredCount < total && (
            <span className="text-xs text-slate-500">Đã trả lời {answeredCount}/{total} ý</span>
          )}
        </div>
      )}

      {/* Modal phóng to ảnh tương tác */}
      {zoomState && (
        <ImageZoomModal
          images={zoomState.images}
          initialIndex={zoomState.initialIndex}
          onClose={() => setZoomState(null)}
        />
      )}
    </section>
  );
}
