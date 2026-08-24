-- Migration: Lộ trình học (Learning Paths)
-- Chạy file này trong Supabase SQL Editor sau khi đã chạy schema.sql và migration-chapters.sql.
-- Lộ trình học là một phần riêng, mỗi lộ trình chứa nhiều chương.

-- =============================================
-- 1. Bảng lộ trình học
-- =============================================
create table if not exists public.learning_paths (
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

-- Trigger cập nhật updated_at khi sửa lộ trình
drop trigger if exists learning_paths_touch_updated_at on public.learning_paths;
create trigger learning_paths_touch_updated_at before update on public.learning_paths
for each row execute procedure public.touch_updated_at();

-- =============================================
-- 2. Thêm cột path_id vào chapters (nullable để chương cũ vẫn hoạt động)
-- =============================================
alter table public.chapters
  add column if not exists path_id uuid references public.learning_paths(id) on delete set null;

create index if not exists chapters_path_position_idx on public.chapters(path_id, position);

-- =============================================
-- 3. Row Level Security
-- =============================================
alter table public.learning_paths enable row level security;

-- Lộ trình: mọi user đã đăng nhập đều đọc được
drop policy if exists learning_paths_read on public.learning_paths;
create policy learning_paths_read on public.learning_paths for select to authenticated using (true);

-- Lộ trình: chỉ giáo viên mới được tạo/sửa/xóa
drop policy if exists learning_paths_insert_teacher on public.learning_paths;
create policy learning_paths_insert_teacher on public.learning_paths for insert to authenticated
with check (public.is_teacher() and created_by = (select auth.uid()));

drop policy if exists learning_paths_update_teacher on public.learning_paths;
create policy learning_paths_update_teacher on public.learning_paths for update to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists learning_paths_delete_teacher on public.learning_paths;
create policy learning_paths_delete_teacher on public.learning_paths for delete to authenticated
using (public.is_teacher());
