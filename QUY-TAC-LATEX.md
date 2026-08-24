# Quy tắc mã LaTeX

Tài liệu này mô tả quy tắc viết **công thức Toán (LaTeX)** trong website, gồm 2 phần:

1. **Công thức inline** trong nội dung tài liệu, câu hỏi, đáp án (render bằng KaTeX qua component `MathText`).
2. **Import file `.tex`** để nạp nguyên một tài liệu vào trình soạn thảo (parser `lib/latex-parser.ts`).

> Xem thêm **QUY-TAC-FILE-JSON.md** để biết cấu trúc file JSON nhập/xuất tài liệu.

## 1. Công thức inline trong nội dung

Website dùng **KaTeX** và chỉ nhận 2 loại dấu bao (delimiter):

| Loại | Cú pháp | Dùng khi |
|---|---|---|
| Inline (trong dòng) | `$...$` | Công thức nằm cùng dòng với chữ, ví dụ: `Nghiệm của $x + 2 = 5$ là $x = 3$.` |
| Display (riêng khối) | `$$...$$` | Công thức lớn, đứng riêng một khối, được phép xuống dòng bên trong |

```text
Đây là công thức inline: $a^2 + b^2 = c^2$.

Đây là công thức display:
$$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$
```

### 1.1. Những dạng KHÔNG được hỗ trợ

Các cú pháp sau sẽ hiển thị **dạng chữ thường**, không render thành công thức:

- `\(...\)` — không được parse.
- `\[...\]` — không được parse.
- `\begin{equation}`, `\begin{align}`... — không được parse.

Chỉ dùng `$...$` và `$$...$$`.

### 1.2. Giới hạn của inline math `$...$`

- Bên trong `$...$` **không được chứa ký tự `$` khác**.
- Bên trong `$...$` **không được có xuống dòng**: nếu công thức dài, hãy dùng `$$...$$`.
- Mở và đóng `$` phải thành cặp; thiếu một bên sẽ khiến cả đoạn hiện dạng chữ.

### 1.3. Khi công thức bị lỗi

KaTeX chạy ở chế độ `throwOnError: false`: công thức sai cú pháp sẽ hiển thị **màu đỏ** tại chỗ, không làm vỡ trang hay báo lỗi toàn tài liệu. Khi soạn nên kiểm tra lại phần xem trước.

## 2. Định dạng văn bản đi kèm

Nội dung text/lesson ngoài công thức còn hỗ trợ định dạng đơn giản:

| Ý muốn | Cú pháp |
|---|---|
| Tiêu đề cấp 1 → 4 | `#`, `##`, `###`, `####` (đầu dòng) |
| Chữ đậm | `**chữ đậm**` |
| Gạch đầu dòng | `*`, `-`, `+`, `•` hoặc `\item` (đầu dòng) |

## 3. Lệnh KaTeX hay dùng cho Toán lớp 8

Bảng dưới đây là các lệnh an toàn, đã kiểm chứng hoạt động tốt trên website:

| Ý nghĩa | Lệnh | Ví dụ | Kết quả mong đợi |
|---|---|---|---|
| Phân số | `\frac{tử}{mẫu}` | `$\frac{3}{4}$` | 3/4 xếp chồng |
| Căn bậc hai | `\sqrt{}` , `\sqrt[n]{}` | `$\sqrt{2}$`, `$\sqrt[3]{x}$` | √2, ∛x |
| Luỹ thừa, chỉ số | `^{}`, `_{}` | `$x^2 + a_1$` | x² + a₁ |
| Nhân | `\cdot`, `\times` | `$2 \cdot 3$`, `$2 \times 3$` | 2·3, 2×3 |
| Chia | `\div` | `$8 \div 2$` | 8÷2 |
| So sánh | `<`, `>`, `\le`, `\ge`, `\ne` | `$x \le 5$` | x ≤ 5 |
| Xấp xỉ | `\approx`, `\neq` | `$\pi \approx 3{,}14$` | π ≈ 3,14 |
| Góc | `\widehat{ABC}`, `\angle` | `$\widehat{ABC} = 90^\circ$` | góc ABC = 90° |
| Độ | `^\circ` | `$45^\circ$` | 45° |
| Độ dài đoạn | `\overline{AB}` hoặc `AB` | `$\overline{AB} = 5\text{cm}$` | |AB| = 5cm |
| Tam giác vuông | `\triangle` | `$\triangle ABC \text{ vuông tại } A$` | △ABC |
| Vuông góc / song song | `\perp`, `\parallel` | `$AB \perp CD$` | AB ⊥ CD |
| Vô tỷ / pi | `\sqrt{}` , `\pi` | `$S = \pi r^2$` | πr² |
| Hệ phương trình | `\begin{cases}` trong `$$...$$` | xem ví dụ dưới | hệ ngoặc nhọn |
| Ngăn cách nghìn thập phân kiểu VN | `{,}` | `$3{,}14$` | 3,14 (không có khoảng trống) |

Ví dụ hệ phương trình:

```text
$$\begin{cases} x + y = 5 \\ x - y = 1 \end{cases}$$
```

Chữ tiếng Việt trong công thức dùng `\text{...}`: `$a \text{ cm}$`.

## 4. Quy tắc escape trong JSON

Khi nội dung nằm trong **file JSON**, mọi dấu `\` phải ghi đôi:

```json
{
  "type": "text",
  "content": "Hằng đẳng thức: $(a + b)^2 = a^2 + 2ab + b^2$."
}
```

Nếu viết trực tiếp trong trình soạn thảo của website thì **không** cần escape, ghi `\frac{a}{b}` bình thường. Escape chỉ áp dụng cho JSON và cho file `.tex` (do bản thân LaTeX cũng dùng `\`).

## 5. Các trường nội dung được render công thức

Toàn bộ các trường chuỗi sau đều hỗ trợ `$...$` và `$$...$$`:

- Khối `text`: trường `content`.
- Khối `lesson`: trường `content`.
- Câu hỏi mọi loại: `text`, `options[].text` / `statements[].text`, `correctAnswer`, `explanation`.

Nghĩa là đáp án trắc nghiệm (`"A"`, `"$\frac{1}{2}$"`) hay đáp án trả lời ngắn đều được render công thức như đề bài.

## 6. Import file `.tex`

Công cụ nhập tài liệu chấp nhận file `.tex` (hoặc dán mã) theo cấu trúc riêng của website. Parser bỏ qua phần mở đầu chuẩn (`\documentclass`, `\usepackage`) và comment `%` (nhớ escape `\%` nếu muốn in dấu %).

### 6.1. Metadata

```latex
\doctitle{Tài liệu Toán lớp 8}
\docdesc{Mô tả ngắn}
\docgrade{Lớp 8}
\docstatus{draft}      % draft | published
\doctype{normal}       % normal | test
\doctopics{phuong-trinh,tam-giac-vuong}
```

Tên rút gọn `\title`, `\description`, `\grade`, `\status`, `\type`, `\topics` cũng được nhận. Mã chủ đề hợp lệ giống JSON (xem Phần 2 của QUY-TAC-FILE-JSON.md); mã sai bị bỏ qua.

### 6.2. Các khối nội dung

```latex
\begin{textblock} ... \end{textblock}   % khối văn bản thuần
\begin{lesson}{Tiêu đề bài giảng}{Mô tả} ... \end{lesson}
\image{0.6}{Chú thích ảnh}{ten-file.png}  % chèn ảnh (scale, chú thích, tên file)
```

Trong `textblock`/`lesson`, các lệnh LaTeX sau được **tự chuyển sang định dạng web**:

| LaTeX | Chuyển thành |
|---|---|
| `\section{...}`, `\subsection{...}` | Tiêu đề `#`, `##` |
| `\textbf{...}`, `\textit{...}` | Đậm `**...**`, nghiêng `*...*` |
| `\begin{itemize}`/`\begin{enumerate}` + `\item` | Danh sách gạch đầu dòng |

### 6.3. Khối câu hỏi và các loại câu

```latex
\begin{quiz}{Tiêu đề phần bài tập}

% Trắc nghiệm: {đề}{chỉ số đáp án đúng (bắt đầu từ 0)}{điểm}{lời giải}
\begin{mcq}{Nghiệm của $x + 2 = 5$ là?}{1}{1}{Chuyển vế: $x = 3$.}
  \option{$x = 2$}
  \option{$x = 3$}
  \option{$x = 4$}
\end{mcq}

% Đúng/Sai: {đề}{điểm}{lời giải}, mỗi mệnh đề {true|false}{nội dung}
\begin{truefalse}{Xét tính đúng sai:}{1}{Giải thích chung.}
  \statement{true}{0 là số nguyên.}
  \statement{false}{$\sqrt{2}$ là số hữu tỉ.}
\end{truefalse}

% Trả lời ngắn (môi trường): {đề}{đáp án}{điểm}{lời giải}
\begin{shortanswer}{Nhập nghiệm của $x - 4 = 0$}{4}{1}{$x = 4$.}
\end{shortanswer}

% Trả lời ngắn (lệnh đơn)
\shortanswer{Nghiệm của $2x = 10$ là?}{5}{1}{$x = 5$.}

% Tự luận: {đề}{điểm}{gợi ý/lời giải}
\essay{Trình bày cách giải bất phương trình $\frac{x}{2} > 1$.}{2}{Nhân hai vế với 2.}

\end{quiz}
```

Lưu ý:

- Chỉ số đáp án đúng của `mcq` tính từ `0`; nếu không hợp lệ thì mặc định `0`.
- Nội dung câu hỏi/đáp án vẫn dùng `$...$`, `$$...$$` như Phần 1.
- File mẫu hoàn chỉnh xem hằng số `SAMPLE_DOCUMENT_LATEX` trong `lib/latex-parser.ts`.

## 7. Nên và không nên

**Nên:**

- Dùng `$...$` cho công thức ngắn, `$$...$$` cho công thức lớn hoặc cần nhiều dòng.
- Dùng `{,}` để viết dấu phẩy thập phân kiểu Việt Nam: `$3{,}14$`.
- Kiểm tra phần xem trước sau khi soạn; công thức lỗi sẽ hiện màu đỏ.

**Không nên:**

- Không dùng `\(...\)`, `\[...\]`, `\begin{equation}` — website không hỗ trợ.
- Không xuống dòng bên trong `$...$` (dùng `$$...$$` thay thế).
- Không lồng `$` trong `$`, ví dụ `$...$...$...$` gây lệch cặp delimiter.
- Không dùng lệnh cần gói mở rộng (TikZ, chemfig...) hoặc lệnh phụ thuộc macros tùy chỉnh — website không khai báo macros riêng.
