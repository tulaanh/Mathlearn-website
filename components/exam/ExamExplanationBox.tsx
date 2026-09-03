import { memo } from "react";
import type { QuizQuestion } from "@/lib/document-types";
import { resolveAllExplanationImages } from "@/lib/document-preview";
import type { ZoomImageItem } from "../ImageZoomModal";
import LazyMathText from "../LazyMathText";

type ExamExplanationBoxProps = {
  question: QuizQuestion;
  onZoomImage: (images: ZoomImageItem[], initialIndex: number) => void;
};

const ExamExplanationBox = memo(function ExamExplanationBox({
  question,
  onZoomImage,
}: ExamExplanationBoxProps) {
  const expImages = resolveAllExplanationImages(question);
  const hasExplanation = Boolean(question.explanation?.trim() || expImages.length > 0);
  if (!hasExplanation) return null;
  return (
    <div className="mt-3 space-y-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
      <div className="font-bold">💡 Hướng dẫn giải / Giải thích:</div>
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
      {question.explanation?.trim() && <LazyMathText text={question.explanation} />}
    </div>
  );
});

export default ExamExplanationBox;
