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
  isQuestionCorrect,
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
import { useStudyReminder } from "./StudyReminderProvider";
import { useProfile } from "./ProfileProvider";

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
  const [filterMode, setFilterMode] = useState<"all" | "wrong" | "correct">("all");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<QuizQuestion | null>(null);
  const [restoredDraftInfo, setRestoredDraftInfo] = useState<{
    answeredCount: number;
    timeStr: string;
  } | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { userId } = useProfile();
  const { setPercent } = useProgress();
  const { isSaved, toggleSave, saveMultiple } = useSavedQuestions();
  const { setExamActive } = useStudyReminder();

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
    // 1. Ưu tiên khôi phục bài đang làm dở của tài khoản hiện tại
    const draft = loadExamDraft(document.id, userId);
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

    // 2. Nếu không có bài làm dở, xem có kết quả đã nộp gần nhất không (localStorage/sessionStorage)
    const savedResult = loadExamResult(document.id, userId);
    if (savedResult) {
      setResult(savedResult);
      if (savedResult.answers) {
        setAnswers(savedResult.answers);
      }
      if (savedResult.correctCount < savedResult.totalAutoGraded) {
        setFilterMode("wrong");
      }
      setHasInitialized(true);
      return;
    }

    // 3. Nếu trên máy chưa có kết quả nhưng đã đăng nhập, thử nạp từ Database Supabase
    if (userId) {
      import("@/lib/supabase/client").then(async ({ createClient }) => {
        const supabase = createClient();
        if (!supabase) {
          setHasInitialized(true);
          return;
        }
        const { data, error } = await supabase
          .from("user_exam_results")
          .select("*")
          .eq("user_id", userId)
          .eq("document_id", document.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          const dbResult: DocumentTestResult = {
            answers: (data.answers as DocumentTestAnswers) || {},
            correctCount: data.correct_count,
            totalAutoGraded: data.total_questions,
            earnedPoints: Number(data.earned_points),
            totalPoints: Number(data.total_points),
            percent: data.percent,
            score: Number(data.score),
          };
          setResult(dbResult);
          if (dbResult.answers) setAnswers(dbResult.answers);
          if (dbResult.correctCount < dbResult.totalAutoGraded) {
            setFilterMode("wrong");
          }
          saveExamResult(document.id, dbResult, userId);
        }
        setHasInitialized(true);
      }).catch(() => setHasInitialized(true));
    } else {
      setHasInitialized(true);
    }
  }, [document.id, userId]);

  // Đang làm bài kiểm tra → hoãn lời nhắc học tập đến sau khi nộp bài
  const examSource = `exam-${document.id}`;
  useEffect(() => {
    if (!result) setExamActive(examSource, true);
    return () => setExamActive(examSource, false);
  }, [result, examSource, setExamActive]);

  // Tự động lưu bài làm dở khi câu trả lời hoặc cờ thay đổi
  useEffect(() => {
    if (!hasInitialized) return;
    if (result) return; // Đã nộp bài thì không lưu draft

    if (Object.keys(answers).length > 0 || Object.keys(flagged).length > 0) {
      const timer = setTimeout(() => {
        saveExamDraft(document.id, { answers, flagged }, userId);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      clearExamDraft(document.id, userId);
    }
  }, [document.id, answers, flagged, result, hasInitialized, userId]);

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

  const gradeableQuestions = useMemo(
    () => questions.filter((q) => questionType(q) !== "essay"),
    [questions],
  );

  const wrongCount = useMemo(
    () => (result ? gradeableQuestions.filter((q) => isQuestionCorrect(q, answers) === false).length : 0),
    [result, gradeableQuestions, answers],
  );

  const correctCount = useMemo(
    () => (result ? gradeableQuestions.filter((q) => isQuestionCorrect(q, answers) === true).length : 0),
    [result, gradeableQuestions, answers],
  );

  /** Cuộn tới câu được chọn từ bảng câu hỏi và nháy viền để dễ nhận ra.
   *  Nếu câu đó đang bị ẩn do bộ lọc thì tự động chuyển về tab "Tất cả". */
  const jumpToQuestion = useCallback(
    (questionId: string) => {
      if (result) {
        const targetQ = questions.find((q) => q.id === questionId);
        if (targetQ) {
          const isCorrect = isQuestionCorrect(targetQ, answers);
          if (
            (filterMode === "wrong" && isCorrect === true) ||
            (filterMode === "correct" && isCorrect === false)
          ) {
            setFilterMode("all");
          }
        }
      }

      window.setTimeout(() => {
        const el = window.document.getElementById(questionDomId(questionId));
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        const flash = ["ring-2", "ring-indigo-500", "ring-offset-2"];
        el.classList.add(...flash);
        window.setTimeout(() => el.classList.remove(...flash), 1200);
      }, 60);
      setPaletteOpen(false);
    },
    [questions, result, answers, filterMode],
  );

  const handleViewWrongQuestions = useCallback(() => {
    setFilterMode("wrong");
    const el = window.document.getElementById("exam-questions-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    saveExamResult(document.id, finished, userId);
    clearExamDraft(document.id, userId);
    setRestoredDraftInfo(null);

    // Lưu kết quả bài thi vào Database Supabase
    if (userId) {
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        if (supabase) {
          supabase
            .from("user_exam_results")
            .insert({
              user_id: userId,
              document_id: document.id,
              answers: finished.answers,
              correct_count: finished.correctCount,
              total_questions: finished.totalAutoGraded,
              earned_points: finished.earnedPoints,
              total_points: finished.totalPoints,
              percent: finished.percent,
              score: finished.score,
            })
            .then(({ error }) => {
              if (error) {
                console.error("Lỗi khi lưu kết quả bài thi vào Database:", error.message);
              }
            });
        }
      });
    }

    // Tự động kích hoạt bộ lọc "Chỉ câu sai" nếu có câu làm sai
    if (correctCount < totalAutoGraded) {
      setFilterMode("wrong");
    } else {
      setFilterMode("all");
    }

    // Lưu điểm tốt nhất vào tiến độ học tập (tự động đồng bộ Database qua useProgress)
    setPercent(`document-quiz:${document.id}`, finished.percent);
    // Nộp bài test đính kèm = hoàn thành tài liệu chứa nó
    if (nextStep?.parentDocument) setPercent(documentProgressKey(nextStep.parentDocument.id), 100);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRetry() {
    clearExamDraft(document.id, userId);
    clearExamResult(document.id, userId);
    setAnswers({});
    setFlagged({});
    setResult(null);
    setFilterMode("all");
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
          onViewWrongQuestions={handleViewWrongQuestions}
        />
      )}

      {/* Nội dung bài kiểm tra */}
      <div id="exam-questions-section" className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e] sm:p-8">
        {/* Bộ lọc câu hỏi sau khi nộp bài */}
        {result && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Chế độ xem:
              </span>
              <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {wrongCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterMode("wrong")}
                    className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                      filterMode === "wrong"
                        ? "bg-rose-500 text-white shadow-xs"
                        : "text-rose-700 hover:bg-rose-100/60 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    }`}
                  >
                    <span>❌ Chỉ câu sai</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                        filterMode === "wrong"
                          ? "bg-rose-600 text-white"
                          : "bg-rose-200/80 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200"
                      }`}
                    >
                      {wrongCount}
                    </span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterMode === "all"
                      ? "bg-white text-slate-900 shadow-xs dark:bg-slate-900 dark:text-white"
                      : "text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>📋 Tất cả câu hỏi</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                      filterMode === "all"
                        ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        : "bg-slate-200/60 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {questions.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("correct")}
                  className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                    filterMode === "correct"
                      ? "bg-emerald-500 text-white shadow-xs"
                      : "text-emerald-700 hover:bg-emerald-100/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                  }`}
                >
                  <span>✓ Câu làm đúng</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                      filterMode === "correct"
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200"
                    }`}
                  >
                    {correctCount}
                  </span>
                </button>
              </div>
            </div>
            {filterMode === "wrong" && (
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Đang hiển thị {wrongCount} câu làm sai kèm lời giải chi tiết
              </span>
            )}
          </div>
        )}

        {document.blocks.length === 0 && <p className="text-sm text-slate-500">Bài kiểm tra chưa có nội dung.</p>}
        {document.blocks.map((block) => (
          <ExamBlock
            key={block.id ?? block.position}
            block={block}
            answers={answers}
            flagged={flagged}
            result={result}
            filterMode={filterMode}
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

      {/* Thanh nộp bài hoặc thanh điều hướng trên Mobile */}
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
        result={result}
        filterMode={filterMode}
        onSelectFilter={setFilterMode}
        wrongCount={wrongCount}
        correctCount={correctCount}
      />
      </div>

      {/* Bảng câu hỏi cố định bên phải (màn hình lớn) */}
      <aside className="sticky top-24 hidden w-72 shrink-0 lg:block print:hidden">
        <div className="max-h-[calc(100vh-120px)] overflow-y-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]">
          <QuestionPalette
            quizBlocks={quizBlocks}
            answers={answers}
            flagged={flagged}
            onJump={jumpToQuestion}
            result={result}
            filterMode={filterMode}
            onSelectFilter={setFilterMode}
          />
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
