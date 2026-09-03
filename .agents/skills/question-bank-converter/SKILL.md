---
name: question-bank-converter
description: >-
  Chuyên gia trích xuất, chuẩn hóa và chuyển đổi tài liệu Toán học (PDF, đề thi, chuyên đề) sang định dạng Ngân hàng câu hỏi JSON và LaTeX KaTeX cho hệ thống MathLearn.
  Sử dụng quy trình Multi-Agent nhận diện hình ảnh thực tế (vision), kiểm tra cú pháp toán học KaTeX, cân bằng dấu ngoặc/dollar, và xuất file tương thích 100% với hệ thống.
---

# Question Bank Converter Skill

Skill này quy định quy trình hoàn chỉnh và các tiêu chuẩn kỹ thuật để trích xuất đề thi, tài liệu toán học (từ PDF, scan, Word) thành các bộ câu hỏi độc lập nạp vào **Ngân hàng câu hỏi (`question_bank`)** của website MathLearn.

**Điểm khác biệt cốt lõi:** Skill này yêu cầu AI **nhìn thực tế vào hình ảnh** bằng vision (tool `view_file` trên file ảnh) và sử dụng **nhiều subagent song song** để nhận diện nội dung — không đoán mò.

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
| `topicIds` | `string[]` | **Có** | Mảng mã chủ đề hợp lệ (xem bảng bên dưới). |
| `options` | `string[]` | *MCQ* | Mảng các phương án trắc nghiệm (thường là 4 phương án). |
| `correctIndex` | `number` | *MCQ* | Vị trí đáp án đúng (bắt đầu từ `0` cho A, `1` cho B, `2` cho C, `3` cho D). |
| `statements` | `object[]` | *True/False* | Mảng mệnh đề `[{"text": "...", "correct": true}]`. |
| `correctAnswer` | `string` | *Short Answer* | Đáp án đúng dạng chuỗi. |
| `points` | `number` | Không | Điểm số (mặc định là `1`). |
| `explanation` | `string` | Không | Lời giải chi tiết bằng KaTeX. Luôn dùng `\n` để xuống dòng thay vì `\\` ngoài math. |
| `imageFileName` | `string` | Tùy chọn | Tên file ảnh minh họa đề bài (`lt_1.png`) đính kèm khi import. |
| `explanationImageFileName`| `string` | Tùy chọn | Tên file ảnh minh họa lời giải (`lt_2.png`) đính kèm khi import. |
| `explanationImages` | `string[]` | Tùy chọn | Mảng danh sách nhiều file ảnh lời giải `["lt_2.png", "lt_3.png"]`. |

### 9 Mã Chủ Đề Hợp Lệ (topicIds):
| Mã chủ đề | Tên hiển thị |
| :--- | :--- |
| `ham-so-va-do-thi` | Hàm số và Đồ thị |
| `mu-va-logarit` | Mũ và Logarit |
| `dao-ham` | Đạo hàm |
| `nguyen-ham-va-tich-phan` | Nguyên hàm và Tích phân |
| `luong-giac` | Lượng giác |
| `day-so-va-gioi-han` | Dãy số và Giới hạn |
| `hinh-hoc-khong-gian` | Hình học không gian |
| `vector-va-he-toa-do` | Vector và Hệ tọa độ |
| `xac-suat-va-thong-ke` | Xác suất và Thống kê |

> **QUAN TRỌNG:** Chỉ sử dụng chính xác các mã trên. Mã sai sẽ bị website tự động lọc bỏ khi import.

---

## 2. Quy Trình Multi-Agent Nhận Diện Hình Ảnh (QUAN TRỌNG NHẤT)

Khi nhận tài liệu PDF/ảnh đề thi để chuyển đổi, **BẮT BUỘC** thực hiện theo quy trình 3 pha sau:

### Pha 1: Extraction (Trích xuất & Cắt Hình Thông Minh) — Agent Chính

1. **Trích xuất PDF thành ảnh & Cắt hình AI với bộ lọc Smart Anti-Overcrop:**
   ```bash
   # Cắt hình ảnh sắc nét tự động (chỉ cắt Đồ thị, Hình học, Bảng biến thiên - không cắt dính bài giải):
   python .agents/skills/question-bank-converter/scripts/auto_crop_figures.py "<file.pdf>" "<output_dir>/figures"
   ```
   Output: `Trang_01.png`, `Trang_02.png`, ..., `figures/lt_1.png`, `figures/crop_manifest.json` (200 DPI)

2. **Nhìn tổng quan tài liệu:**
   - Dùng `view_file` trên 1-2 trang đầu và 1-2 trang cuối để xác định cấu trúc đề:
     - Trang nào là đề bài? Trang nào là đáp án/lời giải?
     - Có bao nhiêu câu hỏi tổng cộng?
     - Đề có phần trắc nghiệm, đúng/sai, trả lời ngắn, tự luận không?

3. **Phân chia batch cho subagent:**
   - Chia các trang thành batch, mỗi batch 2-4 trang liền nhau
   - Tối đa 5 subagent song song
   - Nếu đề bài và lời giải ở trang riêng, gộp trang đề + trang lời giải tương ứng vào cùng batch

### Pha 2: Recognition (Nhận diện) — Nhiều Subagent Song Song

Spawn nhiều subagent, mỗi agent xử lý 1 batch trang. Mỗi subagent **BẮT BUỘC** thực hiện:

1. **Nhìn ảnh thực tế** bằng `view_file` trên từng file `Trang_XX.png` được giao
2. **Nhận diện và trích xuất** từng câu hỏi trong các trang đó:
   - Số thứ tự câu
   - Nội dung đề bài → chuyển sang KaTeX chuẩn
   - Các phương án A, B, C, D → chuyển sang KaTeX chuẩn
   - Loại câu hỏi (`multiple_choice` / `true_false` / `short_answer` / `essay`)
   - Đáp án đúng (`correctIndex` hoặc `correctAnswer`)
   - Mức độ khó (nếu có tag: `[NB]`, `[TH]`, `[VD]`, `[VDC]`)
3. **Nhận diện hình vẽ:**
   - Nếu đề bài hoặc lời giải có hình vẽ (đồ thị, bảng biến thiên, hình hình học), ghi nhận:
     - Mô tả nội dung hình vẽ
     - Vị trí hình trên trang (để người dùng cắt ảnh)
     - Đặt tên tạm: `lt_X.png` (agent chính sẽ đánh số lại ở Pha 3)
4. **Xử lý lời giải (QUAN TRỌNG — Luôn gõ lại chữ, chỉ cắt hình):**

   **Nguyên tắc bắt buộc:** Gõ lại 100% phần văn bản và công thức toán bằng KaTeX vào `explanation`. Chỉ cắt riêng phần **hình vẽ thuần túy** (đồ thị, bảng biến thiên, hình hình học, sơ đồ) thành ảnh.

   | Trường hợp | Cách xử lý |
   | :--- | :--- |
   | Lời giải thuần đại số, không hình | Gõ đầy đủ bằng KaTeX vào `explanation` |
   | Lời giải có chữ + hình vẽ | Gõ **toàn bộ** phần chữ/công thức vào `explanation` + cắt riêng **mỗi** hình vẽ thành ảnh `lt_X.png` |
   | Lời giải có nhiều hình | Gõ **toàn bộ** phần chữ/công thức + cắt riêng từng hình vào `explanationImages` |

   > **KHÔNG ĐƯỢC** chỉ ghi tóm tắt rồi gắn ảnh toàn bộ lời giải. Phải gõ lại đầy đủ mọi dòng chữ, mọi phép tính, chỉ phần hình vẽ không thể gõ được mới cắt ảnh.

5. **Báo cáo kết quả** dưới dạng mảng JSON câu hỏi:

```json
[
  {
    "question_number": 1,
    "text": "Cho hàm số $y = x^3 - 3x + 2$. Giá trị cực đại bằng:",
    "type": "multiple_choice",
    "options": ["$-1$.", "$0$.", "$1$.", "$4$."],
    "correctIndex": 3,
    "difficulty": "nhan_biet",
    "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên cho thấy giá trị cực đại bằng $f(-1) = 4$.",
    "explanation_needs_image": true,
    "image_description": "Bảng biến thiên của hàm số, nằm ở Trang 5, nửa trên",
    "temp_image_name": "lt_temp_1.png"
  }
]
```

### Pha 3: Assembly (Gom và Xuất) — Agent Chính

1. **Thu thập kết quả** từ tất cả subagent
2. **Sắp xếp** câu hỏi theo `question_number` đúng thứ tự
3. **Ghép đề bài + lời giải** nếu chúng từ các batch khác nhau
4. **Đánh số ảnh liên tục:** Đánh lại tất cả ảnh thành `lt_1.png`, `lt_2.png`, ... theo thứ tự xuất hiện
5. **Gán metadata:**
   - `grade`: Khối lớp chung cho toàn bộ đề
   - `topicIds`: Mã chủ đề hợp lệ
   - `difficulty`: Nếu subagent chưa xác định, gán theo vị trí (1-15: NB, 16-35: TH, >35: VD)
6. **Auto-Fixer & Validate:**
   ```bash
   # Tự động sửa lỗi ngoặc, dollar, KaTeX syntax
   node .agents/skills/question-bank-converter/scripts/auto_fix_bank_json.js <output.json>
   
   # Kiểm tra tính hợp lệ nghiêm ngặt
   node .agents/skills/question-bank-converter/scripts/validate_bank_json.js <output.json>
   ```
   Phải đạt **0 lỗi, 0 cảnh báo** trước khi hoàn thành.
7. **Tạo trang Preview HTML 2 cột trực quan:**
   ```bash
   node .agents/skills/question-bank-converter/scripts/generate_preview.js <output.json> <figures_dir> <output_preview.html>
   ```

### Prompt Template Cho Subagent (Nhận Diện Nâng Cao)

Khi spawn subagent, sử dụng prompt theo mẫu sau. Prompt này đã được tối ưu để cải thiện chất lượng nhận diện:

```
Bạn là agent chuyên nhận diện đề thi Toán từ hình ảnh. BẮT BUỘC tuân thủ quy trình sau:

## BƯỚC 1: NHÌN ẢNH
Dùng view_file để NHÌN THỰC TẾ vào TỪNG file ảnh sau (nhìn lần lượt, KHÔNG bỏ sót):
- <đường dẫn>/Trang_XX.png
- <đường dẫn>/Trang_YY.png

## BƯỚC 2: NHẬN DIỆN NỘI DUNG
Với MỖI trang, đọc KỸ từng dòng từ trên xuống dưới và nhận diện:

### 2a. Đề bài:
- Số thứ tự câu hỏi
- Nội dung đề bài → chuyển chính xác sang KaTeX ($...$)
- Loại câu: multiple_choice / true_false / short_answer / essay
- Các phương án A, B, C, D → chuyển từng phương án sang KaTeX
- Hình vẽ trong đề bài → ghi nhận vị trí (trang, vùng) + mô tả nội dung

### 2b. Đáp án / Lời giải:
- Đáp án đúng (correctIndex: 0=A, 1=B, 2=C, 3=D)
- Lời giải: Gõ lại TOÀN BỘ phần chữ và công thức bằng KaTeX
- Hình vẽ trong lời giải (bảng biến thiên, đồ thị, hình hình học):
  → Ghi nhận "cần cắt ảnh" + mô tả chính xác vị trí và nội dung hình

### 2c. Metadata:
- Tag mức độ: [NB], [TH], [VD], [VDC] nếu có
- Nguồn đề: (THPT XYZ 2026) nếu có trong đề bài

## BƯỚC 3: CHECKLIST NHẬN DIỆN CHÍNH XÁC

Khi nhìn ảnh, đặc biệt chú ý nhận diện đúng các ký hiệu toán học sau (dễ nhầm):

| Ký hiệu thực tế | Viết KaTeX đúng | Lỗi thường gặp |
|---|---|---|
| Phân số | $\frac{a}{b}$ | Thiếu ngoặc nhọn: $\frac a b$ |
| Căn bậc hai | $\sqrt{x+1}$ | Thiếu ngoặc: $\sqrt x+1$ |
| Căn bậc n | $\sqrt[3]{x}$ | Viết sai: $\sqrt{3}{x}$ |
| Lũy thừa | $x^{2n+1}$ | Thiếu ngoặc: $x^2n+1$ |
| Chỉ số dưới | $a_{n+1}$ | Thiếu ngoặc: $a_n+1$ |
| Giới hạn | $\lim_{x \to +\infty}$ | Thiếu to: $\lim_{x \infty}$ |
| Tích phân | $\int_{0}^{1} f(x)\,dx$ | Thiếu dx hoặc \, |
| Tổng | $\sum_{k=1}^{n}$ | Viết sai vị trí |
| Vectơ | $\overrightarrow{AB}$ | Dùng \vec{AB} (sai) |
| Ma trận | $\begin{pmatrix} a & b \\ c & d \end{pmatrix}$ | Dùng sai delimiter |
| Số thập phân VN | $0{,}5$ | Dùng $0,5$ (sai) |
| Hệ phương trình | $\begin{cases} x+y=1 \\ x-y=2 \end{cases}$ | Dùng sai môi trường |
| Hoặc (phương trình) | $\left[\begin{array}{l} x=1 \\ x=2 \end{array}\right.$ | Dùng bmatrix (sai) |

## BƯỚC 4: KIỂM TRA LẠI
Trước khi trả kết quả, kiểm tra MỖI câu hỏi:
- [ ] Đếm dấu $ → phải là số chẵn trong mỗi trường
- [ ] Đếm {} → mỗi { phải có } tương ứng
- [ ] Số phương án = 4 (cho MCQ)
- [ ] correctIndex nằm trong [0, 3]
- [ ] Không có \textbf, \textit, \begin{itemize} trong text/explanation
- [ ] Xuống dòng ngoài math dùng \n (không dùng \\)

## QUY TẮC KATEX BẮT BUỘC:
- Inline math: $...$  Display math: $$...$$
- Số thập phân tiếng Việt: $0{,}5$ (không phải $0,5$)
- CẤM dùng \textbf, \textit, \begin{itemize} trong text/explanation
- Xuống dòng ngoài math dùng \n (không dùng \\)
- CẤM dùng \(...\) hoặc \[...\]

## OUTPUT:
Trả về mảng JSON. Mỗi câu hỏi gồm:
{
  "question_number": 1,
  "text": "...",
  "type": "multiple_choice",
  "options": ["...", "...", "...", "..."],
  "correctIndex": 0,
  "difficulty": "nhan_biet",
  "explanation": "... (gõ TOÀN BỘ chữ và công thức, CHỈ hình vẽ mới đánh dấu cắt ảnh)",
  "explanation_needs_image": true/false,
  "image_description": "Bảng biến thiên, Trang X, vùng giữa bên phải",
  "temp_image_name": "lt_temp_X.png"
}
```

---

## 3. Quy Tắc So Khớp & Quản Lý Hình Ảnh

### Đặt tên file ảnh:
* Sử dụng định dạng `lt_1.png`, `lt_2.png`, `lt_3.png`... đánh số liên tục theo từng bộ đề.
* Lưu trữ phân tách theo từng thư mục đề: `De_01/`, `De_02/`, `De_03/`, `De_04/`.

### Quy Tắc Xử Lý Lời Giải (Luôn gõ chữ, chỉ cắt hình):

**Nguyên tắc:** Mọi phần chữ và công thức toán trong lời giải **BẮT BUỘC** gõ lại bằng KaTeX. Chỉ cắt riêng phần hình vẽ thuần túy (đồ thị, bảng biến thiên, hình hình học, sơ đồ) ra ảnh.

**Trường hợp 1 — Lời giải thuần đại số (không hình):**
- Gõ đầy đủ lời giải bằng KaTeX vào `explanation`
- Không cần trường ảnh
```json
{
  "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\n$f(-1) = (-1)^3 - 3(-1) + 2 = 4$.\n$f(1) = 1 - 3 + 2 = 0$.\nVậy giá trị cực đại bằng $4$."
}
```

**Trường hợp 2 — Lời giải có chữ + hình vẽ (phổ biến nhất):**
- Gõ **toàn bộ** phần chữ/công thức vào `explanation`
- Cắt riêng **chỉ** phần hình vẽ (bảng biến thiên, đồ thị, hình hình học) thành ảnh
- Gắn `explanationImageFileName` (1 ảnh) hoặc `explanationImages` (nhiều ảnh)
```json
{
  "explanation": "Ta có $f'(x) = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$.\nBảng biến thiên (xem hình bên dưới):\nTừ bảng biến thiên, hàm số đạt cực đại tại $x = -1$ với $f(-1) = 4$.\nVậy giá trị cực đại của hàm số bằng $4$.",
  "explanationImageFileName": "lt_2.png"
}
```

**Trường hợp 3 — Lời giải có nhiều hình:**
- Vẫn gõ **toàn bộ** chữ/công thức vào `explanation`
- Cắt riêng từng hình → gom vào mảng `explanationImages`
```json
{
  "explanation": "Gọi $H$ là trung điểm $AB$.\n$SH = \\sqrt{SA^2 - AH^2} = \\sqrt{a^2 - \\frac{a^2}{4}} = \\frac{a\\sqrt{3}}{2}$.\nDiện tích đáy: $S_{ABCD} = a^2$.\nThể tích: $V = \\frac{1}{3} \\cdot S_{ABCD} \\cdot SH = \\frac{1}{3} \\cdot a^2 \\cdot \\frac{a\\sqrt{3}}{2} = \\frac{a^3\\sqrt{3}}{6}$.",
  "explanationImages": ["lt_3.png", "lt_4.png"]
}
```

> **LƯU Ý:** Phần `explanation` trong ví dụ trên chứa **toàn bộ** các bước giải chi tiết bằng chữ và công thức. Ảnh chỉ bổ sung phần hình vẽ (hình chóp, bảng biến thiên) mà không thể diễn đạt bằng text.

### Cơ chế lưu trữ:
* File ảnh được chọn cùng lúc với file JSON khi import.
* Trình duyệt tải ảnh trực tiếp lên **Supabase Storage** (`document-images`) và gán `imageStoragePath` vào cơ sở dữ liệu.

---

## 4. Quy Chuẩn KaTeX (Bắt Buộc)

### 4.1 Ký hiệu công thức toán:
- **Inline Math:** `$ ... $` (ví dụ: `$y = f(x)$`)
- **Display Math:** `$$ ... $$` (ví dụ: `$$\lim_{x \to 0} f(x) = 1$$`)
- **CẤM:** `\(...\)`, `\[...\]`, `\vspace`, `\par`

### 4.2 Số thập phân tiếng Việt:
- Sử dụng `$0{,}5$` hoặc `$24{,}5$` thay vì `$0,5$` hoặc `$0.5$`
- Lý do: KaTeX hiểu dấu phẩy trần là khoảng cách phân cách tọa độ

### 4.3 Định dạng văn bản trong câu hỏi & lời giải:
- **CẤM:** `\textbf{...}`, `\textit{...}`, `\begin{itemize}`, `\begin{enumerate}`, `\begin{tabular}`, `\begin{center}` bên trong `text` hoặc `explanation`
- **Thay bằng Markdown:**
  - Gạch đầu dòng: `- `
  - Chữ đậm: `**chữ đậm**`
  - Chữ nghiêng: `*chữ nghiêng*`
  - Xuống dòng: `\n` (trong JSON string)

### 4.4 Làm sạch văn bản đề bài:
- Bỏ mã nhận dạng: `[KID]`, `[MỨC ĐỘ 1]`, `[MỨC ĐỘ 2]`...
- Bỏ nhãn đầu câu: `Câu 1:`, `Bài 1:`, `\textbf{Câu 1:}` (website tự đánh số)

---

## 5. Các Lỗi Thường Gặp & Quy Chuẩn Kiểm Tra (Validation)

### ⚠️ Quy tắc 1: Cân bằng dấu Dollar (`$`)
* Mọi công thức toán học phải có đủ cặp mở và đóng `$ ... $` (hoặc `$$ ... $$`).
* **Lỗi kinh điển:** `Ta có $f'(x) = 0 \Leftrightarrow \begin{bmatrix} x = 1 \\ x = -1 \end{bmatrix}.` → Thiếu dấu `$` sau `\end{bmatrix}`.
* **Sửa đúng:** `Ta có $f'(x) = 0 \Leftrightarrow \begin{bmatrix} x = 1 \\ x = -1 \end{bmatrix}$.`

### ⚠️ Quy tắc 2: Không ngắt ngoặc nhọn lồng nhau (Nested Braces)
* Trong các phương án có chứa chỉ số dưới hay phân số (`\min_{[a;b]}`, `\frac{1}{2}`, `\sqrt{x}`), tuyệt đối không dùng regex non-greedy `.*?` để cắt chuỗi. Phải dùng thuật toán đếm độ sâu dấu ngoặc `extractBraced` để lấy trọn vẹn nội dung.

### ⚠️ Quy tắc 3: Xử lý xuống dòng trong văn bản
* Ngoài vùng math mode (`$...$`), không sử dụng ký tự `\\` trần trụi trong văn bản thông thường. Phải chuyển đổi thành ký tự xuống dòng tự nhiên `\n` để giao diện hiển thị thành các đoạn văn riêng biệt thay vì in ra chữ `\\`.

---

## 6. Công Cụ Hỗ Trợ Tự Động (Scripts)

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
