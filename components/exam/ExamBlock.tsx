import { memo } from "react";
import type { DocumentBlock, DocumentTestAnswers, DocumentTestResult, QuizQuestion } from "@/lib/document-types";
import { getDocumentImageUrl } from "@/lib/document-url";
import type { ZoomImageItem } from "../ImageZoomModal";
import LazyMathText from "../LazyMathText";
import ExamQuestionCard, { questionAnswerKeys, answersEqualFor } from "./ExamQuestionCard";

type ExamBlockProps = {
  block: DocumentBlock;
  answers: DocumentTestAnswers;
  flagged: Record<string, boolean>;
  result: DocumentTestResult | null;
  onAnswer: (key: string, value: string) => void;
  onToggleFlag: (questionId: string) => void;
  onZoomImage: (images: ZoomImageItem[], initialIndex: number) => void;
  onReport: (question: QuizQuestion) => void;
  onToggleSave: (question: QuizQuestion) => void;
  isQuestionSaved: (questionId: string) => boolean;
};

/** So sánh theo giá trị answer của riêng khối này thay vì identity object answers,
 *  để khối không chứa câu bị trả lời không phải re-render. */
function examBlockPropsEqual(prev: ExamBlockProps, next: ExamBlockProps) {
  if (
    prev.block !== next.block ||
    prev.result !== next.result ||
    prev.onAnswer !== next.onAnswer ||
    prev.onToggleFlag !== next.onToggleFlag ||
    prev.onZoomImage !== next.onZoomImage ||
    prev.onReport !== next.onReport ||
    prev.onToggleSave !== next.onToggleSave ||
    prev.isQuestionSaved !== next.isQuestionSaved
  ) {
    return false;
  }
  if (next.block.type !== "quiz") return true;
  const keys = next.block.questions.flatMap(questionAnswerKeys);
  if (!answersEqualFor(keys, prev.answers, next.answers)) return false;
  return next.block.questions.every(
    (q) =>
      prev.flagged[q.id] === next.flagged[q.id] &&
      prev.isQuestionSaved(q.id) === next.isQuestionSaved(q.id),
  );
}

/** Render một khối nội dung: văn bản/bài giảng/ảnh hiển thị thuần, khối quiz render câu hỏi. */
const ExamBlock = memo(function ExamBlock({
  block,
  answers,
  flagged,
  result,
  onAnswer,
  onToggleFlag,
  onZoomImage,
  onReport,
  onToggleSave,
  isQuestionSaved,
}: ExamBlockProps) {
  if (block.type === "text") {
    return <LazyMathText text={block.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />;
  }
  if (block.type === "lesson") {
    return (
      <section className="rounded-2xl border border-green-200 bg-green-50/50 p-5 dark:border-green-900 dark:bg-green-950/20">
        <div className="mb-3">
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950/70 dark:text-green-300">Bài giảng</span>
          <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{block.title}</h3>
          {block.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.description}</p>}
        </div>
        <LazyMathText text={block.content} className="block text-base leading-8 text-slate-700 dark:text-slate-300" />
      </section>
    );
  }
  if (block.type === "image") {
    const src = getDocumentImageUrl(block.storagePath);
    return (
      <figure>
        <img
          src={src}
          alt={block.altText}
          loading="lazy"
          decoding="async"
          onClick={() => onZoomImage([{ src, caption: block.caption }], 0)}
          className="max-h-[720px] w-full cursor-zoom-in rounded-xl object-contain transition-transform hover:scale-[1.005]"
          title="Bấm để phóng to ảnh"
        />
        {block.caption && <figcaption className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">{block.caption}</figcaption>}
      </figure>
    );
  }
  // Khối quiz
  return (
    <section className="space-y-5">
      <div>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">Câu hỏi</span>
        <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{block.title}</h3>
        {block.description && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{block.description}</p>}
      </div>
      {block.questions.map((q, qi) => (
        <ExamQuestionCard
          key={q.id}
          question={q}
          index={qi}
          answers={answers}
          flagged={!!flagged[q.id]}
          result={result}
          onAnswer={onAnswer}
          onToggleFlag={onToggleFlag}
          onZoomImage={onZoomImage}
          onReport={onReport}
          onToggleSave={onToggleSave}
          isSaved={isQuestionSaved(q.id)}
        />
      ))}
    </section>
  );
}, examBlockPropsEqual);

export default ExamBlock;
