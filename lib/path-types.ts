/** Dữ liệu một lộ trình học — mỗi lộ trình chứa nhiều chương */
export type LearningPathData = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  chapters: import("./chapter-types").ChapterData[];
};
