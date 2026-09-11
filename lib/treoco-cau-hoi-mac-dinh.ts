/**
 * ============================================================
 *  GAME TREO CỔ TRUNG THU — Pool câu hỏi dự phòng
 * ------------------------------------------------------------
 *  Dùng khi bảng question_bank chưa có câu trắc nghiệm nào
 *  ở mức độ tương ứng. Chỉ chạy phía server (không gửi xuống
 *  client cho tới khi được chọn).
 *  LaTeX theo QUY-TAC-LATEX.md: chỉ dùng $...$ và $$...$$.
 * ============================================================
 */

import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { QuestionImageItem } from "@/lib/document-types";

/** Câu hỏi trắc nghiệm của game (hỗ trợ hình ảnh minh họa và lời giải). */
export type TreocoCauHoi = {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  imageStoragePath?: string;
  imageUrl?: string;
  imageCaption?: string;
  explanationImageStoragePath?: string;
  explanationImageUrl?: string;
  explanationImages?: QuestionImageItem[];
};

export const TREOCO_CAU_HOI_MAC_DINH: TreocoCauHoi[] = [
  // ---------- Nhận biết (Dễ) ----------
  {
    id: "mac-dinh-nb-1",
    difficulty: "nhan_biet",
    text: "Tính $3^2 + 4^2$.",
    options: ["$25$", "$49$", "$12$", "$7$"],
    correctIndex: 0,
    explanation: "Ta có $3^2 + 4^2 = 9 + 16 = 25$.",
  },
  {
    id: "mac-dinh-nb-2",
    difficulty: "nhan_biet",
    text: "Nghiệm của phương trình $2x - 6 = 0$ là:",
    options: ["$x = -3$", "$x = 6$", "$x = 3$", "$x = 2$"],
    correctIndex: 2,
    explanation: "$2x - 6 = 0 \\Leftrightarrow 2x = 6 \\Leftrightarrow x = 3$.",
  },
  {
    id: "mac-dinh-nb-3",
    difficulty: "nhan_biet",
    text: "Trung bình cộng của các số $4$; $6$; $8$; $10$ là:",
    options: ["$6$", "$8$", "$9$", "$7$"],
    correctIndex: 3,
    explanation: "Trung bình cộng bằng $\\frac{4+6+8+10}{4} = \\frac{28}{4} = 7$.",
  },
  // ---------- Thông hiểu (Trung bình) ----------
  {
    id: "mac-dinh-th-1",
    difficulty: "thong_hieu",
    text: "Cho $f(x) = x^2 - 3x$. Tính $f(2)$.",
    options: ["$-2$", "$2$", "$-4$", "$10$"],
    correctIndex: 0,
    explanation: "Thay $x = 2$: $f(2) = 2^2 - 3 \\cdot 2 = 4 - 6 = -2$.",
  },
  {
    id: "mac-dinh-th-2",
    difficulty: "thong_hieu",
    text: "Kết quả của $\\frac{3}{4} + \\frac{1}{6}$ bằng:",
    options: ["$\\frac{4}{10}$", "$\\frac{5}{6}$", "$\\frac{2}{3}$", "$\\frac{11}{12}$"],
    correctIndex: 3,
    explanation: "Quy đồng mẫu số: $\\frac{3}{4} + \\frac{1}{6} = \\frac{9}{12} + \\frac{2}{12} = \\frac{11}{12}$.",
  },
  {
    id: "mac-dinh-th-3",
    difficulty: "thong_hieu",
    text: "Một chiếc đèn ông sao giá 45.000 đồng được giảm $20\\%$. Số tiền phải trả là:",
    options: ["27.000 đồng", "36.000 đồng", "40.000 đồng", "9.000 đồng"],
    correctIndex: 1,
    explanation: "Số tiền phải trả là $45\\,000 \\times 80\\% = 36\\,000$ đồng.",
  },
  // ---------- Vận dụng (Khó) ----------
  {
    id: "mac-dinh-vd-1",
    difficulty: "van_dung",
    text: "Tập nghiệm của bất phương trình $x^2 - 5x + 6 < 0$ là:",
    options: ["$(2; 3)$", "$(-\\infty; 2)$", "$(3; +\\infty)$", "$(-\\infty; 2) \\cup (3; +\\infty)$"],
    correctIndex: 0,
    explanation: "$x^2 - 5x + 6 < 0 \\Leftrightarrow (x-2)(x-3) < 0 \\Leftrightarrow 2 < x < 3$.",
  },
  {
    id: "mac-dinh-vd-2",
    difficulty: "van_dung",
    text: "Cho $\\log_2 x = 5$. Khi đó $x$ bằng:",
    options: ["$10$", "$32$", "$25$", "$64$"],
    correctIndex: 1,
    explanation: "Từ $\\log_2 x = 5$ suy ra $x = 2^5 = 32$.",
  },
  {
    id: "mac-dinh-vd-3",
    difficulty: "van_dung",
    text: "Giá trị lớn nhất của hàm số $y = -x^2 + 4x - 1$ là:",
    options: ["$3$", "$-1$", "$2$", "$4$"],
    correctIndex: 0,
    explanation: "Ta có $y = -(x-2)^2 + 3 \\le 3$. Vậy giá trị lớn nhất bằng $3$ khi $x = 2$.",
  },
];
