/**
 * Ngân hàng câu hỏi Toán học phong phú cho Mini Game Trung Thu & Thử Thách 60s.
 * - 100% gồm câu Nhận biết (Dễ) và Thông hiểu (Trung bình).
 * - Loại bỏ hoàn toàn câu Vận dụng và các câu Tích phân/Nguyên hàm (do học sinh chưa học tới kỳ 2).
 */
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";

export const NGAN_HANG_CAU_HOI_GAME: TreocoCauHoi[] = [
  {
    "id": "bank-nb-1",
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
    "id": "bank-nb-2",
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
    "id": "bank-nb-3",
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
    "id": "bank-nb-4",
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
    "id": "bank-nb-5",
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
    "id": "bank-nb-6",
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
    "id": "bank-nb-7",
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
    "id": "bank-nb-8",
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
    "id": "bank-nb-9",
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
    "id": "bank-nb-10",
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
    "id": "bank-nb-11",
    "difficulty": "nhan_biet",
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
    "id": "bank-nb-12",
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
    "id": "bank-nb-13",
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
    "id": "bank-nb-14",
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
    "id": "bank-nb-15",
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
    "id": "bank-nb-16",
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
    "id": "bank-nb-17",
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
    "id": "bank-nb-18",
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
    "id": "bank-nb-19",
    "difficulty": "nhan_biet",
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
    "id": "bank-nb-20",
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
    "id": "bank-nb-21",
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
    "id": "bank-nb-22",
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
    "id": "bank-nb-23",
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
    "id": "bank-nb-24",
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
    "id": "bank-nb-25",
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
    "id": "bank-nb-26",
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
    "id": "bank-nb-27",
    "difficulty": "nhan_biet",
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
    "id": "bank-nb-28",
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
    "id": "bank-nb-29",
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
    "id": "bank-nb-30",
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
    "id": "bank-nb-31",
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
    "id": "bank-nb-32",
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
    "id": "bank-nb-33",
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
    "id": "bank-nb-34",
    "difficulty": "nhan_biet",
    "text": "Tập xác định của hàm số $y = \\sqrt{x - 2}$ là:",
    "options": [
      "$[2; +\\infty)$",
      "$(2; +\\infty)$",
      "$(-\\infty; 2]$",
      "$[-2; +\\infty)$"
    ],
    "correctIndex": 0,
    "explanation": "Điều kiện xác định: $x - 2 \\ge 0 \\Leftrightarrow x \\ge 2$. Vậy tập xác định là $[2; +\\infty)$."
  },
  {
    "id": "bank-nb-35",
    "difficulty": "nhan_biet",
    "text": "Nghiệm của phương trình $\\log_2(x - 1) = 3$ là:",
    "options": [
      "$x = 9$",
      "$x = 7$",
      "$x = 8$",
      "$x = 10$"
    ],
    "correctIndex": 0,
    "explanation": "$\\log_2(x - 1) = 3 \\Leftrightarrow x - 1 = 2^3 = 8 \\Leftrightarrow x = 9$."
  },
  {
    "id": "bank-nb-36",
    "difficulty": "nhan_biet",
    "text": "Nghiệm của phương trình $3^{x+1} = 27$ là:",
    "options": [
      "$x = 2$",
      "$x = 3$",
      "$x = 1$",
      "$x = 4$"
    ],
    "correctIndex": 0,
    "explanation": "$3^{x+1} = 27 = 3^3 \\Leftrightarrow x + 1 = 3 \\Leftrightarrow x = 2$."
  },
  {
    "id": "bank-nb-37",
    "difficulty": "nhan_biet",
    "text": "Đạo hàm của hàm số $y = x^4 - 2x^2 + 1$ là:",
    "options": [
      "$y' = 4x^3 - 4x$",
      "$y' = 4x^3 - 2x$",
      "$y' = x^3 - 4x$",
      "$y' = 4x^3 - 4$"
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = (x^4)' - 2(x^2)' + (1)' = 4x^3 - 4x$."
  },
  {
    "id": "bank-nb-38",
    "difficulty": "nhan_biet",
    "text": "Đạo hàm của hàm số $y = \\sin(2x)$ là:",
    "options": [
      "$y' = 2\\cos(2x)$",
      "$y' = \\cos(2x)$",
      "$y' = -2\\cos(2x)$",
      "$y' = -\\cos(2x)$"
    ],
    "correctIndex": 0,
    "explanation": "Áp dụng $(\\sin u)' = u' \\cdot \\cos u$, với $u = 2x \\Rightarrow y' = 2\\cos(2x)$."
  },
  {
    "id": "bank-nb-39",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, toạ độ trung điểm $M$ của đoạn thẳng $AB$ với $A(1; 2; 3)$ và $B(3; 0; 1)$ là:",
    "options": [
      "$M(2; 1; 2)$",
      "$M(4; 2; 4)$",
      "$M(1; -1; -1)$",
      "$M(2; 2; 2)$"
    ],
    "correctIndex": 0,
    "explanation": "$x_M = \\frac{1+3}{2} = 2; y_M = \\frac{2+0}{2} = 1; z_M = \\frac{3+1}{2} = 2$. Vậy $M(2; 1; 2)$."
  },
  {
    "id": "bank-nb-40",
    "difficulty": "nhan_biet",
    "text": "Trong mặt phẳng toạ độ $Oxy$, khoảng cách giữa hai điểm $A(1; 1)$ và $B(4; 5)$ bằng:",
    "options": [
      "$5$",
      "$25$",
      "$\\sqrt{7}$",
      "$4$"
    ],
    "correctIndex": 0,
    "explanation": "$AB = \\sqrt{(4-1)^2 + (5-1)^2} = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$."
  },
  {
    "id": "bank-nb-41",
    "difficulty": "nhan_biet",
    "text": "Diện tích hình tròn có bán kính $R = 3$ bằng:",
    "options": [
      "$9\\pi$",
      "$6\\pi$",
      "$3\\pi$",
      "$18\\pi$"
    ],
    "correctIndex": 0,
    "explanation": "Diện tích hình tròn là $S = \\pi R^2 = \\pi \\cdot 3^2 = 9\\pi$."
  },
  {
    "id": "bank-nb-42",
    "difficulty": "nhan_biet",
    "text": "Thể tích của khối lập phương có cạnh bằng $a = 3$ là:",
    "options": [
      "$27$",
      "$9$",
      "$18$",
      "$81$"
    ],
    "correctIndex": 0,
    "explanation": "Thể tích khối lập phương: $V = a^3 = 3^3 = 27$."
  },
  {
    "id": "bank-nb-43",
    "difficulty": "nhan_biet",
    "text": "Thể tích của khối chóp có diện tích đáy $B = 6$ và chiều cao $h = 4$ là:",
    "options": [
      "$8$",
      "$24$",
      "$12$",
      "$16$"
    ],
    "correctIndex": 0,
    "explanation": "Thể tích khối chóp là $V = \\frac{1}{3}Bh = \\frac{1}{3} \\cdot 6 \\cdot 4 = 8$."
  },
  {
    "id": "bank-nb-44",
    "difficulty": "nhan_biet",
    "text": "Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 2$. Số hạng thứ 2 là:",
    "options": [
      "$u_2 = 5$",
      "$u_2 = 6$",
      "$u_2 = 1$",
      "$u_2 = 7$"
    ],
    "correctIndex": 0,
    "explanation": "Theo công thức cấp số cộng: $u_2 = u_1 + d = 3 + 2 = 5$."
  },
  {
    "id": "bank-nb-45",
    "difficulty": "nhan_biet",
    "text": "Cho cấp số nhân $(u_n)$ có $u_1 = 2$ và công bội $q = 3$. Số hạng $u_2$ bằng:",
    "options": [
      "$6$",
      "$5$",
      "$8$",
      "$18$"
    ],
    "correctIndex": 0,
    "explanation": "Theo định nghĩa cấp số nhân: $u_2 = u_1 \\cdot q = 2 \\cdot 3 = 6$."
  },
  {
    "id": "bank-nb-46",
    "difficulty": "nhan_biet",
    "text": "Tập nghiệm của bất phương trình $2x - 4 > 0$ là:",
    "options": [
      "$(2; +\\infty)$",
      "$[2; +\\infty)$",
      "$(-\\infty; 2)$",
      "$(-\\infty; -2)$"
    ],
    "correctIndex": 0,
    "explanation": "$2x - 4 > 0 \\Leftrightarrow 2x > 4 \\Leftrightarrow x > 2$. Vậy $S = (2; +\\infty)$."
  },
  {
    "id": "bank-nb-47",
    "difficulty": "nhan_biet",
    "text": "Giá trị của $\\cos(60^\\circ)$ bằng:",
    "options": [
      "$\\frac{1}{2}$",
      "$\\frac{\\sqrt{3}}{2}$",
      "$\\frac{\\sqrt{2}}{2}$",
      "$1$"
    ],
    "correctIndex": 0,
    "explanation": "Giá trị lượng giác cơ bản: $\\cos(60^\\circ) = \\frac{1}{2}$."
  },
  {
    "id": "bank-nb-48",
    "difficulty": "nhan_biet",
    "text": "Giá trị của $\\sin(90^\\circ)$ bằng:",
    "options": [
      "$1$",
      "$0$",
      "$-1$",
      "$\\frac{1}{2}$"
    ],
    "correctIndex": 0,
    "explanation": "Giá trị lượng giác: $\\sin(90^\\circ) = 1$."
  },
  {
    "id": "bank-nb-49",
    "difficulty": "nhan_biet",
    "text": "Gieo một con xúc xắc cân đối, đồng chất. Xác suất xuất hiện mặt $6$ chấm là:",
    "options": [
      "$\\frac{1}{6}$",
      "$\\frac{1}{2}$",
      "$\\frac{1}{3}$",
      "$\\frac{5}{6}$"
    ],
    "correctIndex": 0,
    "explanation": "Không gian mẫu có $6$ kết quả, biến cố xuất hiện mặt $6$ có $1$ kết quả. Xác suất là $\\frac{1}{6}$."
  },
  {
    "id": "bank-nb-50",
    "difficulty": "nhan_biet",
    "text": "Đồ thị hàm số $y = 2x - 3$ cắt trục tung $Oy$ tại điểm có toạ độ là:",
    "options": [
      "$(0; -3)$",
      "$(0; 3)$",
      "$(\\frac{3}{2}; 0)$",
      "$(-3; 0)$"
    ],
    "correctIndex": 0,
    "explanation": "Giao điểm với trục tung ứng với $x = 0 \\Rightarrow y = 2(0) - 3 = -3$. Toạ độ là $(0; -3)$."
  },
  {
    "id": "bank-nb-51",
    "difficulty": "nhan_biet",
    "text": "Số điểm cực trị của hàm số bậc nhất $y = 3x + 1$ là:",
    "options": [
      "$0$",
      "$1$",
      "$2$",
      "$3$"
    ],
    "correctIndex": 0,
    "explanation": "Hàm số bậc nhất có đạo hàm $y' = 3 \\ne 0$ với mọi $x$, do đó không có điểm cực trị."
  },
  {
    "id": "bank-nb-52",
    "difficulty": "nhan_biet",
    "text": "Giá trị của biểu thức $A = \\log_3(9)$ bằng:",
    "options": [
      "$2$",
      "$3$",
      "$1$",
      "$9$"
    ],
    "correctIndex": 0,
    "explanation": "Ta có $9 = 3^2 \\Rightarrow \\log_3(9) = 2$."
  },
  {
    "id": "bank-nb-53",
    "difficulty": "nhan_biet",
    "text": "Rút gọn biểu thức $P = x^2 \\cdot x^3$ (với $x > 0$) ta được:",
    "options": [
      "$x^5$",
      "$x^6$",
      "$x$",
      "$x^8$"
    ],
    "correctIndex": 0,
    "explanation": "Áp dụng quy tắc nhân luỹ thừa cùng cơ số: $x^2 \\cdot x^3 = x^{2+3} = x^5$."
  },
  {
    "id": "bank-th-54",
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
    "id": "bank-th-55",
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
    "id": "bank-th-56",
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
    "id": "bank-th-57",
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
    "id": "bank-th-58",
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
    "id": "bank-th-59",
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
    "id": "bank-th-60",
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
    "id": "bank-th-61",
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
    "id": "bank-th-62",
    "difficulty": "thong_hieu",
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
    "id": "bank-th-63",
    "difficulty": "thong_hieu",
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
    "id": "bank-th-64",
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
    "id": "bank-th-65",
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
    "id": "bank-th-66",
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
    "id": "bank-th-67",
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
    "id": "bank-th-68",
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
    "id": "bank-th-69",
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
    "id": "bank-th-70",
    "difficulty": "thong_hieu",
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
    "id": "bank-th-71",
    "difficulty": "thong_hieu",
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
    "id": "bank-th-72",
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
    "id": "bank-th-73",
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
    "id": "bank-th-74",
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
    "id": "bank-th-75",
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
    "id": "bank-th-76",
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
    "id": "bank-th-77",
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
    "id": "bank-th-78",
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
    "id": "bank-th-79",
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
    "id": "bank-th-80",
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
    "id": "bank-th-81",
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
    "id": "bank-th-82",
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
    "id": "bank-th-83",
    "difficulty": "thong_hieu",
    "text": "Cho hàm số $y = x^3 - 3x^2 + 2$. Điểm cực đại của hàm số là:",
    "options": [
      "$x = 0$",
      "$x = 2$",
      "$x = 1$",
      "$x = -1$"
    ],
    "correctIndex": 0,
    "explanation": "$y' = 3x^2 - 6x = 3x(x - 2)$. $y' = 0 \\Leftrightarrow x = 0$ hoặc $x = 2$. Bảng biến thiên cho thấy $y'$ đổi dấu từ dương sang âm qua $x = 0$, nên $x = 0$ là điểm cực đại."
  },
  {
    "id": "bank-th-84",
    "difficulty": "thong_hieu",
    "text": "Nghiệm của bất phương trình $\\log_2(x) < 3$ là:",
    "options": [
      "$0 < x < 8$",
      "$x < 8$",
      "$x > 8$",
      "$0 < x < 9$"
    ],
    "correctIndex": 0,
    "explanation": "Điều kiện: $x > 0$. Bất phương trình $\\Leftrightarrow x < 2^3 = 8$. Kết hợp điều kiện ta được $0 < x < 8$."
  },
  {
    "id": "bank-th-85",
    "difficulty": "thong_hieu",
    "text": "Cho hàm số $y = \\frac{x - 1}{x + 2}$. Mệnh đề nào sau đây đúng?",
    "options": [
      "Hàm số đồng biến trên từng khoảng $(-\\infty; -2)$ và $(-2; +\\infty)$",
      "Hàm số nghịch biến trên từng khoảng $(-\\infty; -2)$ và $(-2; +\\infty)$",
      "Hàm số đồng biến trên $\\mathbb{R}$",
      "Hàm số nghịch biến trên $\\mathbb{R} \\setminus \\{-2\\}$"
    ],
    "correctIndex": 0,
    "explanation": "Tập xác định: $D = \\mathbb{R} \\setminus \\{-2\\}$. Đạo hàm $y' = \\frac{1 \\cdot 2 - (-1) \\cdot 1}{(x+2)^2} = \\frac{3}{(x+2)^2} > 0, \\forall x \\ne -2$. Do đó hàm số đồng biến trên từng khoảng xác định."
  },
  {
    "id": "bank-th-86",
    "difficulty": "thong_hieu",
    "text": "Giá trị nhỏ nhất của hàm số $y = x^2 - 4x + 7$ trên đoạn $[0; 3]$ bằng:",
    "options": [
      "$3$",
      "$7$",
      "$4$",
      "$10$"
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = 2x - 4 = 0 \\Leftrightarrow x = 2 \\in [0; 3]$. Tính: $y(0) = 7, y(2) = 3, y(3) = 4$. Vậy $\\min_{[0;3]} y = 3$ tại $x = 2$."
  },
  {
    "id": "bank-th-87",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, phương trình mặt cầu tâm $I(1; -2; 3)$ bán kính $R = 4$ là:",
    "options": [
      "$(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$",
      "$(x + 1)^2 + (y - 2)^2 + (z + 3)^2 = 16$",
      "$(x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 4$",
      "$(x + 1)^2 + (y - 2)^2 + (z + 3)^2 = 4$"
    ],
    "correctIndex": 0,
    "explanation": "Phương trình mặt cầu tâm $I(a; b; c)$ bán kính $R$: $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2 \\Rightarrow (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$."
  },
  {
    "id": "bank-th-89",
    "difficulty": "thong_hieu",
    "text": "Số giao điểm của đồ thị hàm số $y = x^3 - 3x$ và trục hoành là:",
    "options": [
      "$3$",
      "$2$",
      "$1$",
      "$0$"
    ],
    "correctIndex": 0,
    "explanation": "Phương trình hoành độ giao điểm: $x^3 - 3x = 0 \\Leftrightarrow x(x^2 - 3) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm\\sqrt{3}$. Có $3$ nghiệm phân biệt nên có $3$ giao điểm."
  },
  {
    "id": "bank-th-90",
    "difficulty": "thong_hieu",
    "text": "Một hộp chứa $4$ quả cầu đỏ và $6$ quả cầu xanh. Lấy ngẫu nhiên $1$ quả. Xác suất lấy được quả cầu đỏ là:",
    "options": [
      "$\\frac{2}{5}$",
      "$\\frac{3}{5}$",
      "$\\frac{1}{4}$",
      "$\\frac{1}{6}$"
    ],
    "correctIndex": 0,
    "explanation": "Tổng số quả cầu là $4 + 6 = 10$. Xác suất lấy quả đỏ: $P = \\frac{4}{10} = \\frac{2}{5}$."
  },
  {
    "id": "bank-th-91",
    "difficulty": "thong_hieu",
    "text": "Hàm số $y = -x^4 + 2x^2 + 3$ có bao nhiêu điểm cực trị?",
    "options": [
      "$3$",
      "$1$",
      "$2$",
      "$0$"
    ],
    "correctIndex": 0,
    "explanation": "$y' = -4x^3 + 4x = -4x(x^2 - 1) = 0 \\Leftrightarrow x = 0, x = 1, x = -1$. Vì $y'$ đổi dấu qua cả $3$ nghiệm đơn này nên hàm số có $3$ điểm cực trị."
  },
  {
    "id": "bank-th-92",
    "difficulty": "thong_hieu",
    "text": "Đường thẳng nào dưới đây là tiệm cận ngang của đồ thị hàm số $y = \\frac{3x + 1}{x - 2}$?",
    "options": [
      "$y = 3$",
      "$x = 2$",
      "$y = -\\frac{1}{2}$",
      "$x = 3$"
    ],
    "correctIndex": 0,
    "explanation": "$\\lim_{x \\to \\pm\\infty} \\frac{3x + 1}{x - 2} = 3$. Vậy tiệm cận ngang là đường thẳng $y = 3$."
  },
  {
    "id": "bank-th-93",
    "difficulty": "thong_hieu",
    "text": "Tổng số đường tiệm cận đứng và tiệm cận ngang của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ là:",
    "options": [
      "$2$",
      "$1$",
      "$3$",
      "$0$"
    ],
    "correctIndex": 0,
    "explanation": "Tiệm cận đứng: $x = -1$ (mẫu bằng 0). Tiệm cận ngang: $y = 2$ (giới hạn vô cực). Tổng cộng có 2 đường tiệm cận."
  },
  {
    "id": "bank-th-94",
    "difficulty": "thong_hieu",
    "text": "Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $B$, $SA \\perp (ABC)$. Góc giữa $SB$ và mặt phẳng đáy $(ABC)$ là:",
    "options": [
      "$\\widehat{SBA}$",
      "$\\widehat{SAB}$",
      "$\\widehat{SCA}$",
      "$\\widehat{ASB}$"
    ],
    "correctIndex": 0,
    "explanation": "Vì $SA \\perp (ABC)$ nên hình chiếu của $SB$ lên $(ABC)$ là $AB$. Do đó góc giữa $SB$ và $(ABC)$ là $\\widehat{SBA}$."
  },
  {
    "id": "bank-ext-nb-101",
    "difficulty": "nhan_biet",
    "text": "Với $a$ là số thực dương tùy ý, biểu thức $\\sqrt{a^3}$ bằng:",
    "options": [
      "$a^{\\frac{3}{2}}$.",
      "$a^{\\frac{2}{3}}$.",
      "$a^6$.",
      "$a^{\\frac{1}{3}}$."
    ],
    "correctIndex": 0,
    "explanation": "Theo định nghĩa lũy thừa với số mũ hữu tỉ: $\\sqrt[n]{a^m} = a^{\\frac{m}{n}}$. Với căn bậc hai thì $n=2, m=3$ nên $\\sqrt{a^3} = a^{\\frac{3}{2}}$."
  },
  {
    "id": "bank-ext-nb-102",
    "difficulty": "nhan_biet",
    "text": "Đạo hàm của hàm số $y = e^{2x}$ là:",
    "options": [
      "$y' = 2e^{2x}$.",
      "$y' = e^{2x}$.",
      "$y' = \\frac{1}{2}e^{2x}$.",
      "$y' = 2xe^{2x-1}$."
    ],
    "correctIndex": 0,
    "explanation": "Áp dụng công thức đạo hàm hàm hợp $(e^u)' = u' \\cdot e^u$, ta có: $(e^{2x})' = (2x)' \\cdot e^{2x} = 2e^{2x}$."
  },
  {
    "id": "bank-ext-nb-103",
    "difficulty": "nhan_biet",
    "text": "Tập xác định $D$ của hàm số $y = \\log_3(x - 4)$ là:",
    "options": [
      "$D = (4; +\\infty)$.",
      "$D = [4; +\\infty)$.",
      "$D = (-\\infty; 4)$.",
      "$D = \\mathbb{R} \\setminus \\{4\\}$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số logarit $\\log_a u$ xác định khi $u > 0$. Do đó $x - 4 > 0 \\Leftrightarrow x > 4$. Vậy $D = (4; +\\infty)$."
  },
  {
    "id": "bank-ext-nb-104",
    "difficulty": "nhan_biet",
    "text": "Nghiệm của phương trình $2^{x-1} = 8$ là:",
    "options": [
      "$x = 4$.",
      "$x = 3$.",
      "$x = 2$.",
      "$x = 5$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $2^{x-1} = 8 = 2^3 \\Leftrightarrow x - 1 = 3 \\Leftrightarrow x = 4$."
  },
  {
    "id": "bank-ext-nb-105",
    "difficulty": "nhan_biet",
    "text": "Với mọi số thực dương $a, b$, biểu thức $\\log(ab)$ bằng:",
    "options": [
      "$\\log a + \\log b$.",
      "$\\log a \\cdot \\log b$.",
      "$\\log a - \\log b$.",
      "$\\frac{\\log a}{\\log b}$."
    ],
    "correctIndex": 0,
    "explanation": "Theo tính chất của logarit: logarit của một tích bằng tổng các logarit, tức là $\\log(ab) = \\log a + \\log b$."
  },
  {
    "id": "bank-ext-nb-106",
    "difficulty": "nhan_biet",
    "text": "Đạo hàm của hàm số $y = \\ln(3x)$ trên khoảng $(0; +\\infty)$ là:",
    "options": [
      "$y' = \\frac{1}{x}$.",
      "$y' = \\frac{3}{x}$.",
      "$y' = \\frac{1}{3x}$.",
      "$y' = 3\\ln(3x)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $y' = \\frac{(3x)'}{3x} = \\frac{3}{3x} = \\frac{1}{x}$."
  },
  {
    "id": "bank-ext-nb-107",
    "difficulty": "nhan_biet",
    "text": "Tập xác định của hàm số $y = x^{\\frac{1}{3}}$ là:",
    "options": [
      "$(0; +\\infty)$.",
      "$[0; +\\infty)$.",
      "$\\mathbb{R}$.",
      "$\\mathbb{R} \\setminus \\{0\\}$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số lũy thừa $y = x^\\alpha$ với $\\alpha$ không nguyên có tập xác định là khoảng $(0; +\\infty)$."
  },
  {
    "id": "bank-ext-nb-108",
    "difficulty": "nhan_biet",
    "text": "Phương trình $\\log_2 x = 4$ có nghiệm là:",
    "options": [
      "$x = 16$.",
      "$x = 8$.",
      "$x = 2$.",
      "$x = 32$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $\\log_2 x = 4 \\Leftrightarrow x = 2^4 = 16$."
  },
  {
    "id": "bank-ext-nb-116",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, cho điểm $A(1; -2; 3)$. Tọa độ hình chiếu vuông góc của $A$ lên mặt phẳng $(Oxy)$ là:",
    "options": [
      "$(1; -2; 0)$.",
      "$(0; 0; 3)$.",
      "$(1; 0; 3)$.",
      "$(0; -2; 3)$."
    ],
    "correctIndex": 0,
    "explanation": "Hình chiếu vuông góc của điểm $A(x; y; z)$ lên mặt phẳng tọa độ $(Oxy)$ có cao độ $z = 0$, giữ nguyên $x$ và $y$. Vậy tọa độ là $(1; -2; 0)$."
  },
  {
    "id": "bank-ext-nb-117",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, mặt cầu $(S): (x-1)^2 + (y+2)^2 + (z-3)^2 = 16$ có bán kính $R$ bằng:",
    "options": [
      "$4$.",
      "$16$.",
      "$8$.",
      "$2$."
    ],
    "correctIndex": 0,
    "explanation": "Phương trình mặt cầu có dạng $(x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$. Ta có $R^2 = 16 \\Rightarrow R = 4$."
  },
  {
    "id": "bank-ext-nb-118",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, một vectơ pháp tuyến của mặt phẳng $(P): 2x - 3y + z - 5 = 0$ là:",
    "options": [
      "$\\vec{n} = (2; -3; 1)$.",
      "$\\vec{n} = (2; 3; 1)$.",
      "$\\vec{n} = (2; -3; -5)$.",
      "$\\vec{n} = (-3; 1; -5)$."
    ],
    "correctIndex": 0,
    "explanation": "Mặt phẳng $Ax + By + Cz + D = 0$ có một vectơ pháp tuyến là $\\vec{n} = (A; B; C) = (2; -3; 1)$."
  },
  {
    "id": "bank-ext-nb-119",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, cho hai điểm $A(1; 2; 3)$ và $B(3; 0; 1)$. Tọa độ trung điểm $M$ của đoạn thẳng $AB$ là:",
    "options": [
      "$M(2; 1; 2)$.",
      "$M(4; 2; 4)$.",
      "$M(1; -1; -1)$.",
      "$M(2; -1; 2)$."
    ],
    "correctIndex": 0,
    "explanation": "Tọa độ trung điểm $M$ là $\\left(\\frac{x_A+x_B}{2}; \\frac{y_A+y_B}{2}; \\frac{z_A+z_B}{2}\\right) = \\left(\\frac{1+3}{2}; \\frac{2+0}{2}; \\frac{3+1}{2}\\right) = (2; 1; 2)$."
  },
  {
    "id": "bank-ext-nb-120",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, vectơ $\\vec{u} = 2\\vec{i} - 3\\vec{j} + \\vec{k}$ có tọa độ là:",
    "options": [
      "$(2; -3; 1)$.",
      "$(2; 3; 1)$.",
      "$(1; -3; 2)$.",
      "$(-2; 3; -1)$."
    ],
    "correctIndex": 0,
    "explanation": "Theo định nghĩa tọa độ vectơ: $\\vec{u} = x\\vec{i} + y\\vec{j} + z\\vec{k} \\Leftrightarrow \\vec{u} = (x; y; z) = (2; -3; 1)$."
  },
  {
    "id": "bank-ext-nb-121",
    "difficulty": "nhan_biet",
    "text": "Trong không gian $Oxyz$, cho $\\vec{a} = (1; 2; 3)$ và $\\vec{b} = (2; 0; -1)$. Tọa độ của vectơ $\\vec{a} + \\vec{b}$ là:",
    "options": [
      "$(3; 2; 2)$.",
      "$(1; -2; -4)$.",
      "$(2; 0; -3)$.",
      "$(3; 2; 4)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $\\vec{a} + \\vec{b} = (1+2; 2+0; 3+(-1)) = (3; 2; 2)$."
  },
  {
    "id": "bank-ext-nb-122",
    "difficulty": "nhan_biet",
    "text": "Thể tích $V$ của khối lập phương có cạnh bằng $3$ là:",
    "options": [
      "$V = 27$.",
      "$V = 9$.",
      "$V = 18$.",
      "$V = 81$."
    ],
    "correctIndex": 0,
    "explanation": "Thể tích khối lập phương cạnh $a$ được tính theo công thức $V = a^3$. Với $a = 3$ thì $V = 3^3 = 27$."
  },
  {
    "id": "bank-ext-nb-123",
    "difficulty": "nhan_biet",
    "text": "Thể tích $V$ của khối chóp có diện tích đáy $B$ và chiều cao $h$ là:",
    "options": [
      "$V = \\frac{1}{3}Bh$.",
      "$V = Bh$.",
      "$V = \\frac{1}{2}Bh$.",
      "$V = 3Bh$."
    ],
    "correctIndex": 0,
    "explanation": "Công thức thể tích khối chóp là $V = \\frac{1}{3} S_{đáy} \\cdot h = \\frac{1}{3}Bh$."
  },
  {
    "id": "bank-ext-nb-124",
    "difficulty": "nhan_biet",
    "text": "Thể tích $V$ của khối trụ có bán kính đáy $r$ và chiều cao $h$ là:",
    "options": [
      "$V = \\pi r^2 h$.",
      "$V = \\frac{1}{3}\\pi r^2 h$.",
      "$V = 2\\pi r h$.",
      "$V = \\frac{4}{3}\\pi r^2 h$."
    ],
    "correctIndex": 0,
    "explanation": "Thể tích khối trụ tròn xoay được tính theo công thức $V = B \\cdot h = \\pi r^2 h$."
  },
  {
    "id": "bank-ext-nb-125",
    "difficulty": "nhan_biet",
    "text": "Thể tích $V$ của khối cầu có bán kính $R$ là:",
    "options": [
      "$V = \\frac{4}{3}\\pi R^3$.",
      "$V = 4\\pi R^2$.",
      "$V = \\frac{1}{3}\\pi R^3$.",
      "$V = \\pi R^3$."
    ],
    "correctIndex": 0,
    "explanation": "Công thức tính thể tích khối cầu bán kính $R$ là $V = \\frac{4}{3}\\pi R^3$."
  },
  {
    "id": "bank-ext-nb-126",
    "difficulty": "nhan_biet",
    "text": "Diện tích toàn phần $S_{tp}$ của hình lập phương có cạnh bằng $2$ là:",
    "options": [
      "$24$.",
      "$16$.",
      "$8$.",
      "$12$."
    ],
    "correctIndex": 0,
    "explanation": "Hình lập phương có 6 mặt bằng nhau, mỗi mặt là hình vuông cạnh $a = 2$. Do đó $S_{tp} = 6 \\cdot a^2 = 6 \\cdot 4 = 24$."
  },
  {
    "id": "bank-ext-nb-127",
    "difficulty": "nhan_biet",
    "text": "Gieo một con súc sắc cân đối và đồng chất một lần. Xác suất để xuất hiện mặt có số chấm là số chẵn bằng:",
    "options": [
      "$\\frac{1}{2}$.",
      "$\\frac{1}{3}$.",
      "$\\frac{1}{6}$.",
      "$\\frac{2}{3}$."
    ],
    "correctIndex": 0,
    "explanation": "Không gian mẫu $n(\\Omega) = 6$. Các mặt chẵn gồm $\\{2; 4; 6\\}$ nên có $3$ kết quả thuận lợi. Xác suất là $P = \\frac{3}{6} = \\frac{1}{2}$."
  },
  {
    "id": "bank-ext-nb-128",
    "difficulty": "nhan_biet",
    "text": "Số cách chọn $2$ học sinh từ một nhóm gồm $10$ học sinh là:",
    "options": [
      "$C_{10}^2$.",
      "$A_{10}^2$.",
      "$10^2$.",
      "$2^{10}$."
    ],
    "correctIndex": 0,
    "explanation": "Chọn không thứ tự $2$ phần tử từ $10$ phần tử là tổ hợp chập $2$ của $10$, ký hiệu là $C_{10}^2$."
  },
  {
    "id": "bank-ext-nb-129",
    "difficulty": "nhan_biet",
    "text": "Có bao nhiêu cách xếp $5$ người ngồi vào một bàn dài gồm $5$ ghế?",
    "options": [
      "$120$.",
      "$24$.",
      "$25$.",
      "$720$."
    ],
    "correctIndex": 0,
    "explanation": "Số cách xếp 5 người vào 5 ghế là số hoán vị của 5 phần tử: $P_5 = 5! = 120$ cách."
  },
  {
    "id": "bank-ext-th-130",
    "difficulty": "thong_hieu",
    "text": "Giá trị lớn nhất của hàm số $f(x) = x^3 - 3x + 2$ trên đoạn $[0; 2]$ bằng:",
    "options": [
      "$4$.",
      "$2$.",
      "$0$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Trên $[0; 2]$ ta nhận $x = 1$.\nTính các giá trị: $f(0) = 2, f(1) = 0, f(2) = 2^3 - 3(2) + 2 = 4$.\nVậy giá trị lớn nhất của hàm số trên đoạn $[0; 2]$ bằng $4$."
  },
  {
    "id": "bank-ext-th-131",
    "difficulty": "thong_hieu",
    "text": "Hàm số $y = -x^3 + 3x^2 - 1$ đồng biến trên khoảng nào dưới đây?",
    "options": [
      "$(0; 2)$.",
      "$(-\\infty; 0)$.",
      "$(2; +\\infty)$.",
      "$(-1; 3)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = -3x^2 + 6x = -3x(x - 2)$.\nCho $y' > 0 \\Leftrightarrow -3x(x - 2) > 0 \\Leftrightarrow 0 < x < 2$.\nVậy hàm số đồng biến trên khoảng $(0; 2)$."
  },
  {
    "id": "bank-ext-th-132",
    "difficulty": "thong_hieu",
    "text": "Đồ thị hàm số $y = \\frac{x+1}{x-2}$ có tọa độ tâm đối xứng là:",
    "options": [
      "$(2; 1)$.",
      "$(1; 2)$.",
      "$(-2; 1)$.",
      "$(2; -1)$."
    ],
    "correctIndex": 0,
    "explanation": "Hàm số $y = \\frac{ax+b}{cx+d}$ có tâm đối xứng là giao điểm của hai đường tiệm cận. Tiệm cận đứng $x = 2$, tiệm cận ngang $y = 1$. Vậy tâm đối xứng là $I(2; 1)$."
  },
  {
    "id": "bank-ext-th-133",
    "difficulty": "thong_hieu",
    "text": "Số giao điểm của đồ thị hàm số $y = x^3 - 3x$ với trục hoành là:",
    "options": [
      "$3$.",
      "$2$.",
      "$1$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Phương trình hoành độ giao điểm: $x^3 - 3x = 0 \\Leftrightarrow x(x^2 - 3) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\pm\\sqrt{3}$. Phương trình có 3 nghiệm phân biệt nên có 3 giao điểm."
  },
  {
    "id": "bank-ext-th-134",
    "difficulty": "thong_hieu",
    "text": "Tiếp tuyến của đồ thị hàm số $y = x^3 - 2x + 1$ tại điểm có hoành độ $x_0 = 1$ có hệ số góc bằng:",
    "options": [
      "$1$.",
      "$2$.",
      "$-1$.",
      "$3$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = 3x^2 - 2$. Hệ số góc của tiếp tuyến tại $x_0 = 1$ là $k = y'(1) = 3(1)^2 - 2 = 1$."
  },
  {
    "id": "bank-ext-th-135",
    "difficulty": "thong_hieu",
    "text": "Đồ thị hàm số $y = x^4 - 2x^2 + 3$ có bao nhiêu điểm cực trị?",
    "options": [
      "$3$.",
      "$1$.",
      "$2$.",
      "$0$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = 4x^3 - 4x = 4x(x^2 - 1) = 0 \\Leftrightarrow x = 0, x = 1, x = -1$. Vì $y' = 0$ có 3 nghiệm đơn phân biệt nên đồ thị hàm số có đúng 3 điểm cực trị."
  },
  {
    "id": "bank-ext-th-136",
    "difficulty": "thong_hieu",
    "text": "Hàm số $y = \\frac{2x-1}{x+1}$ nghịch biến trên khoảng nào?",
    "options": [
      "Không nghịch biến trên khoảng nào.",
      "$(-\\infty; -1)$ và $(-1; +\\infty)$.",
      "$(-1; +\\infty)$.",
      "$\\mathbb{R}$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $y' = \\frac{2(1) - (-1)(1)}{(x+1)^2} = \\frac{3}{(x+1)^2} > 0, \\forall x \\ne -1$. Do đó hàm số luôn đồng biến trên từng khoảng xác định, không nghịch biến trên khoảng nào."
  },
  {
    "id": "bank-ext-th-137",
    "difficulty": "thong_hieu",
    "text": "Tập nghiệm của bất phương trình $3^{2x-1} > 27$ là:",
    "options": [
      "$(2; +\\infty)$.",
      "$(\\frac{3}{2}; +\\infty)$.",
      "$(-\\infty; 2)$.",
      "$(1; +\\infty)$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có $3^{2x-1} > 27 = 3^3$. Vì cơ số $3 > 1$ nên $2x - 1 > 3 \\Leftrightarrow 2x > 4 \\Leftrightarrow x > 2$. Vậy tập nghiệm là $(2; +\\infty)$."
  },
  {
    "id": "bank-ext-th-138",
    "difficulty": "thong_hieu",
    "text": "Nghiệm của phương trình $\\log_2(x^2 - 1) = 3$ là:",
    "options": [
      "$x = \\pm 3$.",
      "$x = 3$.",
      "$x = \\pm\\sqrt{7}$.",
      "$x = \\pm 4$."
    ],
    "correctIndex": 0,
    "explanation": "Phương trình tương đương $x^2 - 1 = 2^3 = 8 \\Leftrightarrow x^2 = 9 \\Leftrightarrow x = \\pm 3$ (thỏa mãn điều kiện $x^2 - 1 > 0$)."
  },
  {
    "id": "bank-ext-th-139",
    "difficulty": "thong_hieu",
    "text": "Cho $\\log_2 3 = a$. Giá trị của $\\log_4 18$ theo $a$ bằng:",
    "options": [
      "$\\frac{1 + 2a}{2}$.",
      "$1 + 2a$.",
      "$\\frac{1+a}{2}$.",
      "$2 + a$."
    ],
    "correctIndex": 0,
    "explanation": "Ta có: $\\log_4 18 = \\frac{1}{2}\\log_2(2 \\cdot 3^2) = \\frac{1}{2}(\\log_2 2 + 2\\log_2 3) = \\frac{1 + 2a}{2}$."
  },
  {
    "id": "bank-ext-th-140",
    "difficulty": "thong_hieu",
    "text": "Tập nghiệm của bất phương trình $\\log_{\\frac{1}{2}}(x - 1) \\ge -1$ là:",
    "options": [
      "$(1; 3]$.",
      "$[1; 3]$.",
      "$[3; +\\infty)$.",
      "$(1; 3)$."
    ],
    "correctIndex": 0,
    "explanation": "Điều kiện xác định: $x - 1 > 0 \\Leftrightarrow x > 1$.\nBất phương trình tương đương: $x - 1 \\le \\left(\\frac{1}{2}\\right)^{-1} = 2 \\Leftrightarrow x \\le 3$.\nKết hợp điều kiện ta được $1 < x \\le 3$, tức tập nghiệm $(1; 3]$."
  },
  {
    "id": "bank-ext-th-141",
    "difficulty": "thong_hieu",
    "text": "Tập nghiệm của phương trình $4^x - 3 \\cdot 2^x + 2 = 0$ là:",
    "options": [
      "$\\{0; 1\\}$.",
      "$\\{1; 2\\}$.",
      "$\\{0; 2\\}$.",
      "$\\{-1; 0\\}$."
    ],
    "correctIndex": 0,
    "explanation": "Đặt $t = 2^x (t > 0)$, phương trình trở thành $t^2 - 3t + 2 = 0 \\Leftrightarrow t = 1$ hoặc $t = 2$.\nVới $t = 1 \\Rightarrow 2^x = 1 \\Rightarrow x = 0$.\nVới $t = 2 \\Rightarrow 2^x = 2 \\Rightarrow x = 1$.\nVậy tập nghiệm là $\\{0; 1\\}$."
  },
  {
    "id": "bank-ext-th-147",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, khoảng cách từ điểm $M(1; 2; -3)$ đến mặt phẳng $(P): 2x - 2y + z - 2 = 0$ bằng:",
    "options": [
      "$\\frac{7}{3}$.",
      "$3$.",
      "$7$.",
      "$\\frac{5}{3}$."
    ],
    "correctIndex": 0,
    "explanation": "Khoảng cách từ $M(x_0; y_0; z_0)$ đến $(P)$ là: $d(M, (P)) = \\frac{|2(1) - 2(2) + (-3) - 2|}{\\sqrt{2^2 + (-2)^2 + 1^2}} = \\frac{|2 - 4 - 3 - 2|}{\\sqrt{9}} = \\frac{|-7|}{3} = \\frac{7}{3}$."
  },
  {
    "id": "bank-ext-th-148",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, mặt cầu có tâm $I(1; -2; 3)$ và tiếp xúc với mặt phẳng $(Oxy)$ có phương trình là:",
    "options": [
      "$(x-1)^2 + (y+2)^2 + (z-3)^2 = 9$.",
      "$(x-1)^2 + (y+2)^2 + (z-3)^2 = 4$.",
      "$(x-1)^2 + (y+2)^2 + (z-3)^2 = 1$.",
      "$(x+1)^2 + (y-2)^2 + (z+3)^2 = 9$."
    ],
    "correctIndex": 0,
    "explanation": "Khoảng cách từ $I(1; -2; 3)$ đến $(Oxy)$ chính là bán kính: $R = |z_I| = |3| = 3$. Vậy phương trình mặt cầu là $(x-1)^2 + (y+2)^2 + (z-3)^2 = 3^2 = 9$."
  },
  {
    "id": "bank-ext-th-149",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, đường thẳng đi qua điểm $A(1; 2; -1)$ và vuông góc với mặt phẳng $(P): x + 2y - 2z + 1 = 0$ có phương trình chính tắc là:",
    "options": [
      "$\\frac{x-1}{1} = \\frac{y-2}{2} = \\frac{z+1}{-2}$.",
      "$\\frac{x+1}{1} = \\frac{y+2}{2} = \\frac{z-1}{-2}$.",
      "$\\frac{x-1}{1} = \\frac{y-2}{-2} = \\frac{z+1}{2}$.",
      "$\\frac{x-1}{1} = \\frac{y-2}{2} = \\frac{z+1}{2}$."
    ],
    "correctIndex": 0,
    "explanation": "Đường thẳng vuông góc với mặt phẳng $(P)$ nên nhận vectơ pháp tuyến $\\vec{n}_P = (1; 2; -2)$ làm vectơ chỉ phương. Đi qua $A(1; 2; -1)$ nên phương trình là $\\frac{x-1}{1} = \\frac{y-2}{2} = \\frac{z+1}{-2}$."
  },
  {
    "id": "bank-ext-th-150",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, góc giữa hai mặt phẳng $(P): x + y - z + 1 = 0$ và $(Q): x - y + z - 2 = 0$ có cosin bằng:",
    "options": [
      "$\\frac{1}{3}$.",
      "$\\frac{\\sqrt{3}}{3}$.",
      "$0$.",
      "$\\frac{2}{3}$."
    ],
    "correctIndex": 0,
    "explanation": "Hai vectơ pháp tuyến: $\\vec{n}_1 = (1; 1; -1), \\vec{n}_2 = (1; -1; 1)$.\nTa có $\\cos((P), (Q)) = \\frac{|\\vec{n}_1 \\cdot \\vec{n}_2|}{|\\vec{n}_1||\\vec{n}_2|} = \\frac{|1(1) + 1(-1) + (-1)(1)|}{\\sqrt{3}\\sqrt{3}} = \\frac{|-1|}{3} = \\frac{1}{3}$."
  },
  {
    "id": "bank-ext-th-151",
    "difficulty": "thong_hieu",
    "text": "Trong không gian $Oxyz$, phương trình mặt phẳng đi qua ba điểm $A(2; 0; 0), B(0; -1; 0), C(0; 0; 3)$ là:",
    "options": [
      "$\\frac{x}{2} + \\frac{y}{-1} + \\frac{z}{3} = 1$.",
      "$\\frac{x}{2} + \\frac{y}{1} + \\frac{z}{3} = 1$.",
      "$\\frac{x}{2} + \\frac{y}{-1} + \\frac{z}{3} = 0$.",
      "$\\frac{x}{-2} + \\frac{y}{-1} + \\frac{z}{3} = 1$."
    ],
    "correctIndex": 0,
    "explanation": "Phương trình mặt phẳng theo đoạn chắn đi qua $A(a; 0; 0), B(0; b; 0), C(0; 0; c)$ là $\\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1$. Với $a=2, b=-1, c=3$ ta có $\\frac{x}{2} + \\frac{y}{-1} + \\frac{z}{3} = 1$."
  },
  {
    "id": "bank-ext-th-152",
    "difficulty": "thong_hieu",
    "text": "Cho hình chóp tam giác đều $S.ABC$ có cạnh đáy bằng $a$, cạnh bên bằng $a$. Thể tích của khối chóp $S.ABC$ bằng:",
    "options": [
      "$\\frac{a^3\\sqrt{2}}{12}$.",
      "$\\frac{a^3\\sqrt{3}}{12}$.",
      "$\\frac{a^3\\sqrt{2}}{4}$.",
      "$\\frac{a^3\\sqrt{6}}{12}$."
    ],
    "correctIndex": 0,
    "explanation": "Đây là tứ diện đều cạnh $a$. Công thức thể tích tứ diện đều cạnh $a$ là $V = \\frac{a^3\\sqrt{2}}{12}$."
  },
  {
    "id": "bank-ext-th-153",
    "difficulty": "thong_hieu",
    "text": "Cho hình nón có bán kính đáy $r = 3$ và chiều cao $h = 4$. Diện tích xung quanh của hình nón đã cho bằng:",
    "options": [
      "$15\\pi$.",
      "$12\\pi$.",
      "$24\\pi$.",
      "$20\\pi$."
    ],
    "correctIndex": 0,
    "explanation": "Đường sinh của hình nón: $l = \\sqrt{r^2 + h^2} = \\sqrt{3^2 + 4^2} = 5$.\nDiện tích xung quanh hình nón: $S_{xq} = \\pi r l = \\pi \\cdot 3 \\cdot 5 = 15\\pi$."
  },
  {
    "id": "bank-ext-th-154",
    "difficulty": "thong_hieu",
    "text": "Cho khối lăng trụ đứng $ABC.A'B'C'$ có đáy $ABC$ là tam giác vuông tại $A$, $AB = a, AC = a\\sqrt{3}$ và cạnh bên $AA' = 2a$. Thể tích khối lăng trụ đã cho bằng:",
    "options": [
      "$a^3\\sqrt{3}$.",
      "$\\frac{a^3\\sqrt{3}}{3}$.",
      "$2a^3\\sqrt{3}$.",
      "$\\frac{a^3\\sqrt{3}}{2}$."
    ],
    "correctIndex": 0,
    "explanation": "Diện tích đáy tam giác vuông: $S = \\frac{1}{2} AB \\cdot AC = \\frac{1}{2} \\cdot a \\cdot a\\sqrt{3} = \\frac{a^2\\sqrt{3}}{2}$.\nThể tích khối lăng trụ: $V = S \\cdot h = \\frac{a^2\\sqrt{3}}{2} \\cdot 2a = a^3\\sqrt{3}$."
  },
  {
    "id": "bank-ext-th-155",
    "difficulty": "thong_hieu",
    "text": "Cho khối chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh $a$, $SA \\perp (ABCD)$ và $SA = 3a$. Thể tích khối chóp $S.ABCD$ bằng:",
    "options": [
      "$a^3$.",
      "$3a^3$.",
      "$\\frac{a^3}{3}$.",
      "$2a^3$."
    ],
    "correctIndex": 0,
    "explanation": "Diện tích đáy hình vuông: $S = a^2$. Chiều cao $h = SA = 3a$.\nThể tích khối chóp: $V = \\frac{1}{3} S \\cdot h = \\frac{1}{3} \\cdot a^2 \\cdot 3a = a^3$."
  },
  {
    "id": "bank-ext-th-156",
    "difficulty": "thong_hieu",
    "text": "Một hộp chứa $4$ viên bi đỏ và $6$ viên bi xanh. Lấy ngẫu nhiên $2$ viên bi từ hộp. Xác suất để lấy được $2$ viên bi cùng màu đỏ bằng:",
    "options": [
      "$\\frac{2}{15}$.",
      "$\\frac{1}{5}$.",
      "$\\frac{4}{15}$.",
      "$\\frac{1}{3}$."
    ],
    "correctIndex": 0,
    "explanation": "Số phần tử của không gian mẫu: $n(\\Omega) = C_{10}^2 = 45$.\nSố cách chọn 2 bi đỏ từ 4 bi đỏ: $n(A) = C_4^2 = 6$.\nXác suất: $P(A) = \\frac{6}{45} = \\frac{2}{15}$."
  },
  {
    "id": "bank-ext-th-157",
    "difficulty": "thong_hieu",
    "text": "Gieo hai con súc sắc cân đối và đồng chất. Xác suất để tổng số chấm trên hai con súc sắc bằng $7$ là:",
    "options": [
      "$\\frac{1}{6}$.",
      "$\\frac{7}{36}$.",
      "$\\frac{5}{36}$.",
      "$\\frac{1}{12}$."
    ],
    "correctIndex": 0,
    "explanation": "Không gian mẫu $n(\\Omega) = 6 \\times 6 = 36$.\nCác cặp có tổng bằng 7: $(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)$ gồm 6 cặp.\nXác suất: $P = \\frac{6}{36} = \\frac{1}{6}$."
  }
];
