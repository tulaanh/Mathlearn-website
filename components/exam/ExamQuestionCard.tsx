import { memo } from "react";
import type { QuizQuestion, DocumentTestAnswers, DocumentTestResult } from "@/lib/document-types";
import { isUnitCorrect, questionType, statementKey, statementsOf } from "@/lib/exam-scoring";
import { resolveQuestionImageSrc } from "@/lib/document-preview";
import type { ZoomImageItem } from "../ImageZoomModal";
import LazyMathText from "../LazyMathText";
import DebouncedInput from "../DebouncedInput";
import ExamExplanationBox from "./ExamExplanationBox";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

/** id DOM của thẻ câu hỏi, dùng để bảng câu hỏi cuộn tới. */
export const questionDomId = (questionId: string) => `cau-${questionId}`;

export function usableOptions(q: QuizQuestion) {
  const seen = new Set<string>();
  return (q.options ?? []).filter((o) => {
    if (!o.text || !o.text.trim()) return false;
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

/** Các khóa answer mà một câu hỏi dùng (id câu hỏi + id từng mệnh đề Đúng/Sai). */
export function questionAnswerKeys(q: QuizQuestion): string[] {
  const keys = [q.id];
  for (const s of statementsOf(q)) keys.push(statementKey(q.id, s.id));
  return keys;
}

export function answersEqualFor(keys: string[], a: DocumentTestAnswers, b: DocumentTestAnswers) {
  return keys.every((k) => a[k] === b[k]);
}

type ExamQuestionCardProps = {
  question: QuizQuestion;
  index: number;
  answers: DocumentTestAnswers;
  flagged: boolean;
  result: DocumentTestResult | null;
  onAnswer: (key: string, value: string) => void;
  onToggleFlag: (questionId: string) => void;
  onZoomImage: (images: ZoomImageItem[], initialIndex: number) => void;
  onReport: (question: QuizQuestion) => void;
  onToggleSave: (question: QuizQuestion) => void;
  isSaved: boolean;
};

function examQuestionCardPropsEqual(prev: ExamQuestionCardProps, next: ExamQuestionCardProps) {
  if (
    prev.question !== next.question ||
    prev.index !== next.index ||
    prev.result !== next.result ||
    prev.onAnswer !== next.onAnswer ||
    prev.flagged !== next.flagged ||
    prev.onToggleFlag !== next.onToggleFlag ||
    prev.onZoomImage !== next.onZoomImage ||
    prev.onReport !== next.onReport ||
    prev.onToggleSave !== next.onToggleSave ||
    prev.isSaved !== next.isSaved
  ) {
    return false;
  }
  return answersEqualFor(questionAnswerKeys(next.question), prev.answers, next.answers);
}

/** Thẻ một câu hỏi trong bài kiểm tra: khóa input sau khi nộp, hiện đáp án + giải thích và nút lưu vào ngân hàng. */
const ExamQuestionCard = memo(function ExamQuestionCard({
  question,
  index,
  answers,
  flagged,
  result,
  onAnswer,
  onToggleFlag,
  onZoomImage,
  onReport,
  onToggleSave,
  isSaved,
}: ExamQuestionCardProps) {
  const qType = questionType(question);
  const locked = !!result;
  const options = usableOptions(question);

  // Trạng thái đúng/sai của cả câu (null khi chưa nộp hoặc câu tự luận)
  const questionCorrect = locked && qType !== "essay"
    ? qType === "true_false"
      ? statementsOf(question).every((s) => isUnitCorrect(question, statementKey(question.id, s.id), answers))
      : isUnitCorrect(question, question.id, answers)
    : null;

  return (
    <div
      id={questionDomId(question.id)}
      className={`scroll-mt-24 rounded-xl border p-4 ${
        questionCorrect === null
          ? "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
          : questionCorrect
            ? "border-emerald-300 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20"
            : "border-rose-300 bg-rose-50/40 dark:border-rose-800/60 dark:bg-rose-950/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 font-semibold text-slate-800 dark:text-slate-100">
          {index + 1}. <LazyMathText inline text={question.text} />
          {qType === "essay" && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 align-middle text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">Tự luận</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {locked && (
            <button
              type="button"
              onClick={() => onToggleSave(question)}
              title={isSaved ? "Bỏ lưu câu hỏi khỏi Ngân hàng câu hỏi" : "Lưu câu hỏi này vào Ngân hàng câu hỏi"}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                isSaved
                  ? "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                  : "border-slate-200 bg-white text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-amber-700 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
              }`}
            >
              {isSaved ? "⭐ Đã lưu vào ngân hàng" : "☆ Lưu vào ngân hàng"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onReport(question)}
            title="Báo lỗi câu hỏi này (giải sai, đề sai, thiếu đề, đề mở...)"
            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
          >
            🚩 <span className="hidden sm:inline">Báo lỗi</span>
          </button>
          {!locked && (
            <button
              type="button"
              onClick={() => onToggleFlag(question.id)}
              title={flagged ? "Bỏ đánh dấu xem sau" : "Đánh dấu để xem sau"}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                flagged
                  ? "border-amber-500 bg-amber-400 font-bold text-amber-950 hover:bg-amber-300 dark:border-amber-400 dark:text-amber-950"
                  : "border-slate-200 bg-white text-slate-500 hover:border-amber-400 hover:text-amber-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
              }`}
            >
              🔖 {flagged ? "Đang xem sau" : "Xem sau"}
            </button>
          )}
        </div>
      </div>

      {(() => {
        const imgSrc = resolveQuestionImageSrc(question);
        if (!imgSrc) return null;
        return (
          <figure className="my-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt={question.imageCaption || "Hình ảnh câu hỏi"}
              loading="lazy"
              decoding="async"
              onClick={() => onZoomImage([{ src: imgSrc, caption: question.imageCaption }], 0)}
              className="mx-auto max-h-72 w-full cursor-zoom-in rounded-lg object-contain shadow-xs transition-transform hover:scale-[1.01]"
              title="Bấm để phóng to ảnh đề bài"
            />
            {question.imageCaption && <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">{question.imageCaption}</figcaption>}
          </figure>
        );
      })()}
      {qType === "multiple_choice" && (
        <div className="mt-3 grid gap-2">
          {options.map((option, i) => {
            const isSelected = answers[question.id] === option.id;
            const isAnswer = option.id === question.correctOptionId;
            let cls = isSelected
              ? "border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/30 text-indigo-950 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-white dark:ring-indigo-400/30"
              : "border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-500/60";
            if (locked) {
              cls = isAnswer
                ? "border-emerald-400 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : isSelected
                  ? "border-rose-400 bg-rose-50 text-rose-700 line-through dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300"
                  : "border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400";
            }
            return (
              <label key={option.id} className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-sm ${cls}`}>
                <input
                  type="radio"
                  name={question.id}
                  checked={isSelected}
                  disabled={locked}
                  onChange={() => onAnswer(question.id, option.id)}
                  className="h-4 w-4 accent-purple-600"
                />
                <span className={`font-semibold transition-colors ${isSelected && !locked ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400"}`}>{optionLabels[i] ?? i + 1}.</span>
                <LazyMathText text={option.text} className="min-w-0 flex-1" />
                {locked && isAnswer && <span className="ml-auto shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400">← Đáp án đúng</span>}
              </label>
            );
          })}
        </div>
      )}

      {qType === "true_false" && (
        <div className="mt-3 space-y-2">
          {statementsOf(question).map((s) => {
            const key = statementKey(question.id, s.id);
            const value = answers[key];
            const isRight = value === s.correctVal;
            return (
              <div
                key={s.id}
                className={`rounded-lg border px-3 py-2 ${
                  locked
                    ? isRight
                      ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800/60 dark:bg-emerald-950/30"
                      : "border-rose-300 bg-rose-50/60 dark:border-rose-800/60 dark:bg-rose-950/30"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <LazyMathText text={s.text} className="min-w-0 flex-1 text-sm text-slate-700 dark:text-slate-200" />
                  <div className="flex shrink-0 gap-2">
                    {(["true", "false"] as const).map((val) => {
                      const active = value === val;
                      return (
                        <label
                          key={val}
                          className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                            active
                              ? val === "true"
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-rose-500 bg-rose-500 text-white"
                              : "border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <input type="radio" name={key} className="sr-only" disabled={locked} checked={active} onChange={() => onAnswer(key, val)} />
                          {val === "true" ? "Đúng" : "Sai"}
                        </label>
                      );
                    })}
                  </div>
                </div>
                {locked && <p className="mt-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">Đáp án: {s.correctVal === "true" ? "Đúng" : "Sai"}</p>}
              </div>
            );
          })}
        </div>
      )}

      {qType === "short_answer" && (
        <div className="mt-3 space-y-2">
          <DebouncedInput
            value={answers[question.id] ?? ""}
            disabled={locked}
            placeholder="Nhập câu trả lời…"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            onCommit={(v) => onAnswer(question.id, v)}
          />
          {locked && (
            <p className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <span>Đáp án:</span> {question.correctAnswer && <LazyMathText text={question.correctAnswer} inline />}
            </p>
          )}
        </div>
      )}

      {qType === "essay" && (
        <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          ✏️ Câu hỏi tự luận — Làm bài ra giấy/vở và đối chiếu với đáp án/hướng dẫn giải sau khi nộp bài.
        </div>
      )}

      {locked && <ExamExplanationBox question={question} onZoomImage={onZoomImage} />}
    </div>
  );
}, examQuestionCardPropsEqual);

export default ExamQuestionCard;
