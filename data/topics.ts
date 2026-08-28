import type { Topic } from "@/lib/types";

/**
 * Danh mục chủ đề Toán.
 *
 * Một đề, bài tập hoặc tài liệu có thể tham chiếu nhiều `topicIds` trong
 * `data/quizzes.ts` và `data/chapters.ts` mà không cần nhân bản nội dung.
 */
export const topics: Topic[] = [
  {
    id: "ham-so-va-do-thi",
    name: "Hàm số và Đồ thị",
    description: "Các bài toán về hàm số, đồ thị và tính chất của hàm số.",
  },
  {
    id: "mu-va-logarit",
    name: "Mũ và Logarit",
    description: "Các bài toán về hàm mũ, phương trình mũ, hàm logarit và phương trình logarit.",
  },
  {
    id: "dao-ham",
    name: "Đạo hàm",
    description: "Tính đạo hàm và vận dụng đạo hàm vào các bài toán.",
  },
  {
    id: "nguyen-ham-va-tich-phan",
    name: "Nguyên hàm và Tích phân",
    description: "Tính nguyên hàm, tích phân và các bài toán ứng dụng.",
  },
  {
    id: "luong-giac",
    name: "Lượng giác",
    description: "Các công thức, phương trình và bất phương trình lượng giác.",
  },
  {
    id: "day-so-va-gioi-han",
    name: "Dãy số và Giới hạn",
    description: "Dãy số, cấp số cộng, cấp số nhân và giới hạn.",
  },
  {
    id: "hinh-hoc-khong-gian",
    name: "Hình học không gian",
    description: "Các bài toán về quan hệ không gian, hình khối và thể tích.",
  },
  {
    id: "vector-va-he-toa-do",
    name: "Vector và Hệ tọa độ",
    description: "Vector và phương pháp tọa độ trong hình học.",
  },
  {
    id: "xac-suat-va-thong-ke",
    name: "Xác suất và Thống kê",
    description: "Các bài toán về xác suất, số liệu và thống kê.",
  },
];

export function getTopicById(id: string): Topic | undefined {
  return topics.find((topic) => topic.id === id);
}

export function getTopicsByIds(ids: string[]): Topic[] {
  return ids
    .map((id) => getTopicById(id))
    .filter((topic): topic is Topic => Boolean(topic));
}