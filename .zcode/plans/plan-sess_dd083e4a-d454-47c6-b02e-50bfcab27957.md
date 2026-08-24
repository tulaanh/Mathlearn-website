## Mục tiêu

Tạo **file LaTeX mẫu cho Bài kiểm tra** — `templates/mau-bai-kiem-tra.tex` — có cấu trúc, phong cách và mức hoàn chỉnh ngang bằng file mẫu Tài liệu học tập `templates/mau-tai-lieu.tex`, và chứa **đủ 4 loại câu hỏi** (trắc nghiệm, đúng/sai, trả lời ngắn, tự luận) theo đúng cú pháp mà `lib/latex-parser.ts` chấp nhận.

## Kế hoạch thực hiện

### 1. Tạo file `D:\DayThem\Website\templates\mau-bai-kiem-tra.tex`

- **Preamble + định nghĩa macro y hệt `mau-tai-lieu.tex`** (documentclass, gói lệnh, boolean `showsolutions` để ẩn/hiện đáp án khi in) — file tự biên dịch ra PDF độc lập được.
- **Metadata**:
  - `\doctitle{BÀI KIỂM TRA: TÍNH ĐƠN ĐIỆU CỦA HÀM SỐ}` — cùng chủ đề với `mau-tai-lieu.tex` để 2 mẫu thành cặp lý thuyết + bài kiểm tra.
  - `\docgrade{Lớp 12}`, `\docstatus{draft}`, `\doctopics{tinh-don-dieu-cua-ham-so}`.
  - **`\doctype{test}`** — parser chỉ chấp nhận đúng giá trị `test` (latex-parser.ts:366–369) để mở khóa chế độ chấm điểm thang 10.
- **Khối mở đầu** `\begin{textblock}`: hướng dẫn làm bài (cấu trúc đề 4 phần, thang điểm 10, câu tự luận không chấm tự động) — đóng vai trò như phần "Khởi động/Mục tiêu" của mẫu tài liệu.
- **4 khối quiz, mỗi khối một loại câu hỏi** — nội dung toán lấy từ các câu đã kiểm chứng trong `templates/gemini-code-1787383320808.tex`:
  1. `Phần 1. Trắc nghiệm nhiều phương án` — 2 câu `\begin{mcq}{...}{đáp án 0-based}{điểm}{giải thích}` (hàm \(y = \frac{x^3}{3} - x^2 + x\) đồng biến trên \(\mathbb{R}\); hàm nào nghịch biến trên \(\mathbb{R}\)).
  2. `Phần 2. Câu hỏi Đúng/Sai` — 1 câu `\begin{truefalse}` với 4 mệnh đề `\statement{true/false}{...}` (hàm \(y = x^3 + 3x + 2\)).
  3. `Phần 3. Câu trả lời ngắn` — 2 câu `\shortanswer{câu hỏi}{đáp án}{điểm}{giải thích}` (tính đạo hàm; tìm khoảng đồng biến).
  4. `Phần 4. Câu tự luận` — 1 câu `\essay{câu hỏi}{điểm}{gợi ý}` (chứng minh \(y = 2x - \cos x - 5\) đồng biến trên \(\mathbb{R}\)).
- **Comment hướng dẫn** ngay trong file (giống comment "KHỐI HÌNH ẢNH" của mẫu tài liệu): nói rõ `correctIndex` tính từ 0, câu tự luận luôn bị ép `points: 0` khi nhập, kèm ví dụ `\image{...}{...}{...}` đặt trong câu hỏi ở dạng comment (không để ảnh hoạt động để file nhập được mà không cần chọn file ảnh kèm theo).

### 2. Kiểm tra

- Biên dịch thử PDF bằng pdflatex (trong `templates/` đã có sẵn công cụ biên dịch của `mau-tai-lieu.pdf`) để chắc chắn file đóng gói được và hiển thị đáp án đúng nhờ cờ `showsolutions`.
- Rà lại từng cấu trúc của file mới against `lib/latex-parser.ts`: thứ tự tham số mcq/truefalse/shortanswer/essay, `\doctype{test}`, các khối quiz phải có câu hỏi hợp lệ (yêu cầu của DocumentEditor khi lưu bài kiểm tra).

### Phạm vi không đụng đến

- Không sửa `mau-tai-lieu.tex`, `skill.markdown`, hay code của website — chỉ thêm file mẫu mới.
- Lỗi trùng id `q1` trong mẫu "Phiếu bài tập trắc nghiệm" của trình soạn thảo (`lib/document-templates.ts`) là vấn đề riêng — bạn đã chọn chỉ làm file LaTeX nên tôi để nguyên; nếu muốn sửa luôn thì báo thêm sau.