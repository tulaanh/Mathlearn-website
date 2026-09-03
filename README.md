# 📚 MathLearn – Học Toán Online

Website học tập dành cho học sinh với hệ thống **bài học, tài liệu, bài tập và bài kiểm tra môn Toán**.

Nội dung được tổ chức theo mô hình **chương → bài học**. Mỗi tài liệu, bài tập hoặc bài kiểm tra có thể được gắn với **một hoặc nhiều chủ đề Toán** để dễ tìm kiếm và ôn tập.

## 🚀 Chạy website trên máy

```bash
npm install     # cài đặt (chỉ cần chạy lần đầu)
npm run dev     # chạy chế độ phát triển
```

Mở trình duyệt tại địa chỉ: **http://localhost:3000**

## 🌐 Đưa website lên internet (miễn phí)

Cách đơn giản nhất là dùng [Vercel](https://vercel.com):

1. Đưa code lên GitHub (tạo repository và push).
2. Đăng nhập Vercel bằng tài khoản GitHub → **Import Project**.
3. Nhấn **Deploy** — xong! Bạn sẽ có đường dẫn kiểu `https://ten-website.vercel.app`.

## ✏️ Cách thêm / sửa bài test (dành cho gia sư)

Mở file **`data/quizzes.ts`** — toàn bộ bài test nằm trong mảng `quizzes`.
Copy một object mẫu và thay nội dung:

```ts
{
  id: "toan-9-hinh-hoc",              // id duy nhất, không dấu, không cách
  title: "Hình học lớp 9 – Đường tròn",
  subject: "Toán",                     // môn học
  grade: "Lớp 9",                      // khối lớp
  description: "Mô tả ngắn về bài test",
  topicIds: ["ham-so-va-do-thi", "dao-ham", "nguyen-ham-va-tich-phan"], // có thể có nhiều chủ đề
  questions: [
    {
      id: "q1",                        // id câu hỏi, duy nhất trong bài
      text: "Câu hỏi của bạn ở đây?",
      options: [
        { id: "a", text: "Đáp án A" },
        { id: "b", text: "Đáp án B" },
        { id: "c", text: "Đáp án C" },
        { id: "d", text: "Đáp án D" },
      ],
      correctOptionId: "b",            // trùng id của đáp án đúng
      explanation: "Giải thích hiển thị sau khi nộp bài.",
    },
    // ... thêm câu hỏi khác
  ],
},
```

Sau khi lưu file, website tự cập nhật (khi đang chạy `npm run dev`).

## 🏷️ Chủ đề Toán

Danh mục chủ đề nằm trong **`data/topics.ts`**. Mỗi chủ đề có `id`, `name` và `description`.

Để gắn một bài kiểm tra vào nhiều chủ đề, thêm các id vào `topicIds` trong **`data/quizzes.ts`**:

```ts
topicIds: ["ham-so-va-do-thi", "dao-ham", "nguyen-ham-va-tich-phan"]
```

Bài học/tài liệu trong **`data/chapters.ts`** cũng dùng `topicIds` tùy chọn:

```ts
topicIds: ["ham-so-va-do-thi", "dao-ham", "nguyen-ham-va-tich-phan"]
```

Các chủ đề chỉ dùng để phân loại. Nếu một bài thuộc nhiều chủ đề, bài chỉ được lưu và tính tiến trình một lần.

## 📚 Chương học & tiến trình

Website tổ chức nội dung theo **chương → bài học nhỏ**:

- Trang chủ hiển thị các **thẻ chương** kèm **thanh tiến trình %** của cả chương.
- Vào một chương (`/chuong/[id]`) để thấy danh sách bài học, mỗi bài có thanh % riêng.
- Hai loại bài học:
  - **Bài có bài test**: tiến trình = điểm tốt nhất bạn đã đạt (làm lại để nâng điểm).
  - **Bài lý thuyết (tự học)**: bấm nút **"✅ Đánh dấu đã học"** để đạt 100%.
- Tiến trình chương = trung bình tiến trình của các bài trong chương.
- Tiến trình được lưu tự động trên **trình duyệt của học sinh** (localStorage) — không cần đăng nhập. Xóa dữ liệu trình duyệt sẽ reset tiến trình.

## 🌙 Dark mode

Website hỗ trợ chế độ tối:

- Nhấn nút **🌙 / ☀️** ở góc phải thanh đầu trang để bật/tắt.
- Lựa chọn được **ghi nhớ tự động** (localStorage) cho lần truy cập sau.
- Nếu chưa chọn gì, website tự theo **cài đặt sáng/tối của hệ điều hành**.

## 🏦 Ngân hàng câu hỏi theo mức độ khó

Giáo viên có kho câu hỏi riêng tại **`/quan-ly/ngan-hang-cau-hoi`**, mỗi câu gắn một mức độ khó:

| Mức độ | Ký hiệu |
|---|---|
| Nhận biết | NB |
| Thông hiểu | TH |
| Vận dụng | VD |
| Vận dụng cao | VDC |

Tính năng chính:

- **Quản lý câu hỏi**: thêm/sửa/xóa, lọc theo khối lớp, chủ đề, mức độ, loại câu; hỗ trợ 4 loại câu hỏi như tài liệu (trắc nghiệm, đúng/sai, trả lời ngắn, tự luận) kèm ảnh minh họa.
- **Ghép đề thủ công**: tích chọn nhiều câu → nút **"Tạo đề từ N câu đã chọn"** tạo ngay bài kiểm tra nháp để tinh chỉnh.
- **Sinh đề theo ma trận** (`/quan-ly/ngan-hang-cau-hoi/sinh-de`): nhập số câu NB/TH/VD/VDC (ví dụ 8-6-4-2) → hệ thống chọn ngẫu nhiên từ ngân hàng → lưu thành bài kiểm tra.
- **Chèn từ ngân hàng khi soạn tài liệu**: trong khối 🧩 Câu hỏi của trình soạn thảo có nút **"📚 Chèn từ ngân hàng câu hỏi"**.
- **Nhập/xuất JSON**: định dạng riêng `{ version: 1, kind: "question_bank", questions: [...] }` — xem chi tiết ở `QUY-TAC-FILE-JSON.md` Phần 8.

Cấu trúc dữ liệu nằm ở bảng Supabase `question_bank` (+ `question_bank_topics`). Chạy thêm file **`supabase/migration-question-bank.sql`** trong SQL Editor để tạo bảng. Vì ngân hàng chứa đáp án đúng nên chỉ giáo viên đọc/ghi được dữ liệu này.

## 🔐 Đăng nhập và tài liệu

Tài liệu động dùng **Supabase**:

- Tài khoản giáo viên và học sinh dùng Supabase Auth.
- Tắt đăng ký công khai trong Supabase: **Authentication → Providers → Email → Allow new users to sign up: Off**.
- Bạn tạo tài khoản học sinh thủ công trong **Authentication → Users → Add user**.
- Sau đó thêm hồ sơ tương ứng trong bảng `profiles` với `role = 'student'`.
- Tạo một hồ sơ giáo viên duy nhất với `role = 'teacher'`.
- Chạy toàn bộ file **`supabase/schema.sql`** trong Supabase SQL Editor.
- Sao chép `.env.example` thành `.env.local` và điền URL/anon key của dự án.

Giáo viên dùng `/quan-ly/tai-lieu` để tạo tài liệu gồm các block văn bản và hình ảnh JPG/PNG/WebP (tối đa 5 MB/ảnh), gán nhiều chủ đề, lưu nháp hoặc đăng công khai. Học sinh dùng `/tai-lieu` để xem tài liệu đã đăng. Không hỗ trợ video và không đưa `service_role key` vào frontend.

## 🛠️ Công nghệ sử dụng

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com): Auth, PostgreSQL, Storage và Row Level Security
- Dữ liệu chương, bài học và bài kiểm tra mẫu vẫn nằm trong các file `data/`


### Cấu hình Supabase trên máy local

```powershell
Copy-Item .env.example .env.local
```

Mở `.env.local` và điền `NEXT_PUBLIC_SUPABASE_URL` cùng `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Không dùng `service_role key` trong `.env.local` của frontend.

Sau khi chạy `supabase/schema.sql`, tạo user trong **Authentication → Users**. Lấy UUID của user và thêm profile trong SQL Editor:

```sql
insert into public.profiles (id, display_name, role)
values ('UUID_CUA_BAN', 'Tên giáo viên', 'teacher');
```

Tạo các tài khoản học sinh tương tự với `role = 'student'`. Chỉ user có role `teacher` mới nhìn thấy khu vực quản lý và được phép upload ảnh/tạo tài liệu. Học sinh chỉ thấy tài liệu có trạng thái `published`.


## 📁 Cấu trúc thư mục

```
app/
  page.tsx                  → Trang chủ (danh sách bài test)
  quiz/[id]/page.tsx        → Trang làm bài test
  quiz/[id]/result/page.tsx → Trang kết quả & xem lại
components/
  QuizCard.tsx              → Thẻ hiển thị 1 bài test
  QuizList.tsx              → Danh sách + bộ lọc theo chủ đề
  QuestionCard.tsx          → 1 câu hỏi trắc nghiệm
  QuizRunner.tsx            → Luồng làm bài & nộp bài
  ResultSummary.tsx         → Tổng kết điểm + giải thích
data/
  quizzes.ts                → ⭐ DỮ LIỆU BÀI TEST (sửa tại đây)
  topics.ts                 → Danh mục chủ đề Toán
  chapters.ts               → Chương, bài học và tài liệu
lib/
  types.ts                  → Kiểu dữ liệu
```
