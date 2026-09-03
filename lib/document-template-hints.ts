import { topics } from "@/data/topics";

/** Mẫu cấu trúc JSON hợp lệ để người dùng tham khảo khi nhập tài liệu. */
export const JSON_FORMAT_HINT = `{
  "version": 1,
  "title": "Tên tài liệu (tối đa 200 ký tự)",
  "description": "Mô tả (tuỳ chọn)",
  "grade": "Lớp 8",
  "status": "draft",
  "documentType": "normal",
  "topicIds": ["ham-so-va-do-thi"],
  "blocks": [
    { "type": "text", "content": "Văn bản, hỗ trợ công thức $LaTeX$" },
    { "type": "image", "altText": "Mô tả ảnh", "caption": "Chú thích",
      "dataUrl": "data:image/png;base64,..." },
    { "type": "lesson", "title": "Tiêu đề bài học", "description": "Mô tả ngắn",
      "content": "Nội dung bài giảng, công thức $$y = ax + b$$" },
    { "type": "quiz", "title": "Bài tập trắc nghiệm", "questions": [
      { "type": "multiple_choice", "text": "Câu hỏi?", "options": ["A", "B", "C", "D"], "correctIndex": 0, "points": 1, "explanation": "Lời giải" },
      { "type": "true_false", "text": "Đề bài đúng sai", "statements": [
        { "text": "Mệnh đề 1", "correct": true }, { "text": "Mệnh đề 2", "correct": false }
      ], "points": 1, "explanation": "Giải thích" },
      { "type": "short_answer", "text": "Câu hỏi trả lời ngắn", "correctAnswer": "5", "points": 1 },
      { "type": "essay", "text": "Câu hỏi tự luận", "points": 2, "explanation": "Gợi ý / Đáp án" }
    ] }
  ]
}`;

/** Mẫu cú pháp LaTeX (.tex) hợp lệ để người dùng tham khảo khi nhập tài liệu. */
export const LATEX_SYNTAX_HINT = `\\documentclass[12pt,a4paper]{article}
\\usepackage{amsmath, amssymb}

% --- THÔNG TIN TÀI LIỆU ---
\\doctitle{Tên tài liệu}
\\docdesc{Mô tả tài liệu (tùy chọn)}
\\docgrade{Lớp 8}
\\docstatus{draft}        % draft | published
\\doctype{normal}         % normal (tài liệu học) | test (bài kiểm tra)
\\doctopics{ham-so-va-do-thi} % Các ID chủ đề cách nhau bởi dấu phẩy

% --- KHỐI BÀI GIẢNG / LÝ THUYẾT ---
\\begin{lesson}{Tiêu đề bài giảng}{Mô tả bài giảng}
Nội dung bài giảng hỗ trợ công thức $y = ax + b$ và $$\\int f(x)dx$$.
\\image{0.7}{Chú thích ảnh}{ten_anh.png}
\\end{lesson}

% --- KHỐI CÂU HỎI & BÀI TẬP ---
\\begin{quiz}{Luyện tập trắc nghiệm}
  % 1. Trắc nghiệm đơn: \\begin{mcq}{câu hỏi}{chỉ số đúng (0-3)}{điểm}{giải thích}
  \\begin{mcq}{Câu hỏi trắc nghiệm?}{0}{1}{Giải thích chi tiết}
    \\option{Đáp án A}
    \\option{Đáp án B}
    \\option{Đáp án C}
    \\option{Đáp án D}
  \\end{mcq}

  % 2. Đúng / Sai: \\begin{truefalse}{câu hỏi}{điểm}{giải thích}
  \\begin{truefalse}{Xét tính đúng/sai của các mệnh đề:}{1}{Giải thích}
    \\statement{true}{Mệnh đề đúng}
    \\statement{false}{Mệnh đề sai}
  \\end{truefalse}

  % 3. Trả lời ngắn: \\shortanswer{câu hỏi}{đáp án đúng}{điểm}{giải thích}
  \\shortanswer{Tìm nghiệm của $2x = 6$}{3}{1}{Chia 2 vế cho 2}

  % 4. Tự luận: \\essay{câu hỏi}{điểm}{gợi ý / đáp án}
  \\essay{Chứng minh định lý Pythagoras}{2}{Vẽ hình vuông cạnh a+b}
\\end{quiz}`;

/** Danh sách topicIds hợp lệ, sinh từ dữ liệu chủ đề hiện có. */
export const TOPIC_IDS_HINT = `topicIds hợp lệ: ${topics.map((topic) => topic.id).join(", ")}.`;
