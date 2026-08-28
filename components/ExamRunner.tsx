"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import type {
  DocumentBlock,
  DocumentTestAnswers,
  DocumentTestResult,
  QuizQuestion,
  StudyDocument,
} from "@/lib/document-types";
import type { TestNextStep } from "@/lib/chapter-types";
import {
  answeredUnits,
  gradeQuestions,
  isUnitCorrect,
  percentCorrect,
  questionType,
  scoreOutOf10,
  statementKey,
  statementsOf,
  testQuizBlocks,
  totalUnits,
} from "@/lib/exam-scoring";
import { getDocumentImageUrl } from "@/lib/document-url";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import LazyMathText from "./LazyMathText";
import DebouncedInput from "./DebouncedInput";
import QuestionPalette from "./QuestionPalette";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";
import ReportQuestionModal from "./ReportQuestionModal";
import { documentProgressKey, useProgress } from "@/lib/progress";
import {
  clearExamDraft,
  clearExamResult,
  loadExamDraft,
  loadExamResult,
  saveExamDraft,
  saveExamResult,
} from "@/lib/exam-draft";

const optionLabels = ["A", "B", "C", "D", "E", "F"];

/** id DOM của thẻ câu hỏi, dùng để bảng câu hỏi cuộn tới. */
const questionDomId = (questionId: string) => `cau-${questionId}`;

function usableOptions(q: QuizQuestion) {
  const seen = new Set<string>();
  return (q.options ?? []).filter((o) => {
    if (!o.text || !o.text.trim()) return false;
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
}

/** Màn hình làm bài kiểm tra: tự động lưu bài làm dở và kết quả gần nhất. */
export default function ExamRunner({
  document,
  nextStep = null,
}: {
  document: StudyDocument;
  nextStep?: TestNextStep | null;
}) {
  const [answers, setAnswers] = useState<DocumentTestAnswers>({});
  const [result, setResult] = useState<DocumentTestResult | null>(null);
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<QuizQuestion | null>(null);
  const [restoredDraftInfo, setRestoredDraftInfo] = useState<{
    answeredCount: number;
    timeStr: string;
  } | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { setPercent } = useProgress();

  // Khôi phục bài làm dở hoặc kết quả đã làm gần nhất khi mở bài thi
  useEffect(() => {
    // 1. Ưu tiên khôi phục bài đang làm dở
    const draft = loadExamDraft(document.id);
    if (draft && Object.keys(draft.answers).length > 0) {
      setAnswers(draft.answers);
      setFlagged(draft.flagged || {});
      const date = new Date(draft.updatedAt);
      const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const count = Object.keys(draft.answers).length;
      setRestoredDraftInfo({ answeredCount: count, timeStr });
      setHasInitialized(true);
      return;
    }

    // 2. Nếu không có bài làm dở, xem có kết quả đã nộp gần nhất không
    const savedResult = loadExamResult(document.id);
    if (savedResult) {
      setResult(savedResult);
      if (savedResult.answers) {
        setAnswers(savedResult.answers);
      }
    }
    setHasInitialized(true);
  }, [document.id]);

  // Tự động lưu bài làm dở khi câu trả lời hoặc cờ thay đổi
  useEffect(() => {
    if (!hasInitialized) return;
    if (result) return; // Đã nộp bài thì không lưu draft

    if (Object.keys(answers).length > 0 || Object.keys(flagged).length > 0) {
      const timer = setTimeout(() => {
        saveExamDraft(document.id, { answers, flagged });
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearExamDraft(document.id);
    }
  }, [document.id, answers, flagged, result, hasInitialized]);

  const quizBlocks = useMemo(() => testQuizBlocks(document.blocks), [document.blocks]);
  const questions = useMemo(() => quizBlocks.flatMap((b) => b.questions), [quizBlocks]);

  const total = useMemo(() => totalUnits(questions), [questions]);
  const answered = useMemo(() => answeredUnits(questions, answers), [questions, answers]);
  const essayCount = useMemo(() => questions.filter((q) => questionType(q) === "essay").length, [questions]);
  const canSubmit = !result && total > 0 && answered === total;

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  /** Phải là callback ổn định: nếu đổi identity mỗi render thì mọi ExamBlock/ExamQuestionCard
   *  đều re-render sau mỗi lần chọn đáp án/cắm cờ (bộ so sánh memo so sánh cả hàm này). */
  const openZoom = useCallback((images: ZoomImageItem[], initialIndex: number) => {
    setZoomState({ images, initialIndex });
  }, []);

  const handleReport = useCallback((q: QuizQuestion) => {
    setReportingQuestion(q);
  }, []);

  /** Cuộn tới câu được chọn từ bảng câu hỏi và nháy viền để dễ nhận ra. */
  const jumpToQuestion = useCallback((questionId: string) => {
    const el = window.document.getElementById(questionDomId(questionId));
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const flash = ["ring-2", "ring-indigo-500", "ring-offset-2"];
    el.classList.add(...flash);
    window.setTimeout(() => el.classList.remove(...flash), 1200);
    setPaletteOpen(false);
  }, []);

  function handleSubmit() {
    if (!canSubmit) return;
    const { correctCount, totalAutoGraded, earnedPoints, totalPoints } = gradeQuestions(questions, answers);
    const finished: DocumentTestResult = {
      answers,
      correctCount,
      totalAutoGraded,
      earnedPoints,
      totalPoints,
      percent: percentCorrect(earnedPoints, totalPoints),
      score: scoreOutOf10(earnedPoints, totalPoints),
    };
    setResult(finished);
    saveExamResult(document.id, finished);
    clearExamDraft(document.id);
    setRestoredDraftInfo(null);

    // Lưu điểm tốt nhất vào tiến độ học tập trên chính trình duyệt này
    setPercent(`document-quiz:${document.id}`, finished.percent);
    // Nộp bài test đính kèm = hoàn thành tài liệu chứa nó
    if (nextStep?.parentDocument) setPercent(documentProgressKey(nextStep.parentDocument.id), 100);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetry() {
    clearExamDraft(document.id);
    clearExamResult(document.id);
    setAnswers({});
    setFlagged({});
    setResult(null);
    setRestoredDraftInfo(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <article className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      <div className="w-full min-w-0 max-w-3xl">
      {/* Đầu bài */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        <a href="/quiz" className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
          ← Về danh sách bài kiểm tra
        </a>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">📝 Bài kiểm tra</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Toán</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{document.grade}</span>
          {document.topics.map((topic) => (
            <span key={topic.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{topic.name}</span>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">{document.title}</h1>
        {document.description && <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{document.description}</p>}
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          {questions.length} câu hỏi · {total} ý được chấm tự động
          {essayCount > 0 && ` · ${essayCount} câu tự luận (không tính điểm tự động)`}
        </p>
      </div>

      {/* Thông báo đã khôi phục bài làm dở */}
      {!result && restoredDraftInfo && (
        <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-sm text-indigo-900 shadow-xs dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⏳</span>
            <div>
              <p className="font-semibold">
                Đã tự động khôi phục bài làm dở của bạn ({restoredDraftInfo.answeredCount} ý đã trả lời lúc {restoredDraftInfo.timeStr}).
              </p>
              <p className="text-xs text-indigo-700/80 dark:text-indigo-300/80">
                Bạn có thể tiếp tục làm bài hoặc bấm làm lại từ đầu.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl border border-indigo-300 bg-white px-3.5 py-1.5 text-xs font-bold text-indigo-700 shadow-2xs transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              🔄 Làm lại từ đầu
            </button>
            <button
              type="button"
              onClick={() => setRestoredDraftInfo(null)}
              className="rounded-lg p-1.5 text-indigo-500 hover:bg-indigo-200/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Kết quả sau khi nộp bài */}
      {result && <ExamResultBanner result={result} onRetry={handleRetry} nextStep={nextStep} />}

      {/* Nội dung bài kiểm tra */}
      <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {document.blocks.length === 0 && <p className="text-sm text-slate-500">Bài kiểm tra chưa có nội dung.</p>}
        {document.blocks.map((block) => (
          <ExamBlock
            key={block.id ?? block.position}
            block={block}
            answers={answers}
            flagged={flagged}
            result={result}
            onAnswer={setAnswer}
            onToggleFlag={toggleFlag}
            onZoomImage={openZoom}
            onReport={handleReport}
          />
        ))}
        {questions.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700">
            Bài kiểm tra này chưa có câu hỏi nào.
          </p>
        )}
      </div>

      {/* Thanh nộp bài */}
      {!result && (
        <div className="sticky bottom-4 mt-8 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-lg backdrop-blur-md dark:border-slate-800/80 dark:bg-[#131b2e]/90">
          {/* Bảng câu hỏi thu gọn cho màn hình nhỏ */}
          {paletteOpen && (
            <div className="mb-3 max-h-[55vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#131b2e] lg:hidden">
              <QuestionPalette quizBlocks={quizBlocks} answers={answers} flagged={flagged} onJump={jumpToQuestion} />
            </div>
          )}
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Đã trả lời{" "}
              <strong className={total > 0 && answered === total ? "text-emerald-600 dark:text-emerald-400" : "text-indigo-600 dark:text-indigo-400"}>
                {answered}/{total}
              </strong>{" "}
              ý
            </span>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <button
                type="button"
                onClick={() => setPaletteOpen((v) => !v)}
                className="w-full shrink-0 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-[#0d1322] sm:w-auto lg:hidden"
              >
                {paletteOpen ? "✕ Đóng danh sách" : "📋 Câu hỏi"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full rounded-xl px-6 py-3 font-semibold text-white shadow-xs transition-colors sm:w-auto ${
                  canSubmit ? "bg-purple-600 hover:bg-purple-700" : "cursor-not-allowed bg-slate-300 dark:bg-slate-800 dark:text-slate-500"
                }`}
              >
                {canSubmit ? "✅ Nộp bài & xem điểm" : `Còn ${total - answered} ý chưa trả lời`}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Bảng câu hỏi cố định bên phải (màn hình lớn) */}
      <aside className="sticky top-24 hidden w-72 shrink-0 lg:block print:hidden">
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
          <QuestionPalette quizBlocks={quizBlocks} answers={answers} flagged={flagged} onJump={jumpToQuestion} />
        </div>
      </aside>

      {/* Modal phóng to ảnh tương tác */}
      {zoomState && (
        <ImageZoomModal
          images={zoomState.images}
          initialIndex={zoomState.initialIndex}
          onClose={() => setZoomState(null)}
        />
      )}

      {/* Modal báo lỗi câu hỏi */}
      {reportingQuestion && (
        <ReportQuestionModal
          isOpen={!!reportingQuestion}
          question={reportingQuestion}
          documentInfo={{ id: document.id, title: document.title }}
          onClose={() => setReportingQuestion(null)}
        />
      )}
    </article>
  );
}

/** Bảng kết quả hiển thị sau khi nộp bài: điểm thang 10, phần trăm, số ý đúng. */
function ExamResultBanner({
  result,
  onRetry,
  nextStep = null,
}: {
  result: DocumentTestResult;
  onRetry: () => void;
  nextStep?: TestNextStep | null;
}) {
  const feedback =
    result.percent === 100
      ? { emoji: "🏆", text: "Xuất sắc! Hoàn hảo tuyệt đối!", color: "text-emerald-600 dark:text-emerald-400" }
      : result.percent >= 80
        ? { emoji: "🎉", text: "Rất tốt! Tiếp tục phát huy nhé!", color: "text-emerald-600 dark:text-emerald-400" }
        : result.percent >= 50
          ? { emoji: "💪", text: "Khá ổn! Cần ôn thêm một chút.", color: "text-amber-600 dark:text-amber-400" }
          : { emoji: "📖", text: "Đừng nản! Hãy xem lại tài liệu và thử lại.", color: "text-rose-600 dark:text-rose-400" };

  const nav = nextStep?.navigation ?? null;
  const nextUrl = nav?.nextItem?.url ?? (nav?.nextChapter ? `/chuong/${nav.nextChapter.id}` : nav ? `/chuong/${nav.chapterId}` : null);
  const nextLabel = nav?.nextItem
    ? `➡️ Bài tiếp theo: ${nav.nextItem.title}`
    : nav?.nextChapter
      ? "🎉 Hoàn thành chương! Sang chương kế tiếp →"
      : nav
        ? "🎉 Hoàn thành chương! Xem lại chương →"
        : null;

  return (
    <section className="mb-8 rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 text-center shadow-sm dark:border-purple-900 dark:from-purple-950/30 dark:to-indigo-950/30 sm:p-8">
      <p className="text-4xl">{feedback.emoji}</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-white">Đã nộp bài — kết quả của bạn</h2>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <span className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
          <strong className={`block text-4xl font-extrabold ${feedback.color}`}>{result.score.toFixed(1)}</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">thang điểm 10</span>
        </span>
        <span className="rounded-2xl bg-white px-6 py-4 shadow-sm dark:bg-slate-900">
          <strong className="block text-4xl font-extrabold text-slate-900 dark:text-white">{result.percent}%</strong>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            đạt {result.earnedPoints}/{result.totalPoints} điểm · đúng {result.correctCount}/{result.totalAutoGraded} ý
          </span>
        </span>
      </div>
      <p className={`mt-4 text-sm font-semibold ${feedback.color}`}>{feedback.text}</p>

      {/* Gợi ý chuyển bài kế tiếp trong chương sau khi nộp bài */}
      {nextUrl && nextLabel && (
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          {nextStep?.parentDocument && nav && (
            <Link
              href={`/tai-lieu/${nextStep.parentDocument.id}?chuong=${nav.chapterId}`}
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-[#0d1322]"
            >
              ← Quay lại bài học
            </Link>
          )}
          <Link
            href={nextUrl}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700"
          >
            {nextLabel}
          </Link>
        </div>
      )}

      <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} className="rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white hover:bg-purple-700">
          🔄 Làm lại
        </button>
        <Link href="/quiz" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#0d1322]">
          📋 Chọn bài khác
        </Link>
      </div>
      <p className="mt-3 text-xs text-slate-400">Kết quả chỉ hiển thị trên máy của bạn, không gửi lên máy chủ.</p>
    </section>
  );
}

/** Các khóa answer mà một câu hỏi dùng (id câu hỏi + id từng mệnh đề Đúng/Sai). */
function questionAnswerKeys(q: QuizQuestion): string[] {
  const keys = [q.id];
  for (const s of statementsOf(q)) keys.push(statementKey(q.id, s.id));
  return keys;
}

function answersEqualFor(keys: string[], a: DocumentTestAnswers, b: DocumentTestAnswers) {
  return keys.every((k) => a[k] === b[k]);
}

type ExamBlockProps = {
  block: DocumentBlock;
  answers: DocumentTestAnswers;
  flagged: Record<string, boolean>;
  result: DocumentTestResult | null;
  onAnswer: (key: string, value: string) => void;
  onToggleFlag: (questionId: string) => void;
  onZoomImage: (images: ZoomImageItem[], initialIndex: number) => void;
  onReport: (question: QuizQuestion) => void;
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
    prev.onReport !== next.onReport
  ) {
    return false;
  }
  if (next.block.type !== "quiz") return true;
  const keys = next.block.questions.flatMap(questionAnswerKeys);
  if (!answersEqualFor(keys, prev.answers, next.answers)) return false;
  return next.block.questions.every((q) => prev.flagged[q.id] === next.flagged[q.id]);
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
        />
      ))}
    </section>
  );
}, examBlockPropsEqual);

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
    prev.onReport !== next.onReport
  ) {
    return false;
  }
  return answersEqualFor(questionAnswerKeys(next.question), prev.answers, next.answers);
}

/** Thẻ một câu hỏi trong bài kiểm tra: khóa input sau khi nộp, hiện đáp án + giải thích. */
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

      {locked && (() => {
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
      })()}
    </div>
  );
}, examQuestionCardPropsEqual);
