-- Cập nhật RLS: Cho phép học sinh (mọi tài khoản đã đăng nhập) đọc ngân hàng câu hỏi.
-- Giáo viên vẫn là người duy nhất có quyền thêm, sửa, xóa (INSERT, UPDATE, DELETE).
-- Chạy file này trong Supabase SQL Editor.

-- 1. Bảng question_bank: cho phép authenticated SELECT
drop policy if exists question_bank_read_teacher on public.question_bank;
drop policy if exists question_bank_read_authenticated on public.question_bank;

create policy question_bank_read_authenticated on public.question_bank
for select to authenticated
using (true);

-- 2. Bảng question_bank_topics: cho phép authenticated SELECT
drop policy if exists question_bank_topics_read_teacher on public.question_bank_topics;
drop policy if exists question_bank_topics_read_authenticated on public.question_bank_topics;

create policy question_bank_topics_read_authenticated on public.question_bank_topics
for select to authenticated
using (true);
