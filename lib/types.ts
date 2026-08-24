export type Option = {
  id: string;
  text: string;
};

export type Question = {
  id: string;
  text: string;
  options: Option[];
  /** id của đáp án đúng */
  correctOptionId: string;
  /** Giải thích hiển thị sau khi nộp bài */
  explanation?: string;
};

export type Topic = {
  id: string;
  name: string;
  description: string;
};

export type Quiz = {
  id: string;
  title: string;
  /** Website hiện chỉ phục vụ môn Toán. */
  subject: "Toán";
  /** Khối lớp, ví dụ: "Lớp 8" */
  grade: string;
  description: string;
  /** Một bài kiểm tra có thể thuộc nhiều chủ đề. */
  topicIds: string[];
  questions: Question[];
};

/** Một bài học nhỏ trong chương. Có thể gắn bài test (quizId) hoặc là bài lý thuyết. */
export type Lesson = {
  id: string;
  title: string;
  description?: string;
  /** id của bài test gắn với bài học này (nếu có) */
  quizId?: string;
  /** Bài học/tài liệu có thể thuộc nhiều chủ đề. */
  topicIds?: string[];
};

/** Chương học gồm nhiều bài học nhỏ */
export type Chapter = {
  id: string;
  title: string;
  subject: "Toán";
  grade: string;
  description: string;
  lessons: Lesson[];
};

