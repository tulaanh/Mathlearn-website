import type { Quiz } from "@/lib/types";

/**
 * ============================================================
 *  DỮ LIỆU BÀI TEST
 * ------------------------------------------------------------
 *  Danh sách hiện đang TRỐNG (đã xóa các bài test mẫu cũ).
 *  Gia sư thêm/sửa/xóa bài test ngay tại mảng `quizzes` bên
 *  dưới, cấu trúc theo kiểu `Quiz` trong lib/types.ts:
 *  - `correctOptionId` phải trùng với id của đáp án đúng.
 *  - Mỗi bài test có thể gắn nhiều chủ đề qua `topicIds`.
 *
 *  Ví dụ một bài test:
 *  {
 *    id: "toan-8-ham-so-va-do-thi",
 *    title: "Toán lớp 8 – Hằng đẳng thức đáng nhớ",
 *    subject: "Toán",
 *    grade: "Lớp 8",
 *    description: "Mô tả ngắn về bài test.",
 *    topicIds: ["ham-so-va-do-thi"],
 *    questions: [
 *      {
 *        id: "q1",
 *        text: "(a + b)² bằng?",
 *        options: [
 *          { id: "a", text: "a² + 2ab + b²" },
 *          { id: "b", text: "a² + b²" },
 *        ],
 *        correctOptionId: "a",
 *        explanation: "Hằng đẳng thức đáng nhớ số 1.",
 *      },
 *    ],
 *  }
 * ============================================================
 */
export const quizzes: Quiz[] = [];

export function getQuizById(id: string): Quiz | undefined {
  return quizzes.find((quiz) => quiz.id === id);
}
