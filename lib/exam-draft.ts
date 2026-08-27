import type {
  DocumentTestAnswers,
  DocumentTestResult,
} from "@/lib/document-types";

export type ExamDraft = {
  answers: DocumentTestAnswers;
  flagged: Record<string, boolean>;
  updatedAt: number;
};

const DRAFT_KEY_PREFIX = "exam-draft-";
const RESULT_KEY_PREFIX = "document-test-result-";
const QUIZ_BLOCK_DRAFT_PREFIX = "quiz-block-draft-";

/** Đọc bài làm dở từ localStorage */
export function loadExamDraft(documentId: string): ExamDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DRAFT_KEY_PREFIX}${documentId}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.answers === "object") {
      return parsed as ExamDraft;
    }
    return null;
  } catch {
    return null;
  }
}

/** Lưu bài làm dở vào localStorage */
export function saveExamDraft(
  documentId: string,
  draft: { answers: DocumentTestAnswers; flagged: Record<string, boolean> },
): void {
  if (typeof window === "undefined") return;
  try {
    const data: ExamDraft = {
      answers: draft.answers,
      flagged: draft.flagged,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`${DRAFT_KEY_PREFIX}${documentId}`, JSON.stringify(data));
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
  }
}

/** Xóa bài làm dở khỏi localStorage */
export function clearExamDraft(documentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${documentId}`);
  } catch {
    // bỏ qua
  }
}

/** Lưu kết quả kiểm tra gần nhất vào cả localStorage và sessionStorage */
export function saveExamResult(documentId: string, result: DocumentTestResult): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(result);
    localStorage.setItem(`${RESULT_KEY_PREFIX}${documentId}`, serialized);
    sessionStorage.setItem(`${RESULT_KEY_PREFIX}${documentId}`, serialized);
  } catch {
    // bỏ qua
  }
}

/** Đọc kết quả kiểm tra gần nhất từ localStorage (hoặc fallback sessionStorage) */
export function loadExamResult(documentId: string): DocumentTestResult | null {
  if (typeof window === "undefined") return null;
  try {
    const rawLocal = localStorage.getItem(`${RESULT_KEY_PREFIX}${documentId}`);
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (typeof parsed.score === "number" || typeof parsed.percent === "number") {
        return parsed as DocumentTestResult;
      }
    }
    const rawSession = sessionStorage.getItem(`${RESULT_KEY_PREFIX}${documentId}`);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (typeof parsed.score === "number" || typeof parsed.percent === "number") {
        return parsed as DocumentTestResult;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/** Xóa kết quả kiểm tra gần nhất */
export function clearExamResult(documentId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${RESULT_KEY_PREFIX}${documentId}`);
    sessionStorage.removeItem(`${RESULT_KEY_PREFIX}${documentId}`);
  } catch {
    // bỏ qua
  }
}

/** Trạng thái lưu dở của khối câu hỏi QuizBlock nhúng trong bài học */
export type QuizBlockDraft = {
  answers: Record<string, string>;
  submitted: boolean;
  updatedAt: number;
};

export function loadQuizBlockDraft(blockKey: string): QuizBlockDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${QUIZ_BLOCK_DRAFT_PREFIX}${blockKey}`);
    if (!raw) return null;
    return JSON.parse(raw) as QuizBlockDraft;
  } catch {
    return null;
  }
}

export function saveQuizBlockDraft(
  blockKey: string,
  data: { answers: Record<string, string>; submitted: boolean },
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${QUIZ_BLOCK_DRAFT_PREFIX}${blockKey}`,
      JSON.stringify({ ...data, updatedAt: Date.now() }),
    );
  } catch {
    // bỏ qua
  }
}

export function clearQuizBlockDraft(blockKey: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(`${QUIZ_BLOCK_DRAFT_PREFIX}${blockKey}`);
  } catch {
    // bỏ qua
  }
}
