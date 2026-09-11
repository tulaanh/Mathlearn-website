"use client";

import type { QuestionDifficulty } from "@/lib/question-bank-types";
import { getDifficultyMeta } from "@/lib/question-bank-types";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import LazyMathText from "@/components/LazyMathText";

export type TreocoCauHoiClient = {
  id: string;
  text: string;
  options: string[];
  imageStoragePath?: string;
  imageUrl?: string;
  imageCaption?: string;
};

export type TreocoKetQua = {
  correct: boolean;
  correctIndex: number;
  explanation: string;
  nextQuestionAt: string;
  explanationImageUrl?: string;
  explanationImageStoragePath?: string;
  explanationImages?: Array<{ storagePath?: string; caption?: string; url?: string }>;
};

type Props = {
  question: TreocoCauHoiClient;
  difficulty: QuestionDifficulty;
  answerIndex: number | null;
  result: TreocoKetQua | null;
  submitting: boolean;
  onSelect: (index: number) => void;
  onSubmit: () => void;
  onClear: () => void;
  onGoToHangman?: () => void;
};

/** Nhãn độ khó thân thiện của game (khác nhãn ngân hàng câu hỏi). */
const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  nhan_biet: "Dễ",
  thong_hieu: "Trung bình",
  van_dung: "Khó",
  van_dung_cao: "Vận dụng cao",
};

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

/** Câu hỏi toán của hũ đã chọn + banner kết quả sau khi chấm. */
export default function TreoCoQuestionPanel({
  question,
  difficulty,
  answerIndex,
  result,
  submitting,
  onSelect,
  onSubmit,
  onClear,
  onGoToHangman,
}: Props) {
  const meta = getDifficultyMeta(difficulty);
  const imgSrc = resolveQuestionImageSrc(question);
  const expImages = result ? resolveAllExplanationImages(result) : [];

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-sm dark:border-indigo-900/50 dark:bg-[#131b2e]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <span aria-hidden>🧧</span> Câu toán của bạn
        </h2>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${meta.badgeClass}`}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      <LazyMathText
        text={question.text}
        className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100"
      />

      {/* Hiển thị hình vẽ / đồ thị câu hỏi nếu có */}
      {imgSrc && (
        <figure className="my-3 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={question.imageCaption || "Hình vẽ câu hỏi"}
            className="mx-auto max-h-80 w-full rounded-xl border border-slate-200/80 bg-white object-contain shadow-xs dark:border-slate-800 dark:bg-slate-900"
            loading="lazy"
          />
          {question.imageCaption && (
            <figcaption className="mt-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              {question.imageCaption}
            </figcaption>
          )}
        </figure>
      )}

      <div className="mt-4 space-y-2">
        {question.options.map((option, index) => {
          const isSelected = answerIndex === index;
          const isCorrect = result !== null && index === result.correctIndex;
          const isWrongChosen = result !== null && !result.correct && isSelected;
          let style =
            "border-slate-200 bg-white text-slate-700 hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-indigo-500";
          if (isCorrect) {
            style =
              "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200";
          } else if (isWrongChosen) {
            style =
              "border-rose-400 bg-rose-50 text-rose-700 line-through dark:border-rose-600 dark:bg-rose-950/40 dark:text-rose-300";
          } else if (isSelected) {
            style =
              "border-indigo-500 bg-indigo-50 text-indigo-800 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200";
          }
          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              disabled={result !== null || submitting}
              onClick={() => onSelect(index)}
              className={`flex w-full items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-colors ${
                result !== null || submitting ? "cursor-default" : "cursor-pointer"
              } ${style}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                {OPTION_LETTERS[index] ?? index + 1}
              </span>
              <LazyMathText text={option} className="flex-1 text-sm leading-6" />
            </button>
          );
        })}
      </div>

      {!result ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={answerIndex === null || submitting}
          className="mt-4 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-400"
        >
          {submitting ? "Đang chấm..." : "Trả lời"}
        </button>
      ) : (
        <div className={`mt-4 rounded-xl p-4 ${result.correct ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-rose-50 dark:bg-rose-950/40"}`}>
          <p className={`text-base font-extrabold ${result.correct ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
            {result.correct ? "🎉 Chính xác!" : "😢 Chưa đúng rồi"}
          </p>
          {result.correct && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-emerald-800 shadow-xs dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300">
                🎟️ +1 Vé đoán chữ
              </span>
            </div>
          )}
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {result.correct
              ? "Tuyệt vời! Bạn đã có thêm vé để tiếp tục đoán từ bí mật."
              : "Câu toán tiếp theo sẽ mở sau 10 phút — cố lên nhé!"}
          </p>
          {result.explanation && (
            <div className="mt-3 rounded-lg bg-white/80 p-3 dark:bg-slate-900/60">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Lời giải</p>
              <LazyMathText text={result.explanation} className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-200" />
            </div>
          )}
          {expImages.length > 0 && (
            <div className="mt-3 space-y-2">
              {expImages.map((img, idx) => (
                <figure key={idx} className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.src}
                    alt={img.caption || `Hình vẽ lời giải ${idx + 1}`}
                    className="mx-auto max-h-80 w-full rounded-xl border border-slate-200/80 bg-white object-contain shadow-xs dark:border-slate-800 dark:bg-slate-900"
                    loading="lazy"
                  />
                  {img.caption && (
                    <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {result.correct && onGoToHangman && (
              <button
                type="button"
                onClick={() => {
                  onClear();
                  onGoToHangman();
                }}
                className="flex-1 cursor-pointer rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 shadow-sm dark:bg-indigo-500"
              >
                🏮 Dùng vé đoán chữ ngay! →
              </button>
            )}
            <button
              type="button"
              onClick={onClear}
              className="flex-1 cursor-pointer rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500"
            >
              ✕ Đóng xem hũ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
