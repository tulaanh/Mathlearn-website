"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DocumentTestAnswers,
  DocumentTestResult,
  QuizQuestion,
  StudyDocument,
} from "@/lib/document-types";
import type { TestNextStep } from "@/lib/chapter-types";
import {
  answeredUnits,
  gradeQuestions,
  percentCorrect,
  questionType,
  scoreOutOf10,
  testQuizBlocks,
  totalUnits,
} from "@/lib/exam-scoring";
import QuestionPalette from "./QuestionPalette";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";
import ReportQuestionModal from "./ReportQuestionModal";
import { documentProgressKey, useProgress } from "@/lib/progress";
import { useSavedQuestions } from "@/lib/saved-questions";
import {
  clearExamDraft,
  clearExamResult,
  loadExamDraft,
  loadExamResult,
  saveExamDraft,
  saveExamResult,
} from "@/lib/exam-draft";
import ExamBlock from "./exam/ExamBlock";
import ExamResultBanner from "./exam/ExamResultBanner";
import ExamHeaderNav from "./exam/ExamHeaderNav";
import { questionDomId } from "./exam/ExamQuestionCard";

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
  const { isSaved, toggleSave, saveMultiple } = useSavedQuestions();

  const handleToggleSave = useCallback(
    (q: QuizQuestion) => {
      toggleSave(q, {
        sourceDocId: document.id,
        sourceDocTitle: document.title,
        grade: document.grade,
        topicIds: document.topics.map((t) => t.id),
      });
    },
    [toggleSave, document.id, document.title, document.grade, document.topics],
  );

  const handleSaveQuestionsBatch = useCallback(
    (targetQuestions: QuizQuestion[]) => {
      return saveMultiple(
        targetQuestions.map((q) => ({
          question: q,
          meta: {
            sourceDocId: document.id,
            sourceDocTitle: document.title,
            grade: document.grade,
            topicIds: document.topics.map((t) => t.id),
          },
        })),
      );
    },
    [saveMultiple, document.id, document.title, document.grade, document.topics],
  );

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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">📝 Bài kiểm tra</span>
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Toán</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{document.grade}</span>
            {document.topics.map((topic) => (
              <span key={topic.id} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">{topic.name}</span>
            ))}
          </div>
          <Link
            href={`/quiz/${document.id}/in`}
            className="flex items-center gap-1 rounded-lg border border-purple-300 bg-purple-50/60 px-3 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-950/70"
          >
            🖨 Xuất PDF / In đề
          </Link>
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
      {result && (
        <ExamResultBanner
          documentId={document.id}
          result={result}
          questions={questions}
          answers={answers}
          onRetry={handleRetry}
          nextStep={nextStep}
          onSaveBatch={handleSaveQuestionsBatch}
        />
      )}

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
            onToggleSave={handleToggleSave}
            isQuestionSaved={isSaved}
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
        <ExamHeaderNav
          answered={answered}
          total={total}
          canSubmit={canSubmit}
          paletteOpen={paletteOpen}
          onTogglePalette={() => setPaletteOpen((v) => !v)}
          onSubmit={handleSubmit}
          quizBlocks={quizBlocks}
          answers={answers}
          flagged={flagged}
          onJumpToQuestion={jumpToQuestion}
        />
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
