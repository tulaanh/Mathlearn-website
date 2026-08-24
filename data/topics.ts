import type { Topic } from "@/lib/types";

/**
 * Danh mục chủ đề Toán.
 *
 * Một đề, bài tập hoặc tài liệu có thể tham chiếu nhiều `topicIds` trong
 * `data/quizzes.ts` và `data/chapters.ts` mà không cần nhân bản nội dung.
 */
export const topics: Topic[] = [
  {
    id: "hang-dang-thuc",
    name: "Hằng đẳng thức",
    description: "Nhận biết và vận dụng các hằng đẳng thức đáng nhớ.",
  },
  {
    id: "phan-tich-da-thuc",
    name: "Phân tích đa thức",
    description: "Phân tích đa thức thành nhân tử bằng nhiều phương pháp.",
  },
  {
    id: "phan-thuc-dai-so",
    name: "Phân thức đại số",
    description: "Rút gọn, thực hiện phép tính và giải bài toán với phân thức.",
  },
  {
    id: "phuong-trinh",
    name: "Phương trình",
    description: "Giải và vận dụng phương trình bậc nhất một ẩn.",
  },
  {
    id: "tam-giac-vuong",
    name: "Tam giác vuông",
    description: "Định lí Pythagore và các bài toán trong tam giác vuông.",
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
