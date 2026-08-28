"use client";

import { useCallback, useEffect, useState } from "react";
import type { BankQuestion, QuestionDifficulty } from "@/lib/question-bank-types";
import type { QuizQuestion } from "@/lib/document-types";

export type SavedBankQuestion = BankQuestion & {
  savedAt: string;
  sourceDocId?: string;
  sourceDocTitle?: string;
};

const STORAGE_KEY = "mathlearn-student-saved-questions";
const EVENT_NAME = "mathlearn-saved-questions-changed";

/** Đọc danh sách câu hỏi đã lưu từ localStorage (client-side). */
export function loadSavedQuestions(): SavedBankQuestion[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedBankQuestion[]) : [];
  } catch {
    return [];
  }
}

function persist(questions: SavedBankQuestion[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // bỏ qua nếu browser chặn localStorage
  }
  window.dispatchEvent(new Event(EVENT_NAME));
}

/** Chuẩn hóa QuizQuestion hoặc BankQuestion thành SavedBankQuestion đầy đủ. */
export function normalizeToSavedQuestion(
  question: QuizQuestion | BankQuestion,
  meta?: {
    sourceDocId?: string;
    sourceDocTitle?: string;
    grade?: string;
    topicIds?: string[];
    difficulty?: QuestionDifficulty;
  },
): SavedBankQuestion {
  const bq = question as Partial<BankQuestion>;
  return {
    id: question.id,
    text: question.text,
    type: question.type || "multiple_choice",
    options: question.options,
    statements: question.statements,
    correctOptionId: question.correctOptionId,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: question.points ?? 1,
    imageStoragePath: question.imageStoragePath,
    imageUrl: question.imageUrl,
    imageCaption: question.imageCaption,
    explanationImageStoragePath: question.explanationImageStoragePath,
    explanationImageUrl: question.explanationImageUrl,
    explanationImageCaption: question.explanationImageCaption,
    explanationImages: question.explanationImages,
    difficulty: bq.difficulty || meta?.difficulty || "thong_hieu",
    grade: bq.grade || meta?.grade || "Lớp 12",
    topicIds: bq.topicIds || meta?.topicIds || [],
    savedAt: new Date().toISOString(),
    sourceDocId: meta?.sourceDocId,
    sourceDocTitle: meta?.sourceDocTitle,
  };
}

/** Lưu một câu hỏi vào ngân hàng câu hỏi cá nhân của học sinh. */
export function saveQuestionToBank(
  question: QuizQuestion | BankQuestion,
  meta?: {
    sourceDocId?: string;
    sourceDocTitle?: string;
    grade?: string;
    topicIds?: string[];
    difficulty?: QuestionDifficulty;
  },
): boolean {
  const current = loadSavedQuestions();
  const existingIdx = current.findIndex((q) => q.id === question.id);
  const normalized = normalizeToSavedQuestion(question, meta);

  if (existingIdx >= 0) {
    current[existingIdx] = normalized;
  } else {
    current.unshift(normalized);
  }
  persist(current);
  return true;
}

/** Lưu nhiều câu hỏi cùng lúc vào ngân hàng câu hỏi cá nhân. */
export function saveMultipleQuestionsToBank(
  questions: Array<{
    question: QuizQuestion | BankQuestion;
    meta?: {
      sourceDocId?: string;
      sourceDocTitle?: string;
      grade?: string;
      topicIds?: string[];
      difficulty?: QuestionDifficulty;
    };
  }>,
): number {
  if (!questions.length) return 0;
  const current = loadSavedQuestions();
  const map = new Map<string, SavedBankQuestion>();

  // Giữ các câu cũ
  for (const q of current) {
    map.set(q.id, q);
  }

  // Thêm các câu mới lên đầu
  let count = 0;
  for (const item of questions) {
    const normalized = normalizeToSavedQuestion(item.question, item.meta);
    if (!map.has(normalized.id)) {
      count += 1;
    }
    map.set(normalized.id, normalized);
  }

  const updated = Array.from(map.values()).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
  persist(updated);
  return count;
}

/** Bỏ lưu câu hỏi khỏi ngân hàng cá nhân. */
export function removeSavedQuestion(questionId: string): boolean {
  const current = loadSavedQuestions();
  const filtered = current.filter((q) => q.id !== questionId);
  if (filtered.length !== current.length) {
    persist(filtered);
    return true;
  }
  return false;
}

/** Kiểm tra câu hỏi đã được lưu hay chưa. */
export function isQuestionSaved(questionId: string): boolean {
  const current = loadSavedQuestions();
  return current.some((q) => q.id === questionId);
}

/**
 * Hook theo dõi danh sách câu hỏi đã lưu của học sinh.
 * Tự động đồng bộ trên toàn bộ component và các tab.
 */
export function useSavedQuestions() {
  const [savedQuestions, setSavedQuestions] = useState<SavedBankQuestion[]>([]);

  useEffect(() => {
    const update = () => setSavedQuestions(loadSavedQuestions());
    update();
    window.addEventListener(EVENT_NAME, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT_NAME, update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const savedIdsSet = new Set(savedQuestions.map((q) => q.id));

  const isSaved = useCallback((id: string) => savedIdsSet.has(id), [savedIdsSet]);

  const toggleSave = useCallback(
    (
      question: QuizQuestion | BankQuestion,
      meta?: {
        sourceDocId?: string;
        sourceDocTitle?: string;
        grade?: string;
        topicIds?: string[];
        difficulty?: QuestionDifficulty;
      },
    ) => {
      if (isQuestionSaved(question.id)) {
        removeSavedQuestion(question.id);
        return false;
      } else {
        saveQuestionToBank(question, meta);
        return true;
      }
    },
    [],
  );

  const saveQuestion = useCallback(
    (
      question: QuizQuestion | BankQuestion,
      meta?: {
        sourceDocId?: string;
        sourceDocTitle?: string;
        grade?: string;
        topicIds?: string[];
        difficulty?: QuestionDifficulty;
      },
    ) => {
      saveQuestionToBank(question, meta);
    },
    [],
  );

  const removeQuestion = useCallback((questionId: string) => {
    removeSavedQuestion(questionId);
  }, []);

  const saveMultiple = useCallback(
    (
      items: Array<{
        question: QuizQuestion | BankQuestion;
        meta?: {
          sourceDocId?: string;
          sourceDocTitle?: string;
          grade?: string;
          topicIds?: string[];
          difficulty?: QuestionDifficulty;
        };
      }>,
    ) => {
      return saveMultipleQuestionsToBank(items);
    },
    [],
  );

  return {
    savedQuestions,
    savedIdsSet,
    isSaved,
    toggleSave,
    saveQuestion,
    removeQuestion,
    saveMultiple,
  };
}
