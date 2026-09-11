/**
 * Ngân hàng câu hỏi Toán học thực tế trích xuất trực tiếp từ các bộ đề thi ngân hàng chuẩn của hệ thống (NganHang_HamSo_De01..04.json).
 * - 100% là các câu hỏi thi THPT chuẩn (THPT Lê Thánh Tông HCM, ĐH KHTN HN, Sở GD&ĐT...).
 * - 100% ở 2 mức độ: Nhận biết (Dễ) và Thông hiểu (Trung bình).
 * - Không có câu Vận dụng khó, không có câu Tích phân/Nguyên hàm.
 */
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";

export const NGAN_HANG_CAU_HOI_GAME: TreocoCauHoi[] = [
  {
    "id": "bank-hs-1",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông HCM 2026) Tiệm cận ngang của đồ thị hàm số $y = \\frac{2x-3}{x+1}$ là đường thẳng có phương trình:",
    "options": [
      "$y = -1$.",
      "$x = -1$.",
      "$y = 2$.",
      "$x = 2$."
    ],
    "correctIndex": 2,
    "explanation": "Để tìm tiệm cận ngang của đồ thị hàm số $y = \\frac{2x-3}{x+1}$, ta tính giới hạn của hàm số khi $x \\to \\pm\\infty$.\n$$\\lim_{x \\to \\pm\\infty} y = \\lim_{x \\to \\pm\\infty} \\frac{2x-3}{x+1} = \\lim_{x \\to \\pm\\infty} \\frac{x\\left(2-\\frac{3}{x}\\right)}{x\\left(1+\\frac{1}{x}\\right)} = \\lim_{x \\to \\pm\\infty} \\frac{2-\\frac{3}{x}}{1+\\frac{1}{x}} = \\frac{2-0}{1+0} = 2.$$\nVậy tiệm cận ngang của đồ thị hàm số là đường thẳng $y = 2$."
  },
  {
    "id": "bank-hs-2",
    "difficulty": "nhan_biet",
    "text": "(THPT ĐH-KHTN HN 2026) Cho hàm số $f(x) = x^3 - 3x + 2$. Giá trị cực đại của hàm số đã cho bằng",
    "options": [
      "$-1$.",
      "$0$.",
      "$1$.",
      "$4$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = -1 \\end{bmatrix}$.\nBảng biến thiên:\nGiá trị cực đại của hàm số đã cho bằng $4$."
  },
  {
    "id": "bank-hs-3",
    "difficulty": "nhan_biet",
    "text": "(THPT ĐH-KHTN HN 2026) Cho hàm số $f(x)$ có $f(1)=3$ và $f'(1)=2$. Giá trị của $\\lim_{x\\to 1}\\frac{f^2(x)-9}{x-1}$ bằng",
    "options": [
      "$12$.",
      "$6$.",
      "$2$.",
      "$18$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $\\lim_{x\\to 1} \\frac{f^2(x)-9}{x-1} = \\lim_{x\\to 1}\\frac{[f(x)-3][f(x)+3]}{x-1} = \\lim_{x\\to 1}\\frac{[f(x)-f(1)]}{x-1} \\cdot \\lim_{x\\to 1}[f(x)+3] = f'(1) \\cdot [f(1)+3] = 2 \\cdot (3+3) = 12$."
  },
  {
    "id": "bank-hs-4",
    "difficulty": "nhan_biet",
    "text": "(THPT ĐH-KHTN HN 2026) Tiệm cận xiên của đồ thị hàm số $y = \\frac{2x^2+x}{x+1}$ là:",
    "options": [
      "$y = 2x+1$.",
      "$y = 2x-3$.",
      "$y = 2x$.",
      "$y = 2x-1$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có: $y = \\frac{2x^2+x}{x+1} = 2x-1 + \\frac{1}{x+1}$.\nVì $\\lim_{x \\to \\pm\\infty} \\left[y - (2x-1)\\right] = \\lim_{x \\to \\pm\\infty} \\frac{1}{x+1} = 0$ nên tiệm cận xiên của đồ thị hàm số là $y = 2x-1$."
  },
  {
    "id": "bank-hs-5",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Cho hàm số $y = \\frac{x+2026}{x-2025}$ có đồ thị $(C)$. Đồ thị $(C)$ có đường tiệm cận đứng là",
    "options": [
      "$x = 2025$.",
      "$x = -2024$.",
      "$x = 1$.",
      "$x = 6$."
    ],
    "correctIndex": 0,
    "explanation": "Tập xác định: $D = \\mathbb{R} \\setminus \\{2025\\}$.\nVì $\\lim_{x \\to 2025^+} \\frac{x+2026}{x-2025} = +\\infty$ nên đồ thị $(C)$ có đường tiệm cận đứng là $x = 2025$."
  },
  {
    "id": "bank-hs-6",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Giá trị lớn nhất của hàm số $y = x^3 - 3x + 1$ trên đoạn $[-2;2]$ là",
    "options": [
      "$2$.",
      "$-1$.",
      "$3$.",
      "$-2$."
    ],
    "correctIndex": 2,
    "explanation": "Tập xác định: $D = \\mathbb{R}$.\nTa có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1$ hoặc $x = -1$.\nXét trên $[-2;2]$: $y(-2) = -1$, $y(2) = 3$, $y(-1) = 3$, $y(1) = -1$.\nVậy giá trị lớn nhất của hàm số trên $[-2;2]$ là $3$."
  },
  {
    "id": "bank-hs-7",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Điểm cực đại của hàm số $y=f(x)$ là",
    "options": [
      "$y = 2$.",
      "$x = 2$.",
      "$x = 3$.",
      "$y = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên, điểm cực đại của hàm số là $x = 3$."
  },
  {
    "id": "bank-hs-8",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Hàm số nào sau đây có đồ thị là đường cong như hình vẽ?",
    "options": [
      "$y = x - \\frac{1}{x-1}$.",
      "$y = -x + \\frac{1}{x-1}$.",
      "$y = -x - \\frac{1}{x-1}$.",
      "$y = x + \\frac{1}{x-1}$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số đi qua điểm $(0;-1)$ (Loại A, C) và điểm $(2;3)$ (Loại B). Do đó ta chọn D."
  },
  {
    "id": "bank-hs-9",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Đồ thị của hàm số nào dưới đây có dạng như đường cong trong hình vẽ?",
    "options": [
      "$y = \\frac{2x-1}{2x+1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{2x+1}{2x-1}$.",
      "$y = \\frac{2x+1}{x-1}$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị có tiệm cận đứng là $x = 1$, tiệm cận ngang là $y = 1$ nên đồ thị trên là của hàm số $y = \\frac{x+1}{x-1}$."
  },
  {
    "id": "bank-hs-10",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đồ thị là đường cong trong hình dưới đây. Hàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;1)$.",
      "$(-1;1)$.",
      "$(-\\infty;1)$.",
      "$(0;+\\infty)$."
    ],
    "correctIndex": 0,
    "explanation": "Quan sát đồ thị, nhận thấy hàm số đã cho đồng biến trên khoảng $(0;1)$."
  },
  {
    "id": "bank-hs-11",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Số điểm cực tiểu của đồ thị hàm số $y = \\frac{1}{5}x^5 - \\frac{3}{4}x^4 + \\frac{2}{3}x^3 + \\frac{1}{2}$ là",
    "options": [
      "$0$.",
      "$3$.",
      "$2$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "TXĐ: $D = \\mathbb{R}$.\nTa có $y' = x^4 - 3x^3 + 2x^2 = x^2(x^2 - 3x + 2)$.\n$y' = 0 \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2 \\end{bmatrix}$.\nBảng biến thiên:\nTừ bảng biến thiên, ta thấy đồ thị hàm số có $1$ điểm cực tiểu."
  },
  {
    "id": "bank-hs-12",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Cho hàm số $f(x)$ xác định trên $\\mathbb{R}$ thỏa mãn đồng thời hai điều kiện: $f(x)$ là hàm số lẻ và $f(x)=x^2$ với mọi $x \\le 0$. Giá trị của $f(2)$ bằng",
    "options": [
      "$-4$.",
      "$-2$.",
      "$0$.",
      "$4$."
    ],
    "correctIndex": 0,
    "explanation": "Do $f(x)$ là hàm số lẻ nên $f(2) = -f(-2)$.\nVì $-2 \\le 0$ nên $f(-2) = (-2)^2 = 4 \\Rightarrow f(2) = -4$."
  },
  {
    "id": "bank-hs-13",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Giá trị cực tiểu của hàm số $y = 4x^3 - 6x^2 + 11$ bằng",
    "options": [
      "$0$.",
      "$1$.",
      "$9$.",
      "$11$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $y' = 12x^2 - 12x = 12x(x-1)$.\n$y' = 0 \\Leftrightarrow x = 0$ hoặc $x = 1$.\nĐạo hàm đổi dấu từ âm sang dương tại $x = 1$ nên hàm số đạt cực tiểu tại $x = 1$.\nGiá trị cực tiểu là $y(1) = 4(1)^3 - 6(1)^2 + 11 = 9$."
  },
  {
    "id": "bank-hs-14",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Hàm số $y = -2x^3 + 9x^2 + 24x - 114$ đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(-1;4)$.",
      "$(-4;-1)$.",
      "$(-\\infty;-1)$.",
      "$(4;+\\infty)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = -6x^2 + 18x + 24$.\n$y' > 0 \\Leftrightarrow -6x^2 + 18x + 24 > 0 \\Leftrightarrow -1 < x < 4$.\nVậy hàm số đồng biến trên khoảng $(-1;4)$."
  },
  {
    "id": "bank-hs-15",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Cho hàm số $f(x)$ liên tục trên $[-1;5]$ và có đồ thị như hình vẽ bên (các điểm cực trị của đồ thị thể hiện rõ trên hình). Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và nhỏ nhất của hàm số đã cho trên $[-1;5]$. Giá trị của $M-m$ bằng",
    "options": [
      "$1$.",
      "$4$.",
      "$5$.",
      "$6$."
    ],
    "correctIndex": 2,
    "explanation": "Trên $[-1;5]$, ta có $M = \\max_{[-1;5]} f(x) = 3$ và $m = \\min_{[-1;5]} f(x) = -2$.\nGiá trị của $M - m = 3 - (-2) = 5$."
  },
  {
    "id": "bank-hs-16",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Tiệm cận ngang của đồ thị hàm số $y = \\frac{2x-4}{x+2}$ là đường thẳng có phương trình",
    "options": [
      "$y = 2$.",
      "$y = -2$.",
      "$x = 2$.",
      "$x = -2$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} \\frac{2x-4}{x+2} = 2$ nên đường thẳng $y = 2$ là tiệm cận ngang của đồ thị hàm số."
  },
  {
    "id": "bank-hs-17",
    "difficulty": "thong_hieu",
    "text": "(Sở Bắc Ninh 2026) Đường tiệm cận ngang của đồ thị hàm số $y = \\frac{3x-1}{1-x}$ có phương trình là",
    "options": [
      "$x = -3$.",
      "$y = -3$.",
      "$x = 3$.",
      "$y = 3$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} \\frac{3x-1}{1-x} = -3$ nên $y = -3$ là đường tiệm cận ngang của đồ thị hàm số."
  },
  {
    "id": "bank-hs-18",
    "difficulty": "thong_hieu",
    "text": "(Sở Bắc Ninh 2026) Cho hàm số $y = f(x)$ liên tục và có đồ thị trên đoạn $[-4;3]$ như hình vẽ. Giá trị nhỏ nhất của hàm số $y = f(x)$ trên đoạn $[0;3]$ là",
    "options": [
      "$-4$.",
      "$-3$.",
      "$1$.",
      "$-2$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị trên đoạn $[0;3]$, điểm thấp nhất có tung độ bằng $-2$. Vậy $\\min_{[0;3]} f(x) = -2$."
  },
  {
    "id": "bank-hs-19",
    "difficulty": "thong_hieu",
    "text": "(Sở Bắc Ninh 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như hình vẽ sauSố điểm cực tiểu của đồ thị hàm số $y = f(x)$ là",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng xét dấu đạo hàm, đạo hàm đổi dấu từ âm sang dương đúng 1 lần (tại $x = 0$) nên hàm số có 1 điểm cực tiểu."
  },
  {
    "id": "bank-hs-20",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Cho hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) có đồ thị như hình vẽHàm số nghịch biến trên khoảng nào trong các khoảng dưới đây?",
    "options": [
      "$(-\\infty;-1)$.",
      "$(-1;1)$.",
      "$(1;+\\infty)$.",
      "$(-4;0)$."
    ],
    "correctIndex": 1,
    "explanation": "Quan sát đồ thị, ta thấy trên khoảng $(-1;1)$ đường cong đồ thị đi xuống từ trái sang phải, do đó hàm số nghịch biến trên khoảng $(-1;1)$."
  },
  {
    "id": "bank-hs-21",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Điểm cực tiểu của hàm số $y = \\frac{1}{3}x^3 - 2x^2 + 3x - 1$ là",
    "options": [
      "$x = \\frac{1}{3}$.",
      "$x = 3$.",
      "$x = -1$.",
      "$x = 1$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $y' = x^2 - 4x + 3$.\nCho $y' = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = 3 \\end{bmatrix}$.\nBảng biến thiên:\nĐiểm cực tiểu của hàm số là $x = 3$."
  },
  {
    "id": "bank-hs-22",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Đường thẳng nào dưới đây là đường tiệm cận xiên của đồ thị hàm số $y = 2x - 5 + \\frac{10}{x+3}$?",
    "options": [
      "$y = 2x-5$.",
      "$y = x+3$.",
      "$y = 2x$.",
      "$y = 2x+3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} [y - (2x-5)] = \\lim_{x \\to \\pm\\infty} \\frac{10}{x+3} = 0$ nên đường tiệm cận xiên của đồ thị hàm số là $y = 2x-5$."
  },
  {
    "id": "bank-hs-23",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Cho hàm số $y = \\frac{3x+7}{x+1}$. Giá trị lớn nhất của hàm số đã cho trên đoạn $[0;3]$ bằng",
    "options": [
      "$3$.",
      "$7$.",
      "$4$.",
      "$0$."
    ],
    "correctIndex": 1,
    "explanation": "Tập xác định: $D = \\mathbb{R}\\setminus\\{-1\\}$.\nTa có $y' = \\frac{3\\cdot 1 - 7\\cdot 1}{(x+1)^2} = \\frac{-4}{(x+1)^2} < 0, \\forall x \\ne -1$.\nDo đó hàm số nghịch biến trên $[0;3]$, suy ra $\\max_{[0;3]} y = y(0) = 7$."
  },
  {
    "id": "bank-hs-24",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Đường cong trong hình vẽ bên là đồ thị hàm số nào trong các hàm số được cho bởi các phương án $A, B, C, D$ dưới đây?",
    "options": [
      "$y = \\frac{2x-1}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{2x-2}{2x+1}$.",
      "$y = \\frac{-x+1}{x+1}$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị hàm số có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 1$. Do đó đồ thị là của hàm số $y = \\frac{x+1}{x-1}$."
  },
  {
    "id": "bank-hs-25",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Cho hàm số $y=f(x)$ xác định trên $\\mathbb{R}$, có bảng biến thiên như hình vẽ dưới đây. Hàm số $y=f(x)$ nghịch biến trên khoảng nào trong các khoảng sau?",
    "options": [
      "$(0;1)$.",
      "$(-\\infty;22)$.",
      "$(0;+\\infty)$.",
      "$(2;+\\infty)$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số nghịch biến trên $(-\\infty;0)$ và $(1;+\\infty)$. Vì $(2;+\\infty) \\subset (1;+\\infty)$ nên hàm số nghịch biến trên khoảng $(2;+\\infty)$."
  },
  {
    "id": "bank-hs-26",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Cho hàm số $f(x)$ có đạo hàm $f'(x) = x^2(x-1)(x-2)^3$, $\\forall x \\in \\mathbb{R}$. Hàm số $f(x)$ có bao nhiêu điểm cực đại?",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x^2 = 0 \\\\ x - 1 = 0 \\\\ (x-2)^3 = 0 \\end{bmatrix} \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2 \\end{bmatrix}$.\nBảng biến thiên:\nDựa vào bảng biến thiên suy ra hàm số $f(x)$ có $1$ điểm cực đại."
  },
  {
    "id": "bank-hs-27",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Đồ thị có hình vẽ dưới đây là của hàm số nào?",
    "options": [
      "$y = \\frac{-x+2}{x+1}$.",
      "$y = \\frac{-x}{x+1}$.",
      "$y = \\frac{-x+1}{x+1}$.",
      "$y = \\frac{-2x+1}{2x+1}$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị:\n- Tiệm cận đứng $x = -1$ (Loại D vì có TCĐ $x = -\\frac{1}{2}$).\n- Tiệm cận ngang $y = -1$.\n- Đồ thị cắt trục tung tại $(0;1)$. Thay $x = 0$ vào đáp án C được $y = 1$ (Thỏa mãn)."
  },
  {
    "id": "bank-hs-28",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có đồ thị như hình bên. Hàm số đã cho đạt giá trị nhỏ nhất trên đoạn $[-1;1]$ tại",
    "options": [
      "$x = -1$.",
      "$x = 0$.",
      "$x = -4$.",
      "$x = 1$."
    ],
    "correctIndex": 0,
    "explanation": "Từ đồ thị hàm số ta thấy giá trị nhỏ nhất của hàm số trên đoạn $[-1;1]$ là $-4$ tại $x = -1$."
  },
  {
    "id": "bank-hs-29",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới.Đồ thị hàm số $y=f(x)$ có tổng số bao nhiêu đường tiệm cận đứng và ngang?",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Từ bảng biến thiên ta thấy:\n- $\\lim_{x \\to -\\infty} y = -1 \\Rightarrow y = -1$ là tiệm cận ngang.\n- $\\lim_{x \\to 1^-} y = +\\infty \\Rightarrow x = 1$ là tiệm cận đứng.\nVậy đồ thị hàm số có tổng cộng 2 đường tiệm cận đứng và ngang."
  },
  {
    "id": "bank-hs-30",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số $f(x)$ đạt cực tiểu tại điểm",
    "options": [
      "$y = 0$.",
      "$x = -4$.",
      "$y = -4$.",
      "$x = 3$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số $f(x)$ đạt cực tiểu tại điểm $x = 3$."
  },
  {
    "id": "bank-hs-31",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Cho hàm số $f(x)$ có bảng xét dấu của đạo hàm như sau:Hàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-3;0)$.",
      "$(0;+\\infty)$.",
      "$(0;2)$.",
      "$(-\\infty;-3)$."
    ],
    "correctIndex": 0,
    "explanation": "Do $f'(x) < 0, \\forall x \\in (-3;0)$ nên hàm số nghịch biến trên khoảng $(-3;0)$."
  },
  {
    "id": "bank-hs-32",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Bảng biến thiên sau đây là của hàm số nào?",
    "options": [
      "$y = \\frac{2x+3}{x+1}$.",
      "$y = \\frac{2x-1}{x-1}$.",
      "$y = \\frac{2x-1}{x+1}$.",
      "$y = \\frac{x+1}{2x-1}$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên ta có: Đồ thị hàm số có tiệm cận đứng $x = -1$ và tiệm cận ngang $y = 2$ (loại B và D).\nXét phương án A: $y' = \\frac{-1}{(x+1)^2} < 0, \\forall x \\ne -1$ (loại vì trên BBT $y' > 0$).\nXét phương án C: $y' = \\frac{3}{(x+1)^2} > 0, \\forall x \\ne -1$ (chọn)."
  },
  {
    "id": "bank-hs-33",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Đường cong trong hình sau là của hàm số nào dưới đây?",
    "options": [
      "$y = -x^3 - 3x^2 - 2$.",
      "$y = x^3 - 3x^2 - 2$.",
      "$y = 2x^3 + 6x^2 - 2$.",
      "$y = x^3 + 3x^2 - 2$."
    ],
    "correctIndex": 3,
    "explanation": "Vì đường cong trong hình bên có dạng hàm bậc ba với hệ số $a > 0$, đi qua điểm $(1;2)$ và có hai điểm cực trị $(-2;2)$, $(0;-2)$ nên đó là đồ thị của hàm số $y = x^3 + 3x^2 - 2$."
  },
  {
    "id": "bank-hs-34",
    "difficulty": "thong_hieu",
    "text": "(Cụm trường Hà Tĩnh 2026) Tìm giá trị lớn nhất của hàm số $y = \\frac{2x+3}{x-1}$ trên đoạn $[2;4]$.",
    "options": [
      "$8$.",
      "$\\frac{9}{2}$.",
      "$7$.",
      "$\\frac{11}{3}$."
    ],
    "correctIndex": 2,
    "explanation": "Hàm số xác định và liên tục trên $[2;4]$.\nTa có $y' = \\frac{-5}{(x-1)^2} < 0, \\forall x \\in [2;4]$.\nDo đó hàm số nghịch biến trên $[2;4]$, suy ra $\\max_{[2;4]} y = y(2) = 7$."
  },
  {
    "id": "bank-hs-35",
    "difficulty": "thong_hieu",
    "text": "(Cụm trường Hà Tĩnh 2026) Giá trị lớn nhất của hàm số $y = 3\\sin 2x - 1$ là",
    "options": [
      "$2$.",
      "$5$.",
      "$4$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $-1 \\le \\sin 2x \\le 1 \\Leftrightarrow -3 \\le 3\\sin 2x \\le 3 \\Leftrightarrow -4 \\le 3\\sin 2x - 1 \\le 2$.\nVậy giá trị lớn nhất của hàm số là $y_{\\max} = 2$."
  },
  {
    "id": "bank-hs-36",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Hà Tĩnh 2026) Hàm số $y = f(x)$ có đồ thị như hình dưới đây. Đồ thị hàm số đã cho có đường tiệm cận ngang là:",
    "options": [
      "$x = 2$.",
      "$x = 1$.",
      "$y = 1$.",
      "$y = 2$."
    ],
    "correctIndex": 2,
    "explanation": "Tiệm cận ngang là đường thẳng mà đồ thị hàm số tiến sát về đó khi $x \\to \\pm\\infty$. Nhìn trên hình vẽ ta thấy nhánh đồ thị nằm ngang tiến sát về đường thẳng cắt trục tung tại giá trị $1$. Do đó phương trình tiệm cận ngang là $y = 1$."
  },
  {
    "id": "bank-hs-37",
    "difficulty": "nhan_biet",
    "text": "(Cụm 5 Sở Ninh Bình 2026) Hình vẽ sau đây là đồ thị của một trong bốn hàm số cho ở các đáp án $A, B, C, D$. Hỏi đó là hàm số nào?",
    "options": [
      "$y = x^3+2x+1$.",
      "$y = x^3-3x$.",
      "$y = -x^3+3x$.",
      "$y = x^3+3x^2$."
    ],
    "correctIndex": 1,
    "explanation": "Từ đồ thị ta có $a > 0$ nên loại đáp án C.\nĐồ thị đi qua gốc tọa độ $O(0;0)$ nên hệ số tự do $d = 0$ (loại đáp án A).\nĐồ thị có hai điểm cực trị nên phương trình $y' = 0$ có 2 nghiệm phân biệt (loại đáp án D).\nVậy chọn B ($y = x^3 - 3x$)."
  },
  {
    "id": "bank-hs-38",
    "difficulty": "nhan_biet",
    "text": "(Cụm 5 Sở Ninh Bình 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = (2x-1)(x+1)$. Hàm số $y=f(x)$ có giá trị lớn nhất trên $[-2;0]$ bằng",
    "options": [
      "$f\\left(-\\frac{1}{2}\\right)$.",
      "$f(-1)$.",
      "$f(0)$.",
      "$f(-2)$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $f'(x) = (2x-1)(x+1) = 0 \\Leftrightarrow \\begin{bmatrix} x = \\frac{1}{2} \\\\ x = -1 \\end{bmatrix}$.\nBảng biến thiên:\nTừ bảng biến thiên ta thấy: $\\max_{[-2;0]} f(x) = f(-1)$."
  },
  {
    "id": "bank-hs-39",
    "difficulty": "nhan_biet",
    "text": "(Cụm 5 Sở Ninh Bình 2026) Số đường tiệm cận của đồ thị hàm số $y = 2x+3+\\frac{1}{x-1}$ là",
    "options": [
      "$0$.",
      "$3$.",
      "$1$.",
      "$2$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} [y - (2x+3)] = \\lim_{x \\to \\pm\\infty} \\frac{1}{x-1} = 0 \\Rightarrow y = 2x+3$ là đường tiệm cận xiên của đồ thị hàm số.\n$\\lim_{x \\to 1^+} y = \\lim_{x \\to 1^+} \\left(2x+3+\\frac{1}{x-1}\\right) = +\\infty \\Rightarrow x = 1$ là đường tiệm cận đứng của đồ thị hàm số.\nVậy đồ thị hàm số có 2 đường tiệm cận."
  },
  {
    "id": "bank-hs-40",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Cho hàm số $y = f(x)$ có đạo hàm trên $\\mathbb{R}$. Biết hàm số $y = f'(x)$ có đồ thị như hình vẽ. Phát biểu nào sau đây là đúng?",
    "options": [
      "Hàm số $y = f(x)$ đạt cực đại tại $x_1 = -2$ và đạt cực tiểu tại $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực tiểu tại hai điểm $x_1 = -2$ và $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực đại tại hai điểm $x_1 = -2$ và $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực tiểu tại $x_1 = -2$ và đạt cực đại tại $x_2 = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị hàm số $y = f'(x)$ ta có bảng dấu của $f'(x)$:\nTừ bảng dấu của $f'(x) \\Rightarrow$ Hàm số $y = f(x)$ đạt cực tiểu tại điểm $x_1 = -2$ và đạt cực đại tại $x_2 = 1$."
  },
  {
    "id": "bank-hs-41",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Tiệm cận xiên của đồ thị hàm số $y = \\frac{x^2+x+2}{x+2}$ là",
    "options": [
      "$y = x-1$.",
      "$y = x+1$.",
      "$y = x-2$.",
      "$y = x+2$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y = \\frac{x^2+x+2}{x+2} = x-1+\\frac{4}{x+2}$.\nVì $\\lim_{x \\to \\pm\\infty} [y - (x-1)] = \\lim_{x \\to \\pm\\infty} \\frac{4}{x+2} = 0$ nên phương trình tiệm cận xiên của đồ thị hàm số đã cho là $y = x-1$."
  },
  {
    "id": "bank-hs-42",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Cho hàm số $y = \\frac{3x-5}{x+1}$. Tâm đối xứng của đồ thị hàm số là điểm nào?",
    "options": [
      "$M(-1;3)$.",
      "$N(3;-1)$.",
      "$P(-1;5)$.",
      "$Q(-5;1)$."
    ],
    "correctIndex": 0,
    "explanation": "Tiệm cận đứng của đồ thị hàm số là đường thẳng $x = -1$.\nTiệm cận ngang của đồ thị hàm số là đường thẳng $y = 3$.\nGiao điểm của hai đường tiệm cận là $M(-1;3)$, do đó tâm đối xứng của đồ thị là $M(-1;3)$."
  },
  {
    "id": "bank-hs-43",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Bạn Long định gấp một cái hộp có dạng hình lăng trụ tứ giác đều với tổng diện tích tất cả các mặt là $96\\text{ cm}^2$. Thể tích cái hộp mà bạn Long định gấp lớn nhất bằng bao nhiêu?",
    "options": [
      "$32\\text{ cm}^3$.",
      "$64\\text{ cm}^3$.",
      "$108\\text{ cm}^3$.",
      "$96\\text{ cm}^3$."
    ],
    "correctIndex": 1,
    "explanation": "Ta gọi cạnh đáy của cái hộp có dạng hình lăng trụ tứ giác đều là $a > 0$ và chiều cao là $x > 0$ (đơn vị: cm).\nKhi đó $2a^2 + 4ax = 96 \\Rightarrow x = \\frac{48-a^2}{2a}$.\nMà $V = x \\cdot a^2 = a^2 \\cdot \\frac{48-a^2}{2a} = \\frac{48a-a^3}{2}$ trên $(0;\\sqrt{48})$.\nTa có $V' = \\frac{1}{2}(48 - 3a^2) = 0 \\Rightarrow a = 4$.\nBảng biến thiên của hàm số $V(a) = \\frac{48a-a^3}{2}$:\nDựa vào bảng biến thiên ta thấy thể tích cái hộp lớn nhất bằng $V(4) = 64\\text{ cm}^3$."
  },
  {
    "id": "bank-hs-44",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Giá trị nhỏ nhất của hàm số $y = x^4-2x^2+3$ trên đoạn $[0;2]$ bằng",
    "options": [
      "$2$.",
      "$-2$.",
      "$4$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = 4x^3-4x = 4x(x^2-1) = 0 \\Leftrightarrow x = 0; x = 1; x = -1$.\nTrên đoạn $[0;2]$, ta xét các giá trị $x = 0$ và $x = 1$.\n$y(0) = 3; y(1) = 1-2+3 = 2; y(2) = 2^4 - 2\\cdot 2^2 + 3 = 11$.\nSo sánh các kết quả, giá trị nhỏ nhất của hàm số trên đoạn đã cho là $2$."
  },
  {
    "id": "bank-hs-45",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sau:Hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(1;+\\infty)$.",
      "$(-2;1)$.",
      "$(-2;3)$.",
      "$(-\\infty;-2)$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta thấy $f'(x) > 0$ với mọi $x \\in (-2;1)$ nên hàm số $y = f(x)$ đồng biến trên khoảng $(-2;1)$."
  },
  {
    "id": "bank-hs-46",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ xác định trên $\\mathbb{R}\\setminus\\{-1\\}$, liên tục trên mỗi khoảng xác định và có bảng biến thiên như hình:Hỏi đồ thị hàm số có bao nhiêu đường tiệm cận ngang?",
    "options": [
      "$0$.",
      "$2$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta thấy $\\lim_{x \\to -\\infty} y = 2$ và $\\lim_{x \\to +\\infty} y = -1$.\nVậy đồ thị hàm số có 2 đường tiệm cận ngang là $y = 2$ và $y = -1$."
  },
  {
    "id": "bank-hs-47",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Hàm số nào dưới đây có đồ thị là đường cong như hình vẽ",
    "options": [
      "$y = -x^4+3x+1$.",
      "$y = x^3-3x+1$.",
      "$y = -x^2+3x+1$.",
      "$y = -x^3+3x+1$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số đã cho là đồ thị của hàm số bậc ba, có hai điểm cực trị và có nhánh phải đi xuống khi $x \\to +\\infty$. Do đó hệ số $a < 0$ (loại B, C).\nKiểm tra hàm số $y = -x^3 + 3x + 1$:\nTập xác định: $D = \\mathbb{R}$. $y' = -3x^2 + 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên:\nGiá trị cực đại $y_{\\text{CĐ}} = y(1) = 3$, cực tiểu $y_{\\text{CT}} = y(-1) = -1$.\nKhi $x = 0 \\Rightarrow y = 1$ (cắt trục tung tại $(0;1)$). Đồ thị phù hợp với hình vẽ đã cho."
  },
  {
    "id": "bank-hs-48",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ có bảng biến thiên sau:Giá trị cực đại của hàm số $y = f(x)$ là:",
    "options": [
      "$1$.",
      "$5$.",
      "$0$.",
      "$-3$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát bảng biến thiên: Tại $x = 1$, $y'$ đổi dấu từ dương sang âm, nên hàm số đạt cực đại tại $x = 1$ và giá trị cực đại là $y(1) = 0$."
  },
  {
    "id": "bank-hs-49",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = \\frac{2x-2}{x+2}$ có tập xác định là $D$. Hàm số đã cho có đạo hàm trên $D$ là",
    "options": [
      "$y' = -\\frac{2}{(x+2)^2}$.",
      "$y' = \\frac{6}{(x+2)^2}$.",
      "$y' = \\frac{2}{(x+2)^2}$.",
      "$y' = -\\frac{6}{(x+2)^2}$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào công thức tính đạo hàm của hàm số $y = \\frac{ax+b}{cx+d}$, ta có $y' = \\frac{2\\cdot 2 - 1\\cdot(-2)}{(x+2)^2} = \\frac{6}{(x+2)^2}$."
  },
  {
    "id": "bank-hs-50",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽĐồ thị hàm số đã cho có đường tiệm cận ngang là",
    "options": [
      "$x = 1$.",
      "$y = 2$.",
      "$y = 1$.",
      "$y = 3$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị hàm số, $y = 2$ là đường tiệm cận ngang của đồ thị hàm số."
  },
  {
    "id": "bank-hs-51",
    "difficulty": "thong_hieu",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽĐiểm cực đại của hàm số đã cho",
    "options": [
      "$x = 1$.",
      "$x = 2$.",
      "$x = 0$.",
      "$x = -2$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị, điểm cực đại của hàm số đã cho là: $x = 0$."
  },
  {
    "id": "bank-hs-52",
    "difficulty": "thong_hieu",
    "text": "(Sở Hưng Yên 2026) Trong các hàm số cho dưới đây, hàm số nào đồng biến trên $(-\\infty;+\\infty)$?",
    "options": [
      "$y = -x^3+3x+1$.",
      "$y = 2x^3+x-5$.",
      "$y = \\sqrt{x}$.",
      "$y = \\frac{2x-1}{x+1}$."
    ],
    "correctIndex": 1,
    "explanation": "Xét hàm số $y = 2x^3+x-5 \\Rightarrow y' = 6x^2+1 > 0, \\forall x \\in \\mathbb{R}$. Do đó hàm số luôn đồng biến trên $\\mathbb{R}$."
  },
  {
    "id": "bank-hs-53",
    "difficulty": "thong_hieu",
    "text": "(THPT Thọ Xuân 5-Thanh Hóa 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[1;5]$ và có đồ thị như hình vẽ sau.Trên đoạn $[1;5]$, hàm số đã cho đạt giá trị lớn nhất tại điểm.",
    "options": [
      "$x = 1$.",
      "$x = 4$.",
      "$x = 5$.",
      "$x = 2$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị trên đoạn $[1;5]$, hàm số đạt giá trị lớn nhất bằng $4$ tại điểm $x = 2$."
  },
  {
    "id": "bank-hs-54",
    "difficulty": "thong_hieu",
    "text": "(THPT Thọ Xuân 5-Thanh Hóa 2026) Cho hàm số bậc ba $y = f(x)$ có đồ thị đạo hàm $y = f'(x)$ như hình sauHàm số đã cho nghịch biến trên khoảng",
    "options": [
      "$(-1;0)$.",
      "$(2;3)$.",
      "$(1;2)$.",
      "$(3;4)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị ta có $f'(x) < 0, \\forall x \\in (0;2)$, suy ra $f'(x) < 0, \\forall x \\in (1;2)$ nên hàm số $y = f(x)$ nghịch biến trên khoảng $(1;2)$."
  },
  {
    "id": "bank-hs-55",
    "difficulty": "thong_hieu",
    "text": "(THPT Thọ Xuân 5-Thanh Hóa 2026) Giá trị lớn nhất của hàm số $y = x^3 - 3x$ trên đoạn $[0;3]$ bằng",
    "options": [
      "$0$.",
      "$2$.",
      "$18$.",
      "$-2$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $y = x^3 - 3x \\Rightarrow y' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1$ (do $x = -1 \\notin [0;3]$).\n$y(0) = 0; y(1) = -2; y(3) = 18$.\nVậy giá trị lớn nhất của hàm số $y = x^3 - 3x$ trên đoạn $[0;3]$ bằng $18$."
  },
  {
    "id": "bank-hs-56",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - LHT - HCM 2026) Trong hệ trục tọa độ $Oxy$, tiệm cận ngang của đồ thị hàm số $y = \\frac{2}{x-2}$ có phương trình là:",
    "options": [
      "$y = 2$.",
      "$y = -1$.",
      "$y = 0$.",
      "$x = 2$."
    ],
    "correctIndex": 2,
    "explanation": "Hàm số đã cho là $y = \\frac{2}{x-2}$.\nĐể tìm tiệm cận ngang, ta tính giới hạn của hàm số khi $x \\to \\pm\\infty$:\n$\\lim_{x \\to \\pm\\infty} y = \\lim_{x \\to \\pm\\infty} \\frac{2}{x-2} = 0$.\nVậy tiệm cận ngang của đồ thị hàm số là đường thẳng $y = 0$."
  },
  {
    "id": "bank-hs-57",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - LHT - HCM 2026) Cho hàm số $y = f(x)$ có một phần đồ thị như hình bên.Khoảng đồng biến của hàm số $y = f(x)$ là:",
    "options": [
      "$(2;4)$.",
      "$(0;3)$.",
      "$(-1;0)$.",
      "$(1;3)$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị:\n- Đồ thị hàm số đi xuống (nghịch biến) khi $x < 1$.\n- Đồ thị hàm số đi lên (đồng biến) trong khoảng từ $x = 1$ đến $x = 3$.\n- Đồ thị hàm số đi xuống (nghịch biến) khi $x > 3$.\nVậy hàm số đồng biến trên khoảng $(1;3)$."
  },
  {
    "id": "bank-hs-58",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - LHT - HCM 2026) Đường cong ở hình bên là đồ thị của hàm số nào sau đây?",
    "options": [
      "$y = \\frac{-x^2-2x-2}{x+1}$.",
      "$y = \\frac{x^2+2x+2}{x-1}$.",
      "$y = \\frac{-x^2-2x}{x+1}$.",
      "$y = \\frac{x^2-2x+2}{x+1}$."
    ],
    "correctIndex": 0,
    "explanation": "Đồ thị hàm số đi qua điểm $(0;-2)$ (Loại C, D).\nĐồ thị hàm số có đường tiệm cận đứng $x = -1$ (Loại B).\nDo đó chọn đáp án A."
  },
  {
    "id": "bank-hs-59",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Đồ thị hàm số $y = \\frac{2x-3}{x-1}$ có đường tiệm cận ngang là",
    "options": [
      "$x = -1$.",
      "$y = -2$.",
      "$x = 1$.",
      "$y = 2$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} \\frac{2x-3}{x-1} = 2$ nên đường tiệm cận ngang là $y = 2$."
  },
  {
    "id": "bank-hs-60",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Cho hàm số $y = f(x) = ax^4+bx^3+cx^2+dx+e$ có đạo hàm $f'(x)$ và đồ thị hàm số $y = f'(x)$ cắt trục hoành tại các điểm có hoành độ $-1;0;2$ như hình bên. Hỏi hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(-\\infty;-1)$.",
      "$(1;+\\infty)$.",
      "$(0;2)$.",
      "$(-1;0)$."
    ],
    "correctIndex": 3,
    "explanation": "Hàm số $y = f(x)$ đồng biến khi và chỉ khi đạo hàm $f'(x) > 0$.\nTừ đồ thị, ta thấy rằng đồ thị của $y = f'(x)$ cắt trục hoành tại các điểm có hoành độ $x = -1, x = 0, x = 2$.\nTrên khoảng $(-1;0)$: Đồ thị $f'(x)$ nằm phía trên trục hoành, tức là $f'(x) > 0$. Do đó, $f(x)$ đồng biến trên khoảng này.\nVậy, hàm số $y = f(x)$ đồng biến trên các khoảng $(-1;0)$ và $(2;+\\infty)$."
  },
  {
    "id": "bank-hs-61",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Tính đạo hàm của hàm số $y = e^x + \\log x$.",
    "options": [
      "$y' = e^x - \\frac{1}{x\\ln 10}$.",
      "$y' = e^x + \\frac{1}{x}$.",
      "$y' = e^x + \\frac{1}{x\\ln 10}$.",
      "$y' = e^x - \\frac{1}{x}$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có hàm số $y = e^x + \\log x$. Suy ra $y' = (e^x)' + (\\log x)' = e^x + \\frac{1}{x\\ln 10}$."
  },
  {
    "id": "bank-hs-62",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Cho hàm số $f(x)$ xác định và có đạo hàm trên $\\mathbb{R}$ và có bảng biến thiên như sau:Giá trị cực đại của hàm số bằng",
    "options": [
      "$-2$.",
      "$0$.",
      "$-3$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số đạt cực đại tại $x = -2$ và giá trị cực đại bằng $1$."
  },
  {
    "id": "bank-hs-63",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ dưới đâyHàm số đã cho nghịch biến trên khoảng",
    "options": [
      "$(0;+\\infty)$.",
      "$(-\\infty;0)$.",
      "$(0;1)$.",
      "$(-\\infty;5)$."
    ],
    "correctIndex": 1,
    "explanation": "Từ bảng biến thiên ta có hàm số đã cho nghịch biến trên khoảng $(-\\infty;0)$ và $(1;+\\infty)$."
  },
  {
    "id": "bank-hs-64",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số bậc ba $y = f(x)$ có bảng biến thiên như sau:Điểm cực tiểu của đồ thị hàm số là:",
    "options": [
      "$(-1;0)$.",
      "$(1;0)$.",
      "$(-1;4)$.",
      "$(1;4)$."
    ],
    "correctIndex": 1,
    "explanation": "Từ bảng biến thiên ta có điểm cực tiểu của đồ thị hàm số là $(1;0)$."
  },
  {
    "id": "bank-hs-65",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[-1;3]$ và có đồ thị như hình vẽ. Giá trị lớn nhất của hàm số đã cho trên đoạn $[-1;3]$ bằng",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị ta có giá trị lớn nhất của hàm số trên $[-1;3]$ bằng $3$ tại điểm $x = 3$."
  },
  {
    "id": "bank-hs-66",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Hàm số $y = \\frac{ax+b}{cx+d}$ ($c \\ne 0, ad-bc \\ne 0$) có đồ thị dưới đây. Đường tiệm cận đứng của đồ thị hàm số là:",
    "options": [
      "$x = -1$.",
      "$x = 1$.",
      "$x = 2$.",
      "$y = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Từ đồ thị ta có đường tiệm cận đứng của đồ thị hàm số đã cho là đường thẳng $x = 2$."
  },
  {
    "id": "bank-hs-67",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Đồ thị nào dưới đây có dạng đường cong như hình bên?",
    "options": [
      "$y = x^3-3x^2-1$.",
      "$y = \\frac{x^3-3x+1}{x-1}$.",
      "$y = -x^3+3x^2-1$.",
      "$y = \\frac{x+1}{x-1}$."
    ],
    "correctIndex": 2,
    "explanation": "Đường cong trong hình là đồ thị hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) $\\to$ Loại B, D.\nTa có $\\lim_{x \\to +\\infty} y = -\\infty \\Rightarrow a < 0 \\to$ Loại A. Do đó chọn C ($y = -x^3+3x^2-1$)."
  },
  {
    "id": "bank-hs-68",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = \\frac{ax+b}{cx+d}$ có đồ thị là đường cong như hình vẽ bên. Tọa độ giao điểm của đồ thị hàm số với trục hoành là",
    "options": [
      "$(2;0)$.",
      "$(0;1)$.",
      "$(1;0)$.",
      "$(0;2)$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào hình vẽ, đồ thị hàm số cắt trục hoành tại điểm $(2;0)$."
  },
  {
    "id": "bank-hs-69",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Trong 5 giây đầu tiên, một chất điểm chuyển động theo phương trình $S(t) = -t^3+6t^2+t+5$ trong đó $t$ tính bằng giây và $S(t)$ tính bằng mét. Tính vận tốc của vật tại thời điểm $t=3$ giây.",
    "options": [
      "$35\\text{ m/s}$.",
      "$10\\text{ m/s}$.",
      "$64\\text{ m/s}$.",
      "$13\\text{ m/s}$."
    ],
    "correctIndex": 1,
    "explanation": "Vận tốc của chất điểm: $v(t) = S'(t) = -3t^2+12t+1$.\nVận tốc của chất điểm tại thời điểm $t = 3$ giây: $v(3) = -3\\times 3^2 + 12\\times 3 + 1 = 10\\text{ (m/s)}$."
  },
  {
    "id": "bank-hs-70",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - HCM 2026) Cho hàm số $f(x)$ có bảng biến thiên sauHàm số đã cho có điểm cực đại là",
    "options": [
      "$(0;3)$.",
      "$x = 0$.",
      "$y = 3$.",
      "$y = 1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, hàm số đạt cực đại tại điểm $x = 0$."
  },
  {
    "id": "bank-hs-71",
    "difficulty": "nhan_biet",
    "text": "(THPT Liên cấp đại học Hồng Đức 2026) Tiệm cận đứng của đồ thị hàm số $y = \\frac{2x+4}{x-1}$ là",
    "options": [
      "$x = 1$.",
      "$x = -1$.",
      "$x = 2$.",
      "$x = -2$."
    ],
    "correctIndex": 0,
    "explanation": "Vì $\\lim_{x \\to 1^+} \\frac{2x+4}{x-1} = +\\infty$ nên $x = 1$ là tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-72",
    "difficulty": "nhan_biet",
    "text": "(THPT Liên cấp đại học Hồng Đức 2026) Hàm số nào dưới đây có đồ thị như đường cong trong hình bên?",
    "options": [
      "$y = \\frac{x^2-2x+3}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = x^3-3x-1$.",
      "$y = x^2+x-1$."
    ],
    "correctIndex": 2,
    "explanation": "Đây là hình ảnh đồ thị của hàm số bậc ba với hệ số $a > 0$, nên chọn đáp án C ($y = x^3 - 3x - 1$)."
  },
  {
    "id": "bank-hs-73",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Khuyến - LTT HCM 2026) Hàm số nào dưới đây đơn điệu trên tập xác định của nó?",
    "options": [
      "$y = \\sqrt{x^3+x-5}$.",
      "$y = \\frac{4x-2}{x-1}$.",
      "$y = x^4+x^3+x+11$.",
      "$y = \\cot 2x$."
    ],
    "correctIndex": 0,
    "explanation": "Xét hàm số $y = \\sqrt{x^3+x-5}$ có tập xác định $[a;+\\infty)$ với $a \\approx 1{,}516$.\nTa có $y' = \\frac{3x^2+1}{2\\sqrt{x^3+x-5}} > 0, \\forall x \\in (a;+\\infty)$.\nVậy hàm số đồng biến trên tập xác định của nó."
  },
  {
    "id": "bank-hs-74",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Hình vẽ bên là đồ thị của hàm số $y = \\frac{ax+b}{cx+b}$. Đường tiệm cận đứng của đồ thị có phương trình là",
    "options": [
      "$x = 1$.",
      "$x = 2$.",
      "$y = 1$.",
      "$y = 2$."
    ],
    "correctIndex": 0,
    "explanation": "Quan sát đồ thị, đường tiệm cận đứng của đồ thị là $x = 1$."
  },
  {
    "id": "bank-hs-75",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Tìm giá trị lớn nhất của hàm số $y = \\frac{2x-1}{x+1}$ trên đoạn $[1;2]$.",
    "options": [
      "$\\max_{[1;2]} y = \\frac{1}{2}$.",
      "$\\max_{[1;2]} y = -\\frac{1}{2}$.",
      "$\\max_{[1;2]} y = -\\frac{1}{3}$.",
      "$\\max_{[1;2]} y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $y' = \\frac{3}{(x+1)^2} > 0, \\forall x \\in [1;2]$ nên hàm số đồng biến trên đoạn $[1;2]$.\nDo đó $\\max_{[1;2]} y = y(2) = 1$."
  },
  {
    "id": "bank-hs-76",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Tiệm cận xiên của đồ thị hàm số $y = \\frac{-x^2-2x+5}{x+2}$ là",
    "options": [
      "$y = -x$.",
      "$y = -x+1$.",
      "$y = x+2$.",
      "$x = -2$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y = \\frac{-x^2-2x+5}{x+2} = -x + \\frac{5}{x+2}$.\nVì $\\lim_{x \\to \\pm\\infty} [y - (-x)] = \\lim_{x \\to \\pm\\infty} \\frac{5}{x+2} = 0$ nên đường thẳng $y = -x$ là tiệm cận xiên của đồ thị hàm số đã cho."
  },
  {
    "id": "bank-hs-77",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số có đồ thị như hình vẽ bên. Phát biểu nào sau đây sai?",
    "options": [
      "Hàm số đồng biến trên khoảng $(0;2)$.",
      "Hàm số nghịch biến trên khoảng $(2;+\\infty)$.",
      "Điểm cực đại của hàm số là 4.",
      "Điểm cực tiểu của đồ thị hàm số là $(0;0)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị hàm số ta có các ý A, B, D đều đúng.\nĐiểm cực đại của hàm số là $x = 2$ (hoặc giá trị cực đại là $y = 4$), phát biểu \"Điểm cực đại của hàm số là 4\" là sai (nhầm lẫn giữa điểm cực đại và giá trị cực đại)."
  },
  {
    "id": "bank-hs-78",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên. Mệnh đề nào dưới đây đúng?",
    "options": [
      "$\\min_{\\mathbb{R}} y = 4$.",
      "$y_{\\text{CT}} = 0$.",
      "$\\max_{\\mathbb{R}} y = 5$.",
      "$y_{\\text{CĐ}} = 5$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, giá trị cực đại của hàm số là $y_{\\text{CĐ}} = 5$."
  },
  {
    "id": "bank-hs-79",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Tiệm cận đứng của đồ thị hàm số $y = \\frac{5}{x-1}$ là đường thẳng có phương trình",
    "options": [
      "$x = 5$.",
      "$y = 0$.",
      "$y = 1$.",
      "$x = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $\\lim_{x \\to 1^+} y = +\\infty$ nên $x = 1$ là đường tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-80",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Số giao điểm của đồ thị hai hàm số $y = x^2-3x-1$ và $y = x^3-1$ là",
    "options": [
      "$1$.",
      "$0$.",
      "$3$.",
      "$2$."
    ],
    "correctIndex": 0,
    "explanation": "Xét phương trình hoành độ giao điểm: $x^3 - 1 = x^2 - 3x - 1 \\Leftrightarrow x^3 - x^2 + 3x = 0 \\Leftrightarrow x(x^2 - x + 3) = 0 \\Leftrightarrow x = 0$.\nVậy đồ thị hai hàm số có đúng 1 giao điểm."
  },
  {
    "id": "bank-hs-81",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ xác định và liên tục trên khoảng $(-\\infty;+\\infty)$, có bảng biến thiên như hình sau:Mệnh đề nào sau đây đúng?",
    "options": [
      "Hàm số nghịch biến trên khoảng $(-\\infty;-1)$.",
      "Hàm số nghịch biến trên khoảng $(-\\infty;2)$.",
      "Hàm số đồng biến trên khoảng $(1;+\\infty)$.",
      "Hàm số đồng biến trên khoảng $(-1;+\\infty)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên ta có hàm số đồng biến trên khoảng $(-\\infty;-1)$ và $(1;+\\infty)$. Vậy đáp án C đúng."
  },
  {
    "id": "bank-hs-82",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Đường cong trong hình dưới là đồ thị của hàm số nào?",
    "options": [
      "$y = -x^3+3x^2-4$.",
      "$y = -x^3+3x^2+1$.",
      "$y = x^3-3x^2+1$.",
      "$y = -x^3+2x^2-1$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị hàm số đã cho có dạng hàm số bậc ba $y = ax^3+bx^2+cx+d \\Rightarrow y' = 3ax^2+2bx+c$.\nĐồ thị đi qua điểm $(0;1) \\Rightarrow d = 1$.\nĐi qua điểm $(2;5) \\Rightarrow 8a+4b+2c+d = 5$.\nCó điểm cực trị tại $x = 0 \\Rightarrow y'(0) = c = 0$.\nCó điểm cực trị tại $x = 2 \\Rightarrow y'(2) = 12a+4b+c = 0$.\nGiải hệ ta được $a = -1, b = 3, c = 0, d = 1 \\Rightarrow y = -x^3+3x^2+1$."
  },
  {
    "id": "bank-hs-83",
    "difficulty": "nhan_biet",
    "text": "(THPT Bãi Cháy - Quảng Ninh 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ dưới đây:Đồ thị hàm số $y = f(x)$ có bao nhiêu đường tiệm cận?",
    "options": [
      "$2$.",
      "$3$.",
      "$1$.",
      "$4$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta có:\n- $\\lim_{x \\to 1^+} y = +\\infty$ và $\\lim_{x \\to 1^-} y = -\\infty$ nên đường thẳng $x = 1$ là đường tiệm cận đứng của đồ thị hàm số.\n- $\\lim_{x \\to -\\infty} y = -1$ nên đường thẳng $y = -1$ là đường tiệm cận ngang của đồ thị hàm số.\n- $\\lim_{x \\to +\\infty} y = 2$ nên đường thẳng $y = 2$ là đường tiệm cận ngang của đồ thị hàm số.\nVậy đồ thị hàm số có 3 đường tiệm cận."
  },
  {
    "id": "bank-hs-84",
    "difficulty": "nhan_biet",
    "text": "(THPT Bãi Cháy - Quảng Ninh 2026) Tích của giá trị nhỏ nhất và giá trị lớn nhất của hàm số $y = x+\\frac{4}{x}$ trên $[1;3]$ bằng",
    "options": [
      "$6$.",
      "$\\frac{52}{3}$.",
      "$\\frac{65}{3}$.",
      "$20$."
    ],
    "correctIndex": 3,
    "explanation": "Trên $[1;3]$, $y' = 1 - \\frac{4}{x^2} = 0 \\Leftrightarrow x = 2$.\nTa có $y(1) = 5, y(2) = 4, y(3) = \\frac{13}{3} \\Rightarrow \\min_{[1;3]} y = 4, \\max_{[1;3]} y = 5$.\nTích của giá trị nhỏ nhất và giá trị lớn nhất của hàm số là $4\\cdot 5 = 20$."
  },
  {
    "id": "bank-hs-85",
    "difficulty": "nhan_biet",
    "text": "(THPT Bãi Cháy - Quảng Ninh 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ dưới đây:Tiệm cận ngang của đồ thị hàm số là đường thẳng có phương trình",
    "options": [
      "$x = -\\frac{1}{2}$.",
      "$x = 1$.",
      "$y = -\\frac{1}{2}$.",
      "$y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Tiệm cận ngang của đồ thị hàm số là đường thẳng có phương trình $y = 1$."
  },
  {
    "id": "bank-hs-86",
    "difficulty": "thong_hieu",
    "text": "(Liên trường Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như sau:Hàm số $y = f(x)$ đồng biến trên khoảng nào trong các khoảng sau đây?",
    "options": [
      "$(0;1)$.",
      "$(-3;0)$.",
      "$(2;+\\infty)$.",
      "$(-\\infty;-1)$."
    ],
    "correctIndex": 0,
    "explanation": "Nhìn bảng xét dấu ta thấy trong khoảng $(0;1)$ thì đạo hàm $y' > 0$, do đó hàm số đồng biến trên khoảng $(0;1)$."
  },
  {
    "id": "bank-hs-87",
    "difficulty": "thong_hieu",
    "text": "(Liên trường Hà Nội 2026) Cho đồ thị hàm số $y = \\frac{2x+1}{2-x}$ có đường tiệm cận ngang là đường thẳng có phương trình",
    "options": [
      "$y = -2$.",
      "$x = -2$.",
      "$y = 1$.",
      "$x = 2$."
    ],
    "correctIndex": 0,
    "explanation": "Đồ thị hàm số $y = \\frac{2x+1}{2-x}$ có đường tiệm cận ngang là $y = \\frac{2}{-1} = -2$."
  },
  {
    "id": "bank-hs-88",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trung Thiên - Hà Tĩnh 2026) Tiệm cận đứng của đồ thị hàm số $y = \\frac{2x-2}{x+1}$ là",
    "options": [
      "$x = -1$.",
      "$x = 1$.",
      "$x = -2$.",
      "$x = 2$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số $y = \\frac{2x-2}{x+1}$ có tập xác định là $D = \\mathbb{R}\\setminus\\{-1\\}$. Ta có $\\lim_{x \\to (-1)^+} \\frac{2x-2}{x+1} = -\\infty$ (vì tử số tiến về $-4$ và mẫu số tiến về $0^+$). Do đó, đường thẳng $x = -1$ là tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-89",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Tìm hệ số $b, c$ để hàm số $y = \\frac{2}{cx+b}$ có đồ thị như hình vẽ sau:",
    "options": [
      "$\\begin{cases} b=2 \\\\ c=-1 \\end{cases}$.",
      "$\\begin{cases} b=1 \\\\ c=-1 \\end{cases}$.",
      "$\\begin{cases} b=2 \\\\ c=1 \\end{cases}$.",
      "$\\begin{cases} b=-2 \\\\ c=1 \\end{cases}$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số có tiệm cận đứng là $x = -\\frac{b}{c} = 2 \\Rightarrow b = -2c$.\nĐồ thị đi qua điểm $(0;-1) \\Rightarrow \\frac{2}{b} = -1 \\Rightarrow b = -2 \\Rightarrow c = 1$.\nVậy $b = -2, c = 1$."
  },
  {
    "id": "bank-hs-90",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ dưới đâyHàm số đã cho đồng biến trên khoảng nào trong các khoảng sau đây?",
    "options": [
      "$(-\\infty;1)$.",
      "$(1;2)$.",
      "$(2;+\\infty)$.",
      "$(-1;1)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ đồ thị hàm số, ta thấy nhánh đồ thị đi lên từ trái sang phải trên $(2;+\\infty)$, do đó hàm số đồng biến trên $(2;+\\infty)$."
  },
  {
    "id": "bank-hs-91",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm như sauHàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-\\infty;2)$.",
      "$(3;4)$.",
      "$(4;+\\infty)$.",
      "$(1;3)$."
    ],
    "correctIndex": 1,
    "explanation": "Hàm số đã cho nghịch biến trên khoảng $(3;4)$ vì $y' < 0$ với mọi $x \\in (3;4)$."
  },
  {
    "id": "bank-hs-92",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm như sau:Số điểm cực trị của hàm số đã cho là",
    "options": [
      "$3$.",
      "$4$.",
      "$2$.",
      "$5$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng xét dấu, đạo hàm đổi dấu 4 lần khi qua các điểm $x = -3, x = -2, x = 3, x = 5$. Do đó số điểm cực trị của hàm số đã cho là 4."
  },
  {
    "id": "bank-hs-93",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Hình vẽ sau đây là đồ thị của hàm số nào trong các hàm số dưới đây?",
    "options": [
      "$y = x^3+2x+1$.",
      "$y = x^3-2x+1$.",
      "$y = -x^3+2x+1$.",
      "$y = x^3-2x^2+1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào hình vẽ suy ra hệ số $a > 0$ (Loại C).\nĐồ thị của hàm số có 2 điểm cực trị nên phương trình $y' = 0$ có 2 nghiệm phân biệt (Loại A).\nĐồ thị của hàm số giao với trục $Ox$ là $y = 0 \\Leftrightarrow x^3-2x^2+1=0 \\Leftrightarrow x = 1, x \\approx -0{,}6, x \\approx 1{,}6$ (Loại D).\nVậy chọn B ($y = x^3 - 2x + 1$)."
  },
  {
    "id": "bank-hs-94",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ bên dướiHàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;2)$.",
      "$(0;+\\infty)$.",
      "$(2;+\\infty)$.",
      "$(-\\infty;2)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị ta thấy, đồ thị hàm số đi lên từ trái sang phải trong khoảng $(2;+\\infty)$ nên hàm số đã cho đồng biến trên khoảng $(2;+\\infty)$."
  },
  {
    "id": "bank-hs-95",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Đồ thị hàm số $y = \\frac{x+3}{x-1}$ có đường tiệm cận đứng là",
    "options": [
      "$y = 1$.",
      "$x = -3$.",
      "$x = 1$.",
      "$x = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có: Tập xác định: $D = \\mathbb{R}\\setminus\\{1\\}$.\nVì $\\lim_{x \\to 1^+} \\frac{x+3}{x-1} = +\\infty$ nên đường thẳng $x = 1$ là đường tiệm cận đứng của đồ thị hàm số đã cho."
  },
  {
    "id": "bank-hs-96",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có đồ thị trên đoạn $[-2;2]$ như hình vẽGọi giá trị lớn nhất và giá trị nhỏ nhất của hàm số trên đoạn $[-2;2]$ lần lượt là $M$ và $m$. Khi đó $M-m$ bằng",
    "options": [
      "$5$.",
      "$-4$.",
      "$0$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $M = 1, m = -4$. Vậy $M - m = 1 - (-4) = 5$."
  },
  {
    "id": "bank-hs-97",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Nhân Tông - Hà Nội 2026) Cho hàm số $y = \\frac{ax+b}{cx+d}$ ($ac \\ne 0; ad-bc \\ne 0$) có đồ thị như hình vẽ dưới đây. Trong các hệ số $a, b, c, d$ có bao nhiêu số dương?",
    "options": [
      "$2$.",
      "$1$.",
      "$3$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Tiệm cận đứng là: $x = 1$ nên $-\\frac{d}{c} = 1 \\Rightarrow d = -c$.\nTiệm cận ngang là: $y = -1$ nên $\\frac{a}{c} = -1 \\Rightarrow a = -c$.\nĐồ thị cắt trục tung tại điểm có tung độ bằng $-2$ nên $\\frac{b}{d} = -2 \\Rightarrow b = -2d = 2c$.\nTa xét 2 trường hợp dấu của $c$:\n- TH1: Nếu $c > 0$ thì $b > 0; a < 0; d < 0$ suy ra có 2 số dương.\n- TH2: Nếu $c < 0$ thì $b < 0; a > 0; d > 0$ suy ra có 2 số dương.\nVậy trong mọi trường hợp đều có 2 số dương."
  },
  {
    "id": "bank-hs-98",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Hà Nội 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Hàm số đã cho có bao nhiêu điểm cực trị.",
    "options": [
      "$2$.",
      "$3$.",
      "$1$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên trên thì hàm số có hai điểm cực trị ($x = -1$ và $x = 1$)."
  },
  {
    "id": "bank-hs-99",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $[-3;2]$ và có bảng biến thiên như hình dưới đây. Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và giá trị nhỏ nhất của hàm số $y = f(x)$ trên $[-1;2]$. Giá trị của $M+m$ bằng bao nhiêu",
    "options": [
      "$2$.",
      "$3$.",
      "$4$.",
      "$1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên của hàm số, trên đoạn $[-1;2]$ ta thấy hàm số đạt GTLN tại $x = -1$ là $M = 3$, hàm số đạt GTNN tại $x = 0$ là $m = 0$. Suy ra $M + m = 3 + 0 = 3$."
  },
  {
    "id": "bank-hs-100",
    "difficulty": "thong_hieu",
    "text": "(Cụm Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau.Hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(2;4)$.",
      "$(3;+\\infty)$.",
      "$(1;2)$.",
      "$(0;1)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ bảng biến thiên, hàm số $y = f(x)$ đồng biến trên các khoảng $(1;2)$ và $(2;3)$."
  },
  {
    "id": "bank-hs-101",
    "difficulty": "thong_hieu",
    "text": "(Cụm Hải Phòng 2026) Cho hàm số $f(x)$ liên tục trên đoạn $[0;3]$ và có đồ thị như hình vẽ bên. Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và nhỏ nhất của hàm số đã cho trên đoạn $[0;3]$. Giá trị của $M+m$ bằng",
    "options": [
      "$3$.",
      "$5$.",
      "$2$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào đồ thị, ta có: $M = \\max_{[0;3]} f(x) = f(3) = 3$ và $m = \\min_{[0;3]} f(x) = f(2) = -2 \\Rightarrow M + m = 3 - 2 = 1$."
  },
  {
    "id": "bank-hs-102",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Giá trị lớn nhất của hàm số $y = \\frac{2x-5}{x-1}$ trên đoạn $[2;5]$ là",
    "options": [
      "$-1$.",
      "$\\frac{1}{2}$.",
      "$\\frac{5}{4}$.",
      "$1$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $y' = \\frac{3}{(x-1)^2} > 0, \\forall x \\in [2;5]$ nên hàm số đồng biến trên đoạn $[2;5] \\Rightarrow \\max_{[2;5]} y = y(5) = \\frac{5}{4}$."
  },
  {
    "id": "bank-hs-103",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Giá trị nhỏ nhất của hàm số: $y = 4\\sin 2x - 3$ là",
    "options": [
      "$1$.",
      "$-11$.",
      "$-7$.",
      "$5$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $-1 \\le \\sin 2x \\le 1 \\Rightarrow -4 \\le 4\\sin 2x \\le 4 \\Rightarrow -7 \\le 4\\sin 2x - 3 \\le 1$.\nVậy giá trị nhỏ nhất của hàm số $y = 4\\sin 2x - 3$ là $-7$."
  },
  {
    "id": "bank-hs-104",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sauHàm số đạt cực đại tại điểm",
    "options": [
      "$x = 1$.",
      "$x = -3$.",
      "$x = -2$.",
      "$x = 0$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, ta thấy hàm số $y = f(x)$ đạt cực đại tại điểm $x = 0$."
  },
  {
    "id": "bank-hs-105",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Cho đồ thị hàm số như hình vẽ bên dưới. Đường tiệm cận ngang của đồ thị hàm số là",
    "options": [
      "$x = 2$.",
      "$y = 2$.",
      "$x = 1$.",
      "$y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Đường tiệm cận ngang của đồ thị hàm số là $y = 1$."
  },
  {
    "id": "bank-hs-106",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Sở Phú Thọ 2026) Giá trị nhỏ nhất của hàm số $f(x) = x^3-30x$ trên đoạn $[2;19]$ bằng:",
    "options": [
      "$-52$.",
      "$20\\sqrt{10}$.",
      "$-63$.",
      "$-20\\sqrt{10}$."
    ],
    "correctIndex": 3,
    "explanation": "Xét $x \\in [2;19]$, hàm số $f(x) = x^3 - 30x$ liên tục trên $[2;19]$.\nTa có $f'(x) = 3x^2 - 30 = 0 \\Leftrightarrow x = \\sqrt{10}$ (thỏa mãn) hoặc $x = -\\sqrt{10}$ (loại).\n$f(2) = -52; f(\\sqrt{10}) = -20\\sqrt{10}; f(19) = 6289$.\nGiá trị nhỏ nhất của hàm số trên đoạn $[2;19]$ bằng: $f(\\sqrt{10}) = -20\\sqrt{10}$."
  },
  {
    "id": "bank-hs-107",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Sở Phú Thọ 2026) Cho hàm số $f(x)$ có bảng biến thiên như sau:Giá trị cực đại của hàm số đã cho bằng",
    "options": [
      "$2$.",
      "$-2$.",
      "$-3$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên, giá trị cực đại của hàm số đã cho bằng $2$ tại $x = 3$."
  },
  {
    "id": "bank-hs-108",
    "difficulty": "nhan_biet",
    "text": "(Sở Hà Nội 2026) Cho hàm số $y=f(x)$ có đồ thị như hình vẽ. Tổng của giá trị lớn nhất và giá trị nhỏ nhất của hàm số đã cho trên đoạn $[-2;2]$ bằng",
    "options": [
      "$-1$.",
      "$-6$.",
      "$0$.",
      "$-5$."
    ],
    "correctIndex": 1,
    "explanation": "Giá trị lớn nhất của hàm số đã cho trên đoạn $[-2;2]$ là $-1$.\nGiá trị nhỏ nhất của hàm số đã cho trên đoạn $[-2;2]$ là $-5$.\nVậy tổng là $-1 - 5 = -6$."
  },
  {
    "id": "bank-hs-109",
    "difficulty": "nhan_biet",
    "text": "(Sở Hà Nội 2026) Cho hàm số $y = f(x)$ có đạo hàm trên $\\mathbb{R}$ và có bảng xét dấu của $f'(x)$ như sau:Số điểm cực trị của hàm số $y = f(x)$ là",
    "options": [
      "$3$.",
      "$1$.",
      "$2$.",
      "$0$."
    ],
    "correctIndex": 2,
    "explanation": "$f'(x)$ đổi dấu khi đi qua các điểm $x = -3; x = 2$ nên hàm số đã cho có hai điểm cực trị."
  },
  {
    "id": "bank-hs-110",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Bắc Ninh 2026) Cho hàm số $y=f(x)$ xác định trên $\\mathbb{R}\\setminus\\{-1\\}$, liên tục trên mỗi khoảng xác định và có bảng biến thiên như hình sau:Hỏi đồ thị hàm số có tổng tất cả bao nhiêu đường tiệm cận đứng và tiệm cận ngang?",
    "options": [
      "$0$.",
      "$3$.",
      "$1$.",
      "$2$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta xét giới hạn tại vô cực: $\\lim_{x \\to -\\infty} y = 2$ và $\\lim_{x \\to +\\infty} y = -1$, suy ra đồ thị có hai đường tiệm cận ngang là $y = 2$ và $y = -1$.\nXét giới hạn tại điểm gián đoạn: $\\lim_{x \\to (-1)^-} y = -\\infty$, suy ra đồ thị có một đường tiệm cận đứng là $x = -1$.\nVậy đồ thị hàm số có tổng cộng 3 đường tiệm cận đứng và ngang."
  },
  {
    "id": "bank-hs-111",
    "difficulty": "nhan_biet",
    "text": "(Sở Sơn La 2026) Tiệm cận đứng của đồ thị hàm số $y = \\frac{2x-1}{x-1}$ là đường thẳng có phương trình:",
    "options": [
      "$y = 1$.",
      "$x = 1$.",
      "$y = 2$.",
      "$x = 2$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có: $\\lim_{x \\to 1^+} \\frac{2x-1}{x-1} = +\\infty; \\lim_{x \\to 1^-} \\frac{2x-1}{x-1} = -\\infty$.\nSuy ra $x = 1$ là đường tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-112",
    "difficulty": "nhan_biet",
    "text": "(Sở Tuyên Quang 2026) Tiệm cận xiên của đồ thị hàm số $y = x+1-\\frac{1}{x-2}$ là đường thẳng có phương trình",
    "options": [
      "$y = x$.",
      "$x = 2$.",
      "$y = 1$.",
      "$y = x+1$."
    ],
    "correctIndex": 3,
    "explanation": "Tiệm cận xiên là đường thẳng $y = x+1$."
  },
  {
    "id": "bank-hs-113",
    "difficulty": "nhan_biet",
    "text": "(Sở Tuyên Quang 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-26;6)$.",
      "$(-\\infty;-1)$.",
      "$(3;+\\infty)$.",
      "$(-1;2)$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên ta nhận thấy hàm số đã cho nghịch biến trên khoảng $(-1;3)$, mà $(-1;2) \\subset (-1;3)$ nên hàm số đã cho nghịch biến trên khoảng $(-1;2)$."
  },
  {
    "id": "bank-hs-114",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[-2;3]$ và có đồ thị trong hình bên. Giá trị lớn nhất của hàm số $y = f(x)$ trên đoạn $[-2;3]$ bằng bao nhiêu?",
    "options": [
      "$1$.",
      "$3$.",
      "$-3$.",
      "$2$."
    ],
    "correctIndex": 3,
    "explanation": "Giá trị lớn nhất của hàm số trên đoạn $[-2;3]$ là $2$."
  },
  {
    "id": "bank-hs-115",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(-3;6)$.",
      "$(6;+\\infty)$.",
      "$(-1;+\\infty)$.",
      "$(-\\infty;5)$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên ta kết luận: Hàm số đồng biến trên các khoảng $(-\\infty;-3)$ và $(6;+\\infty)$."
  },
  {
    "id": "bank-hs-116",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Đường cong trong hình vẽ bên là đồ thị của hàm số nào sau đây?",
    "options": [
      "$y = \\frac{2x+3}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{x-1}{x+1}$.",
      "$y = \\frac{x+1}{3x-3}$."
    ],
    "correctIndex": 1,
    "explanation": "Ta thấy đồ thị hàm số có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 1$ nên chọn $y = \\frac{x+1}{x-1}$."
  },
  {
    "id": "bank-hs-117",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) có đồ thị như hình vẽ bên dưới. Điểm cực tiểu của hàm số đã cho là",
    "options": [
      "$y = 3$.",
      "$y = -1$.",
      "$x = 1$.",
      "$x = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Điểm cực tiểu của hàm số đã cho là $x = 1$."
  },
  {
    "id": "bank-hs-118",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x+3}{x-2}$ có phương trình là",
    "options": [
      "$y = 2$.",
      "$x = 2$.",
      "$y = -\\frac{3}{2}$.",
      "$x = -\\frac{3}{2}$."
    ],
    "correctIndex": 1,
    "explanation": "Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x+3}{x-2}$ là $x = 2$."
  },
  {
    "id": "bank-hs-119",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Hàm số $y = x^3-3x+2026$ nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(1;+\\infty)$.",
      "$(-\\infty;1)$.",
      "$(-2;2)$.",
      "$(-1;1)$."
    ],
    "correctIndex": 3,
    "explanation": "Tập xác định: $D = \\mathbb{R}$.\nTa có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên:\nHàm số nghịch biến trên khoảng $(-1;1)$."
  },
  {
    "id": "bank-hs-120",
    "difficulty": "nhan_biet",
    "text": "(Chuyên KHTN HN 2026) Đường tiệm cận xiên của đồ thị hàm số $y = \\frac{-5x^2+3x+1}{x-1}$ có phương trình là:",
    "options": [
      "$y = 5x+2$.",
      "$y = -5x+2$.",
      "$y = -5-2x$.",
      "$y = -5x-2$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $y = \\frac{-5x^2+3x+1}{x-1} = -5x-2 - \\frac{1}{x-1}$.\nĐường tiệm cận xiên của đồ thị hàm số là $y = -5x-2$."
  },
  {
    "id": "bank-hs-121",
    "difficulty": "thong_hieu",
    "text": "(Chuyên KHTN HN 2026) Cho hàm số $f(x) = \\frac{ax^2+2x-5}{x^2-3x+2}$ (với $a$ là hằng số). Biết rằng $f(x)$ liên tục tại $x = 1$. Giá trị của $f(1)$ bằng.",
    "options": [
      "$-6$.",
      "$-8$.",
      "$2$.",
      "$3$."
    ],
    "correctIndex": 1,
    "explanation": "Để hàm số $y = f(x)$ liên tục tại $x = 1$ thì phải tồn tại $\\lim_{x \\to 1} \\frac{ax^2+2x-5}{x^2-3x+2}$ và $\\lim_{x \\to 1} \\left(\\frac{ax^2+2x-5}{x^2-3x+2}\\right) = f(1)$.\nĐể tồn tại $\\lim_{x \\to 1} \\frac{ax^2+2x-5}{x^2-3x+2}$ thì phương trình $ax^2+2x-5 = 0$ có ít nhất một nghiệm $x = 1$.\nKhi đó: $a\\cdot 1^2 + 2\\cdot 1 - 5 = 0 \\Rightarrow a = 3$.\nVới $a = 3$ ta có $f(1) = \\lim_{x \\to 1} \\frac{3x^2+2x-5}{x^2-3x+2} = \\lim_{x \\to 1} \\frac{(x-1)(3x+5)}{(x-1)(x-2)} = \\lim_{x \\to 1} \\frac{3x+5}{x-2} = -8$."
  },
  {
    "id": "bank-hs-122",
    "difficulty": "thong_hieu",
    "text": "(Chuyên KHTN HN 2026) Cho hàm số $y=f(x)$. Đồ thị hàm số $f'(x)$ là đồ thị một hàm số bậc ba như hình vẽSố điểm cực tiểu của hàm số $y=f(x)$ là",
    "options": [
      "$3$.",
      "$1$.",
      "$2$.",
      "$0$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị hàm số $f'(x)$ ta thấy: $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = 2 \\end{bmatrix}$.\nTa có bảng biến thiên:\nDựa vào bảng biến thiên ta thấy hàm số không có điểm cực tiểu (chỉ có $1$ điểm cực đại tại $x = -1$)."
  },
  {
    "id": "bank-hs-123",
    "difficulty": "thong_hieu",
    "text": "(Sở Quảng Ninh 2026) Cho hàm số $y = f(x)$ xác định và liên tục trên $\\mathbb{R}\\setminus\\{-1\\}$, có bảng biến thiên như sau.Khẳng định nào sau đây là đúng?",
    "options": [
      "Đồ thị hàm số có tiệm cận đứng $y=-1$ và tiệm cận ngang $x=-2$.",
      "Đồ thị hàm số có duy nhất một tiệm cận.",
      "Đồ thị hàm số có ba tiệm cận.",
      "Đồ thị hàm số có tiệm cận đứng $x=-1$ và tiệm cận ngang $y=-2$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số có tiệm cận đứng $x = -1$ và tiệm cận ngang $y = -2$."
  },
  {
    "id": "bank-hs-124",
    "difficulty": "thong_hieu",
    "text": "(Sở Quảng Ninh 2026) Hàm số $y = f(x) = x^3-3x^2-9x+7$ có cực đại là",
    "options": [
      "$-1$.",
      "$12$.",
      "$3$.",
      "$-20$."
    ],
    "correctIndex": 1,
    "explanation": "$y' = f'(x) = 3x^2 - 6x - 9 = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = 3 \\end{bmatrix}$.\nTa có bảng biến thiên:\nHàm số $y = f(x) = x^3 - 3x^2 - 9x + 7$ có giá trị cực đại là $y_{\\text{CĐ}} = 12$ tại $x = -1$."
  },
  {
    "id": "bank-hs-125",
    "difficulty": "thong_hieu",
    "text": "(THPT Ngô Quyền - Hải Phòng 2026) Đường tiệm cận ngang của đồ thị hàm số $y = 1+\\frac{2x+1}{x+2}$ có phương trình là",
    "options": [
      "$y = 3$.",
      "$x = -1$.",
      "$y = 2$.",
      "$x = -2$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $\\lim_{x \\to +\\infty} \\left(1+\\frac{2x+1}{x+2}\\right) = \\lim_{x \\to +\\infty} \\left(1+\\frac{2x+1}{x+2}\\right) = 3$.\nVậy phương trình đường tiệm cận ngang là $y = 3$."
  },
  {
    "id": "bank-hs-126",
    "difficulty": "thong_hieu",
    "text": "(THPT Ngô Quyền - Hải Phòng 2026) Cho hàm số $y=f(x)$ có bảng biến thiên như sau:Khẳng định nào sau đây sai?",
    "options": [
      "Hàm số có giá trị cực tiểu bằng $-1$.",
      "Hàm số có giá trị cực đại bằng $-1$.",
      "Hàm số có 2 điểm cực đại.",
      "Hàm số có 3 điểm cực trị."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên ta thấy: Hàm số có 3 cực trị. Trong đó có 2 cực đại và 1 cực tiểu. Hàm số có giá trị cực tiểu bằng $-1$ và có giá trị cực đại bằng $3$. Do đó phương án \"Hàm số có giá trị cực đại bằng $-1$\" là sai."
  },
  {
    "id": "bank-hs-127",
    "difficulty": "thong_hieu",
    "text": "(Sở Lào Cai 2026) Cho hàm số $y = f(x) = \\frac{ax^2+bx+c}{mx+n}$ có đồ thị như hình vẽ dưới đây. Đường tiệm cận xiên của đồ thị hàm số đã cho có phương trình là",
    "options": [
      "$y = x-2$.",
      "$y = 3x+1$.",
      "$y = x+3$.",
      "$y = x-1$."
    ],
    "correctIndex": 2,
    "explanation": "Phương trình đường tiệm cận xiên có dạng $y = a'x+b'$.\nĐường tiệm cận xiên đi qua các điểm $(0;3)$ và $(1;4)$ nên ta có hệ phương trình:\n$\\begin{cases} b' = 3 \\\\ a'+b' = 4 \\end{cases} \\Leftrightarrow \\begin{cases} b' = 3 \\\\ a' = 1 \\end{cases}$.\nVậy $y = x+3$ là phương trình đường tiệm cận xiên của đồ thị hàm số."
  },
  {
    "id": "bank-hs-128",
    "difficulty": "thong_hieu",
    "text": "(Sở Lào Cai 2026) Cho hàm số $f(x)$ có bảng biến thiên như sauHàm số đã cho đạt cực đại tại",
    "options": [
      "$x = 1$.",
      "$x = -2$.",
      "$x = 2$.",
      "$x = -1$."
    ],
    "correctIndex": 3,
    "explanation": "Từ bảng biến thiên suy ra hàm số đạt cực đại tại $x = -1$."
  },
  {
    "id": "bank-hs-129",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Phú Thọ 2026) Cho hàm số bậc bốn có đồ thị như hình vẽ dưới đây:Điểm cực tiểu của đồ thị hàm số đã cho là",
    "options": [
      "$x = 2$.",
      "$A(0;-1)$.",
      "$x = 0$.",
      "$x = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị, điểm cực tiểu của đồ thị hàm số đã cho là $A(0;-1)$."
  },
  {
    "id": "bank-hs-130",
    "difficulty": "thong_hieu",
    "text": "(Sở Thanh Hóa 2026) Cho hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a,b,c,d \\in \\mathbb{R}$) có đồ thị như hình bên. Mệnh đề nào dưới đây đúng?",
    "options": [
      "$a<0, d>0$.",
      "$a>0, d>0$.",
      "$a>0, d<0$.",
      "$a<0, d<0$."
    ],
    "correctIndex": 0,
    "explanation": "Nhánh phải đồ thị đi xuống nên $a < 0$.\nĐồ thị cắt trục tung tại điểm có tung độ dương nên $d > 0$.\nDo đó $a < 0, d > 0$."
  },
  {
    "id": "bank-hs-131",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Phú Thọ 2026) Cho hàm số bậc bốn có đồ thị như hình vẽ dưới đây:Điểm cực tiểu của đồ thị hàm số đã cho là",
    "options": [
      "$x = 2$.",
      "$A(0;-1)$.",
      "$x = 0$.",
      "$x = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị, điểm cực tiểu của đồ thị hàm số đã cho là $A(0;-1)$."
  },
  {
    "id": "bank-hs-132",
    "difficulty": "thong_hieu",
    "text": "(Sở Hà Tĩnh 2026) Giá trị lớn nhất của hàm số $y = \\frac{x+3}{x-3}$ trên đoạn $[0;2]$ bằng",
    "options": [
      "$-1$.",
      "$2$.",
      "$3$.",
      "$-5$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = -\\frac{6}{(x-3)^2} < 0, \\forall x \\in [0;2]$ nên hàm số nghịch biến trên đoạn $[0;2] \\Rightarrow \\max_{[0;2]} y = y(0) = -1$."
  },
  {
    "id": "bank-hs-133",
    "difficulty": "thong_hieu",
    "text": "(Sở Hà Tĩnh 2026) Cho hàm số có đồ thị như hình vẽ. Mệnh đề nào sau đây sai",
    "options": [
      "Hàm số đồng biến trên khoảng $(0;2)$.",
      "Hàm số nghịch biến trên khoảng $(2;+\\infty)$.",
      "Hàm số đồng biến trên khoảng $(0;4)$.",
      "Hàm số nghịch biến trên khoảng $(-1;0)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị hàm số ta có hàm số đồng biến trên khoảng $(0;4)$ là sai (vì trên khoảng $(2;4)$ hàm số nghịch biến)."
  },
  {
    "id": "bank-hs-134",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dướiHàm số đồng biến trên khoảng nào trong các khoảng dưới đây",
    "options": [
      "$(2;3)$.",
      "$(0;3)$.",
      "$(-1;2)$.",
      "$(3;4)$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên, hàm số đồng biến trên khoảng $(1;3)$, do đó hàm số đồng biến trên $(2;3) \\subset (1;3)$."
  },
  {
    "id": "bank-hs-135",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Xác định tiệm cận đứng của đồ thị hàm số $y = \\frac{ax+b}{cx+d}$ có dạng như hình dưới.",
    "options": [
      "$x = 1$.",
      "$x = -1$.",
      "$y = 1$.",
      "$y = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $\\lim_{x \\to (-1)^-} f(x) = -\\infty$ và $\\lim_{x \\to (-1)^+} f(x) = +\\infty$ nên $x = -1$ là tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-136",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Xác định giá trị nhỏ nhất trên đoạn $[-1;1]$ của hàm số $y = f(x)$ có đồ thị như hình dưới.",
    "options": [
      "$-1$.",
      "$-4$.",
      "$0$.",
      "$-2$."
    ],
    "correctIndex": 1,
    "explanation": "Giá trị nhỏ nhất trên đoạn $[-1;1]$ của hàm số $y = f(x)$ có đồ thị trên là $-4$ đạt tại $x = -1$."
  },
  {
    "id": "bank-hs-137",
    "difficulty": "thong_hieu",
    "text": "(Sở Cao Bằng 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = (x+1)(2x-5)^2$ với mọi $x \\in \\mathbb{R}$. Hàm số đã cho nghịch biến trên khoảng nào?",
    "options": [
      "$\\left(-1;\\frac{5}{2}\\right)$.",
      "$(-\\infty;-1)$.",
      "$(-3;1)$.",
      "$(-1;+\\infty)$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $f'(x) = (x+1)(2x-5)^2 = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = \\frac{5}{2} \\end{bmatrix}$.\nBảng biến thiên:\nVậy hàm số đã cho nghịch biến trên khoảng $(-\\infty;-1)$."
  },
  {
    "id": "bank-hs-138",
    "difficulty": "thong_hieu",
    "text": "(Cụm chuyên môn 4 Đắk Lắk 2026) Cho hàm số $f(x)$ có đạo hàm $f'(x) = x(x-1)(x-2)^3, \\forall x \\in \\mathbb{R}$. Số điểm cực trị của hàm số đã cho là",
    "options": [
      "$1$.",
      "$5$.",
      "$2$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2\\text{ (nghiệm kép)} \\end{bmatrix}$.\nBảng biến thiên:\nVậy hàm số có hai điểm cực trị (tại $x = 0$ và $x = 1$)."
  },
  {
    "id": "bank-hs-139",
    "difficulty": "thong_hieu",
    "text": "(Cụm chuyên môn 4 Đắk Lắk 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;1)$.",
      "$(1;+\\infty)$.",
      "$(-1;1)$.",
      "$(-1;0)$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số đã cho đồng biến trên khoảng $(-\\infty;-1)$ và $(0;1)$."
  },
  {
    "id": "bank-hs-140",
    "difficulty": "thong_hieu",
    "text": "(HSG 12 - Thanh Hóa 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = x(x+2)(x+3), \\forall x \\in \\mathbb{R}$ và $f(1)+f(-2) = f(3)+f(0)$. Giá trị nhỏ nhất, giá trị lớn nhất của hàm số $y=f(x)$ trên đoạn $[-2;3]$ lần lượt là",
    "options": [
      "$f(0)$ và $f(-2)$.",
      "$f(3)$ và $f(0)$.",
      "$f(0)$ và $f(3)$.",
      "$f(-2)$ và $f(0)$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có bảng biến thiên trên $[-2;3]$:\nGiá trị nhỏ nhất là $f(0)$. Mặt khác $f(1) + f(-2) = f(3) + f(0)$ và $f(1) > f(0) \\Rightarrow f(-2) < f(3)$.\nDo đó giá trị lớn nhất của hàm số là $f(3)$."
  }
];
