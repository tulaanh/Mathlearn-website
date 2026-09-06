import { memo, useMemo } from "react";
import type { DocumentBlock, DocumentTestAnswers, DocumentTestResult, QuizQuestion } from "@/lib/document-types";
import { isQuestionCorrect } from "@/lib/exam-scoring";
import { getDocumentImageUrl } from "@/lib/document-url";
import type { ZoomImageItem } from "../ImageZoomModal";
import LazyMathText from "../LazyMathText";
import ExamQuestionCard, { questionAnswerKeys, answersEqualFor } from "./ExamQuestionCard";

type ExamBlockProps = {
  block: DocumentBlock;
  answers: DocumentTestAnswers;
  flagged: Record<string, boolean>;
  result: DocumentTestResult | null;
  filterMode?: "all" | "wrong" | "correct";
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
    prev.filterMode !== next.filterMode ||
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
  filterMode = "all",
  onAnswer,
  onToggleFlag,
  onZoomImage,
  onReport,
  onToggleSave,
  isQuestionSaved,
}: ExamBlockProps) {
  const isPostSubmit = !!result;

  const filteredQuestionEntries = useMemo(() => {
    if (block.type !== "quiz") return [];
    return block.questions
      .map((q, qi) => ({ question: q, originalIndex: qi }))
      .filter(({ question }) => {
        if (!isPostSubmit || filterMode === "all") return true;
        const correct = isQuestionCorrect(question, answers);
        if (filterMode === "wrong") return correct === false;
        if (filterMode === "correct") return correct === true;
        return true;
      });
  }, [block, isPostSubmit, filterMode, answers]);

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
      {filteredQuestionEntries.length > 0 ? (
        filteredQuestionEntries.map(({ question: q, originalIndex: qi }) => (
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
        ))
      ) : (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {filterMode === "wrong"
              ? "🎉 Xuất sắc! Bạn đã làm đúng tất cả các câu trong phần này."
              : "Không có câu hỏi nào phù hợp với bộ lọc hiện tại."}
          </p>
        </div>
      )}
    </section>
  );
}, examBlockPropsEqual);

export default ExamBlock;
