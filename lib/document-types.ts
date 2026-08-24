export type DocumentStatus = "draft" | "published";
export type DocumentType = "normal" | "test";

export type QuestionImageItem = {
  storagePath?: string;
  caption?: string;
  url?: string;
  file?: File | null;
  /** Tên file ảnh tham chiếu trong .tex */
  sourceName?: string;
};

export type QuizQuestion = {
  id: string;
  text: string;
  type?: QuestionType;
  options?: {
    id: string;
    text: string;
    correctVal?: "true" | "false";
  }[];
  statements?: {
    id: string;
    text: string;
    correctVal: "true" | "false";
  }[];
  correctOptionId?: string;
  correctAnswer?: string;
  /** Điểm tối đa của câu hỏi, mặc định 1. */
  points?: number;
  /** Điểm nhận được theo số mệnh đề Đúng/Sai đúng (index = số ý đúng). */
  trueFalsePoints?: number[];
  explanation?: string;
  imageStoragePath?: string;
  imageCaption?: string;
  imageUrl?: string;
  imageFile?: File | null;
  /** Tên file ảnh được tham chiếu trong .tex (dùng ghép ảnh khi nhập LaTeX). */
  imageSourceName?: string;
  explanationImageStoragePath?: string;
  explanationImageCaption?: string;
  explanationImageUrl?: string;
  explanationImageFile?: File | null;
  /** Tên file ảnh lời giải được tham chiếu trong .tex (dùng ghép ảnh khi nhập LaTeX). */
  explanationImageSourceName?: string;
  /** Danh sách nhiều ảnh lời giải (nếu câu hỏi có nhiều hơn 1 hình ảnh lời giải). */
  explanationImages?: QuestionImageItem[];
};

export type DocumentTestAnswers = Record<string, string>;

export type DocumentTestResult = {
  answers: DocumentTestAnswers;
  correctCount: number;
  totalAutoGraded: number;
  /** Tổng điểm đạt được và tổng điểm tối đa trước khi quy đổi về thang 10. */
  earnedPoints: number;
  totalPoints: number;
  percent: number;
  score: number;
};

export type QuestionType = "multiple_choice" | "short_answer" | "essay" | "true_false";

export type DocumentBlock =
  | {
      id?: string;
      type: "text";
      content: string;
      position: number;
    }
  | {
      id?: string;
      type: "image";
      storagePath: string;
      altText: string;
      caption?: string;
      position: number;
    }
  | {
      id?: string;
      type: "lesson";
      title: string;
      description?: string;
      content: string;
      position: number;
    }
  | {
      id?: string;
      type: "quiz";
      title: string;
      description?: string;
      questions: QuizQuestion[];
      position: number;
    };

export type StudyDocument = {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  status: DocumentStatus;
  documentType: DocumentType;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  /** Các bài kiểm tra đính kèm (chỉ dành cho tài liệu học tập), có thể rỗng. */
  attachedTestIds?: string[];
  attachedTests?: { id: string; title: string }[];
  blocks: DocumentBlock[];
  topics: {
    id: string;
    name: string;
    description: string;
  }[];
};

export type DocumentFormBlock =
  | { type: "text"; content: string; keyId?: string }
  | { type: "image"; file: File | null; altText: string; caption: string; previewUrl?: string; storagePath?: string; keyId?: string; sourceName?: string }
  | { type: "lesson"; title: string; description?: string; content: string; keyId?: string }
  | { type: "quiz"; title: string; description?: string; questions: QuizQuestion[]; keyId?: string };

