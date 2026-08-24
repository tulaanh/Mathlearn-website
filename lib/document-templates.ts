import type { DocumentFormBlock } from "@/lib/document-types";

/**
 * Mẫu tài liệu dựng sẵn: mỗi mẫu trả về dữ liệu nạp thẳng vào trình soạn thảo.
 * `build()` luôn tạo object/array mới để các lần áp dụng không dùng chung tham chiếu.
 */

export type EditorPreset = {
  title: string;
  description: string;
  grade: string;
  status: "draft" | "published";
  documentType: "normal" | "test";
  selectedTopics: string[];
  blocks: DocumentFormBlock[];
};

export type DocumentTemplate = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  build: () => EditorPreset;
};

type FormQuizQuestion = Extract<DocumentFormBlock, { type: "quiz" }>["questions"][number];

const OPTION_IDS = ["a", "b", "c", "d"];

function makeQuestion(text: string, options: string[], correctIndex: number, explanation?: string): FormQuizQuestion {
  return {
    id: "q1",
    text,
    options: options.map((optionText, i) => ({ id: OPTION_IDS[i] ?? String(i), text: optionText })),
    correctOptionId: OPTION_IDS[correctIndex] ?? "a",
    points: 1,
    ...(explanation ? { explanation } : {}),
  };
}

function makeQuizBlock(title: string, description: string, question: FormQuizQuestion): DocumentFormBlock {
  return { type: "quiz", title, description, questions: [question] };
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: "bai-giang-ly-thuyet",
    name: "Bài giảng lý thuyết",
    tagline: "Mở đầu, phần bài giảng có công thức LaTeX và một câu hỏi kiểm tra nhanh.",
    icon: "📗",
    build: () => ({
      title: "Bài giảng mới",
      description: "Mô tả ngắn về nội dung bài giảng.",
      grade: "Lớp 8",
      status: "draft",
      documentType: "normal",
      selectedTopics: [],
      blocks: [
        { type: "text", content: "Mục tiêu bài học:\n- Nắm được khái niệm chính\n- Vận dụng công thức vào bài tập\n\nNhắc lại công thức quan trọng:\n$$(a + b)^2 = a^2 + 2ab + b^2$$" },
        { type: "lesson", title: "Khái niệm và công thức", description: "Phần trọng tâm học sinh cần ghi nhớ.", content: "Trình bày khái niệm ở đây. Ví dụ minh họa: với $x = 2$ ta có $x^2 + 1 = 5$.\nMột công thức khác thường gặp:\n$$\\sqrt{a^2} = |a|$$" },
        makeQuizBlock("Kiểm tra nhanh", "Trả lời câu hỏi dưới đây.", makeQuestion("Tính giá trị $(1 + 2)^2$.", ["9", "5", "4", "3"], 0, "Áp dụng hằng đẳng thức: $(1 + 2)^2 = 1 + 4 + 4 = 9$.")),
      ],
    }),
  },
  {
    id: "phieu-bai-tap-trac-nghiem",
    name: "Phiếu bài tập trắc nghiệm",
    tagline: "Phiếu luyện tập với 3 câu hỏi trắc nghiệm, mỗi câu 4 đáp án A–D.",
    icon: "📝",
    build: () => ({
      title: "Phiếu bài tập trắc nghiệm",
      description: "Học sinh chọn đáp án đúng cho từng câu hỏi.",
      grade: "Lớp 8",
      status: "draft",
      documentType: "test",
      selectedTopics: [],
      blocks: [
        { type: "text", content: "Hướng dẫn: đọc kỹ mỗi câu hỏi và chọn một đáp án đúng. Sau khi nộp bài, hệ thống sẽ chấm điểm tự động." },
        makeQuizBlock("Câu 1", "", makeQuestion("Câu hỏi mẫu: kết quả của $3 \\times 4$ là bao nhiêu?", ["12", "7", "34", "1"], 0, "$3 \\times 4 = 12$.")),
        makeQuizBlock("Câu 2", "", makeQuestion("", ["", "", "", ""], 0)),
        makeQuizBlock("Câu 3", "", makeQuestion("", ["", "", "", ""], 0)),
      ],
    }),
  },
  {
    id: "on-tap-chuong",
    name: "Ôn tập chương",
    tagline: "Tóm tắt kiến thức, bảng công thức cần nhớ và câu hỏi luyện tập.",
    icon: "🔄",
    build: () => ({
      title: "Ôn tập chương",
      description: "Tổng hợp kiến thức trọng tâm của chương.",
      grade: "Lớp 8",
      status: "draft",
      documentType: "normal",
      selectedTopics: [],
      blocks: [
        { type: "text", content: "Tóm tắt những nội dung chính của chương:\n- Ý chính thứ nhất\n- Ý chính thứ hai\n- Ý chính thứ ba" },
        { type: "lesson", title: "Công thức cần nhớ", description: "Danh sách công thức xuất hiện trong chương.", content: "$$a^2 - b^2 = (a - b)(a + b)$$\n$$a^3 + b^3 = (a + b)(a^2 - ab + b^2)$$\n$$x^2 + x + \\frac{1}{4} = \\left(x + \\frac{1}{2}\\right)^2$$" },
        makeQuizBlock("Luyện tập", "Cố gắng làm mà không nhìn công thức.", makeQuestion("Rút gọn $a^2 - 9$.", ["$(a - 3)(a + 3)$", "$(a - 3)^2$", "$(a + 3)^2$", "$a(a - 9)$"], 0, "Dùng hằng đẳng thức hiệu hai bình phương.")),
      ],
    }),
  },
];

