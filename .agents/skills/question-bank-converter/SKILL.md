---
name: question-bank-converter
description: >-
  Chuyên gia trích xuất, chuẩn hóa và chuyển đổi tài liệu Toán học (PDF, đề thi, chuyên đề) sang định dạng Ngân hàng câu hỏi JSON và LaTeX KaTeX cho hệ thống MathLearn.
  Bao gồm quy trình xử lý hình ảnh độc lập, kiểm tra cú pháp toán học KaTeX, cân bằng dấu ngoặc/dollar, và xuất file tương thích 100% với hệ thống.
---

# Question Bank Converter Skill

Skill này quy định quy trình hoàn chỉnh và các tiêu chuẩn kỹ thuật để trích xuất đề thi, tài liệu toán học (từ PDF, scan, Word) thành các bộ câu hỏi độc lập nạp vào **Ngân hàng câu hỏi (`question_bank`)** của website MathLearn.

---

## 1. Cấu Trúc JSON Ngân Hàng Câu Hỏi Chuẩn

File JSON phải tuân thủ nghiêm ngặt định dạng sau:

```json
{
  "version": 1,
  "kind": "question_bank",
  "questions": [
    {
      "text": "(THPT Chuyên 2026) Cho hàm số $f(x) = x^3 - 3x + 2$. Giá trị cực đại bằng:",
      "type": "multiple_choice",
      "difficulty": "nhan_biet",
      "grade": "Lớp 12",
      "topicIds": ["ham-so-va-do-thi"],
      "options": ["$-1$.", "$0$.", "$1$.", "$4$."],
      "correctIndex": 3,
      "points": 1,
      "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow \\begin{bmatrix} x = 1 \\\\ x = -1 \\end{bmatrix}$.\nBảng biến thiên:\nGiá trị cực đại của hàm số đã cho bằng $4$.",
      "explanationImageFileName": "lt_1.png"
    }
  ]
}
```

### Bảng trường thông tin:
| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả |
| :--- | :--- | :---: | :--- |
| `text` | `string` | **Có** | Nội dung câu hỏi, chứa công thức KaTeX `$ ... $`. |
| `type` | `string` | **Có** | `multiple_choice` \| `true_false` \| `short_answer` \| `essay`. |
| `difficulty` | `string` | **Có** | `nhan_biet` \| `thong_hieu` \| `van_dung` \| `van_dung_cao`. |
| `grade` | `string` | **Có** | Khối lớp, ví dụ `"Lớp 12"`, `"Lớp 11"`, `"Lớp 10"`. |
| `topicIds` | `string[]` | **Có** | Mảng mã chủ đề hợp lệ trong hệ thống (VD: `["ham-so-va-do-thi"]`). |
| `options` | `string[]` | *MCQ* | Mảng các phương án trắc nghiệm (thường là 4 phương án). |
| `correctIndex` | `number` | *MCQ* | Vị trí đáp án đúng (bắt đầu từ `0` cho A, `1` cho B, `2` cho C, `3` cho D). |
| `statements` | `object[]` | *True/False* | Mảng mệnh đề `[{"text": "...", "correct": true}]`. |
| `points` | `number` | Không | Điểm số (mặc định là `1`). |
| `explanation` | `string` | Không | Lời giải chi tiết bằng KaTeX. Luôn dùng `\n` để xuống dòng thay vì `\\` ngoài math. |
| `imageFileName` | `string` | Tùy chọn | Tên file ảnh minh họa đề bài (`lt_1.png`) đính kèm khi import. |
| `explanationImageFileName`| `string` | Tùy chọn | Tên file ảnh minh họa lời giải (`lt_2.png`) đính kèm khi import. |
| `explanationImages` | `string[]` | Tùy chọn | Mảng danh sách nhiều file ảnh lời giải `["lt_2.png", "lt_3.png"]`. |

---

## 2. Quy Tắc So Khớp & Quản Lý Hình Ảnh

1. **Quy tắc đặt tên file ảnh:**
   * Sử dụng định dạng `lt_1.png`, `lt_2.png`, `lt_3.png`... đánh số liên tục theo từng bộ đề.
   * Lưu trữ phân tách theo từng thư mục đề: `De_01/`, `De_02/`, `De_03/`, `De_04/`.
2. **Quy tắc gõ lời giải có ảnh:**
   * **Không bỏ trống phần chữ:** Luôn gõ lại 100% các bước biến đổi đại số, tính đạo hàm $y'$, tìm nghiệm, điều kiện và kết luận vào trường `explanation`.
   * Gắn nhãn `explanationImageFileName: "lt_X.png"` để hình vẽ (bảng biến thiên / đồ thị) hiển thị kèm cùng lời giải.
3. **Cơ chế lưu trữ:**
   * File ảnh được chọn cùng lúc với file JSON khi import. Trình duyệt tải ảnh trực tiếp lên **Supabase Storage** (`document-images`) và gán `imageStoragePath` vào cơ sở dữ liệu.

---

## 3. Các Lỗi Thường Gặp & Quy Chuẩn Kiểm Tra (Validation)

Để tránh tình trạng câu hỏi bị hệ thống bỏ qua (skip) hoặc lỗi giao diện, bắt buộc phải kiểm tra 3 quy tắc sau:

### ⚠️ Quy tắc 1: Cân bằng dấu Dollar (`$`)
* Mọi công thức toán học phải có đủ cặp mở và đóng `$ ... $` (hoặc `$$ ... $$`).
* **Lỗi kinh điển:** `Ta có $f'(x) = 0 \Leftrightarrow \begin{bmatrix} x = 1 \\ x = -1 \end{bmatrix}.` $\to$ Thiếu dấu `$` sau `\end{bmatrix}`.
* **Sửa đúng:** `Ta có $f'(x) = 0 \Leftrightarrow \begin{bmatrix} x = 1 \\ x = -1 \end{bmatrix}$.`

### ⚠️ Quy tắc 2: Không ngắt ngoặc nhọn lồng nhau (Nested Braces)
* Trong các phương án có chứa chỉ số dưới hay phân số (`\min_{[a;b]}`, `\frac{1}{2}`, `\sqrt{x}`), tuyệt đối không dùng regex non-greedy `.*?` để cắt chuỗi. Phải dùng thuật toán đếm độ sâu dấu ngoặc `extractBraced` để lấy trọn vẹn nội dung.

### ⚠️ Quy tắc 3: Xử lý xuống dòng trong văn bản
* Ngoài vùng math mode (`$...$`), không sử dụng ký tự `\\` trần trụi trong văn bản thông thường. Phải chuyển đổi thành ký tự xuống dòng tự nhiên `\n` để giao diện hiển thị thành các đoạn văn riêng biệt thay vì in ra chữ `\\`.

---

## 4. Công Cụ Hỗ Trợ Tự Động (Scripts)

### 1. Kiểm tra toàn diện file JSON (0 Lỗi):
```bash
node .agents/skills/question-bank-converter/scripts/validate_bank_json.js <path-to-json-file>
```

### 2. Chuyển đổi từ file LaTeX sang JSON Ngân hàng câu hỏi:
```bash
node .agents/skills/question-bank-converter/scripts/tex_to_bank_json.js <path-to-tex-file> <output-json-file>
```

### 3. Trích xuất toàn bộ trang PDF độ nét cao:
```bash
python .agents/skills/question-bank-converter/scripts/extract_pdf_pages.py <path-to-pdf> <output-dir>
```
