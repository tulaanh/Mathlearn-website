import type { Chapter } from "@/lib/types";

/**
 * ============================================================
 *  DỮ LIỆU CHƯƠNG HỌC
 * ------------------------------------------------------------
 *  Danh sách hiện đang TRỐNG (đã xóa nội dung mẫu cũ).
 *  Thêm chương mới bằng cách thêm object vào mảng `chapters`
 *  bên dưới, cấu trúc theo kiểu `Chapter` trong lib/types.ts.
 *
 *  Mỗi chương gồm nhiều bài học nhỏ:
 *  - Bài học có `quizId`   → tiến trình = điểm tốt nhất của bài test đó
 *  - Bài học không có quiz → học sinh bấm "Đánh dấu đã học" để đạt 100%
 * ============================================================
 */
export const chapters: Chapter[] = [];

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((chapter) => chapter.id === id);
}
