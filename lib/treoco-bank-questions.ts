/**
 * Ngân hàng câu hỏi Toán học chuẩn trích xuất từ các bộ đề thi ngân hàng (NganHang_HamSo_De01..04.json).
 * - Tự động đồng bộ với các file ảnh tĩnh trong public/images/bank/ (tối ưu hóa tốc độ tải 0 latency).
 * - Nhận biết (Dễ) và Thông hiểu (Trung bình) dùng cho Thử thách Toán 60s và Hũ bí mật.
 * - Vận dụng (Khó) dùng cho Hũ bí mật trong Mini Game Trung Thu.
 * - Không có câu Tích phân/Nguyên hàm.
 * - 100% câu hỏi có hình vẽ đều có đường dẫn ảnh chính xác tuyệt đối.
 */
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";

export const NGAN_HANG_CAU_HOI_GAME: TreocoCauHoi[] = [
  {
    "id": "bank-hs-de01-1",
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
    "id": "bank-hs-de01-2",
    "difficulty": "nhan_biet",
    "text": "(THPT ĐH-KHTN HN 2026) Cho hàm số $f(x) = x^3 - 3x + 2$. Giá trị cực đại của hàm số đã cho bằng",
    "options": [
      "$-1$.",
      "$0$.",
      "$1$.",
      "$4$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = -1 \\end{bmatrix}$.\nBảng biến thiên:\nGiá trị cực đại của hàm số đã cho bằng $4$.",
    "explanationImageUrl": "/images/bank/de_01/lt_1.png"
  },
  {
    "id": "bank-hs-de01-3",
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
    "id": "bank-hs-de01-4",
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
    "id": "bank-hs-de01-5",
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
    "id": "bank-hs-de01-6",
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
    "id": "bank-hs-de01-7",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Điểm cực đại của hàm số $y=f(x)$ là",
    "options": [
      "$y = 2$.",
      "$x = 2$.",
      "$x = 3$.",
      "$y = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên, điểm cực đại của hàm số là $x = 3$.",
    "imageUrl": "/images/bank/de_01/lt_2.png"
  },
  {
    "id": "bank-hs-de01-8",
    "difficulty": "nhan_biet",
    "text": "(THPT Đồng Hỷ - Thái Nguyên 2026) Hàm số nào sau đây có đồ thị là đường cong như hình vẽ?",
    "options": [
      "$y = x - \\frac{1}{x-1}$.",
      "$y = -x + \\frac{1}{x-1}$.",
      "$y = -x - \\frac{1}{x-1}$.",
      "$y = x + \\frac{1}{x-1}$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số đi qua điểm $(0;-1)$ (Loại A, C) và điểm $(2;3)$ (Loại B). Do đó ta chọn D.",
    "imageUrl": "/images/bank/de_01/lt_3.png"
  },
  {
    "id": "bank-hs-de01-9",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Đồ thị của hàm số nào dưới đây có dạng như đường cong trong hình vẽ?",
    "options": [
      "$y = \\frac{2x-1}{2x+1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{2x+1}{2x-1}$.",
      "$y = \\frac{2x+1}{x-1}$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị có tiệm cận đứng là $x = 1$, tiệm cận ngang là $y = 1$ nên đồ thị trên là của hàm số $y = \\frac{x+1}{x-1}$.",
    "imageUrl": "/images/bank/de_01/lt_4.png"
  },
  {
    "id": "bank-hs-de01-10",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có đồ thị là đường cong trong hình dưới đây. Hàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;1)$.",
      "$(-1;1)$.",
      "$(-\\infty;1)$.",
      "$(0;+\\infty)$."
    ],
    "correctIndex": 0,
    "explanation": "Quan sát đồ thị, nhận thấy hàm số đã cho đồng biến trên khoảng $(0;1)$.",
    "imageUrl": "/images/bank/de_01/lt_5.png"
  },
  {
    "id": "bank-hs-de01-11",
    "difficulty": "nhan_biet",
    "text": "(Chuyên Trần Phú - Hải Phòng 2026) Số điểm cực tiểu của đồ thị hàm số $y = \\frac{1}{5}x^5 - \\frac{3}{4}x^4 + \\frac{2}{3}x^3 + \\frac{1}{2}$ là",
    "options": [
      "$0$.",
      "$3$.",
      "$2$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "TXĐ: $D = \\mathbb{R}$.\nTa có $y' = x^4 - 3x^3 + 2x^2 = x^2(x^2 - 3x + 2)$.\n$y' = 0 \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2 \\end{bmatrix}$.\nBảng biến thiên:\nTừ bảng biến thiên, ta thấy đồ thị hàm số có $1$ điểm cực tiểu.",
    "explanationImageUrl": "/images/bank/de_01/lt_6.png"
  },
  {
    "id": "bank-hs-de01-12",
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
    "id": "bank-hs-de01-13",
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
    "id": "bank-hs-de01-14",
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
    "id": "bank-hs-de01-15",
    "difficulty": "nhan_biet",
    "text": "(THPT Nguyễn Gia Thiều - Hà Nội 2026) Cho hàm số $f(x)$ liên tục trên $[-1;5]$ và có đồ thị như hình vẽ bên (các điểm cực trị của đồ thị thể hiện rõ trên hình). Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và nhỏ nhất của hàm số đã cho trên $[-1;5]$. Giá trị của $M-m$ bằng",
    "options": [
      "$1$.",
      "$4$.",
      "$5$.",
      "$6$."
    ],
    "correctIndex": 2,
    "explanation": "Trên $[-1;5]$, ta có $M = \\max_{[-1;5]} f(x) = 3$ và $m = \\min_{[-1;5]} f(x) = -2$.\nGiá trị của $M - m = 3 - (-2) = 5$.",
    "imageUrl": "/images/bank/de_01/lt_7.png"
  },
  {
    "id": "bank-hs-de01-16",
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
    "id": "bank-hs-de01-17",
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
    "id": "bank-hs-de01-18",
    "difficulty": "thong_hieu",
    "text": "(Sở Bắc Ninh 2026) Cho hàm số $y = f(x)$ liên tục và có đồ thị trên đoạn $[-4;3]$ như hình vẽ. Giá trị nhỏ nhất của hàm số $y = f(x)$ trên đoạn $[0;3]$ là",
    "options": [
      "$-4$.",
      "$-3$.",
      "$1$.",
      "$-2$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị trên đoạn $[0;3]$, điểm thấp nhất có tung độ bằng $-2$. Vậy $\\min_{[0;3]} f(x) = -2$.",
    "imageUrl": "/images/bank/de_01/lt_8.png"
  },
  {
    "id": "bank-hs-de01-19",
    "difficulty": "thong_hieu",
    "text": "(Sở Bắc Ninh 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như hình vẽ sauSố điểm cực tiểu của đồ thị hàm số $y = f(x)$ là",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng xét dấu đạo hàm, đạo hàm đổi dấu từ âm sang dương đúng 1 lần (tại $x = 0$) nên hàm số có 1 điểm cực tiểu.",
    "imageUrl": "/images/bank/de_01/lt_9.png"
  },
  {
    "id": "bank-hs-de01-20",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Cho hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) có đồ thị như hình vẽHàm số nghịch biến trên khoảng nào trong các khoảng dưới đây?",
    "options": [
      "$(-\\infty;-1)$.",
      "$(-1;1)$.",
      "$(1;+\\infty)$.",
      "$(-4;0)$."
    ],
    "correctIndex": 1,
    "explanation": "Quan sát đồ thị, ta thấy trên khoảng $(-1;1)$ đường cong đồ thị đi xuống từ trái sang phải, do đó hàm số nghịch biến trên khoảng $(-1;1)$.",
    "imageUrl": "/images/bank/de_01/lt_10.png"
  },
  {
    "id": "bank-hs-de01-21",
    "difficulty": "thong_hieu",
    "text": "(Sở Phú Thọ 2026) Điểm cực tiểu của hàm số $y = \\frac{1}{3}x^3 - 2x^2 + 3x - 1$ là",
    "options": [
      "$x = \\frac{1}{3}$.",
      "$x = 3$.",
      "$x = -1$.",
      "$x = 1$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $y' = x^2 - 4x + 3$.\nCho $y' = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = 3 \\end{bmatrix}$.\nBảng biến thiên:\nĐiểm cực tiểu của hàm số là $x = 3$.",
    "explanationImageUrl": "/images/bank/de_01/lt_11.png"
  },
  {
    "id": "bank-hs-de01-22",
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
    "id": "bank-hs-de01-23",
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
    "id": "bank-hs-de01-24",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Đường cong trong hình vẽ bên là đồ thị hàm số nào trong các hàm số được cho bởi các phương án $A, B, C, D$ dưới đây?",
    "options": [
      "$y = \\frac{2x-1}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{2x-2}{2x+1}$.",
      "$y = \\frac{-x+1}{x+1}$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị hàm số có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 1$. Do đó đồ thị là của hàm số $y = \\frac{x+1}{x-1}$.",
    "imageUrl": "/images/bank/de_01/lt_12.png"
  },
  {
    "id": "bank-hs-de01-25",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Cho hàm số $y=f(x)$ xác định trên $\\mathbb{R}$, có bảng biến thiên như hình vẽ dưới đây. Hàm số $y=f(x)$ nghịch biến trên khoảng nào trong các khoảng sau?",
    "options": [
      "$(0;1)$.",
      "$(-\\infty;22)$.",
      "$(0;+\\infty)$.",
      "$(2;+\\infty)$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số nghịch biến trên $(-\\infty;0)$ và $(1;+\\infty)$. Vì $(2;+\\infty) \\subset (1;+\\infty)$ nên hàm số nghịch biến trên khoảng $(2;+\\infty)$.",
    "imageUrl": "/images/bank/de_01/lt_13.png"
  },
  {
    "id": "bank-hs-de01-26",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Lê Thánh Tông - Đà Nẵng 2026) Cho hàm số $f(x)$ có đạo hàm $f'(x) = x^2(x-1)(x-2)^3$, $\\forall x \\in \\mathbb{R}$. Hàm số $f(x)$ có bao nhiêu điểm cực đại?",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x^2 = 0 \\\\ x - 1 = 0 \\\\ (x-2)^3 = 0 \\end{bmatrix} \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2 \\end{bmatrix}$.\nBảng biến thiên:\nDựa vào bảng biến thiên suy ra hàm số $f(x)$ có $1$ điểm cực đại.",
    "explanationImageUrl": "/images/bank/de_01/lt_14.png"
  },
  {
    "id": "bank-hs-de01-27",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Đồ thị có hình vẽ dưới đây là của hàm số nào?",
    "options": [
      "$y = \\frac{-x+2}{x+1}$.",
      "$y = \\frac{-x}{x+1}$.",
      "$y = \\frac{-x+1}{x+1}$.",
      "$y = \\frac{-2x+1}{2x+1}$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị:\n- Tiệm cận đứng $x = -1$ (Loại D vì có TCĐ $x = -\\frac{1}{2}$).\n- Tiệm cận ngang $y = -1$.\n- Đồ thị cắt trục tung tại $(0;1)$. Thay $x = 0$ vào đáp án C được $y = 1$ (Thỏa mãn).",
    "imageUrl": "/images/bank/de_01/lt_15.png"
  },
  {
    "id": "bank-hs-de01-28",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có đồ thị như hình bên. Hàm số đã cho đạt giá trị nhỏ nhất trên đoạn $[-1;1]$ tại",
    "options": [
      "$x = -1$.",
      "$x = 0$.",
      "$x = -4$.",
      "$x = 1$."
    ],
    "correctIndex": 0,
    "explanation": "Từ đồ thị hàm số ta thấy giá trị nhỏ nhất của hàm số trên đoạn $[-1;1]$ là $-4$ tại $x = -1$.",
    "imageUrl": "/images/bank/de_01/lt_16.png"
  },
  {
    "id": "bank-hs-de01-29",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dưới.Đồ thị hàm số $y=f(x)$ có tổng số bao nhiêu đường tiệm cận đứng và ngang?",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Từ bảng biến thiên ta thấy:\n- $\\lim_{x \\to -\\infty} y = -1 \\Rightarrow y = -1$ là tiệm cận ngang.\n- $\\lim_{x \\to 1^-} y = +\\infty \\Rightarrow x = 1$ là tiệm cận đứng.\nVậy đồ thị hàm số có tổng cộng 2 đường tiệm cận đứng và ngang.",
    "imageUrl": "/images/bank/de_01/lt_17.png"
  },
  {
    "id": "bank-hs-de01-30",
    "difficulty": "thong_hieu",
    "text": "(Cụm liên trường Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số $f(x)$ đạt cực tiểu tại điểm",
    "options": [
      "$y = 0$.",
      "$x = -4$.",
      "$y = -4$.",
      "$x = 3$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số $f(x)$ đạt cực tiểu tại điểm $x = 3$.",
    "imageUrl": "/images/bank/de_01/lt_18.png"
  },
  {
    "id": "bank-hs-de01-31",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Cho hàm số $f(x)$ có bảng xét dấu của đạo hàm như sau:Hàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-3;0)$.",
      "$(0;+\\infty)$.",
      "$(0;2)$.",
      "$(-\\infty;-3)$."
    ],
    "correctIndex": 0,
    "explanation": "Do $f'(x) < 0, \\forall x \\in (-3;0)$ nên hàm số nghịch biến trên khoảng $(-3;0)$.",
    "imageUrl": "/images/bank/de_01/lt_19.png"
  },
  {
    "id": "bank-hs-de01-32",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Bảng biến thiên sau đây là của hàm số nào?",
    "options": [
      "$y = \\frac{2x+3}{x+1}$.",
      "$y = \\frac{2x-1}{x-1}$.",
      "$y = \\frac{2x-1}{x+1}$.",
      "$y = \\frac{x+1}{2x-1}$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên ta có: Đồ thị hàm số có tiệm cận đứng $x = -1$ và tiệm cận ngang $y = 2$ (loại B và D).\nXét phương án A: $y' = \\frac{-1}{(x+1)^2} < 0, \\forall x \\ne -1$ (loại vì trên BBT $y' > 0$).\nXét phương án C: $y' = \\frac{3}{(x+1)^2} > 0, \\forall x \\ne -1$ (chọn).",
    "imageUrl": "/images/bank/de_01/lt_20.png"
  },
  {
    "id": "bank-hs-de01-33",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Đường cong trong hình sau là của hàm số nào dưới đây?",
    "options": [
      "$y = -x^3 - 3x^2 - 2$.",
      "$y = x^3 - 3x^2 - 2$.",
      "$y = 2x^3 + 6x^2 - 2$.",
      "$y = x^3 + 3x^2 - 2$."
    ],
    "correctIndex": 3,
    "explanation": "Vì đường cong trong hình bên có dạng hàm bậc ba với hệ số $a > 0$, đi qua điểm $(1;2)$ và có hai điểm cực trị $(-2;2)$, $(0;-2)$ nên đó là đồ thị của hàm số $y = x^3 + 3x^2 - 2$.",
    "imageUrl": "/images/bank/de_01/lt_21.png"
  },
  {
    "id": "bank-hs-de01-34",
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
    "id": "bank-hs-de01-35",
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
    "id": "bank-hs-de01-36",
    "difficulty": "van_dung",
    "text": "(Cụm trường Hà Tĩnh 2026) Cho hàm số $f(x) = ax^3+bx^2+cx+d$ có đồ thị như hình sau đây. Số nghiệm dương của phương trình $2f(x)-3 = 0$ là:",
    "options": [
      "$1$.",
      "$0$.",
      "$3$.",
      "$2$."
    ],
    "correctIndex": 3,
    "explanation": "Biến đổi phương trình: $2f(x)-3 = 0 \\Leftrightarrow f(x) = \\frac{3}{2} = 1{,}5$.\nĐường thẳng nằm ngang $y = 1{,}5$ cắt đồ thị tại 3 điểm, trong đó có 2 giao điểm có hoành độ dương ($x > 0$). Vậy phương trình có 2 nghiệm dương.",
    "imageUrl": "/images/bank/de_01/lt_22.png"
  },
  {
    "id": "bank-hs-de01-37",
    "difficulty": "van_dung",
    "text": "(Cụm trường Hà Tĩnh 2026) Cho hàm số $y=f(x)$ có bảng biến thiên như sau:Giá trị cực đại của hàm số $y=f(x)$ là",
    "options": [
      "$y = -3$.",
      "$y = -6$.",
      "$x = -7$.",
      "$x = -4$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên, giá trị cực đại của hàm số là $y_{\\text{CĐ}} = -3$.",
    "imageUrl": "/images/bank/de_01/lt_23.png"
  },
  {
    "id": "bank-hs-de01-38",
    "difficulty": "van_dung",
    "text": "(Cụm trường Hà Tĩnh 2026) Đường tiệm cận xiên của đồ thị hàm số $y = x+4+\\frac{x-1}{x-2}$ là",
    "options": [
      "$y = x+4$.",
      "$x = 2$.",
      "$y = x+5$.",
      "$y = x+3$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $y = x+4+\\frac{x-1}{x-2} = x+4+1+\\frac{1}{x-2} = x+5+\\frac{1}{x-2}$.\nVì $\\lim_{x \\to \\pm\\infty} [y - (x+5)] = \\lim_{x \\to \\pm\\infty} \\frac{1}{x-2} = 0$ nên đường tiệm cận xiên là $y = x+5$."
  },
  {
    "id": "bank-hs-de01-39",
    "difficulty": "van_dung",
    "text": "(Liên trường Nghệ An 2026) Cho hàm số $y = \\frac{ax+2}{x+c}$ có đồ thị như hình sau đây. Tính giá trị của biểu thức $P = 2a-c$",
    "options": [
      "$4$.",
      "$-4$.",
      "$-5$.",
      "$5$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào đồ thị ta có:\n- Tiệm cận đứng $x = 2 \\Rightarrow -c = 2 \\Leftrightarrow c = -2$.\n- Tiệm cận ngang $y = 1 \\Rightarrow a = 1$.\nVậy $P = 2a - c = 2(1) - (-2) = 4$.",
    "imageUrl": "/images/bank/de_01/lt_24.png"
  },
  {
    "id": "bank-hs-de01-40",
    "difficulty": "van_dung",
    "text": "(Liên trường Nghệ An 2026) Bạn Hải có một tấm bìa hình vuông cạnh 40 cm. Bạn muốn cắt bỏ ở bốn góc bốn hình vuông nhỏ bằng nhau để gấp và dán lại thành một hộp hình hộp chữ nhật không có nắp (tham khảo hình vẽ).Để hộp có thể tích lớn nhất thì độ dài cạnh của hình vuông nhỏ bị cắt là:",
    "options": [
      "$6\\text{ cm}$.",
      "$5\\text{ cm}$.",
      "$\\frac{20}{3}\\text{ cm}$.",
      "$\\frac{10}{3}\\text{ cm}$."
    ],
    "correctIndex": 2,
    "explanation": "Gọi $x\\text{ (cm)}$ là độ dài cạnh hình vuông nhỏ bị cắt ở bốn góc ($0 < x < 20$). Khi cắt bỏ bốn hình vuông nhỏ ở bốn góc và gấp lại, ta được một hình hộp chữ nhật không có nắp.\nChiều cao của hộp là $x\\text{ cm}$. Cạnh của đáy hộp (hình vuông) là $40 - 2x\\text{ cm}$.\nThể tích của hộp là $V(x) = (40-2x)^2 \\cdot x = 4x^3 - 160x^2 + 1600x$.\n$V'(x) = 12x^2 - 320x + 1600 = 0 \\Leftrightarrow \\begin{bmatrix} x = \\frac{20}{3}\\text{ (TM)} \\\\ x = 20\\text{ (Loại)} \\end{bmatrix}$.\n$V''(x) = 24x - 320 \\Rightarrow V''\\left(\\frac{20}{3}\\right) = -160 < 0$, nên thể tích $V(x)$ đạt cực đại tại $x = \\frac{20}{3}$.\nVậy để hộp có thể tích lớn nhất thì độ dài cạnh hình vuông nhỏ bị cắt là $\\frac{20}{3}\\text{ cm}$.",
    "imageUrl": "/images/bank/de_01/lt_25.png",
    "explanationImageUrl": "/images/bank/de_01/lt_26.png"
  },
  {
    "id": "bank-hs-de01-41",
    "difficulty": "van_dung",
    "text": "(Liên trường Nghệ An 2026) Hàm số nào sau đây nghịch biến trên $\\mathbb{R}$?",
    "options": [
      "$y = \\left(\\frac{2026}{2025}\\right)^x$.",
      "$y = \\log_{\\frac{1}{2}} x$.",
      "$y = \\frac{2x-1}{x-1}$.",
      "$y = e^{-x}$."
    ],
    "correctIndex": 3,
    "explanation": "Xét hàm số $y = e^{-x}$ có tập xác định $D = \\mathbb{R}$ và đạo hàm $y' = -e^{-x} < 0, \\forall x \\in \\mathbb{R}$. Do đó hàm số $y = e^{-x}$ nghịch biến trên $\\mathbb{R}$."
  },
  {
    "id": "bank-hs-de01-42",
    "difficulty": "van_dung",
    "text": "(Liên trường Nghệ An 2026) Cho hàm số $f(x) = ax^3+bx^2+cx+d$ có đồ thị như hình sau đâyĐiểm cực đại của hàm số $y=f(x)$ là",
    "options": [
      "$x = 0$.",
      "$x = 2$.",
      "$y = 3$.",
      "$M(2;3)$."
    ],
    "correctIndex": 1,
    "explanation": "Từ đồ thị, ta xác định được điểm cực đại của đồ thị hàm số là $(2;3)$. Vậy điểm cực đại của hàm số là $x = 2$.",
    "imageUrl": "/images/bank/de_01/lt_27.png"
  },
  {
    "id": "bank-hs-de01-43",
    "difficulty": "van_dung",
    "text": "(Liên trường Nghệ An 2026) Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x+3}{x-1}$ là",
    "options": [
      "$x = 2$.",
      "$y = 1$.",
      "$y = 2$.",
      "$x = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Vì $\\lim_{x \\to 1^+} \\frac{2x+3}{x-1} = +\\infty$ nên đường thẳng $x = 1$ là đường tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-de01-44",
    "difficulty": "van_dung",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = x^2(x+1)^2(2x-1)$. Số điểm cực trị của hàm số $y=f(x)$ là",
    "options": [
      "$3$.",
      "$0$.",
      "$2$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Phương trình $f'(x) = 0 \\Leftrightarrow x^2(x+1)^2(2x-1) = 0$ có nghiệm đơn $x = \\frac{1}{2}$ và hai nghiệm bội chẵn $x = 0, x = -1$. Vì đạo hàm chỉ đổi dấu 1 lần khi qua $x = \\frac{1}{2}$ nên hàm số có đúng 1 điểm cực trị."
  },
  {
    "id": "bank-hs-de01-45",
    "difficulty": "van_dung",
    "text": "(THPT Nguyễn Thị Minh Khai - Hà Nội 2026) Giá trị nhỏ nhất của hàm số $y = x^3-3x+5$ trên đoạn $[2;4]$ là",
    "options": [
      "$\\min_{[2;4]} y = 5$.",
      "$\\min_{[2;4]} y = 0$.",
      "$\\min_{[2;4]} y = 3$.",
      "$\\min_{[2;4]} y = 7$."
    ],
    "correctIndex": 3,
    "explanation": "Hàm số liên tục trên $[2;4]$. Ta có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1 \\notin [2;4]$.\nTa tính $y(2) = 7, y(4) = 57$.\nVậy giá trị nhỏ nhất của hàm số trên đoạn $[2;4]$ là $7$ tại $x = 2$."
  },
  {
    "id": "bank-hs-de02-1",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Hà Tĩnh 2026) Hàm số $y = f(x)$ có đồ thị như hình dưới đây. Đồ thị hàm số đã cho có đường tiệm cận ngang là:",
    "options": [
      "$x = 2$.",
      "$x = 1$.",
      "$y = 1$.",
      "$y = 2$."
    ],
    "correctIndex": 2,
    "explanation": "Tiệm cận ngang là đường thẳng mà đồ thị hàm số tiến sát về đó khi $x \\to \\pm\\infty$. Nhìn trên hình vẽ ta thấy nhánh đồ thị nằm ngang tiến sát về đường thẳng cắt trục tung tại giá trị $1$. Do đó phương trình tiệm cận ngang là $y = 1$.",
    "imageUrl": "/images/bank/de_02/lt_1.png"
  },
  {
    "id": "bank-hs-de02-2",
    "difficulty": "nhan_biet",
    "text": "(Cụm 5 Sở Ninh Bình 2026) Hình vẽ sau đây là đồ thị của một trong bốn hàm số cho ở các đáp án $A, B, C, D$. Hỏi đó là hàm số nào?",
    "options": [
      "$y = x^3+2x+1$.",
      "$y = x^3-3x$.",
      "$y = -x^3+3x$.",
      "$y = x^3+3x^2$."
    ],
    "correctIndex": 1,
    "explanation": "Từ đồ thị ta có $a > 0$ nên loại đáp án C.\nĐồ thị đi qua gốc tọa độ $O(0;0)$ nên hệ số tự do $d = 0$ (loại đáp án A).\nĐồ thị có hai điểm cực trị nên phương trình $y' = 0$ có 2 nghiệm phân biệt (loại đáp án D).\nVậy chọn B ($y = x^3 - 3x$).",
    "imageUrl": "/images/bank/de_02/lt_2.png"
  },
  {
    "id": "bank-hs-de02-3",
    "difficulty": "nhan_biet",
    "text": "(Cụm 5 Sở Ninh Bình 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = (2x-1)(x+1)$. Hàm số $y=f(x)$ có giá trị lớn nhất trên $[-2;0]$ bằng",
    "options": [
      "$f\\left(-\\frac{1}{2}\\right)$.",
      "$f(-1)$.",
      "$f(0)$.",
      "$f(-2)$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $f'(x) = (2x-1)(x+1) = 0 \\Leftrightarrow \\begin{bmatrix} x = \\frac{1}{2} \\\\ x = -1 \\end{bmatrix}$.\nBảng biến thiên:\nTừ bảng biến thiên ta thấy: $\\max_{[-2;0]} f(x) = f(-1)$.",
    "explanationImageUrl": "/images/bank/de_02/lt_3.png"
  },
  {
    "id": "bank-hs-de02-4",
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
    "id": "bank-hs-de02-5",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Cho hàm số $y = f(x)$ có đạo hàm trên $\\mathbb{R}$. Biết hàm số $y = f'(x)$ có đồ thị như hình vẽ. Phát biểu nào sau đây là đúng?",
    "options": [
      "Hàm số $y = f(x)$ đạt cực đại tại $x_1 = -2$ và đạt cực tiểu tại $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực tiểu tại hai điểm $x_1 = -2$ và $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực đại tại hai điểm $x_1 = -2$ và $x_2 = 1$.",
      "Hàm số $y = f(x)$ đạt cực tiểu tại $x_1 = -2$ và đạt cực đại tại $x_2 = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị hàm số $y = f'(x)$ ta có bảng dấu của $f'(x)$:\nTừ bảng dấu của $f'(x) \\Rightarrow$ Hàm số $y = f(x)$ đạt cực tiểu tại điểm $x_1 = -2$ và đạt cực đại tại $x_2 = 1$.",
    "imageUrl": "/images/bank/de_02/lt_4.png",
    "explanationImageUrl": "/images/bank/de_02/lt_5.png"
  },
  {
    "id": "bank-hs-de02-6",
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
    "id": "bank-hs-de02-7",
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
    "id": "bank-hs-de02-8",
    "difficulty": "nhan_biet",
    "text": "(ĐGNL ĐHSPHN 2026) Bạn Long định gấp một cái hộp có dạng hình lăng trụ tứ giác đều với tổng diện tích tất cả các mặt là $96\\text{ cm}^2$. Thể tích cái hộp mà bạn Long định gấp lớn nhất bằng bao nhiêu?",
    "options": [
      "$32\\text{ cm}^3$.",
      "$64\\text{ cm}^3$.",
      "$108\\text{ cm}^3$.",
      "$96\\text{ cm}^3$."
    ],
    "correctIndex": 1,
    "explanation": "Ta gọi cạnh đáy của cái hộp có dạng hình lăng trụ tứ giác đều là $a > 0$ và chiều cao là $x > 0$ (đơn vị: cm).\nKhi đó $2a^2 + 4ax = 96 \\Rightarrow x = \\frac{48-a^2}{2a}$.\nMà $V = x \\cdot a^2 = a^2 \\cdot \\frac{48-a^2}{2a} = \\frac{48a-a^3}{2}$ trên $(0;\\sqrt{48})$.\nTa có $V' = \\frac{1}{2}(48 - 3a^2) = 0 \\Rightarrow a = 4$.\nBảng biến thiên của hàm số $V(a) = \\frac{48a-a^3}{2}$:\nDựa vào bảng biến thiên ta thấy thể tích cái hộp lớn nhất bằng $V(4) = 64\\text{ cm}^3$.",
    "explanationImageUrl": "/images/bank/de_02/lt_6.png"
  },
  {
    "id": "bank-hs-de02-9",
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
    "id": "bank-hs-de02-10",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sau:Hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(1;+\\infty)$.",
      "$(-2;1)$.",
      "$(-2;3)$.",
      "$(-\\infty;-2)$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta thấy $f'(x) > 0$ với mọi $x \\in (-2;1)$ nên hàm số $y = f(x)$ đồng biến trên khoảng $(-2;1)$.",
    "imageUrl": "/images/bank/de_02/lt_7.png"
  },
  {
    "id": "bank-hs-de02-11",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ xác định trên $\\mathbb{R}\\setminus\\{-1\\}$, liên tục trên mỗi khoảng xác định và có bảng biến thiên như hình:Hỏi đồ thị hàm số có bao nhiêu đường tiệm cận ngang?",
    "options": [
      "$0$.",
      "$2$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta thấy $\\lim_{x \\to -\\infty} y = 2$ và $\\lim_{x \\to +\\infty} y = -1$.\nVậy đồ thị hàm số có 2 đường tiệm cận ngang là $y = 2$ và $y = -1$.",
    "imageUrl": "/images/bank/de_02/lt_8.png"
  },
  {
    "id": "bank-hs-de02-12",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Hàm số nào dưới đây có đồ thị là đường cong như hình vẽ",
    "options": [
      "$y = -x^4+3x+1$.",
      "$y = x^3-3x+1$.",
      "$y = -x^2+3x+1$.",
      "$y = -x^3+3x+1$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số đã cho là đồ thị của hàm số bậc ba, có hai điểm cực trị và có nhánh phải đi xuống khi $x \\to +\\infty$. Do đó hệ số $a < 0$ (loại B, C).\nKiểm tra hàm số $y = -x^3 + 3x + 1$:\nTập xác định: $D = \\mathbb{R}$. $y' = -3x^2 + 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên:\nGiá trị cực đại $y_{\\text{CĐ}} = y(1) = 3$, cực tiểu $y_{\\text{CT}} = y(-1) = -1$.\nKhi $x = 0 \\Rightarrow y = 1$ (cắt trục tung tại $(0;1)$). Đồ thị phù hợp với hình vẽ đã cho.",
    "imageUrl": "/images/bank/de_02/lt_9.png",
    "explanationImageUrl": "/images/bank/de_02/lt_10.png"
  },
  {
    "id": "bank-hs-de02-13",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ có bảng biến thiên sau:Giá trị cực đại của hàm số $y = f(x)$ là:",
    "options": [
      "$1$.",
      "$5$.",
      "$0$.",
      "$-3$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát bảng biến thiên: Tại $x = 1$, $y'$ đổi dấu từ dương sang âm, nên hàm số đạt cực đại tại $x = 1$ và giá trị cực đại là $y(1) = 0$.",
    "imageUrl": "/images/bank/de_02/lt_11.png"
  },
  {
    "id": "bank-hs-de02-14",
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
    "id": "bank-hs-de02-15",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽĐồ thị hàm số đã cho có đường tiệm cận ngang là",
    "options": [
      "$x = 1$.",
      "$y = 2$.",
      "$y = 1$.",
      "$y = 3$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị hàm số, $y = 2$ là đường tiệm cận ngang của đồ thị hàm số.",
    "imageUrl": "/images/bank/de_02/lt_12.png"
  },
  {
    "id": "bank-hs-de02-16",
    "difficulty": "thong_hieu",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽĐiểm cực đại của hàm số đã cho",
    "options": [
      "$x = 1$.",
      "$x = 2$.",
      "$x = 0$.",
      "$x = -2$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị, điểm cực đại của hàm số đã cho là: $x = 0$.",
    "imageUrl": "/images/bank/de_02/lt_13.png"
  },
  {
    "id": "bank-hs-de02-17",
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
    "id": "bank-hs-de02-18",
    "difficulty": "thong_hieu",
    "text": "(THPT Thọ Xuân 5-Thanh Hóa 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[1;5]$ và có đồ thị như hình vẽ sau.Trên đoạn $[1;5]$, hàm số đã cho đạt giá trị lớn nhất tại điểm.",
    "options": [
      "$x = 1$.",
      "$x = 4$.",
      "$x = 5$.",
      "$x = 2$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị trên đoạn $[1;5]$, hàm số đạt giá trị lớn nhất bằng $4$ tại điểm $x = 2$.",
    "imageUrl": "/images/bank/de_02/lt_14.png"
  },
  {
    "id": "bank-hs-de02-19",
    "difficulty": "thong_hieu",
    "text": "(THPT Thọ Xuân 5-Thanh Hóa 2026) Cho hàm số bậc ba $y = f(x)$ có đồ thị đạo hàm $y = f'(x)$ như hình sauHàm số đã cho nghịch biến trên khoảng",
    "options": [
      "$(-1;0)$.",
      "$(2;3)$.",
      "$(1;2)$.",
      "$(3;4)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị ta có $f'(x) < 0, \\forall x \\in (0;2)$, suy ra $f'(x) < 0, \\forall x \\in (1;2)$ nên hàm số $y = f(x)$ nghịch biến trên khoảng $(1;2)$.",
    "imageUrl": "/images/bank/de_02/lt_15.png"
  },
  {
    "id": "bank-hs-de02-20",
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
    "id": "bank-hs-de02-21",
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
    "id": "bank-hs-de02-22",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - LHT - HCM 2026) Cho hàm số $y = f(x)$ có một phần đồ thị như hình bên.Khoảng đồng biến của hàm số $y = f(x)$ là:",
    "options": [
      "$(2;4)$.",
      "$(0;3)$.",
      "$(-1;0)$.",
      "$(1;3)$."
    ],
    "correctIndex": 3,
    "explanation": "Quan sát đồ thị:\n- Đồ thị hàm số đi xuống (nghịch biến) khi $x < 1$.\n- Đồ thị hàm số đi lên (đồng biến) trong khoảng từ $x = 1$ đến $x = 3$.\n- Đồ thị hàm số đi xuống (nghịch biến) khi $x > 3$.\nVậy hàm số đồng biến trên khoảng $(1;3)$.",
    "imageUrl": "/images/bank/de_02/lt_16.png"
  },
  {
    "id": "bank-hs-de02-23",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - LHT - HCM 2026) Đường cong ở hình bên là đồ thị của hàm số nào sau đây?",
    "options": [
      "$y = \\frac{-x^2-2x-2}{x+1}$.",
      "$y = \\frac{x^2+2x+2}{x-1}$.",
      "$y = \\frac{-x^2-2x}{x+1}$.",
      "$y = \\frac{x^2-2x+2}{x+1}$."
    ],
    "correctIndex": 0,
    "explanation": "Đồ thị hàm số đi qua điểm $(0;-2)$ (Loại C, D).\nĐồ thị hàm số có đường tiệm cận đứng $x = -1$ (Loại B).\nDo đó chọn đáp án A.",
    "imageUrl": "/images/bank/de_02/lt_17.png"
  },
  {
    "id": "bank-hs-de02-24",
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
    "id": "bank-hs-de02-25",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Cho hàm số $y = f(x) = ax^4+bx^3+cx^2+dx+e$ có đạo hàm $f'(x)$ và đồ thị hàm số $y = f'(x)$ cắt trục hoành tại các điểm có hoành độ $-1;0;2$ như hình bên. Hỏi hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(-\\infty;-1)$.",
      "$(1;+\\infty)$.",
      "$(0;2)$.",
      "$(-1;0)$."
    ],
    "correctIndex": 3,
    "explanation": "Hàm số $y = f(x)$ đồng biến khi và chỉ khi đạo hàm $f'(x) > 0$.\nTừ đồ thị, ta thấy rằng đồ thị của $y = f'(x)$ cắt trục hoành tại các điểm có hoành độ $x = -1, x = 0, x = 2$.\nTrên khoảng $(-1;0)$: Đồ thị $f'(x)$ nằm phía trên trục hoành, tức là $f'(x) > 0$. Do đó, $f(x)$ đồng biến trên khoảng này.\nVậy, hàm số $y = f(x)$ đồng biến trên các khoảng $(-1;0)$ và $(2;+\\infty)$.",
    "imageUrl": "/images/bank/de_02/lt_18.png"
  },
  {
    "id": "bank-hs-de02-26",
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
    "id": "bank-hs-de02-27",
    "difficulty": "thong_hieu",
    "text": "(Chuyên Hạ Long 2026) Cho hàm số $f(x)$ xác định và có đạo hàm trên $\\mathbb{R}$ và có bảng biến thiên như sau:Giá trị cực đại của hàm số bằng",
    "options": [
      "$-2$.",
      "$0$.",
      "$-3$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, hàm số đạt cực đại tại $x = -2$ và giá trị cực đại bằng $1$.",
    "imageUrl": "/images/bank/de_02/lt_19.png"
  },
  {
    "id": "bank-hs-de02-28",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ dưới đâyHàm số đã cho nghịch biến trên khoảng",
    "options": [
      "$(0;+\\infty)$.",
      "$(-\\infty;0)$.",
      "$(0;1)$.",
      "$(-\\infty;5)$."
    ],
    "correctIndex": 1,
    "explanation": "Từ bảng biến thiên ta có hàm số đã cho nghịch biến trên khoảng $(-\\infty;0)$ và $(1;+\\infty)$.",
    "imageUrl": "/images/bank/de_02/lt_20.png"
  },
  {
    "id": "bank-hs-de02-29",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số bậc ba $y = f(x)$ có bảng biến thiên như sau:Điểm cực tiểu của đồ thị hàm số là:",
    "options": [
      "$(-1;0)$.",
      "$(1;0)$.",
      "$(-1;4)$.",
      "$(1;4)$."
    ],
    "correctIndex": 1,
    "explanation": "Từ bảng biến thiên ta có điểm cực tiểu của đồ thị hàm số là $(1;0)$.",
    "imageUrl": "/images/bank/de_02/lt_21.png"
  },
  {
    "id": "bank-hs-de02-30",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[-1;3]$ và có đồ thị như hình vẽ. Giá trị lớn nhất của hàm số đã cho trên đoạn $[-1;3]$ bằng",
    "options": [
      "$2$.",
      "$0$.",
      "$1$.",
      "$3$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị ta có giá trị lớn nhất của hàm số trên $[-1;3]$ bằng $3$ tại điểm $x = 3$.",
    "imageUrl": "/images/bank/de_02/lt_22.png"
  },
  {
    "id": "bank-hs-de02-31",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Hàm số $y = \\frac{ax+b}{cx+d}$ ($c \\ne 0, ad-bc \\ne 0$) có đồ thị dưới đây. Đường tiệm cận đứng của đồ thị hàm số là:",
    "options": [
      "$x = -1$.",
      "$x = 1$.",
      "$x = 2$.",
      "$y = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Từ đồ thị ta có đường tiệm cận đứng của đồ thị hàm số đã cho là đường thẳng $x = 2$.",
    "imageUrl": "/images/bank/de_02/lt_23.png"
  },
  {
    "id": "bank-hs-de02-32",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Đồ thị nào dưới đây có dạng đường cong như hình bên?",
    "options": [
      "$y = x^3-3x^2-1$.",
      "$y = \\frac{x^3-3x+1}{x-1}$.",
      "$y = -x^3+3x^2-1$.",
      "$y = \\frac{x+1}{x-1}$."
    ],
    "correctIndex": 2,
    "explanation": "Đường cong trong hình là đồ thị hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) $\\to$ Loại B, D.\nTa có $\\lim_{x \\to +\\infty} y = -\\infty \\Rightarrow a < 0 \\to$ Loại A. Do đó chọn C ($y = -x^3+3x^2-1$).",
    "imageUrl": "/images/bank/de_02/lt_24.png"
  },
  {
    "id": "bank-hs-de02-33",
    "difficulty": "thong_hieu",
    "text": "(THPT Than Uyên - Lai Châu 2026) Cho hàm số $y = \\frac{ax+b}{cx+d}$ có đồ thị là đường cong như hình vẽ bên. Tọa độ giao điểm của đồ thị hàm số với trục hoành là",
    "options": [
      "$(2;0)$.",
      "$(0;1)$.",
      "$(1;0)$.",
      "$(0;2)$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào hình vẽ, đồ thị hàm số cắt trục hoành tại điểm $(2;0)$.",
    "imageUrl": "/images/bank/de_02/lt_25.png"
  },
  {
    "id": "bank-hs-de02-34",
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
    "id": "bank-hs-de02-35",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Khuyến - HCM 2026) Cho hàm số $f(x)$ có bảng biến thiên sauHàm số đã cho có điểm cực đại là",
    "options": [
      "$(0;3)$.",
      "$x = 0$.",
      "$y = 3$.",
      "$y = 1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, hàm số đạt cực đại tại điểm $x = 0$.",
    "imageUrl": "/images/bank/de_02/lt_26.png"
  },
  {
    "id": "bank-hs-de02-36",
    "difficulty": "van_dung",
    "text": "(THPT Nguyễn Khuyến - HCM 2026) Hàm số $y = \\sqrt{-x^2+2x}$ đồng biến trên khoảng nào?",
    "options": [
      "$(0;1)$.",
      "$(1;2)$.",
      "$(-\\infty;0)$.",
      "$(2;+\\infty)$."
    ],
    "correctIndex": 0,
    "explanation": "Điều kiện bài toán: $-x^2+2x \\ge 0 \\Leftrightarrow 0 \\le x \\le 2$.\nTa có $y' = \\frac{-2x+2}{2\\sqrt{-x^2+2x}} \\ge 0 \\Rightarrow x \\le 1$.\nVậy hàm số đồng biến trên khoảng $(0;1)$."
  },
  {
    "id": "bank-hs-de02-37",
    "difficulty": "van_dung",
    "text": "(THPT Nguyễn Khuyến - HCM 2026) Cho hàm số $y = \\frac{x^2-3x+4}{x+1}$. Tiệm cận đứng của đồ thị hàm số là",
    "options": [
      "$y = 1$.",
      "$x = -1$.",
      "$x = 1$.",
      "$y = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Tập xác định của hàm số $D = \\mathbb{R}\\setminus\\{-1\\}$.\nVì $\\lim_{x \\to (-1)^+} \\frac{x^2-3x+4}{x+1} = +\\infty$ nên $x = -1$ là đường tiệm cận đứng của đồ thị hàm số."
  },
  {
    "id": "bank-hs-de02-38",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$, có bảng xét dấu đạo hàm như sau:Khẳng định nào dưới đây đúng?",
    "options": [
      "Hàm số nghịch biến trên khoảng $(-\\infty;0)$.",
      "Hàm số đồng biến trên khoảng $(1;+\\infty)$.",
      "Hàm số đồng biến trên khoảng $(-\\infty;-2)$.",
      "Hàm số nghịch biến trên khoảng $(0;4)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ bảng xét dấu đạo hàm, ta thấy $f'(x) > 0$ trên $(-\\infty;-2)$ nên hàm số đồng biến trên khoảng $(-\\infty;-2)$.",
    "imageUrl": "/images/bank/de_02/lt_27.png"
  },
  {
    "id": "bank-hs-de02-39",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Giá trị lớn nhất của hàm số $y = x^3-3x+2$ trên đoạn $[0;3]$ bằng",
    "options": [
      "$2$.",
      "$3$.",
      "$20$.",
      "$0$."
    ],
    "correctIndex": 2,
    "explanation": "Hàm số đã cho liên tục trên đoạn $[0;3]$. Ta có: $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1 \\in [0;3]$ (hoặc $x = -1 \\notin [0;3]$).\nXét trên đoạn $[0;3]$:\n$y(0) = 0^3 - 3\\times 0 + 2 = 2;$\n$y(1) = 1^3 - 3\\times 1 + 2 = 0;$\n$y(3) = 3^3 - 3\\times 3 + 2 = 20$.\nVậy giá trị lớn nhất của hàm số trên đoạn $[0;3]$ bằng $20$ tại $x = 3$."
  },
  {
    "id": "bank-hs-de02-40",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ sau:Tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số $y = f(x)$ là",
    "options": [
      "$3$.",
      "$1$.",
      "$4$.",
      "$2$."
    ],
    "correctIndex": 3,
    "explanation": "Ta có $\\lim_{x \\to (-1)^+} f(x) = -\\infty \\Rightarrow$ Đường tiệm cận đứng: $x = -1$.\nTa có $\\lim_{x \\to +\\infty} f(x) = 0 \\Rightarrow$ Tiệm cận ngang: $y = 0$.\nVậy tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số là $2$.",
    "imageUrl": "/images/bank/de_02/lt_28.png"
  },
  {
    "id": "bank-hs-de02-41",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Cho hàm số bậc ba $y = f(x)$ có đồ thị như hình vẽ sauGiá trị cực đại của hàm số đã cho là",
    "options": [
      "$1$.",
      "$-1$.",
      "$2$.",
      "$-2$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị, điểm cực đại của đồ thị hàm số là $(-1;2)$. Do đó giá trị cực đại của hàm số đã cho là $y = 2$.",
    "imageUrl": "/images/bank/de_02/lt_29.png"
  },
  {
    "id": "bank-hs-de02-42",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Phương trình đường tiệm cận xiên của đồ thị hàm số $y = \\frac{x^2+x-3}{x+1}$ là",
    "options": [
      "$y = x+1$.",
      "$y = x$.",
      "$y = x-3$.",
      "$y = 2x$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $y = \\frac{x^2+x-3}{x+1} = x - \\frac{3}{x+1}$.\nDo đó $\\lim_{x \\to \\pm\\infty} (y - x) = \\lim_{x \\to \\pm\\infty} \\left(-\\frac{3}{x+1}\\right) = 0 \\Rightarrow y = x$ là đường tiệm cận xiên của đồ thị hàm số."
  },
  {
    "id": "bank-hs-de02-43",
    "difficulty": "van_dung",
    "text": "(Sở Ninh Bình 2026) Đồ thị hàm số $y = \\frac{2x+3}{x-1}$ có tâm đối xứng là điểm",
    "options": [
      "$N(3;-1)$.",
      "$P(1;2)$.",
      "$Q\\left(1;-\\frac{3}{2}\\right)$.",
      "$M(2;-1)$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị hàm số có đường tiệm cận đứng là $x = 1$ và đường tiệm cận ngang là $y = 2$.\nDo đó, đồ thị hàm số $y = \\frac{2x+3}{x-1}$ có tâm đối xứng là điểm $P(1;2)$."
  },
  {
    "id": "bank-hs-de02-44",
    "difficulty": "van_dung",
    "text": "(THPT Liên cấp đại học Hồng Đức 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-1;0)$.",
      "$(-\\infty;0)$.",
      "$(1;+\\infty)$.",
      "$(0;1)$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, ta thấy $f'(x) < 0$ trên các khoảng $(-\\infty;-1)$ và $(0;1)$. Do đó hàm số nghịch biến trên khoảng $(0;1)$.",
    "imageUrl": "/images/bank/de_02/lt_30.png"
  },
  {
    "id": "bank-hs-de02-45",
    "difficulty": "van_dung",
    "text": "(THPT Liên cấp đại học Hồng Đức 2026) Cho hàm số $f(x)$ có đồ thị như hình bên. Giá trị lớn nhất của hàm số $f(x)$ trên đoạn $[-3;2]$ đạt tại $x$ bằng",
    "options": [
      "$4$.",
      "$2$.",
      "$-3$.",
      "$0$."
    ],
    "correctIndex": 2,
    "explanation": "Quan sát đồ thị ta thấy giá trị lớn nhất của hàm số $f(x)$ trên đoạn $[-3;2]$ là $4$, đạt tại $x = -3$.",
    "imageUrl": "/images/bank/de_02/lt_31.png"
  },
  {
    "id": "bank-hs-de03-1",
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
    "id": "bank-hs-de03-2",
    "difficulty": "nhan_biet",
    "text": "(THPT Liên cấp đại học Hồng Đức 2026) Hàm số nào dưới đây có đồ thị như đường cong trong hình bên?",
    "options": [
      "$y = \\frac{x^2-2x+3}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = x^3-3x-1$.",
      "$y = x^2+x-1$."
    ],
    "correctIndex": 2,
    "explanation": "Đây là hình ảnh đồ thị của hàm số bậc ba với hệ số $a > 0$, nên chọn đáp án C ($y = x^3 - 3x - 1$).",
    "imageUrl": "/images/bank/de_03/lt_1.png"
  },
  {
    "id": "bank-hs-de03-3",
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
    "id": "bank-hs-de03-4",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Hình vẽ bên là đồ thị của hàm số $y = \\frac{ax+b}{cx+b}$. Đường tiệm cận đứng của đồ thị có phương trình là",
    "options": [
      "$x = 1$.",
      "$x = 2$.",
      "$y = 1$.",
      "$y = 2$."
    ],
    "correctIndex": 0,
    "explanation": "Quan sát đồ thị, đường tiệm cận đứng của đồ thị là $x = 1$.",
    "imageUrl": "/images/bank/de_03/lt_2.png"
  },
  {
    "id": "bank-hs-de03-5",
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
    "id": "bank-hs-de03-6",
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
    "id": "bank-hs-de03-7",
    "difficulty": "nhan_biet",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số có đồ thị như hình vẽ bên. Phát biểu nào sau đây sai?",
    "options": [
      "Hàm số đồng biến trên khoảng $(0;2)$.",
      "Hàm số nghịch biến trên khoảng $(2;+\\infty)$.",
      "Điểm cực đại của hàm số là 4.",
      "Điểm cực tiểu của đồ thị hàm số là $(0;0)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị hàm số ta có các ý A, B, D đều đúng.\nĐiểm cực đại của hàm số là $x = 2$ (hoặc giá trị cực đại là $y = 4$), phát biểu \"Điểm cực đại của hàm số là 4\" là sai (nhầm lẫn giữa điểm cực đại và giá trị cực đại).",
    "imageUrl": "/images/bank/de_03/lt_3.png"
  },
  {
    "id": "bank-hs-de03-8",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ bên. Mệnh đề nào dưới đây đúng?",
    "options": [
      "$\\min_{\\mathbb{R}} y = 4$.",
      "$y_{\\text{CT}} = 0$.",
      "$\\max_{\\mathbb{R}} y = 5$.",
      "$y_{\\text{CĐ}} = 5$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, giá trị cực đại của hàm số là $y_{\\text{CĐ}} = 5$.",
    "imageUrl": "/images/bank/de_03/lt_4.png"
  },
  {
    "id": "bank-hs-de03-9",
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
    "id": "bank-hs-de03-10",
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
    "id": "bank-hs-de03-11",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Cho hàm số $y = f(x)$ xác định và liên tục trên khoảng $(-\\infty;+\\infty)$, có bảng biến thiên như hình sau:Mệnh đề nào sau đây đúng?",
    "options": [
      "Hàm số nghịch biến trên khoảng $(-\\infty;-1)$.",
      "Hàm số nghịch biến trên khoảng $(-\\infty;2)$.",
      "Hàm số đồng biến trên khoảng $(1;+\\infty)$.",
      "Hàm số đồng biến trên khoảng $(-1;+\\infty)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào bảng biến thiên ta có hàm số đồng biến trên khoảng $(-\\infty;-1)$ và $(1;+\\infty)$. Vậy đáp án C đúng.",
    "imageUrl": "/images/bank/de_03/lt_5.png"
  },
  {
    "id": "bank-hs-de03-12",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Nghệ An 2026) Đường cong trong hình dưới là đồ thị của hàm số nào?",
    "options": [
      "$y = -x^3+3x^2-4$.",
      "$y = -x^3+3x^2+1$.",
      "$y = x^3-3x^2+1$.",
      "$y = -x^3+2x^2-1$."
    ],
    "correctIndex": 1,
    "explanation": "Đồ thị hàm số đã cho có dạng hàm số bậc ba $y = ax^3+bx^2+cx+d \\Rightarrow y' = 3ax^2+2bx+c$.\nĐồ thị đi qua điểm $(0;1) \\Rightarrow d = 1$.\nĐi qua điểm $(2;5) \\Rightarrow 8a+4b+2c+d = 5$.\nCó điểm cực trị tại $x = 0 \\Rightarrow y'(0) = c = 0$.\nCó điểm cực trị tại $x = 2 \\Rightarrow y'(2) = 12a+4b+c = 0$.\nGiải hệ ta được $a = -1, b = 3, c = 0, d = 1 \\Rightarrow y = -x^3+3x^2+1$.",
    "imageUrl": "/images/bank/de_03/lt_6.png"
  },
  {
    "id": "bank-hs-de03-13",
    "difficulty": "nhan_biet",
    "text": "(THPT Bãi Cháy - Quảng Ninh 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ dưới đây:Đồ thị hàm số $y = f(x)$ có bao nhiêu đường tiệm cận?",
    "options": [
      "$2$.",
      "$3$.",
      "$1$.",
      "$4$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta có:\n- $\\lim_{x \\to 1^+} y = +\\infty$ và $\\lim_{x \\to 1^-} y = -\\infty$ nên đường thẳng $x = 1$ là đường tiệm cận đứng của đồ thị hàm số.\n- $\\lim_{x \\to -\\infty} y = -1$ nên đường thẳng $y = -1$ là đường tiệm cận ngang của đồ thị hàm số.\n- $\\lim_{x \\to +\\infty} y = 2$ nên đường thẳng $y = 2$ là đường tiệm cận ngang của đồ thị hàm số.\nVậy đồ thị hàm số có 3 đường tiệm cận.",
    "imageUrl": "/images/bank/de_03/lt_7.png"
  },
  {
    "id": "bank-hs-de03-14",
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
    "id": "bank-hs-de03-15",
    "difficulty": "nhan_biet",
    "text": "(THPT Bãi Cháy - Quảng Ninh 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ dưới đây:Tiệm cận ngang của đồ thị hàm số là đường thẳng có phương trình",
    "options": [
      "$x = -\\frac{1}{2}$.",
      "$x = 1$.",
      "$y = -\\frac{1}{2}$.",
      "$y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Tiệm cận ngang của đồ thị hàm số là đường thẳng có phương trình $y = 1$.",
    "imageUrl": "/images/bank/de_03/lt_8.png"
  },
  {
    "id": "bank-hs-de03-16",
    "difficulty": "thong_hieu",
    "text": "(Liên trường Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như sau:Hàm số $y = f(x)$ đồng biến trên khoảng nào trong các khoảng sau đây?",
    "options": [
      "$(0;1)$.",
      "$(-3;0)$.",
      "$(2;+\\infty)$.",
      "$(-\\infty;-1)$."
    ],
    "correctIndex": 0,
    "explanation": "Nhìn bảng xét dấu ta thấy trong khoảng $(0;1)$ thì đạo hàm $y' > 0$, do đó hàm số đồng biến trên khoảng $(0;1)$.",
    "imageUrl": "/images/bank/de_03/lt_9.png"
  },
  {
    "id": "bank-hs-de03-17",
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
    "id": "bank-hs-de03-18",
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
    "id": "bank-hs-de03-19",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Tìm hệ số $b, c$ để hàm số $y = \\frac{2}{cx+b}$ có đồ thị như hình vẽ sau:",
    "options": [
      "$\\begin{cases} b=2 \\\\ c=-1 \\end{cases}$.",
      "$\\begin{cases} b=1 \\\\ c=-1 \\end{cases}$.",
      "$\\begin{cases} b=2 \\\\ c=1 \\end{cases}$.",
      "$\\begin{cases} b=-2 \\\\ c=1 \\end{cases}$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số có tiệm cận đứng là $x = -\\frac{b}{c} = 2 \\Rightarrow b = -2c$.\nĐồ thị đi qua điểm $(0;-1) \\Rightarrow \\frac{2}{b} = -1 \\Rightarrow b = -2 \\Rightarrow c = 1$.\nVậy $b = -2, c = 1$.",
    "imageUrl": "/images/bank/de_03/lt_10.png"
  },
  {
    "id": "bank-hs-de03-20",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ dưới đâyHàm số đã cho đồng biến trên khoảng nào trong các khoảng sau đây?",
    "options": [
      "$(-\\infty;1)$.",
      "$(1;2)$.",
      "$(2;+\\infty)$.",
      "$(-1;1)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ đồ thị hàm số, ta thấy nhánh đồ thị đi lên từ trái sang phải trên $(2;+\\infty)$, do đó hàm số đồng biến trên $(2;+\\infty)$.",
    "imageUrl": "/images/bank/de_03/lt_11.png"
  },
  {
    "id": "bank-hs-de03-21",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm như sauHàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-\\infty;2)$.",
      "$(3;4)$.",
      "$(4;+\\infty)$.",
      "$(1;3)$."
    ],
    "correctIndex": 1,
    "explanation": "Hàm số đã cho nghịch biến trên khoảng $(3;4)$ vì $y' < 0$ với mọi $x \\in (3;4)$.",
    "imageUrl": "/images/bank/de_03/lt_12.png"
  },
  {
    "id": "bank-hs-de03-22",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu của đạo hàm như sau:Số điểm cực trị của hàm số đã cho là",
    "options": [
      "$3$.",
      "$4$.",
      "$2$.",
      "$5$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng xét dấu, đạo hàm đổi dấu 4 lần khi qua các điểm $x = -3, x = -2, x = 3, x = 5$. Do đó số điểm cực trị của hàm số đã cho là 4.",
    "imageUrl": "/images/bank/de_03/lt_13.png"
  },
  {
    "id": "bank-hs-de03-23",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Hình vẽ sau đây là đồ thị của hàm số nào trong các hàm số dưới đây?",
    "options": [
      "$y = x^3+2x+1$.",
      "$y = x^3-2x+1$.",
      "$y = -x^3+2x+1$.",
      "$y = x^3-2x^2+1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào hình vẽ suy ra hệ số $a > 0$ (Loại C).\nĐồ thị của hàm số có 2 điểm cực trị nên phương trình $y' = 0$ có 2 nghiệm phân biệt (Loại A).\nĐồ thị của hàm số giao với trục $Ox$ là $y = 0 \\Leftrightarrow x^3-2x^2+1=0 \\Leftrightarrow x = 1, x \\approx -0{,}6, x \\approx 1{,}6$ (Loại D).\nVậy chọn B ($y = x^3 - 2x + 1$).",
    "imageUrl": "/images/bank/de_03/lt_14.png"
  },
  {
    "id": "bank-hs-de03-24",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có đồ thị như hình vẽ bên dướiHàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;2)$.",
      "$(0;+\\infty)$.",
      "$(2;+\\infty)$.",
      "$(-\\infty;2)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị ta thấy, đồ thị hàm số đi lên từ trái sang phải trong khoảng $(2;+\\infty)$ nên hàm số đã cho đồng biến trên khoảng $(2;+\\infty)$.",
    "imageUrl": "/images/bank/de_03/lt_15.png"
  },
  {
    "id": "bank-hs-de03-25",
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
    "id": "bank-hs-de03-26",
    "difficulty": "thong_hieu",
    "text": "(THPT Nguyễn Trãi - Hà Nội 2026) Cho hàm số $y = f(x)$ có đồ thị trên đoạn $[-2;2]$ như hình vẽGọi giá trị lớn nhất và giá trị nhỏ nhất của hàm số trên đoạn $[-2;2]$ lần lượt là $M$ và $m$. Khi đó $M-m$ bằng",
    "options": [
      "$5$.",
      "$-4$.",
      "$0$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $M = 1, m = -4$. Vậy $M - m = 1 - (-4) = 5$.",
    "imageUrl": "/images/bank/de_03/lt_16.png"
  },
  {
    "id": "bank-hs-de03-27",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Nhân Tông - Hà Nội 2026) Cho hàm số $y = \\frac{ax+b}{cx+d}$ ($ac \\ne 0; ad-bc \\ne 0$) có đồ thị như hình vẽ dưới đây. Trong các hệ số $a, b, c, d$ có bao nhiêu số dương?",
    "options": [
      "$2$.",
      "$1$.",
      "$3$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Tiệm cận đứng là: $x = 1$ nên $-\\frac{d}{c} = 1 \\Rightarrow d = -c$.\nTiệm cận ngang là: $y = -1$ nên $\\frac{a}{c} = -1 \\Rightarrow a = -c$.\nĐồ thị cắt trục tung tại điểm có tung độ bằng $-2$ nên $\\frac{b}{d} = -2 \\Rightarrow b = -2d = 2c$.\nTa xét 2 trường hợp dấu của $c$:\n- TH1: Nếu $c > 0$ thì $b > 0; a < 0; d < 0$ suy ra có 2 số dương.\n- TH2: Nếu $c < 0$ thì $b < 0; a > 0; d > 0$ suy ra có 2 số dương.\nVậy trong mọi trường hợp đều có 2 số dương.",
    "imageUrl": "/images/bank/de_03/lt_17.png"
  },
  {
    "id": "bank-hs-de03-28",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Hà Nội 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình vẽ. Hàm số đã cho có bao nhiêu điểm cực trị.",
    "options": [
      "$2$.",
      "$3$.",
      "$1$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên trên thì hàm số có hai điểm cực trị ($x = -1$ và $x = 1$).",
    "imageUrl": "/images/bank/de_03/lt_18.png"
  },
  {
    "id": "bank-hs-de03-29",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Hà Nội 2026) Cho hàm số $y = f(x)$ liên tục trên $[-3;2]$ và có bảng biến thiên như hình dưới đây. Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và giá trị nhỏ nhất của hàm số $y = f(x)$ trên $[-1;2]$. Giá trị của $M+m$ bằng bao nhiêu",
    "options": [
      "$2$.",
      "$3$.",
      "$4$.",
      "$1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên của hàm số, trên đoạn $[-1;2]$ ta thấy hàm số đạt GTLN tại $x = -1$ là $M = 3$, hàm số đạt GTNN tại $x = 0$ là $m = 0$. Suy ra $M + m = 3 + 0 = 3$.",
    "imageUrl": "/images/bank/de_03/lt_19.png"
  },
  {
    "id": "bank-hs-de03-30",
    "difficulty": "thong_hieu",
    "text": "(Cụm Hải Phòng 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau.Hàm số $y = f(x)$ đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(2;4)$.",
      "$(3;+\\infty)$.",
      "$(1;2)$.",
      "$(0;1)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ bảng biến thiên, hàm số $y = f(x)$ đồng biến trên các khoảng $(1;2)$ và $(2;3)$.",
    "imageUrl": "/images/bank/de_03/lt_20.png"
  },
  {
    "id": "bank-hs-de03-31",
    "difficulty": "thong_hieu",
    "text": "(Cụm Hải Phòng 2026) Cho hàm số $f(x)$ liên tục trên đoạn $[0;3]$ và có đồ thị như hình vẽ bên. Gọi $M$ và $m$ lần lượt là giá trị lớn nhất và nhỏ nhất của hàm số đã cho trên đoạn $[0;3]$. Giá trị của $M+m$ bằng",
    "options": [
      "$3$.",
      "$5$.",
      "$2$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào đồ thị, ta có: $M = \\max_{[0;3]} f(x) = f(3) = 3$ và $m = \\min_{[0;3]} f(x) = f(2) = -2 \\Rightarrow M + m = 3 - 2 = 1$.",
    "imageUrl": "/images/bank/de_03/lt_21.png"
  },
  {
    "id": "bank-hs-de03-32",
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
    "id": "bank-hs-de03-33",
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
    "id": "bank-hs-de03-34",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng biến thiên như sauHàm số đạt cực đại tại điểm",
    "options": [
      "$x = 1$.",
      "$x = -3$.",
      "$x = -2$.",
      "$x = 0$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên, ta thấy hàm số $y = f(x)$ đạt cực đại tại điểm $x = 0$.",
    "imageUrl": "/images/bank/de_03/lt_22.png"
  },
  {
    "id": "bank-hs-de03-35",
    "difficulty": "thong_hieu",
    "text": "(THPT Lê Quý Đôn - Đống Đa 2026) Cho đồ thị hàm số như hình vẽ bên dưới. Đường tiệm cận ngang của đồ thị hàm số là",
    "options": [
      "$x = 2$.",
      "$y = 2$.",
      "$x = 1$.",
      "$y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Đường tiệm cận ngang của đồ thị hàm số là $y = 1$.",
    "imageUrl": "/images/bank/de_03/lt_23.png"
  },
  {
    "id": "bank-hs-de03-36",
    "difficulty": "van_dung",
    "text": "(Sở Lạng Sơn 2026) Cho hàm số $y = f(x)$ có đồ thị như bên dướiHàm số đã cho nghịch biến trên khoảng nào trong các khoảng sau đây?",
    "options": [
      "$(0;2)$.",
      "$(-1;1)$.",
      "$(-1;0)$.",
      "$(1;2)$."
    ],
    "correctIndex": 2,
    "explanation": "Từ đồ thị ta thấy hàm số nghịch biến trên khoảng $(-1;0)$.",
    "imageUrl": "/images/bank/de_03/lt_24.png"
  },
  {
    "id": "bank-hs-de03-37",
    "difficulty": "van_dung",
    "text": "(Sở Thái Nguyên 2026) Tiệm cận ngang của đồ thị hàm số $y = \\frac{2x-5}{x+2}$ là đường thẳng có phương trình",
    "options": [
      "$y = 2$.",
      "$y = -2$.",
      "$y = \\frac{5}{2}$.",
      "$y = \\frac{2}{5}$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} y = \\lim_{x \\to \\pm\\infty} \\frac{2x-5}{x+2} = 2$ suy ra đường thẳng $y = 2$ là tiệm cận ngang của đồ thị hàm số."
  },
  {
    "id": "bank-hs-de03-38",
    "difficulty": "van_dung",
    "text": "(Sở Thái Nguyên 2026) Cho hàm số $f(x)$ có bảng biến thiên như hình vẽ. Giá trị cực tiểu của hàm số đã cho là",
    "options": [
      "$y = 2$.",
      "$y = -1$.",
      "$y = 0$.",
      "$y = 1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên ta thấy dấu của $f'(x)$ đổi dấu từ âm sang dương khi qua $x = 0$ nên giá trị cực tiểu của hàm số là $y_{\\text{CT}} = f(0) = 1$.",
    "imageUrl": "/images/bank/de_03/lt_25.png"
  },
  {
    "id": "bank-hs-de03-39",
    "difficulty": "van_dung",
    "text": "(Sở Thái Nguyên 2026) Cho hàm số đa thức bậc bốn $y = f(x)$ có đồ thị như hình vẽ. Hàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(-1;+\\infty)$.",
      "$(-\\infty;-1)$.",
      "$(-1;0)$.",
      "$(-\\infty;1)$."
    ],
    "correctIndex": 1,
    "explanation": "Quan sát đồ thị ta thấy hàm số đồng biến trên các khoảng $(-\\infty;-1)$ và $(0;1)$.",
    "imageUrl": "/images/bank/de_03/lt_26.png"
  },
  {
    "id": "bank-hs-de03-40",
    "difficulty": "van_dung",
    "text": "(Sở Thái Nguyên 2026) Đồ thị của hàm số nào dưới đây có dạng như đường cong trong hình vẽ?",
    "options": [
      "$y = \\frac{2x-1}{x+2}$.",
      "$y = \\frac{x^2-1}{2x-1}$.",
      "$y = -x^3+3x+1$.",
      "$y = x^3-3x+1$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào hình dạng đồ thị ta có: đồ thị là của hàm số bậc 3: $y = ax^3+bx^2+cx+d$ và có hệ số $a > 0$ nên chọn đáp án D ($y = x^3 - 3x + 1$).",
    "imageUrl": "/images/bank/de_03/lt_27.png"
  },
  {
    "id": "bank-hs-de03-41",
    "difficulty": "van_dung",
    "text": "(Cụm trường Thanh Hóa 2026) Đường tiệm cận ngang đồ thị hàm số $y = \\frac{3x-1}{x-2}$ là",
    "options": [
      "$y = 2$.",
      "$x = 3$.",
      "$y = 3$.",
      "$x = 2$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $\\lim_{x \\to \\pm\\infty} y = \\lim_{x \\to \\pm\\infty} \\frac{3x-1}{x-2} = 3$ suy ra đường thẳng $y = 3$ là tiệm cận ngang của đồ thị hàm số."
  },
  {
    "id": "bank-hs-de03-42",
    "difficulty": "van_dung",
    "text": "(Cụm trường Thanh Hóa 2026) Cho hàm số $y = f(x)$ có đạo hàm $f'(x) = (x-1)(x-2)^2(x-3)^3$. Số điểm cực trị của hàm số $y = f(x)$ là",
    "options": [
      "$2$.",
      "$3$.",
      "$1$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Điều kiện xác định: $D = \\mathbb{R}$.\n$y' = 0 \\Leftrightarrow (x-1)(x-2)^2(x-3)^3 = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = 2 \\\\ x = 3 \\end{bmatrix}$.\nTa có bảng biến thiên:\nDựa vào bảng biến thiên ta thấy hàm số có $2$ điểm cực trị (tại $x = 1$ và $x = 3$, qua $x=2$ đạo hàm không đổi dấu).",
    "explanationImageUrl": "/images/bank/de_03/lt_28.png"
  },
  {
    "id": "bank-hs-de03-43",
    "difficulty": "van_dung",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu đạo hàm như hình vẽ bên dưới. Hàm số đã cho có bao nhiêu điểm cực đại?",
    "options": [
      "$3$.",
      "$2$.",
      "$0$.",
      "$1$."
    ],
    "correctIndex": 3,
    "explanation": "Đạo hàm đổi dấu 1 lần từ dương sang âm và $y = f(x)$ liên tục trên $\\mathbb{R}$ nên hàm số có 1 điểm cực đại.",
    "imageUrl": "/images/bank/de_03/lt_29.png"
  },
  {
    "id": "bank-hs-de03-44",
    "difficulty": "van_dung",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Cho hàm số $y = f(x)$ liên tục trên $[-1;+\\infty)$ và có đồ thị như hình vẽ. Tìm giá trị lớn nhất của hàm số $y = f(x)$ trên $[1;4]$.",
    "options": [
      "$0$.",
      "$1$.",
      "$4$.",
      "$3$."
    ],
    "correctIndex": 3,
    "explanation": "Giá trị lớn nhất của hàm số $y = f(x)$ trên $[1;4]$ là $y = 3$ đạt khi $x = 1$ và $x = 3$.",
    "imageUrl": "/images/bank/de_03/lt_30.png"
  },
  {
    "id": "bank-hs-de03-45",
    "difficulty": "van_dung",
    "text": "(THPT Lê Thánh Tông - HCM 2026) Biết rằng đồ thị hàm số $y = \\frac{ax+1}{bx-2}$ có tiệm cận đứng là $x=2$ và tiệm cận ngang là $y=3$. Hiệu $a-2b$ có giá trị là",
    "options": [
      "$4$.",
      "$0$.",
      "$1$.",
      "$5$."
    ],
    "correctIndex": 2,
    "explanation": "$y = \\frac{ax+1}{bx-2}$. Ta có tiệm cận đứng là $x = \\frac{2}{b} = 2 \\Rightarrow b = 1$.\nTiệm cận ngang là $y = \\frac{a}{b} = a = 3 \\Rightarrow a = 3$.\nSuy ra $a - 2b = 3 - 2 = 1$."
  },
  {
    "id": "bank-hs-de04-1",
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
    "id": "bank-hs-de04-2",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Sở Phú Thọ 2026) Cho hàm số $f(x)$ có bảng biến thiên như sau:Giá trị cực đại của hàm số đã cho bằng",
    "options": [
      "$2$.",
      "$-2$.",
      "$-3$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên, giá trị cực đại của hàm số đã cho bằng $2$ tại $x = 3$.",
    "imageUrl": "/images/bank/de_04/lt_1.png"
  },
  {
    "id": "bank-hs-de04-3",
    "difficulty": "nhan_biet",
    "text": "(Sở Hà Nội 2026) Cho hàm số $y=f(x)$ có đồ thị như hình vẽ. Tổng của giá trị lớn nhất và giá trị nhỏ nhất của hàm số đã cho trên đoạn $[-2;2]$ bằng",
    "options": [
      "$-1$.",
      "$-6$.",
      "$0$.",
      "$-5$."
    ],
    "correctIndex": 1,
    "explanation": "Giá trị lớn nhất của hàm số đã cho trên đoạn $[-2;2]$ là $-1$.\nGiá trị nhỏ nhất của hàm số đã cho trên đoạn $[-2;2]$ là $-5$.\nVậy tổng là $-1 - 5 = -6$.",
    "imageUrl": "/images/bank/de_04/lt_2.png"
  },
  {
    "id": "bank-hs-de04-4",
    "difficulty": "nhan_biet",
    "text": "(Sở Hà Nội 2026) Cho hàm số $y = f(x)$ có đạo hàm trên $\\mathbb{R}$ và có bảng xét dấu của $f'(x)$ như sau:Số điểm cực trị của hàm số $y = f(x)$ là",
    "options": [
      "$3$.",
      "$1$.",
      "$2$.",
      "$0$."
    ],
    "correctIndex": 2,
    "explanation": "$f'(x)$ đổi dấu khi đi qua các điểm $x = -3; x = 2$ nên hàm số đã cho có hai điểm cực trị.",
    "imageUrl": "/images/bank/de_04/lt_3.png"
  },
  {
    "id": "bank-hs-de04-5",
    "difficulty": "nhan_biet",
    "text": "(Cụm trường Bắc Ninh 2026) Cho hàm số $y=f(x)$ xác định trên $\\mathbb{R}\\setminus\\{-1\\}$, liên tục trên mỗi khoảng xác định và có bảng biến thiên như hình sau:Hỏi đồ thị hàm số có tổng tất cả bao nhiêu đường tiệm cận đứng và tiệm cận ngang?",
    "options": [
      "$0$.",
      "$3$.",
      "$1$.",
      "$2$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên, ta xét giới hạn tại vô cực: $\\lim_{x \\to -\\infty} y = 2$ và $\\lim_{x \\to +\\infty} y = -1$, suy ra đồ thị có hai đường tiệm cận ngang là $y = 2$ và $y = -1$.\nXét giới hạn tại điểm gián đoạn: $\\lim_{x \\to (-1)^-} y = -\\infty$, suy ra đồ thị có một đường tiệm cận đứng là $x = -1$.\nVậy đồ thị hàm số có tổng cộng 3 đường tiệm cận đứng và ngang.",
    "imageUrl": "/images/bank/de_04/lt_4.png"
  },
  {
    "id": "bank-hs-de04-6",
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
    "id": "bank-hs-de04-7",
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
    "id": "bank-hs-de04-8",
    "difficulty": "nhan_biet",
    "text": "(Sở Tuyên Quang 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(-26;6)$.",
      "$(-\\infty;-1)$.",
      "$(3;+\\infty)$.",
      "$(-1;2)$."
    ],
    "correctIndex": 3,
    "explanation": "Dựa vào bảng biến thiên ta nhận thấy hàm số đã cho nghịch biến trên khoảng $(-1;3)$, mà $(-1;2) \\subset (-1;3)$ nên hàm số đã cho nghịch biến trên khoảng $(-1;2)$.",
    "imageUrl": "/images/bank/de_04/lt_5.png"
  },
  {
    "id": "bank-hs-de04-9",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ liên tục trên đoạn $[-2;3]$ và có đồ thị trong hình bên. Giá trị lớn nhất của hàm số $y = f(x)$ trên đoạn $[-2;3]$ bằng bao nhiêu?",
    "options": [
      "$1$.",
      "$3$.",
      "$-3$.",
      "$2$."
    ],
    "correctIndex": 3,
    "explanation": "Giá trị lớn nhất của hàm số trên đoạn $[-2;3]$ là $2$.",
    "imageUrl": "/images/bank/de_04/lt_6.png"
  },
  {
    "id": "bank-hs-de04-10",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho đồng biến trên khoảng nào sau đây?",
    "options": [
      "$(-3;6)$.",
      "$(6;+\\infty)$.",
      "$(-1;+\\infty)$.",
      "$(-\\infty;5)$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên ta kết luận: Hàm số đồng biến trên các khoảng $(-\\infty;-3)$ và $(6;+\\infty)$.",
    "imageUrl": "/images/bank/de_04/lt_7.png"
  },
  {
    "id": "bank-hs-de04-11",
    "difficulty": "nhan_biet",
    "text": "(Sở Ninh Bình 2026) Đường cong trong hình vẽ bên là đồ thị của hàm số nào sau đây?",
    "options": [
      "$y = \\frac{2x+3}{x-1}$.",
      "$y = \\frac{x+1}{x-1}$.",
      "$y = \\frac{x-1}{x+1}$.",
      "$y = \\frac{x+1}{3x-3}$."
    ],
    "correctIndex": 1,
    "explanation": "Ta thấy đồ thị hàm số có tiệm cận đứng $x = 1$ và tiệm cận ngang $y = 1$ nên chọn $y = \\frac{x+1}{x-1}$.",
    "imageUrl": "/images/bank/de_04/lt_8.png"
  },
  {
    "id": "bank-hs-de04-12",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Cho hàm số $y = ax^3+bx^2+cx+d$ ($a \\ne 0$) có đồ thị như hình vẽ bên dưới. Điểm cực tiểu của hàm số đã cho là",
    "options": [
      "$y = 3$.",
      "$y = -1$.",
      "$x = 1$.",
      "$x = -1$."
    ],
    "correctIndex": 2,
    "explanation": "Điểm cực tiểu của hàm số đã cho là $x = 1$.",
    "imageUrl": "/images/bank/de_04/lt_9.png"
  },
  {
    "id": "bank-hs-de04-13",
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
    "id": "bank-hs-de04-14",
    "difficulty": "nhan_biet",
    "text": "(Sở Hưng Yên 2026) Hàm số $y = x^3-3x+2026$ nghịch biến trên khoảng nào dưới đây?",
    "options": [
      "$(1;+\\infty)$.",
      "$(-\\infty;1)$.",
      "$(-2;2)$.",
      "$(-1;1)$."
    ],
    "correctIndex": 3,
    "explanation": "Tập xác định: $D = \\mathbb{R}$.\nTa có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên:\nHàm số nghịch biến trên khoảng $(-1;1)$.",
    "explanationImageUrl": "/images/bank/de_04/lt_10.png"
  },
  {
    "id": "bank-hs-de04-15",
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
    "id": "bank-hs-de04-16",
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
    "id": "bank-hs-de04-17",
    "difficulty": "thong_hieu",
    "text": "(Chuyên KHTN HN 2026) Cho hàm số $y=f(x)$. Đồ thị hàm số $f'(x)$ là đồ thị một hàm số bậc ba như hình vẽSố điểm cực tiểu của hàm số $y=f(x)$ là",
    "options": [
      "$3$.",
      "$1$.",
      "$2$.",
      "$0$."
    ],
    "correctIndex": 3,
    "explanation": "Từ đồ thị hàm số $f'(x)$ ta thấy: $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = 2 \\end{bmatrix}$.\nTa có bảng biến thiên:\nDựa vào bảng biến thiên ta thấy hàm số không có điểm cực tiểu (chỉ có $1$ điểm cực đại tại $x = -1$).",
    "imageUrl": "/images/bank/de_04/lt_11.png",
    "explanationImageUrl": "/images/bank/de_04/lt_12.png"
  },
  {
    "id": "bank-hs-de04-18",
    "difficulty": "thong_hieu",
    "text": "(Sở Quảng Ninh 2026) Cho hàm số $y = f(x)$ xác định và liên tục trên $\\mathbb{R}\\setminus\\{-1\\}$, có bảng biến thiên như sau.Khẳng định nào sau đây là đúng?",
    "options": [
      "Đồ thị hàm số có tiệm cận đứng $y=-1$ và tiệm cận ngang $x=-2$.",
      "Đồ thị hàm số có duy nhất một tiệm cận.",
      "Đồ thị hàm số có ba tiệm cận.",
      "Đồ thị hàm số có tiệm cận đứng $x=-1$ và tiệm cận ngang $y=-2$."
    ],
    "correctIndex": 3,
    "explanation": "Đồ thị hàm số có tiệm cận đứng $x = -1$ và tiệm cận ngang $y = -2$.",
    "imageUrl": "/images/bank/de_04/lt_13.png"
  },
  {
    "id": "bank-hs-de04-19",
    "difficulty": "thong_hieu",
    "text": "(Sở Quảng Ninh 2026) Hàm số $y = f(x) = x^3-3x^2-9x+7$ có cực đại là",
    "options": [
      "$-1$.",
      "$12$.",
      "$3$.",
      "$-20$."
    ],
    "correctIndex": 1,
    "explanation": "$y' = f'(x) = 3x^2 - 6x - 9 = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = 3 \\end{bmatrix}$.\nTa có bảng biến thiên:\nHàm số $y = f(x) = x^3 - 3x^2 - 9x + 7$ có giá trị cực đại là $y_{\\text{CĐ}} = 12$ tại $x = -1$.",
    "explanationImageUrl": "/images/bank/de_04/lt_14.png"
  },
  {
    "id": "bank-hs-de04-20",
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
    "id": "bank-hs-de04-21",
    "difficulty": "thong_hieu",
    "text": "(THPT Ngô Quyền - Hải Phòng 2026) Cho hàm số $y=f(x)$ có bảng biến thiên như sau:Khẳng định nào sau đây sai?",
    "options": [
      "Hàm số có giá trị cực tiểu bằng $-1$.",
      "Hàm số có giá trị cực đại bằng $-1$.",
      "Hàm số có 2 điểm cực đại.",
      "Hàm số có 3 điểm cực trị."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào bảng biến thiên ta thấy: Hàm số có 3 cực trị. Trong đó có 2 cực đại và 1 cực tiểu. Hàm số có giá trị cực tiểu bằng $-1$ và có giá trị cực đại bằng $3$. Do đó phương án \"Hàm số có giá trị cực đại bằng $-1$\" là sai.",
    "imageUrl": "/images/bank/de_04/lt_15.png"
  },
  {
    "id": "bank-hs-de04-22",
    "difficulty": "thong_hieu",
    "text": "(Sở Lào Cai 2026) Cho hàm số $y = f(x) = \\frac{ax^2+bx+c}{mx+n}$ có đồ thị như hình vẽ dưới đây. Đường tiệm cận xiên của đồ thị hàm số đã cho có phương trình là",
    "options": [
      "$y = x-2$.",
      "$y = 3x+1$.",
      "$y = x+3$.",
      "$y = x-1$."
    ],
    "correctIndex": 2,
    "explanation": "Phương trình đường tiệm cận xiên có dạng $y = a'x+b'$.\nĐường tiệm cận xiên đi qua các điểm $(0;3)$ và $(1;4)$ nên ta có hệ phương trình:\n$\\begin{cases} b' = 3 \\\\ a'+b' = 4 \\end{cases} \\Leftrightarrow \\begin{cases} b' = 3 \\\\ a' = 1 \\end{cases}$.\nVậy $y = x+3$ là phương trình đường tiệm cận xiên của đồ thị hàm số.",
    "imageUrl": "/images/bank/de_04/lt_16.png"
  },
  {
    "id": "bank-hs-de04-23",
    "difficulty": "thong_hieu",
    "text": "(Sở Lào Cai 2026) Cho hàm số $f(x)$ có bảng biến thiên như sauHàm số đã cho đạt cực đại tại",
    "options": [
      "$x = 1$.",
      "$x = -2$.",
      "$x = 2$.",
      "$x = -1$."
    ],
    "correctIndex": 3,
    "explanation": "Từ bảng biến thiên suy ra hàm số đạt cực đại tại $x = -1$.",
    "imageUrl": "/images/bank/de_04/lt_17.png"
  },
  {
    "id": "bank-hs-de04-24",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Phú Thọ 2026) Cho hàm số bậc bốn có đồ thị như hình vẽ dưới đây:Điểm cực tiểu của đồ thị hàm số đã cho là",
    "options": [
      "$x = 2$.",
      "$A(0;-1)$.",
      "$x = 0$.",
      "$x = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị, điểm cực tiểu của đồ thị hàm số đã cho là $A(0;-1)$.",
    "imageUrl": "/images/bank/de_04/lt_18.png"
  },
  {
    "id": "bank-hs-de04-25",
    "difficulty": "thong_hieu",
    "text": "(Sở Thanh Hóa 2026) Cho hàm số bậc ba $y = ax^3+bx^2+cx+d$ ($a,b,c,d \\in \\mathbb{R}$) có đồ thị như hình bên. Mệnh đề nào dưới đây đúng?",
    "options": [
      "$a<0, d>0$.",
      "$a>0, d>0$.",
      "$a>0, d<0$.",
      "$a<0, d<0$."
    ],
    "correctIndex": 0,
    "explanation": "Nhánh phải đồ thị đi xuống nên $a < 0$.\nĐồ thị cắt trục tung tại điểm có tung độ dương nên $d > 0$.\nDo đó $a < 0, d > 0$.",
    "imageUrl": "/images/bank/de_04/lt_19.png"
  },
  {
    "id": "bank-hs-de04-26",
    "difficulty": "thong_hieu",
    "text": "(THPT Trần Phú - Phú Thọ 2026) Cho hàm số bậc bốn có đồ thị như hình vẽ dưới đây:Điểm cực tiểu của đồ thị hàm số đã cho là",
    "options": [
      "$x = 2$.",
      "$A(0;-1)$.",
      "$x = 0$.",
      "$x = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Dựa vào đồ thị, điểm cực tiểu của đồ thị hàm số đã cho là $A(0;-1)$.",
    "imageUrl": "/images/bank/de_04/lt_20.png"
  },
  {
    "id": "bank-hs-de04-27",
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
    "id": "bank-hs-de04-28",
    "difficulty": "thong_hieu",
    "text": "(Sở Hà Tĩnh 2026) Cho hàm số có đồ thị như hình vẽ. Mệnh đề nào sau đây sai",
    "options": [
      "Hàm số đồng biến trên khoảng $(0;2)$.",
      "Hàm số nghịch biến trên khoảng $(2;+\\infty)$.",
      "Hàm số đồng biến trên khoảng $(0;4)$.",
      "Hàm số nghịch biến trên khoảng $(-1;0)$."
    ],
    "correctIndex": 2,
    "explanation": "Dựa vào đồ thị hàm số ta có hàm số đồng biến trên khoảng $(0;4)$ là sai (vì trên khoảng $(2;4)$ hàm số nghịch biến).",
    "imageUrl": "/images/bank/de_04/lt_21.png"
  },
  {
    "id": "bank-hs-de04-29",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như hình bên dướiHàm số đồng biến trên khoảng nào trong các khoảng dưới đây",
    "options": [
      "$(2;3)$.",
      "$(0;3)$.",
      "$(-1;2)$.",
      "$(3;4)$."
    ],
    "correctIndex": 0,
    "explanation": "Dựa vào bảng biến thiên, hàm số đồng biến trên khoảng $(1;3)$, do đó hàm số đồng biến trên $(2;3) \\subset (1;3)$.",
    "imageUrl": "/images/bank/de_04/lt_22.png"
  },
  {
    "id": "bank-hs-de04-30",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Xác định tiệm cận đứng của đồ thị hàm số $y = \\frac{ax+b}{cx+d}$ có dạng như hình dưới.",
    "options": [
      "$x = 1$.",
      "$x = -1$.",
      "$y = 1$.",
      "$y = -1$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $\\lim_{x \\to (-1)^-} f(x) = -\\infty$ và $\\lim_{x \\to (-1)^+} f(x) = +\\infty$ nên $x = -1$ là tiệm cận đứng của đồ thị hàm số.",
    "imageUrl": "/images/bank/de_04/lt_23.png"
  },
  {
    "id": "bank-hs-de04-31",
    "difficulty": "thong_hieu",
    "text": "(Sở TT Huế 2026) Xác định giá trị nhỏ nhất trên đoạn $[-1;1]$ của hàm số $y = f(x)$ có đồ thị như hình dưới.",
    "options": [
      "$-1$.",
      "$-4$.",
      "$0$.",
      "$-2$."
    ],
    "correctIndex": 1,
    "explanation": "Giá trị nhỏ nhất trên đoạn $[-1;1]$ của hàm số $y = f(x)$ có đồ thị trên là $-4$ đạt tại $x = -1$.",
    "imageUrl": "/images/bank/de_04/lt_24.png"
  },
  {
    "id": "bank-hs-de04-32",
    "difficulty": "thong_hieu",
    "text": "(Sở Cao Bằng 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = (x+1)(2x-5)^2$ với mọi $x \\in \\mathbb{R}$. Hàm số đã cho nghịch biến trên khoảng nào?",
    "options": [
      "$\\left(-1;\\frac{5}{2}\\right)$.",
      "$(-\\infty;-1)$.",
      "$(-3;1)$.",
      "$(-1;+\\infty)$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có $f'(x) = (x+1)(2x-5)^2 = 0 \\Leftrightarrow \\begin{bmatrix} x = -1 \\\\ x = \\frac{5}{2} \\end{bmatrix}$.\nBảng biến thiên:\nVậy hàm số đã cho nghịch biến trên khoảng $(-\\infty;-1)$.",
    "explanationImageUrl": "/images/bank/de_04/lt_25.png"
  },
  {
    "id": "bank-hs-de04-33",
    "difficulty": "thong_hieu",
    "text": "(Cụm chuyên môn 4 Đắk Lắk 2026) Cho hàm số $f(x)$ có đạo hàm $f'(x) = x(x-1)(x-2)^3, \\forall x \\in \\mathbb{R}$. Số điểm cực trị của hàm số đã cho là",
    "options": [
      "$1$.",
      "$5$.",
      "$2$.",
      "$3$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có $f'(x) = 0 \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = 1 \\\\ x = 2\\text{ (nghiệm kép)} \\end{bmatrix}$.\nBảng biến thiên:\nVậy hàm số có hai điểm cực trị (tại $x = 0$ và $x = 1$).",
    "explanationImageUrl": "/images/bank/de_04/lt_26.png"
  },
  {
    "id": "bank-hs-de04-34",
    "difficulty": "thong_hieu",
    "text": "(Cụm chuyên môn 4 Đắk Lắk 2026) Cho hàm số $y = f(x)$ có bảng biến thiên như sau:Hàm số đã cho đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0;1)$.",
      "$(1;+\\infty)$.",
      "$(-1;1)$.",
      "$(-1;0)$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số đã cho đồng biến trên khoảng $(-\\infty;-1)$ và $(0;1)$.",
    "imageUrl": "/images/bank/de_04/lt_27.png"
  },
  {
    "id": "bank-hs-de04-35",
    "difficulty": "thong_hieu",
    "text": "(HSG 12 - Thanh Hóa 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = x(x+2)(x+3), \\forall x \\in \\mathbb{R}$ và $f(1)+f(-2) = f(3)+f(0)$. Giá trị nhỏ nhất, giá trị lớn nhất của hàm số $y=f(x)$ trên đoạn $[-2;3]$ lần lượt là",
    "options": [
      "$f(0)$ và $f(-2)$.",
      "$f(3)$ và $f(0)$.",
      "$f(0)$ và $f(3)$.",
      "$f(-2)$ và $f(0)$."
    ],
    "correctIndex": 2,
    "explanation": "Ta có bảng biến thiên trên $[-2;3]$:\nGiá trị nhỏ nhất là $f(0)$. Mặt khác $f(1) + f(-2) = f(3) + f(0)$ và $f(1) > f(0) \\Rightarrow f(-2) < f(3)$.\nDo đó giá trị lớn nhất của hàm số là $f(3)$.",
    "explanationImageUrl": "/images/bank/de_04/lt_28.png"
  },
  {
    "id": "bank-hs-de04-36",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Thanh Hóa 2026) Đồ thị hàm số nào dưới đây có dạng như đường cong hình bên?",
    "options": [
      "$y = -x^3+3x-1$.",
      "$y = x^3-x+2$.",
      "$y = x^3-x-2$.",
      "$y = x^4-2x^2-2$."
    ],
    "correctIndex": 2,
    "explanation": "Đồ thị có dạng trong hình là đồ thị hàm số bậc ba $y = ax^3+bx^2+cx+d$ có hệ số $a > 0$ và cắt trục $Oy$ tại điểm có tung độ âm nên chọn C ($y = x^3 - x - 2$).",
    "imageUrl": "/images/bank/de_04/lt_29.png"
  },
  {
    "id": "bank-hs-de04-37",
    "difficulty": "van_dung",
    "text": "(Cụm chuyên môn 4 Đắk Lắk 2026) Một chất điểm chuyển động thẳng được xác định bởi phương trình $s = t^3-3t^2+5t+2$, trong đó $t$ tính bằng giây và $s$ tính bằng mét. Gia tốc của chuyển động khi $t=3$ là",
    "options": [
      "$17\\text{ m/s}^2$.",
      "$12\\text{ m/s}^2$.",
      "$24\\text{ m/s}^2$.",
      "$14\\text{ m/s}^2$."
    ],
    "correctIndex": 1,
    "explanation": "Vận tốc của chuyển động: $v = s' = 3t^2-6t+5$.\nGia tốc của chuyển động: $a = v' = s'' = 6t-6$.\nGia tốc của chuyển động khi $t = 3$ là $a = 6\\cdot 3 - 6 = 12\\text{ (m/s}^2\\text{)}$."
  },
  {
    "id": "bank-hs-de04-38",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Cho hàm số $y = 6x-\\sqrt{9x^2-x+10}-\\frac{8}{\\sqrt{4-x}}$ có đồ thị $(C)$, đường tiệm cận xiên của $(C)$ cắt trục $Ox$ tại $A$, cắt trục $Oy$ tại $B$. Diện tích tam giác $OAB$ bằng",
    "options": [
      "$\\frac{1}{36}$.",
      "$\\frac{-1}{324}$.",
      "$\\frac{1}{324}$.",
      "$\\frac{1}{648}$."
    ],
    "correctIndex": 3,
    "explanation": "Điều kiện xác định của hàm số: $\\begin{cases} 9x^2-x+10 \\ge 0 \\\\ 4-x > 0 \\end{cases} \\Leftrightarrow x < 4$.\nGọi tiệm cận xiên có phương trình $y = ax+b$.\n$a = \\lim_{x \\to -\\infty} \\frac{6x-\\sqrt{9x^2-x+10}-\\frac{8}{\\sqrt{4-x}}}{x} = \\lim_{x \\to -\\infty} \\left(6+\\sqrt{9-\\frac{1}{x}+\\frac{10}{x^2}}-\\frac{8}{x\\sqrt{4-x}}\\right) = 9$.\n$b = \\lim_{x \\to -\\infty} (y - ax) = \\lim_{x \\to -\\infty} \\left(-3x-\\sqrt{9x^2-x+10}-\\frac{8}{\\sqrt{4-x}}\\right) = -\\frac{1}{6}$.\nSuy ra tiệm cận xiên có phương trình $y = 9x - \\frac{1}{6}$.\nTiệm cận xiên cắt trục $Ox$ tại $A\\left(\\frac{1}{54};0\\right)$, cắt trục $Oy$ tại $B\\left(0;-\\frac{1}{6}\\right)$.\nDiện tích tam giác $OAB$ bằng $\\frac{1}{2} \\cdot \\frac{1}{54} \\cdot \\frac{1}{6} = \\frac{1}{648}$."
  },
  {
    "id": "bank-hs-de04-39",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Cho hàm số $y=f(x)$ có đồ thị như hình vẽHàm số $y = f\\left(\\sqrt{x^2-4x+4}-2x\\right)$ đồng biến trên khoảng",
    "options": [
      "$\\left(0;\\frac{2}{3}\\right)$.",
      "$\\left(\\frac{2}{3};+\\infty\\right)$.",
      "$(-4;-2)$.",
      "$(-\\infty;0)$."
    ],
    "correctIndex": 0,
    "explanation": "Đặt $u(x) = \\sqrt{x^2-4x+4} - 2x = |x-2| - 2x = \\begin{cases} -x-2 & \\text{khi } x \\ge 2 \\\\ 2-3x & \\text{khi } x < 2 \\end{cases}$.\nTa có: $u'(x) < 0, \\forall x \\ne 2$.\nĐồ thị hàm số $u(x)$:\nXét hàm số $y = f(u)$ có $y' = u'(x) \\cdot f'(u)$. Hàm số đồng biến khi $y' > 0 \\Leftrightarrow f'(u) < 0$ (do $u'(x) < 0$).\nDựa vào đồ thị hàm số $y = f(x)$, $f'(u) < 0 \\Leftrightarrow 0 < u < 2$.\nDựa vào đồ thị $u(x)$ suy ra: $0 < u(x) < 2 \\Leftrightarrow 0 < x < \\frac{2}{3}$.\nVậy hàm số đồng biến trên khoảng $\\left(0;\\frac{2}{3}\\right)$.",
    "imageUrl": "/images/bank/de_04/lt_30.png",
    "explanationImageUrl": "/images/bank/de_04/lt_31.png"
  },
  {
    "id": "bank-hs-de04-40",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Cho hàm số $y = \\frac{-4x^2+8x-7}{2x-1}$ có đồ thị là $(C)$. Gọi $A, B$ là hai điểm cực trị của $(C)$, khoảng cách giữa hai điểm $A, B$ là:",
    "options": [
      "$68$.",
      "$2\\sqrt{17}$.",
      "$\\sqrt{17}$.",
      "$17$."
    ],
    "correctIndex": 1,
    "explanation": "Điều kiện: $x \\ne \\frac{1}{2}$.\nTa có: $y' = \\frac{-8x^2+8x+6}{(2x-1)^2} = 0 \\Leftrightarrow x = \\frac{3}{2}$ hoặc $x = -\\frac{1}{2}$.\nDo đó toạ độ 2 điểm cực trị là $A\\left(\\frac{3}{2};-2\\right)$ và $B\\left(-\\frac{1}{2};6\\right)$.\nVậy khoảng cách giữa hai điểm $A, B$ là $AB = \\sqrt{\\left(-\\frac{1}{2}-\\frac{3}{2}\\right)^2 + (6 - (-2))^2} = 2\\sqrt{17}$."
  },
  {
    "id": "bank-hs-de04-41",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Một nhà máy cần sản xuất một loại sản phẩm cung cấp cho thị trường trong nước. Biết rằng chi phí để sản xuất $x$ sản phẩm trong một ngày bao gồm: (1) Chi phí cho công việc hành chính chung là 2500 (nghìn đồng); (2) Các loại chi phí khác là $\\frac{25x^2}{10000}$ (nghìn đồng); (3) Chi phí sản xuất là $4x$ (nghìn đồng). Lợi nhuận thu được trên một sản phẩm được tính bằng giá bán mỗi sản phẩm trừ đi tổng chi phí của mỗi một sản phẩm. Giả sử giá bán mỗi sản phẩm không thay đổi, để lợi nhuận thu được trên mỗi một sản phẩm là lớn nhất, trong một ngày nhà máy cần sản xuất số lượng sản phẩm là",
    "options": [
      "$1000000$.",
      "$1612$.",
      "$1000$.",
      "$1613$."
    ],
    "correctIndex": 2,
    "explanation": "Gọi $C(x)$ là tổng chi phí của mỗi một sản phẩm (đơn vị: nghìn đồng).\nKhi đó: $C(x) = \\frac{2500 + \\frac{25x^2}{10000} + 4x}{x} = \\frac{2500}{x} + \\frac{x}{400} + 4$.\nĐể lợi nhuận trên mỗi sản phẩm lớn nhất thì chi phí $C(x)$ phải nhỏ nhất.\nXét $C(x)$ với $x > 0$: $C'(x) = -\\frac{2500}{x^2} + \\frac{1}{400} = 0 \\Leftrightarrow x^2 = 1000000 \\Leftrightarrow x = 1000$.\nBảng biến thiên:\nDo đó hàm số $C(x)$ nhỏ nhất khi $x = 1000$.\nVậy trong 1 ngày, nhà máy cần sản xuất $1000$ sản phẩm.",
    "explanationImageUrl": "/images/bank/de_04/lt_32.png"
  },
  {
    "id": "bank-hs-de04-42",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Cho hàm số $y = \\frac{7-4x}{2x-1}$ có đồ thị $(H)$, điểm $M \\in (H)$. Tổng khoảng cách từ điểm $M$ đến hai đường tiệm cận của $(H)$ nhỏ nhất là.",
    "options": [
      "$2$.",
      "$2\\sqrt{5}$.",
      "$2+\\sqrt{5}$.",
      "$\\sqrt{10}$."
    ],
    "correctIndex": 3,
    "explanation": "Tập xác định: $D = \\mathbb{R}\\setminus\\left\\{\\frac{1}{2}\\right\\}$.\nDễ có tiệm cận đứng $d_1: x = \\frac{1}{2} \\Leftrightarrow 2x-1 = 0$ và tiệm cận ngang $d_2: y = -2 \\Leftrightarrow y+2 = 0$.\nGọi $M(x_0;y_0) \\in (H)$.\nTa có $d(M, d_1) + d(M, d_2) = \\frac{|2x_0-1|}{2} + |y_0+2| = \\frac{|2x_0-1|}{2} + \\left|\\frac{7-4x_0}{2x_0-1}+2\\right| = \\frac{|2x_0-1|}{2} + \\frac{5}{|2x_0-1|} \\ge 2\\sqrt{\\frac{5}{2}} = \\sqrt{10}$.\nĐẳng thức xảy ra khi và chỉ khi $\\frac{|2x_0-1|}{2} = \\frac{5}{|2x_0-1|} \\Leftrightarrow x_0 = \\frac{1-\\sqrt{10}}{2} \\lor x_0 = \\frac{1+\\sqrt{10}}{2}$."
  },
  {
    "id": "bank-hs-de04-43",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Quảng Ninh 2026) Cho hàm số $y = 2x^3+(m+1)x^2-12x+1$ ($m$ là tham số), tập hợp các giá trị $m$ để đường thẳng đi qua hai điểm cực trị của đồ thị hàm số vuông góc với đường thẳng $x-9y = 0$.",
    "options": [
      "$\\{-2;4\\}$.",
      "$\\{-4;2\\}$.",
      "$\\{2\\}$.",
      "$\\{-4\\}$."
    ],
    "correctIndex": 1,
    "explanation": "Ta có: $y' = 6x^2+2(m+1)x-12$.\nĐể hàm số có hai điểm cực trị thì phương trình $y'=0$ có hai nghiệm phân biệt: $\\Delta' > 0 \\Leftrightarrow (m+1)^2+72 > 0$ (Đúng với mọi $m$).\nPhương trình đường thẳng đi qua hai điểm cực trị của hàm số là: $y = \\left(-\\frac{1}{9}m^2-\\frac{2}{9}m-\\frac{73}{9}\\right)x + \\frac{1}{3}(2m+5)$.\nĐể đường thẳng đi qua hai điểm cực trị vuông góc với đường thẳng $x-9y = 0 \\Leftrightarrow y = \\frac{1}{9}x$ thì: $\\frac{1}{9}\\left(-\\frac{1}{9}m^2-\\frac{2}{9}m-\\frac{73}{9}\\right) = -1 \\Leftrightarrow m^2+2m-8 = 0 \\Leftrightarrow m = -4$ hoặc $m = 2$.\nVậy $m \\in \\{-4;2\\}$."
  },
  {
    "id": "bank-hs-de04-44",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Hải Phòng 2026) Gọi $m, M$ lần lượt là giá trị nhỏ nhất và giá trị lớn nhất của hàm số $f(x) = \\frac{1}{2}x-\\sqrt{x+1}$ trên đoạn $[0;3]$. Tính tổng $S = 2m+3M$.",
    "options": [
      "$S = -\\frac{7}{2}$.",
      "$S = -\\frac{3}{2}$.",
      "$S = -3$.",
      "$S = 4$."
    ],
    "correctIndex": 0,
    "explanation": "Xét hàm số $f(x) = \\frac{1}{2}x-\\sqrt{x+1}$ trên đoạn $[0;3]$.\nTa có: $f'(x) = \\frac{1}{2} - \\frac{1}{2\\sqrt{x+1}} = \\frac{\\sqrt{x+1}-1}{2\\sqrt{x+1}} = 0 \\Leftrightarrow \\sqrt{x+1} = 1 \\Leftrightarrow x = 0$.\n$f(0) = -1; f(3) = -\\frac{1}{2}$.\nSuy ra $m = -1, M = -\\frac{1}{2}$.\nVậy $S = 2m+3M = 2(-1) + 3\\left(-\\frac{1}{2}\\right) = -\\frac{7}{2}$."
  },
  {
    "id": "bank-hs-de04-45",
    "difficulty": "van_dung",
    "text": "(HSG 12 - Thanh Hóa 2026) Cho hàm số $y=f(x)$ có đạo hàm $f'(x) = x(x+2)(x+3), \\forall x \\in \\mathbb{R}$ và $f(1)+f(-2) = f(3)+f(0)$. Giá trị nhỏ nhất, giá trị lớn nhất của hàm số $y=f(x)$ trên đoạn $[-2;3]$ lần lượt là.",
    "options": [
      "$f(0)$ và $f(3)$.",
      "$f(3)$ và $f(0)$.",
      "$f(-2)$ và $f(0)$.",
      "$f(0)$ và $f(-2)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $f'(x) = x(x+2)(x+3) = 0 \\Leftrightarrow \\begin{bmatrix} x = 0 \\\\ x = -2 \\\\ x = -3 \\end{bmatrix}$.\nBảng biến thiên trên $[-2;3]$:\nDựa vào bảng biến thiên, giá trị nhỏ nhất của hàm số trên $[-2;3]$ là $f(0)$.\nMặt khác $f(1) + f(-2) = f(3) + f(0)$ và $f(1) > f(0) \\Rightarrow f(-2) < f(3)$.\nDo đó giá trị lớn nhất của hàm số là $f(3)$.",
    "explanationImageUrl": "/images/bank/de_04/lt_33.png"
  }
];
