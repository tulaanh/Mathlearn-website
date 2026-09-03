"use client";

import { useMemo, useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BankQuestion } from "@/lib/question-bank-types";
import type { Topic } from "@/lib/types";
import type { QuizQuestion } from "@/lib/document-types";
import { useSavedQuestions, type SavedBankQuestion } from "@/lib/saved-questions";
import ImageZoomModal, { type ZoomImageItem } from "./ImageZoomModal";
import ReportQuestionModal from "./ReportQuestionModal";
import BankFilterBar from "./question-bank/BankFilterBar";
import BankNavTabs from "./question-bank/BankNavTabs";
import BankEmptyState from "./question-bank/BankEmptyState";
import BankQuestionCard from "./question-bank/BankQuestionCard";

type Props = {
  questions: BankQuestion[];
  grades: string[];
  topics: Topic[];
  page?: number;
  pageSize?: number;
  totalAll?: number;
};

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
  const [isPending, startTransition] = useTransition();
  const { savedQuestions, isSaved, toggleSave } = useSavedQuestions();

  const [expandAll, setExpandAll] = useState(false);
  const [zoomState, setZoomState] = useState<{ images: ZoomImageItem[]; initialIndex: number } | null>(null);
  const [reportingQuestion, setReportingQuestion] = useState<QuizQuestion | null>(null);

  const currentTab = searchParams.get("tab") === "saved" ? "saved" : "all";
  const currentSearch = searchParams.get("q") ?? "";
  const currentGrade = searchParams.get("grade") ?? "";
  const currentTopic = searchParams.get("topic") ?? "";
  const currentDifficulty = searchParams.get("difficulty") ?? "";
  const currentType = searchParams.get("type") ?? "";

  const hasFilter = Boolean(currentSearch || currentGrade || currentTopic || currentDifficulty || currentType);

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/ngan-hang-cau-hoi?${qs}` : "/ngan-hang-cau-hoi");
      });
    },
    [router, searchParams]
  );

  const switchTab = useCallback(
    (tab: "all" | "saved") => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "saved") params.set("tab", "saved");
      else params.delete("tab");
      params.delete("page");
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/ngan-hang-cau-hoi?${qs}` : "/ngan-hang-cau-hoi");
      });
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    startTransition(() => {
      if (currentTab === "saved") {
        router.push("/ngan-hang-cau-hoi?tab=saved");
      } else {
        router.push("/ngan-hang-cau-hoi");
      }
    });
  }, [currentTab, router]);

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

  const handleZoomImage = useCallback((images: ZoomImageItem[], initialIndex: number) => {
    setZoomState({ images, initialIndex });
  }, []);

  return (
    <div className={`relative space-y-5 transition-opacity ${isPending ? "opacity-60" : ""}`} aria-busy={isPending}>
      {isPending && (
        <div className="sticky top-20 z-20 mx-auto w-fit rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg">
          Đang cập nhật…
        </div>
      )}

      <BankNavTabs
        currentTab={currentTab}
        switchTab={switchTab}
        totalAll={totalAll}
        savedCount={savedQuestions.length}
        hasActiveQuestions={activeQuestions.length > 0}
        expandAll={expandAll}
        onToggleExpandAll={() => setExpandAll((prev) => !prev)}
      />

      <BankFilterBar
        currentTab={currentTab}
        currentSearch={currentSearch}
        currentGrade={currentGrade}
        currentTopic={currentTopic}
        currentDifficulty={currentDifficulty}
        currentType={currentType}
        grades={grades}
        topics={topics}
        hasFilter={hasFilter}
        setParam={setParam}
        clearAllFilters={clearAllFilters}
      />

      {activeQuestions.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <p className="font-semibold text-slate-500 dark:text-slate-400">
            {currentTab === "saved"
              ? `Đang hiển thị ${activeQuestions.length} câu hỏi đã lưu`
              : `Hiển thị trang ${page} (${activeQuestions.length} câu hỏi)`}
          </p>
        </div>
      )}

      {activeQuestions.length === 0 ? (
        <BankEmptyState
          currentTab={currentTab}
          hasFilter={hasFilter}
          switchTab={switchTab}
          clearAllFilters={clearAllFilters}
        />
      ) : (
        <div className="space-y-4">
          {activeQuestions.map((q, index) => {
            const qIndex = currentTab === "saved" ? index + 1 : (page - 1) * pageSize + index + 1;
            return (
              <BankQuestionCard
                key={q.id}
                q={q}
                qIndex={qIndex}
                currentTab={currentTab}
                topics={topics}
                isItemSaved={isSaved(q.id)}
                toggleSave={toggleSave}
                onZoomImage={handleZoomImage}
                onReport={setReportingQuestion}
                expandAll={expandAll}
              />
            );
          })}
        </div>
      )}

      {zoomState && (
        <ImageZoomModal
          images={zoomState.images}
          initialIndex={zoomState.initialIndex}
          onClose={() => setZoomState(null)}
        />
      )}

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
