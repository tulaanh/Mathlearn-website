# Kế hoạch: Gợi ý chuyển bài tiếp theo trong chương

## Logic hoàn thành (đã chốt với bạn)
- **Tài liệu lý thuyết (không có test đính kèm)**: hoàn thành khi học sinh bấm nút "✅ Hoàn thành bài học" ở cuối trang → hiện card gợi ý.
- **Tài liệu có test đính kèm**: sau khi **nộp bài test** (bất kể điểm số) → tài liệu **tự động** được đánh dấu hoàn thành → hiện gợi ý.
- **Hiển thị**: card ở cuối trang tài liệu + nút "Bài tiếp theo" ngay trong khung kết quả sau khi nộp bài test.

## Thay đổi

### 1. File mới `lib/chapter-navigation.ts`
- `getChapterItemUrl(item)`: builder URL dùng chung (`/quiz/{quizId}` cho quiz legacy, `/quiz/{documentId}` cho tài liệu dạng test, `/tai-lieu/{documentId}` cho tài liệu thường) — thay cho logic inline hiện tại trong `ChapterDetailDynamic.tsx:84-92`.
- Type `ChapterNavigation`: `{ chapterId, chapterTitle, currentIndex, totalItems, nextItem: { title, url } | null, nextChapter: { id, title } | null }`.
- `getNavigationForDocument(documentId, preferredChapterId?)` (bọc `cache()`):
  - Truy vấn `chapter_items` where `document_id` join `chapters` → xác định chương chứa tài liệu (ưu tiên tham số `chuong` trên URL, fallback chương đầu tiên nếu tài liệu thuộc nhiều chương).
  - Tải toàn bộ item của chương (dùng lại `getChapterDataById` đã cache), tìm vị trí hiện tại, tính item kế tiếp theo `position`.
  - Hết item → nếu chương có `path_id`, tìm **chương kế tiếp trong lộ trình** để gợi ý.
- `getNavigationForTestDocument(testId, preferredChapterId?)`: thử với test như item trực tiếp của chương; nếu không có, truy vấn ngược `documents` where `attached_test_id = testId` → tài liệu cha → trả về navigation của tài liệu cha **kèm `parentDocument`** (để hiện nút "Quay lại bài học" và tự hoàn thành tài liệu cha).

### 2. `lib/progress.ts` — thêm 2 helper key
`documentProgressKey(id)` → `` `document:${id}` `` và `documentTestProgressKey(id)` → `` `document-quiz:${id}` `` để các component dùng chung, tránh lặp chuỗi (thay cho `getDynamicItemKey` vốn nhận `ChapterItem`).

### 3. `app/tai-lieu/[id]/page.tsx`
- Nhận thêm `searchParams` (`?chuong=...`), tính `getNavigationForDocument`, truyền prop `navigation` vào `DocumentViewer`.

### 4. `components/DocumentViewer.tsx` + component mới `components/DocumentNextStep.tsx`
- Link "Làm bài →" của test đính kèm (`DocumentViewer.tsx:86-98`) thêm `?chuong={chapterId}` để giữ ngữ cảnh chương.
- Render `<DocumentNextStep document navigation />` cuối trang, các trạng thái:
  - Tài liệu **không thuộc chương nào** → không hiển thị.
  - **Có test đính kèm, chưa nộp** → card tím: "Bước cuối: làm bài kiểm tra đính kèm" + nút "Làm bài →" (điều kiện "đã nộp" = key `document-quiz:{testId}` **tồn tại** trong progress, không dùng `> 0` vì có thể nộp được 0 điểm).
  - **Tự động hoàn thành**: `useEffect` — nếu đã nộp test đính kèm mà `document:{id}` < 100 → `setPercent(…, 100)`.
  - **Không có test, chưa hoàn thành** → card + nút "✅ Hoàn thành bài học" (bấm → `setPercent(document:{id}, 100)`).
  - **Đã hoàn thành, còn bài kế** → card xanh "🎉 Bạn đã hoàn thành! Bài tiếp theo: {title}" + nút "Chuyển ngay →" + link nhỏ "Về danh sách chương".
  - **Đã hoàn thành, hết item** → "🎉 Hoàn thành toàn bộ chương!" + nút sang chương kế trong lộ trình (nếu có).
- Style theo hệ thống hiện tại (rounded-2xl, gradient, dark mode), tiếng Việt.

### 5. `app/quiz/[id]/page.tsx` + `components/ExamRunner.tsx`
- Trang quiz: với test document, tính `getNavigationForTestDocument` (kèm `?chuong=` nếu có) → truyền prop `nextStep` vào `ExamRunner`.
- `ExamRunner.handleSubmit` (`ExamRunner.tsx:90-111`): nếu là test đính kèm (có `parentDocument`) → `setPercent(document:{parentId}, 100)` ngay khi nộp.
- `ExamResultBanner` (`ExamRunner.tsx:230-268`): thêm hàng nút phía trên "Làm lại/Chọn bài khác":
  - "➡️ Bài tiếp theo: {title}" (nếu còn item kế) hoặc "🎉 Hoàn thành chương — sang chương kế" (nếu hết).
  - "← Quay lại bài học" (chỉ khi là test đính kèm).

### 6. `components/ChapterDetailDynamic.tsx`
- Các link "Đọc tài liệu / Làm bài test / Xem lại tài liệu" thêm `?chuong={chapter.id}`; dùng `getChapterItemUrl` chung.

## Không thay đổi
- **Không đụng database** — tiến độ vẫn lưu localStorage như hiện tại.
- Giữ nguyên logic "hoàn thành" của trang danh sách chương (done = 100%); tính năng này chỉ bổ sung cơ chế gợi ý.
- Quiz legacy tĩnh (`QuizRunner`) không thêm gợi ý; chỉ cần URL helper hỗ trợ khi quiz legacy là *bài kế tiếp* được gợi ý.

## Kiểm thử
- Chạy `npm run build` để xác nhận biên dịch.
- Kiểm tra thủ công các luồng: (1) tài liệu thường → bấm hoàn thành → card gợi ý; (2) tài liệu có test đính kèm → nộp bài → nút "Bài tiếp theo" trong kết quả + quay lại tài liệu thấy đã hoàn thành; (3) item cuối chương → card hoàn thành chương/chương kế; (4) tài liệu không thuộc chương nào → không hiện gì.