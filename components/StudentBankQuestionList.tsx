"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { BankQuestion } from "@/lib/question-bank-types";
import { DIFFICULTY_META, QUESTION_TYPE_LABELS, getDifficultyMeta } from "@/lib/question-bank-types";
import type { Topic } from "@/lib/types";
import type { QuizQuestion } from "@/lib/document-types";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import { useSavedQuestions, type SavedBankQuestion } from "@/lib/saved-questions";
import LazyMathText from "./LazyMathText";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";
import ReportQuestionModal from "./ReportQuestionModal";

type Props = {
  questions: BankQuestion[];
  grades: string[];
  topics: Topic[];
  page?: number;
  pageSize?: number;
  totalAll?: number;
};

const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Mọi dạng câu" },
  { value: "multiple_choice", label: "Trắc nghiệm" },
  { value: "true_false", label: "Đúng / Sai" },
  { value: "short_answer", label: "Trả lời ngắn" },
  { value: "essay", label: "Tự luận" },
];

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
  return (
    q.statements ??
    (q.options ?? []).map((o) => ({
      id: o.id,
      text: o.text,
      correctVal: o.correctVal === "false" ? ("false" as const) : ("true" as const),
    }))
  );
}

export default function StudentBankQuestionList({
  questions,
  grades,
  topics,
  page = 1,
  pageSize = 20,
  totalAll,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { savedQuestions, isSaved, toggleSave } = useSavedQuestions();

  // Trạng thái mở rộng lời giải từng câu
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  // Trạng thái phóng to ảnh
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);
  // Trạng thái báo lỗi câu hỏi
  const [reportingQuestion, setReportingQuestion] = useState<QuizQuestion | null>(null);

  const currentTab = searchParams.get("tab") === "saved" ? "saved" : "all";
  const currentSearch = searchParams.get("q") ?? "";
  const currentGrade = searchParams.get("grade") ?? "";
  const currentTopic = searchParams.get("topic") ?? "";
  const currentDifficulty = searchParams.get("difficulty") ?? "";
  const currentType = searchParams.get("type") ?? "";

  const hasFilter = Boolean(currentSearch || currentGrade || currentTopic || currentDifficulty || currentType);

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page"); // reset về trang 1 khi đổi bộ lọc
    const qs = params.toString();
    router.push(qs ? `/ngan-hang-cau-hoi?${qs}` : "/ngan-hang-cau-hoi");
  };

  const switchTab = (tab: "all" | "saved") => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "saved") params.set("tab", "saved");
    else params.delete("tab");
    params.delete("page");
    const qs = params.toString();
    router.push(qs ? `/ngan-hang-cau-hoi?${qs}` : "/ngan-hang-cau-hoi");
  };

  const clearAllFilters = () => {
    if (currentTab === "saved") {
      router.push("/ngan-hang-cau-hoi?tab=saved");
    } else {
      router.push("/ngan-hang-cau-hoi");
    }
  };

  // Lọc câu hỏi đã lưu nếu đang ở tab saved
  const filteredSavedQuestions = useMemo(() => {
    if (currentTab !== "saved") return [];
    return savedQuestions.filter((q) => {
      if (currentSearch.trim()) {
        const needle = currentSearch.trim().toLowerCase();
        if (!q.text.toLowerCase().includes(needle) && !q.explanation?.toLowerCase().includes(needle)) {
          return false;
        }
      }
      if (currentGrade && q.grade !== currentGrade) return false;
      if (currentTopic && !q.topicIds.includes(currentTopic)) return false;
      if (currentDifficulty && q.difficulty !== currentDifficulty) return false;
      if (currentType && (q.type || "multiple_choice") !== currentType) return false;
      return true;
    });
  }, [savedQuestions, currentTab, currentSearch, currentGrade, currentTopic, currentDifficulty, currentType]);

  const activeQuestions: (BankQuestion | SavedBankQuestion)[] =
    currentTab === "saved" ? filteredSavedQuestions : questions;

  const toggleExplanation = (id: string) => {
    setExpandedExplanations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allExpanded = useMemo(() => {
    if (activeQuestions.length === 0) return false;
    return activeQuestions.every((q) => expandedExplanations[q.id]);
  }, [activeQuestions, expandedExplanations]);

  const toggleAllExplanations = () => {
    const target = !allExpanded;
    const next: Record<string, boolean> = {};
    for (const q of activeQuestions) {
      next[q.id] = target;
    }
    setExpandedExplanations(next);
  };

  return (
    <div className="space-y-5">
      {/* Thanh tab: Tất cả câu hỏi vs Câu hỏi đã lưu */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => switchTab("all")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              currentTab === "all"
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <span>🏦 Tất cả câu hỏi</span>
            {totalAll !== undefined && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  currentTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {totalAll}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => switchTab("saved")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${
              currentTab === "saved"
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
          >
            <span>⭐ Câu hỏi đã lưu</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                currentTab === "saved"
                  ? "bg-white/25 text-white"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}
            >
              {savedQuestions.length}
            </span>
          </button>
        </div>

        {activeQuestions.length > 0 && (
          <button
            type="button"
            onClick={toggleAllExplanations}
            className="rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
          >
            💡 {allExpanded ? "Ẩn tất cả lời giải" : "Hiện tất cả lời giải"}
          </button>
        )}
      </div>

      {/* Thanh bộ lọc tìm kiếm */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const value = (new FormData(e.currentTarget).get("q") as string) ?? "";
              setParam("q", value.trim());
            }}
            className="flex min-w-[220px] flex-1 gap-2"
          >
            <input
              name="q"
              defaultValue={currentSearch}
              placeholder={currentTab === "saved" ? "🔍 Tìm trong câu hỏi đã lưu..." : "🔍 Tìm kiếm câu hỏi..."}
              className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              className="h-10 rounded-xl bg-indigo-600 px-4 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Tìm
            </button>
          </form>

          <select
            value={currentGrade}
            onChange={(e) => setParam("grade", e.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Mọi khối lớp</option>
            {grades.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          <select
            value={currentTopic}
            onChange={(e) => setParam("topic", e.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Mọi chủ đề</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={currentDifficulty}
            onChange={(e) => setParam("difficulty", e.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            <option value="">Mọi mức độ</option>
            {DIFFICULTY_META.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            value={currentType}
            onChange={(e) => setParam("type", e.target.value)}
            className="h-10 rounded-xl border border-slate-300 px-3 text-sm transition-colors focus:border-indigo-500 focus:outline-hidden dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {hasFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="h-10 rounded-xl border border-slate-300 px-3.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Thông tin số lượng */}
      {activeQuestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            {currentTab === "saved"
              ? `Đang hiển thị ${activeQuestions.length} câu hỏi đã lưu`
              : `Hiển thị trang ${page} (${activeQuestions.length} câu hỏi)`}
          </p>
        </div>
      )}

      {/* Danh sách câu hỏi */}
      {activeQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-[#131b2e]">
          <div className="mx-auto mb-3 text-4xl">{currentTab === "saved" ? "⭐" : "🔍"}</div>
          <p className="text-base font-bold text-slate-800 dark:text-slate-200">
            {currentTab === "saved"
              ? hasFilter
                ? "Không tìm thấy câu hỏi đã lưu nào khớp bộ lọc"
                : "Bạn chưa lưu câu hỏi nào vào Ngân hàng câu hỏi"
              : "Không tìm thấy câu hỏi phù hợp"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {currentTab === "saved"
              ? hasFilter
                ? "Hãy thử điều chỉnh lại từ khóa hoặc các tiêu chí bộ lọc."
                : "Sau khi nộp bài tập hoặc làm xong bài kiểm tra, bạn có thể bấm '⭐ Lưu vào ngân hàng' để ôn tập lại tại đây."
              : "Hãy thử thay đổi từ khóa hoặc điều chỉnh các tiêu chí bộ lọc."}
          </p>
          {currentTab === "saved" && !hasFilter && (
            <div className="mt-5 flex justify-center gap-3">
              <Link
                href="/quiz"
                className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-purple-700"
              >
                Làm bài kiểm tra ngay →
              </Link>
              <button
                type="button"
                onClick={() => switchTab("all")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                Khám phá kho câu hỏi chung
              </button>
            </div>
          )}
          {hasFilter && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 inline-block rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-indigo-700"
            >
              Đặt lại tất cả bộ lọc
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {activeQuestions.map((q, index) => {
            const meta = getDifficultyMeta(q.difficulty);
            const qType = q.type || "multiple_choice";
            const qIndex = currentTab === "saved" ? index + 1 : (page - 1) * pageSize + index + 1;
            const isExplanationShown = Boolean(expandedExplanations[q.id]);
            const imgSrc = resolveQuestionImageSrc(q);
            const expImages = resolveAllExplanationImages(q);
            const hasExplanation = Boolean(q.explanation?.trim() || expImages.length > 0);
            const savedItem = q as SavedBankQuestion;
            const isItemSaved = isSaved(q.id);

            // Tìm thông tin đáp án đúng của trắc nghiệm
            const correctOpt =
              qType === "multiple_choice"
                ? (q.options ?? []).find((o) => o.id === q.correctOptionId)
                : null;
            const correctOptIdx =
              qType === "multiple_choice"
                ? (q.options ?? []).findIndex((o) => o.id === q.correctOptionId)
                : -1;

            return (
              <div
                key={q.id}
                id={`cau-hoi-${q.id}`}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-colors dark:border-slate-800/90 dark:bg-[#131b2e]"
              >
                {/* Header câu hỏi: số thứ tự, nhãn mức độ, khối lớp, chủ đề, nút lưu, nút báo lỗi */}
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-lg bg-indigo-600 px-2 text-xs font-bold text-white">
                      Câu {qIndex}
                    </span>
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
                      {meta.label}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {QUESTION_TYPE_LABELS[qType]}
                    </span>
                    {q.grade && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {q.grade}
                      </span>
                    )}
                    {q.topicIds.map((topicId) => {
                      const topic = topics.find((t) => t.id === topicId);
                      return topic ? (
                        <Link
                          key={topicId}
                          href={`/ngan-hang-cau-hoi?topic=${topicId}${currentTab === "saved" ? "&tab=saved" : ""}`}
                          className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-200 dark:bg-violet-950/50 dark:text-violet-300"
                        >
                          {topic.name}
                        </Link>
                      ) : null;
                    })}
                    {savedItem.sourceDocTitle && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                        📌 {savedItem.sourceDocTitle}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleSave(q)}
                      title={isItemSaved ? "Bỏ lưu câu hỏi khỏi Ngân hàng" : "Lưu vào Ngân hàng câu hỏi"}
                      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${
                        isItemSaved
                          ? "border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                          : "border-slate-200 bg-slate-50/80 text-slate-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-amber-800 dark:hover:bg-amber-950/40 dark:hover:text-amber-300"
                      }`}
                    >
                      <span>{isItemSaved ? "⭐ Đã lưu" : "☆ Lưu câu hỏi"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportingQuestion(q)}
                      title="Báo lỗi câu hỏi này"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-rose-800 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                    >
                      <span>🚩</span>
                      <span>Báo lỗi</span>
                    </button>
                  </div>
                </div>

                {/* Nội dung đề bài */}
                <div className="text-sm font-medium leading-relaxed text-slate-900 dark:text-slate-100">
                  <LazyMathText text={q.text} />
                </div>

                {/* Ảnh đề bài nếu có */}
                {imgSrc && (
                  <figure className="my-3 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgSrc}
                      alt={q.imageCaption || `Hình ảnh câu hỏi ${qIndex}`}
                      loading="lazy"
                      decoding="async"
                      onClick={() => setZoomState({ images: [{ src: imgSrc, caption: q.imageCaption }], initialIndex: 0 })}
                      className="mx-auto max-h-72 w-full cursor-zoom-in rounded-xl border border-slate-100 object-contain shadow-xs transition-transform hover:scale-[1.01] dark:border-slate-800"
                      title="Bấm để phóng to hình ảnh"
                    />
                    {q.imageCaption && (
                      <figcaption className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {q.imageCaption}
                      </figcaption>
                    )}
                  </figure>
                )}

                {/* Các phương án lựa chọn theo loại câu hỏi */}
                {qType === "multiple_choice" && (
                  <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {usableOptions(q.options).map((opt, oi) => {
                      const isCorrect = isExplanationShown && opt.id === q.correctOptionId;
                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors ${
                            isCorrect
                              ? "border-emerald-400 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200"
                              : "border-slate-200/80 bg-slate-50/50 text-slate-800 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-200"
                          }`}
                        >
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200/80 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {optionLabels[oi] ?? opt.id}
                          </span>
                          <div className="min-w-0 flex-1">
                            <LazyMathText inline text={opt.text} />
                            {isCorrect && (
                              <span className="ml-2 font-bold text-emerald-600 dark:text-emerald-400">✓ Đáp án đúng</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {qType === "true_false" && (
                  <div className="mt-3 space-y-2">
                    {statementsOf(q).map((statement, si) => {
                      const isTrue = statement.correctVal === "true";
                      return (
                        <div
                          key={statement.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-sm dark:border-slate-800/80 dark:bg-slate-900/40"
                        >
                          <div className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-slate-500">
                              {String.fromCharCode(97 + si)}.
                            </span>
                            <LazyMathText inline text={statement.text} />
                          </div>
                          {isExplanationShown && (
                            <span
                              className={`rounded-md px-2.5 py-0.5 text-xs font-bold ${
                                isTrue
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  : "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              }`}
                            >
                              {isTrue ? "✓ Đúng" : "✗ Sai"}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {qType === "short_answer" && (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
                    ✍️ <em>Dạng câu hỏi điền kết quả ngắn (bấm xem lời giải bên dưới để đối chiếu kết quả).</em>
                  </div>
                )}

                {qType === "essay" && (
                  <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-400">
                    📝 <em>Dạng câu hỏi tự luận (làm bài ra giấy/vở rồi đối chiếu các bước giải bên dưới).</em>
                  </div>
                )}

                {/* Nút bật/tắt đáp án & lời giải chi tiết */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => toggleExplanation(q.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
                  >
                    <span>💡</span>
                    <span>{isExplanationShown ? "Ẩn đáp án & lời giải" : "Xem đáp án & lời giải"}</span>
                  </button>

                  {/* Khung hiển thị đáp án & lời giải chi tiết */}
                  {isExplanationShown && (
                    <div className="mt-3 space-y-3 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/40 p-4 text-sm text-slate-800 dark:border-indigo-950/60 dark:from-indigo-950/30 dark:to-violet-950/20 dark:text-slate-200">
                      {/* Dòng tóm tắt đáp án chuẩn */}
                      <div className="rounded-lg bg-white/80 p-3 shadow-2xs backdrop-blur-xs dark:bg-slate-900/80">
                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                          Đáp án chính xác
                        </p>
                        <div className="mt-1 font-semibold text-slate-900 dark:text-white">
                          {qType === "multiple_choice" && (
                            <span>
                              {correctOptIdx >= 0 ? `${optionLabels[correctOptIdx] ?? ""}. ` : ""}
                              {correctOpt ? <LazyMathText inline text={correctOpt.text} /> : "Chưa có đáp án"}
                            </span>
                          )}
                          {qType === "true_false" && (
                            <div className="mt-1 flex flex-wrap gap-3 text-xs">
                              {statementsOf(q).map((stmt, si) => (
                                <span key={stmt.id} className="inline-flex items-center gap-1">
                                  <b>{String.fromCharCode(97 + si)}:</b>
                                  <span
                                    className={
                                      stmt.correctVal === "true"
                                        ? "text-emerald-600 dark:text-emerald-400 font-bold"
                                        : "text-rose-600 dark:text-rose-400 font-bold"
                                    }
                                  >
                                    {stmt.correctVal === "true" ? "Đúng" : "Sai"}
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                          {qType === "short_answer" && (
                            <span className="font-mono text-indigo-600 dark:text-indigo-300">
                              {q.correctAnswer ? <LazyMathText inline text={q.correctAnswer} /> : "Chưa có đáp án"}
                            </span>
                          )}
                          {qType === "essay" && (
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              (Xem các bước giải chi tiết phía dưới)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lời giải chi tiết */}
                      {hasExplanation ? (
                        <div className="space-y-3 pt-1">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Hướng dẫn giải chi tiết
                          </p>

                          {expImages.length > 0 && (
                            <div
                              className={
                                expImages.length === 1 ? "space-y-2" : "grid grid-cols-1 gap-3 sm:grid-cols-2"
                              }
                            >
                              {expImages.map((img, imgIdx) => (
                                <figure key={imgIdx} className="group relative text-center">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.src}
                                    alt={img.caption || `Hình ảnh lời giải ${imgIdx + 1}`}
                                    loading="lazy"
                                    decoding="async"
                                    onClick={() => setZoomState({ images: expImages, initialIndex: imgIdx })}
                                    className="mx-auto max-h-80 w-full cursor-zoom-in rounded-xl border border-slate-200/80 bg-white object-contain shadow-xs transition-transform hover:scale-[1.01] dark:border-slate-800 dark:bg-slate-900"
                                    title="Bấm để phóng to và xem chi tiết ảnh"
                                  />
                                  {img.caption && (
                                    <figcaption className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                                      {img.caption}
                                    </figcaption>
                                  )}
                                </figure>
                              ))}
                            </div>
                          )}

                          {q.explanation?.trim() && (
                            <div className="leading-relaxed">
                              <LazyMathText text={q.explanation} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Chưa có bài giải chi tiết bổ sung cho câu hỏi này.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal phóng to ảnh */}
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
          documentInfo={{ title: "Ngân hàng câu hỏi" }}
          onClose={() => setReportingQuestion(null)}
        />
      )}
    </div>
  );
}
