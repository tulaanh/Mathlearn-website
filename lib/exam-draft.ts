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

function getDraftKey(documentId: string, userId?: string | null): string {
  return userId ? `${DRAFT_KEY_PREFIX}${userId}-${documentId}` : `${DRAFT_KEY_PREFIX}${documentId}`;
}

function getResultKey(documentId: string, userId?: string | null): string {
  return userId ? `${RESULT_KEY_PREFIX}${userId}-${documentId}` : `${RESULT_KEY_PREFIX}${documentId}`;
}

function getQuizBlockDraftKey(blockKey: string, userId?: string | null): string {
  return userId ? `${QUIZ_BLOCK_DRAFT_PREFIX}${userId}-${blockKey}` : `${QUIZ_BLOCK_DRAFT_PREFIX}${blockKey}`;
}

/** Đọc bài làm dở từ localStorage (phân tách theo userId nếu có) */
export function loadExamDraft(documentId: string, userId?: string | null): ExamDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getDraftKey(documentId, userId);
    let raw = localStorage.getItem(key);
    // Nếu có userId mà chưa có draft ở key mới, nhưng có draft cũ từ trước:
    // chuyển giao draft sang userId hiện tại và xóa key cũ
    if (!raw) {
      const oldRaw = localStorage.getItem(`${DRAFT_KEY_PREFIX}${documentId}`);
      if (oldRaw && userId) {
        localStorage.setItem(key, oldRaw);
        localStorage.removeItem(`${DRAFT_KEY_PREFIX}${documentId}`);
        raw = oldRaw;
      } else if (oldRaw && !userId) {
        raw = oldRaw;
      }
    }
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

/** Lưu bài làm dở vào localStorage theo userId */
export function saveExamDraft(
  documentId: string,
  draft: { answers: DocumentTestAnswers; flagged: Record<string, boolean> },
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const data: ExamDraft = {
      answers: draft.answers,
      flagged: draft.flagged,
      updatedAt: Date.now(),
    };
    const key = getDraftKey(documentId, userId);
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
  }
}

/** Xóa bài làm dở khỏi localStorage */
export function clearExamDraft(documentId: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getDraftKey(documentId, userId));
    // Dọn dẹp key cũ nếu có
    localStorage.removeItem(`${DRAFT_KEY_PREFIX}${documentId}`);
  } catch {
    // bỏ qua
  }
}

/** Lưu kết quả kiểm tra gần nhất vào cả localStorage và sessionStorage */
export function saveExamResult(
  documentId: string,
  result: DocumentTestResult,
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(result);
    const key = getResultKey(documentId, userId);
    localStorage.setItem(key, serialized);
    sessionStorage.setItem(key, serialized);
  } catch {
    // bỏ qua
  }
}

/** Đọc kết quả kiểm tra gần nhất từ localStorage (hoặc fallback sessionStorage) */
export function loadExamResult(
  documentId: string,
  userId?: string | null,
): DocumentTestResult | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getResultKey(documentId, userId);
    let rawLocal = localStorage.getItem(key);

    // Kế thừa kết quả cũ từ trước khi nâng cấp
    if (!rawLocal) {
      const oldRaw = localStorage.getItem(`${RESULT_KEY_PREFIX}${documentId}`);
      if (oldRaw && userId) {
        localStorage.setItem(key, oldRaw);
        localStorage.removeItem(`${RESULT_KEY_PREFIX}${documentId}`);
        rawLocal = oldRaw;
      } else if (oldRaw && !userId) {
        rawLocal = oldRaw;
      }
    }

    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (typeof parsed.score === "number" || typeof parsed.percent === "number") {
        return parsed as DocumentTestResult;
      }
    }
    const rawSession = sessionStorage.getItem(key);
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
export function clearExamResult(documentId: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getResultKey(documentId, userId);
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
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

export function loadQuizBlockDraft(blockKey: string, userId?: string | null): QuizBlockDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getQuizBlockDraftKey(blockKey, userId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as QuizBlockDraft;
  } catch {
    return null;
  }
}

export function saveQuizBlockDraft(
  blockKey: string,
  data: { answers: Record<string, string>; submitted: boolean },
  userId?: string | null,
): void {
  if (typeof window === "undefined") return;
  try {
    const key = getQuizBlockDraftKey(blockKey, userId);
    localStorage.setItem(
      key,
      JSON.stringify({ ...data, updatedAt: Date.now() }),
    );
  } catch {
    // bỏ qua
  }
}

export function clearQuizBlockDraft(blockKey: string, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getQuizBlockDraftKey(blockKey, userId));
    localStorage.removeItem(`${QUIZ_BLOCK_DRAFT_PREFIX}${blockKey}`);
  } catch {
    // bỏ qua
  }
}

/** Dọn dẹp toàn bộ dữ liệu bài thi (drafts, results) của một user hoặc tất cả khi đăng xuất */
export function clearUserExamData(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const toRemoveLocal: string[] = [];
    const toRemoveSession: string[] = [];
    const prefixMatch = userId ? `-${userId}-` : "-";

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (
        (k.startsWith(DRAFT_KEY_PREFIX) ||
          k.startsWith(RESULT_KEY_PREFIX) ||
          k.startsWith(QUIZ_BLOCK_DRAFT_PREFIX)) &&
        (!userId || k.includes(prefixMatch))
      ) {
        toRemoveLocal.push(k);
      }
    }

    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (!k) continue;
      if (
        (k.startsWith(RESULT_KEY_PREFIX) || k.startsWith("quiz-result-")) &&
        (!userId || k.includes(prefixMatch))
      ) {
        toRemoveSession.push(k);
      }
    }

    toRemoveLocal.forEach((k) => localStorage.removeItem(k));
    toRemoveSession.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // bỏ qua
  }
}
