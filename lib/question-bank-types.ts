import type { QuestionType, QuizQuestion } from "@/lib/document-types";

/** Mức độ khó của câu hỏi trong ngân hàng (theo ma trận đề thi). */
export type QuestionDifficulty = "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao";

export const DIFFICULTY_META: {
  id: QuestionDifficulty;
  label: string;
  short: string;
  badgeClass: string;
}[] = [
  {
    id: "nhan_biet",
    label: "Nhận biết",
    short: "NB",
    badgeClass: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300",
  },
  {
    id: "thong_hieu",
    label: "Thông hiểu",
    short: "TH",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  {
    id: "van_dung",
    label: "Vận dụng",
    short: "VD",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  {
    id: "van_dung_cao",
    label: "Vận dụng cao",
    short: "VDC",
    badgeClass: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
];

export function isQuestionDifficulty(value: unknown): value is QuestionDifficulty {
  return typeof value === "string" && DIFFICULTY_META.some((d) => d.id === value);
}

export function getDifficultyMeta(id: QuestionDifficulty) {
  return DIFFICULTY_META.find((d) => d.id === id) ?? DIFFICULTY_META[0];
}

/** Câu hỏi trong ngân hàng = câu hỏi tài liệu + mức độ khó + khối lớp + chủ đề. */
export type BankQuestion = QuizQuestion & {
  difficulty: QuestionDifficulty;
  grade: string;
  topicIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

/** Ma trận sinh đề: số lượng câu hỏi cần chọn theo từng mức độ. */
export type ExamMatrix = Record<QuestionDifficulty, number>;

/** Các trường lưu trong cột content (jsonb), ngoài các cột riêng của bảng. */
type BankContent = Omit<QuizQuestion, "id" | "text" | "type">;

/** Chuyển câu hỏi ngân hàng thành payload để insert/update bảng question_bank.
 *  Hàm thuần (không phụ thuộc server) dùng được ở cả client và server. */
export function bankQuestionToPayload(question: BankQuestion): {
  text: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  grade: string;
  content: BankContent;
} {
  const { id, text, type, difficulty, grade, topicIds, createdAt, updatedAt, ...rest } = question;
  // imageFile và explanationImageFile là đối tượng File phía client, không thể lưu vào JSON
  const clone = { ...rest } as Record<string, unknown>;
  delete clone.imageFile;
  delete clone.explanationImageFile;
  if (Array.isArray(clone.explanationImages)) {
    clone.explanationImages = (clone.explanationImages as Array<Record<string, unknown>>).map((img) => {
      const copy = { ...img };
      delete copy.file;
      return copy;
    });
  }
  return {
    text,
    type: type || "multiple_choice",
    difficulty,
    grade,
    content: clone as BankContent,
  };
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  multiple_choice: "Trắc nghiệm",
  true_false: "Đúng / Sai",
  short_answer: "Trả lời ngắn",
  essay: "Tự luận",
};
