-- Migration: Quản lý Chương động
-- Chạy file này trong Supabase SQL Editor sau khi đã chạy schema.sql.

-- =============================================
-- 1. Bảng chương
-- =============================================
create table if not exists public.chapters (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  subject text not null default 'Toán' check (subject = 'Toán'),
  grade text not null default 'Lớp 8',
  position integer not null default 0,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger cập nhật updated_at khi sửa chương
drop trigger if exists chapters_touch_updated_at on public.chapters;
create trigger chapters_touch_updated_at before update on public.chapters
for each row execute procedure public.touch_updated_at();

-- =============================================
-- 2. Bảng liên kết chương ↔ tài liệu / bài kiểm tra
-- =============================================
create table if not exists public.chapter_items (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  item_type text not null check (item_type in ('document', 'quiz')),
  -- Tài liệu Supabase (uuid). NULL nếu item_type = 'quiz'.
  document_id uuid references public.documents(id) on delete cascade,
  -- Bài kiểm tra cũ (id string trong data/quizzes.ts). NULL nếu item_type = 'document'.
  quiz_id text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  -- Ràng buộc: phải có đúng 1 trong 2 tham chiếu
  constraint chapter_items_ref_check check (
    (item_type = 'document' and document_id is not null and quiz_id is null)
    or (item_type = 'quiz' and quiz_id is not null and document_id is null)
  )
);

-- Indexes
create index if not exists chapters_position_idx on public.chapters(position);
create index if not exists chapter_items_chapter_position_idx on public.chapter_items(chapter_id, position);
create index if not exists chapter_items_document_idx on public.chapter_items(document_id) where document_id is not null;

-- =============================================
-- 3. Row Level Security
-- =============================================
alter table public.chapters enable row level security;
alter table public.chapter_items enable row level security;

-- Chapters: mọi user đã đăng nhập đều đọc được
drop policy if exists chapters_read on public.chapters;
create policy chapters_read on public.chapters for select to authenticated using (true);

-- Chapters: chỉ giáo viên mới được tạo/sửa/xóa
drop policy if exists chapters_insert_teacher on public.chapters;
create policy chapters_insert_teacher on public.chapters for insert to authenticated
with check (public.is_teacher() and created_by = (select auth.uid()));

drop policy if exists chapters_update_teacher on public.chapters;
create policy chapters_update_teacher on public.chapters for update to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists chapters_delete_teacher on public.chapters;
create policy chapters_delete_teacher on public.chapters for delete to authenticated
using (public.is_teacher());

-- Chapter items: mọi user đã đăng nhập đều đọc được
drop policy if exists chapter_items_read on public.chapter_items;
create policy chapter_items_read on public.chapter_items for select to authenticated using (true);

-- Chapter items: chỉ giáo viên mới được quản lý
drop policy if exists chapter_items_manage_teacher on public.chapter_items;
create policy chapter_items_manage_teacher on public.chapter_items for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());
