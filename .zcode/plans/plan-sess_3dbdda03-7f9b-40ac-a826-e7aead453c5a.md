# Kế hoạch tối ưu hiệu năng Website (Next.js 15 + React 19 + KaTeX + Supabase)

## Đánh giá tổng quan
Nền tảng đã tốt (memo cơ bản, Suspense/skeleton, không CDN, system fonts). Vấn đề tập trung vào: (1) re-render lan truyền khi gõ/click, (2) KaTeX parse đồng bộ không cache, (3) animate thuộc tính layout, (4) ảnh eager-load, (5) query dữ liệu dư trên trang danh sách.

---

## Giai đoạn 1 — Giảm giật lag khi thao tác (cao nhất)

### 1.1 Cache KaTeX — `components/MathText.tsx`
- Thêm cache module-level `Map<string, string>` trong `renderKatex`, key = `${displayMode}|${latex}`, giới hạn ~500 entry (FIFO evict).
- Cả `renderInline` lẫn block `$$...$$` đều hưởng lợi; mount lại trang không parse lại.

### 1.2 ExamRunner — `components/ExamRunner.tsx`
- Tách `ExamQuestionCard` + `ExamBlock` thành component memo hóa. Vì `answers` là object đổi identity mỗi lần cập nhật, dùng **custom comparator** cho `React.memo`: so sánh `question`, `locked`, và riêng các giá trị answer của câu đó (`question.id` + các `statementKey`), không so identity object.
- `setAnswer` bọc `useCallback` để giữ ổn định.
- Ô input trả lời ngắn (dòng ~382-389): tách thành component nhỏ giữ **local state**, commit lên `answers` qua debounce ~400ms (useEffect + cleanup) → hết re-render parent mỗi phím gõ.

### 1.3 QuizRunner / QuizBlock — cùng xử lý
- `components/QuizBlock.tsx`: memo hóa phần render câu hỏi + input local state/debounce tương tự 1.2 (quy mô nhỏ hơn).

### 1.4 Editor — hết lag khi gõ văn bản dài
- `components/QuizEditor.tsx`: bỏ `cloneQuestions` (deep-clone toàn bộ mọi keystroke, dòng 12/23) → thay bằng update bất biến có mục tiêu: `updateQuestion(qIdx, patch)`, `updateOption(qIdx, oIdx, text)` chỉ tạo object mới cho câu/option bị sửa, giữ nguyên identity các câu khác.
- Memo hóa các block editor (`QuizEditor` và các editor block khác trong DocumentEditor) bằng `React.memo` — nhờ identity ổn định từ 1.4 trên, sửa block nào chỉ re-render block đó.

---

## Giai đoạn 2 — Animation / render

### 2.1 ProgressBar — `components/ProgressBar.tsx`
- Thay animate `width` bằng `transform: scaleX(clamped/100)` + `origin-left` + `transition-transform duration-500`. Bỏ `transition-all`.

### 2.2 Theme toggle hết khựng
- `app/globals.css:25`: bỏ `transition` màu trên body. `app/layout.tsx:42`: bỏ `transition-colors` trùng lặp trên body. Bỏ `transition-colors` trên các container lớn (article cards trong ExamRunner, footer) → đổi theme tức thì, không animated-repaint 250ms toàn trang. Giữ `transition-colors` trên nút/label nhỏ (rẻ).

### 2.3 Thu hẹp 22 chỗ `transition-all`
- Sửa cơ học theo danh sách file từ audit (ChapterCard, ChapterCardDynamic, DocumentCard, QuizCard, TestCard, ChapterManageCard, DocumentTemplatePicker, QuestionCard, Sidebar, HomeTabs, ChapterEditor, ChapterItemPicker, layout.tsx, LoginForm) → `transition-colors` / `transition-shadow` / `transition-transform` đúng property thực tế.

### 2.4 HomeTabs — `components/HomeTabs.tsx:166`
- Xóa `transition-all` chết trên vòng conic-gradient (gradient không nội suy được).

---

## Giai đoạn 3 — Ảnh & dữ liệu

### 3.1 Lazy images (6 chỗ)
- `DocumentViewer.tsx:45`, `DocumentPreviewModal.tsx:136`, `QuizBlock.tsx:63`, `ExamRunner.tsx:226` + `294`, `QuizEditor.tsx:78`: thêm `loading="lazy" decoding="async"`.

### 3.2 Trang danh sách chỉ lấy metadata — `lib/documents.ts`
- Thêm hàm `loadDocumentCards()` (chỉ cột cần cho card: title, grade, topics, counts, updatedAt), không fetch nội dung blocks/quiz JSON đầy đủ. Kiểm tra `supabase/schema.sql` + `migration-lesson-quiz.sql` để lấy số câu hỏi bằng query nhẹ (aggregate) nếu schema đã chuẩn hóa. Cập nhật `app/tai-lieu/page.tsx`, `app/quiz/page.tsx`, `HomeTabs` dùng nguồn mới; giữ nguyên `loadDocuments()` cho trang chi tiết. Đảm bảo card hiển thị đúng như cũ.

### 3.3 Dọn dẹp
- Xóa `index.html` mồ côi ở root (tham chiếu style.css/script.js không tồn tại, Next.js không serve).

---

## Giai đoạn 4 — Kiểm chứng
1. `npx tsc --noEmit` + `npm run build` pass.
2. Mở dev server, test bằng browser: gõ liên tục vào ô trả lời ngắn bài kiểm tra (so sánh mượt trước/sau), click đáp án, đổi dark/light, so sánh giao diện các trang chính bằng screenshot với hiện tại (không regression).

## Rủi ro & lưu ý
- Custom comparator memo ở ExamRunner phải test kỹ (chọn đáp án mọi loại câu: multiple_choice, true_false, short_answer, essay; nộp bài chấm điểm đúng).
- `loadDocumentCards` đụng tầng dữ liệu — đối chiếu hiển thị card trước/sau; nếu schema không cho count rẻ thì fallback chỉ cắt phần nội dung nặng, vẫn cải thiện RSC payload.
- Ảnh từ Supabase không biết kích thước gốc → không đặt được width/height tĩnh, chỉ lazy + async decoding (tránh CLS cần metadata ảnh trong DB — nằm ngoài phạm vi này).