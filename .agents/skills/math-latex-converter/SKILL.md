---
name: math-latex-converter
description: >-
  Chuyên gia chuyển đổi tài liệu Toán học (PDF, SGK, đề thi, bài tập) sang định dạng LaTeX chuẩn KaTeX của hệ thống website MathLearn.
  Kích hoạt skill này khi người dùng yêu cầu chuyển đổi bài học, chuyên đề, đề thi, trắc nghiệm, tự luận hoặc chèn ảnh cho hệ thống website.
---

# MathLearn LaTeX Converter Skill

Skill này hướng dẫn quy trình và chuẩn hóa cú pháp để chuyển đổi tài liệu toán học (từ tài liệu PDF, hình ảnh, văn bản scan) sang định dạng mã nguồn LaTeX tương thích hoàn toàn với bộ phân tích `latex-parser.ts` và bộ render KaTeX của website.

---

## 1. Cấu Trúc Khung Tài Liệu Chuẩn

Mỗi tài liệu LaTeX xuất ra phải có đầy đủ phần khai báo cấu trúc như sau (tuyệt đối không dùng lệnh `\vspace`):

```latex
\documentclass[12pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[T5]{fontenc}
\usepackage{amsmath, amssymb}
\usepackage{graphicx}
\usepackage{ifthen}

\newboolean{showsolutions}
\setboolean{showsolutions}{true}

% --- ĐỊNH NGHĨA CÁC LỆNH ẢO CHO CÔNG CỤ LATEX2JSON CỦA WEBSITE ---
\newcommand{\doctitle}[1]{\begin{center}\Large\textbf{#1}\end{center}}
\newcommand{\docdesc}[1]{\textbf{Mô tả:} #1}
\newcommand{\docgrade}[1]{\textbf{Lớp:} #1}
\newcommand{\docstatus}[1]{\textbf{Trạng thái:} #1}
\newcommand{\doctype}[1]{\textbf{Loại:} #1}
\newcommand{\doctopics}[1]{\textbf{Chủ đề:} #1}

\newenvironment{textblock}{}{}

\newenvironment{lesson}[2]{
	\noindent\textbf{\Large #1}\\
	\textit{#2}
}{}

\newcommand{\image}[3]{
	\begin{center}
		\includegraphics[width=#1\textwidth]{#3} \\
		\textit{#2}
	\end{center}
}

\newenvironment{quiz}[1]{
	\noindent\textbf{\Large Kiểm tra: #1}
}{}

\newenvironment{mcq}[4]{
	\noindent\textbf{Câu hỏi:} #1 \\
	\ifthenelse{\boolean{showsolutions}}{
		\textit{(Đáp án đúng: #2, Điểm: #3) - Giải thích: #4}
	}{}
	\begin{itemize}
	}{
	\end{itemize}
}
\newcommand{\option}[1]{\item #1}

\newenvironment{truefalse}[3]{
	\noindent\textbf{Đúng/Sai:} #1 \\
	\ifthenelse{\boolean{showsolutions}}{
		\textit{(Điểm: #2) - Giải thích: #3}
	}{}
	\begin{itemize}
	}{
	\end{itemize}
}
\newcommand{\statement}[2]{\item [\textbf{#1}] #2}

\newcommand{\shortanswer}[4]{
    \noindent\textbf{Trả lời ngắn (Điểm: #3):}

    \noindent #1

	\ifthenelse{\boolean{showsolutions}}{
		\noindent\textit{Đáp án: #2 - Giải thích:}
		\noindent #4
	}{}
}

\newcommand{\essay}[3]{
    \noindent\textbf{Tự luận (Điểm: #2):}
    
    \noindent #1
    
	\ifthenelse{\boolean{showsolutions}}{
		\noindent\textbf{Gợi ý / Đáp án:}
		\noindent #3
	}{}
}

\begin{document}

\doctitle{TIÊU ĐỀ TÀI LIỆU}
\docdesc{Mô tả ngắn gọn về tài liệu}
\docgrade{Lớp 10}
\docstatus{draft}
\doctype{normal}
\doctopics{ham-so-va-do-thi}

% --- NỘI DUNG TÀI LIỆU ---

\end{document}
```

---

## 2. Quy Tắc Toán Học & Định Dạng (Bắt Buộc)

1. **Ký hiệu công thức toán:**
   - **Inline Math (trong dòng):** Bắt buộc dùng `$ ... $` (ví dụ: `$y = f(x)$`).
   - **Display Math (khối riêng):** Bắt buộc dùng `$$ ... $$` (ví dụ: `$$\lim_{x \to 0} f(x) = 1$$`).
   - **CẤM:** Không dùng `\(...\)` hay `\[...\]` vì bộ render website chỉ hỗ trợ `$ ... $` và `$$ ... $$`.
   - **CẤM:** Không dùng `\vspace` hoặc `\par` ở bất kỳ đâu trong file. Hãy dùng xuống dòng tự nhiên.

2. **Quy tắc định dạng văn bản trong câu hỏi & lời giải:**
   - **CẤM:** Không dùng `\begin{itemize}`, `\begin{enumerate}`, `\begin{center}`, `\begin{tabular}`, `\textit{...}`, `\textbf{...}` bên trong nội dung `{Đề bài}` hoặc `{Giải thích}` / `{Lời giải}` của các câu hỏi (`mcq`, `truefalse`, `shortanswer`, `essay`). Bộ phân tích câu hỏi không chạy `latexToMarkdown` cho các trường này, nên các lệnh này sẽ bị in nguyên văn ra màn hình.
   - Thay vào đó, dùng định dạng Markdown chuẩn:
     - Gạch đầu dòng: Dùng dấu `- ` đầu dòng.
     - Chữ đậm: Dùng `**chữ đậm**`.
     - Chữ nghiêng: Dùng `*chữ nghiêng*`.
     - Xuống dòng: Nhấn Enter xuống dòng tự nhiên hoặc dùng `\\`.

3. **Dấu phẩy số thập phân tiếng Việt:**
   - Sử dụng định dạng `0{,}5` hoặc `24{,}5` trong công thức toán để tránh bị KaTeX hiểu nhầm thành khoảng cách phân cách toạ độ.

4. **Làm sạch văn bản đề bài:**
   - Bỏ các mã nhận dạng như `[KID]`, `[MỨC ĐỘ 1]`,...
   - Không bọc `\textbf{Ví dụ 1:}` hay `\textbf{Câu 1:}` vào bên trong tham số đề bài, vì giao diện website sẽ tự động gắn nhãn và đánh số thứ tự.

---

## 3. Quy Tắc Phân Khối (Block Types)

### A. Khối Bài Học / Lý Thuyết (`\begin{lesson}`)
Mỗi phần lý thuyết lớn (Phần I, Phần II, từng Dạng toán/Bài toán) được bọc trong một `lesson`:
```latex
\begin{lesson}{Tiêu đề bài học}{Mô tả ngắn}
Nội dung lý thuyết, định lý, công thức...
\end{lesson}
```

### B. Khối Câu Hỏi / Bài Tập (`\begin{quiz}`)
Các câu hỏi trắc nghiệm, tự luận minh họa hoặc bài tập rèn luyện được gom vào khối `quiz`:
```latex
\begin{quiz}{Tiêu đề khối bài tập}
% Chứa các câu hỏi mcq, truefalse, shortanswer, essay bên trong
\end{quiz}
```

---

## 4. Cú Pháp Các Loại Câu Hỏi

### 1. Trắc nghiệm nhiều lựa chọn (`mcq`)
- Tham số: `{Đề bài}{Chỉ số đáp án đúng (tính từ 0: 0=A, 1=B, 2=C, 3=D)}{Điểm}{Giải thích}`
```latex
\begin{mcq}{Cho hàm số $y = \frac{2x-1}{x+1}$. Tiệm cận ngang của đồ thị là}{1}{1}{Ta có $\lim_{x \to \pm\infty} y = 2$ nên tiệm cận ngang là $y = 2$.}
	\option{$y = 1$.}
	\option{$y = 2$.}
	\option{$x = -1$.}
	\option{$x = 2$.}
\end{mcq}
```

### 2. Trắc nghiệm Đúng / Sai (`truefalse`)
- Tham số: `{Đề bài}{Điểm}{Giải thích}`
- Mỗi mệnh đề dùng lệnh `\statement{true|false}{Nội dung mệnh đề}`
```latex
\begin{truefalse}{Cho hàm số $y = f(x)$ có bảng biến thiên... Xét tính đúng sai:}{1}{Giải thích tổng quát nếu có...}
	\statement{true}{Hàm số đồng biến trên khoảng $(0; 2)$.}
	\statement{false}{Hàm số có giá trị nhỏ nhất bằng $-1$.}
	\statement{true}{Đồ thị hàm số có tiệm cận đứng $x = 1$.}
	\statement{false}{Hàm số đạt cực đại tại $x = 3$.}
\end{truefalse}
```

### 3. Trắc nghiệm trả lời ngắn (`shortanswer`)
- Tham số: `\shortanswer{Đề bài}{Đáp án ngắn}{Điểm}{Giải thích}`
```latex
\shortanswer{Tổng số đường tiệm cận đứng và tiệm cận ngang của hàm số $y = \frac{x+1}{x^2-1}$ là bao nhiêu?}{2}{1}{Ta có $y = \frac{1}{x-1}$ với $x \ne -1$, nên có 1 TCĐ $x = 1$ và 1 TCN $y = 0$. Tổng số tiệm cận là 2.}
```

### 4. Câu hỏi tự luận / Ví dụ minh họa (`essay`)
- Tham số: `\essay{Đề bài}{Điểm}{Lời giải / Gợi ý}`
```latex
\essay{Khảo sát sự biến thiên và vẽ đồ thị hàm số $y = x^3 - 3x^2 + 1$.}{1}{Lời giải chi tiết...}
```

---

## 5. Quy Tắc Xử Lý Lời Giải & Đánh Số Ảnh (`\image`)

Cú pháp chèn ảnh: `\image{tỷ_lệ}{chú_thích}{tên_file}` (ví dụ: `\image{0.6}{}{lt_1.png}`).

### A. Quy Tắc Xử Lý Lời Giải (QUAN TRỌNG)

1. **Khi lời giải trong tài liệu CÓ CHỨA HÌNH ẢNH (đồ thị, hình vẽ hình học, bảng biến thiên, bảng biểu...):**
   - **KHÔNG CẦN GÕ LỜI GIẢI BẰNG VĂN BẢN CHỮ.**
   - Người dùng sẽ chụp/cắt toàn bộ phần lời giải đó thành ảnh để tải lên hệ thống.
   - Ta chỉ cần đặt placeholder ảnh `\image{0.6}{}{lt_X.png}` vào tham số `{Lời giải}` / `{Giải thích}`.
   - Ví dụ:
   ```latex
   \essay{Cho hình chóp $S.ABCD$ có đáy là hình vuông... Tính thể tích khối chóp.}{1}{\image{0.6}{}{lt_5.png}}
   ```

2. **Khi lời giải bị PHÂN TÁCH QUA NHIỀU TRANG (phân trang):**
   - Nếu lời giải của một câu hỏi/ví dụ kéo dài qua 2 hay nhiều trang trong tài liệu gốc, bắt buộc chèn liên tiếp đủ các mã ảnh tương ứng cho từng trang:
   ```latex
   \essay{Đề bài...}{1}{\image{0.6}{}{lt_8.png} \image{0.6}{}{lt_9.png}}
   ```

3. **Khi lời giải trong tài liệu KHÔNG CÓ HÌNH ẢNH (chỉ thuần chữ và công thức đại số):**
   - **Bắt buộc gõ lại đầy đủ lời giải chi tiết** bằng mã nguồn LaTeX chuẩn KaTeX.
   - Nhớ không dùng `\textbf{Lời giải:}`, `\textit`, `\vspace`, `\begin{itemize}` bên trong lời giải.

### B. Quy Tắc Đánh Số Ảnh Liên Tục

1. **Đánh số tăng dần liên tục:**
   - Tất cả hình ảnh trong một file được đánh số tăng dần liên tục: `lt_1.png`, `lt_2.png`, `lt_3.png`, `lt_4.png`,... từ đầu đến cuối file theo thứ tự đọc (gặp ảnh nào trong lý thuyết, đề bài hay lời giải thì tăng số đó lên 1).
2. **Ảnh trong lý thuyết:** Đặt trực tiếp trong khối `\begin{lesson}`.
3. **Ảnh trong đề bài:** Đặt ngay trong tham số `{Đề bài}` của câu hỏi.
4. **Ảnh trong lời giải:** Đặt trong tham số `{Giải thích}` / `{Lời giải}` của câu hỏi.
