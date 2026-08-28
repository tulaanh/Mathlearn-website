-- Bảng lưu trữ báo lỗi câu hỏi từ học sinh / người học.
-- Hỗ trợ các loại lỗi: giải sai, đề sai, thiếu đề, đề mở, lỗi khác.
-- Chạy file này trong Supabase SQL Editor.

create table if not exists public.question_reports (
  id uuid primary key default gen_random_uuid(),
  question_id text not null,
  question_text text not null,
  question_type text default 'multiple_choice',
  document_id uuid references public.documents(id) on delete set null,
  document_title text,
  document_url text,
  error_type text not null check (error_type in ('giai_sai', 'de_sai', 'thieu_de', 'de_mo', 'khac')),
  description text,
  status text not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  resolution_note text,
  reporter_id uuid references public.profiles(id) on delete set null,
  reporter_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists question_reports_status_idx on public.question_reports(status);
create index if not exists question_reports_error_type_idx on public.question_reports(error_type);
create index if not exists question_reports_created_at_idx on public.question_reports(created_at desc);
create index if not exists question_reports_document_id_idx on public.question_reports(document_id);

-- Trigger cập nhật updated_at tự động
drop trigger if exists question_reports_touch_updated_at on public.question_reports;
create trigger question_reports_touch_updated_at before update on public.question_reports
for each row execute procedure public.touch_updated_at();

-- Bật Row Level Security (RLS)
alter table public.question_reports enable row level security;

-- 1. Cho phép mọi người (kể cả khách chưa đăng nhập và học sinh) gửi báo lỗi
drop policy if exists question_reports_insert_all on public.question_reports;
create policy question_reports_insert_all on public.question_reports for insert
with check (true);

-- 2. Giáo viên có quyền xem toàn bộ báo lỗi
drop policy if exists question_reports_select_teacher on public.question_reports;
create policy question_reports_select_teacher on public.question_reports for select to authenticated
using (public.is_teacher() or reporter_id = (select auth.uid()));

-- 3. Giáo viên có quyền cập nhật trạng thái / ghi chú xử lý
drop policy if exists question_reports_update_teacher on public.question_reports;
create policy question_reports_update_teacher on public.question_reports for update to authenticated
using (public.is_teacher())
with check (public.is_teacher());

-- 4. Giáo viên có quyền xóa báo lỗi
drop policy if exists question_reports_delete_teacher on public.question_reports;
create policy question_reports_delete_teacher on public.question_reports for delete to authenticated
using (public.is_teacher());
