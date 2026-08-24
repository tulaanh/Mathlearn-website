/** Loại item trong chương: tài liệu Supabase hoặc bài kiểm tra cũ */
export type ChapterItemType = "document" | "quiz";

/** Một mục trong chương (tài liệu hoặc bài kiểm tra) */
export type ChapterItem = {
  id: string;
  itemType: ChapterItemType;
  documentId?: string;
  quizId?: string;
  position: number;
  /** Dữ liệu mở rộng khi hiển thị — được join từ bảng documents hoặc lookup từ quizzes.ts */
  title?: string;
  description?: string | null;
  /** Chỉ có khi itemType = 'document' */
  documentType?: "normal" | "test";
  documentStatus?: "draft" | "published";
  grade?: string;
};

/** Dữ liệu một chương */
export type ChapterData = {
  id: string;
  /** Lộ trình học chứa chương này (null nếu chưa gán vào lộ trình nào) */
  pathId: string | null;
  title: string;
  description: string | null;
  subject: string;
  grade: string;
  position: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  items: ChapterItem[];
};

/** Bài kế tiếp được gợi ý sau khi hoàn thành một mục trong chương */
export type ChapterNextItem = {
  title: string;
  url: string;
  /** Bài kế tiếp là bài kiểm tra (quiz legacy hoặc tài liệu dạng test) */
  isTest: boolean;
};

/** Định vị một tài liệu/bài test trong chương để gợi ý bài kế tiếp */
export type ChapterNavigation = {
  chapterId: string;
  chapterTitle: string;
  /** Vị trí mục hiện tại (0-based) trong chương */
  currentIndex: number;
  totalItems: number;
  nextItem: ChapterNextItem | null;
  /** Chương kế tiếp trong lộ trình — chỉ có khi đã hết bài của chương hiện tại */
  nextChapter: { id: string; title: string } | null;
};

/** Gợi ý bước tiếp theo cho trang làm bài kiểm tra (/quiz/[id]) */
export type TestNextStep = {
  navigation: ChapterNavigation;
  /** Tài liệu chứa bài test này dưới dạng test đính kèm (nếu có) */
  parentDocument: { id: string; title: string } | null;
};

/** URL học tập của một mục trong chương.
 *  Kèm ?chuong= để trang đích biết ngữ cảnh chương khi tài liệu thuộc nhiều chương. */
export function getChapterItemUrl(
  item: Pick<ChapterItem, "itemType" | "documentId" | "quizId" | "documentType">,
  chapterId?: string,
): string {
  let url: string;
  if (item.itemType === "quiz") {
    url = `/quiz/${item.quizId}`;
  } else if (item.documentType === "test") {
    url = `/quiz/${item.documentId}`;
  } else {
    url = `/tai-lieu/${item.documentId}`;
  }
  return chapterId ? `${url}?chuong=${chapterId}` : url;
}
