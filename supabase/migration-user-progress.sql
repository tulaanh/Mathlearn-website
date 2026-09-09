-- ============================================================================
-- MathLearn: Lưu tiến trình học tập và kết quả bài kiểm tra vào Database
-- Chạy toàn bộ file này trong Supabase SQL Editor.
-- ============================================================================

-- 1. BẢNG TIẾN TRÌNH HỌC TẬP (Bài đã học, % hoàn thành, điểm cao nhất)
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_key text not null check (char_length(item_key) between 1 and 200),
  percent integer not null check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  constraint user_progress_user_item_unique unique (user_id, item_key)
);

create index if not exists user_progress_user_idx on public.user_progress(user_id);
create index if not exists user_progress_item_key_idx on public.user_progress(item_key);

-- RLS cho user_progress
alter table public.user_progress enable row level security;

-- Học sinh đọc tiến trình của chính mình, Giáo viên đọc được tất cả
drop policy if exists user_progress_select on public.user_progress;
create policy user_progress_select on public.user_progress
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());

-- Học sinh ghi tiến trình của chính mình
drop policy if exists user_progress_insert on public.user_progress;
create policy user_progress_insert on public.user_progress
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_progress_update on public.user_progress;
create policy user_progress_update on public.user_progress
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists user_progress_delete on public.user_progress;
create policy user_progress_delete on public.user_progress
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());


-- 2. BẢNG KẾT QUẢ BÀI KIỂM TRA (Lịch sử làm bài, điểm số, câu đúng/sai)
create table if not exists public.user_exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  correct_count integer not null default 0 check (correct_count >= 0),
  total_questions integer not null default 0 check (total_questions >= 0),
  earned_points numeric not null default 0 check (earned_points >= 0),
  total_points numeric not null default 0 check (total_points >= 0),
  percent integer not null default 0 check (percent between 0 and 100),
  score numeric not null default 0 check (score between 0 and 10),
  created_at timestamptz not null default now()
);

create index if not exists user_exam_results_user_doc_idx on public.user_exam_results(user_id, document_id);
create index if not exists user_exam_results_created_at_idx on public.user_exam_results(created_at desc);

-- RLS cho user_exam_results
alter table public.user_exam_results enable row level security;

-- Học sinh đọc kết quả của chính mình, Giáo viên đọc được tất cả
drop policy if exists user_exam_results_select on public.user_exam_results;
create policy user_exam_results_select on public.user_exam_results
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());

-- Học sinh lưu kết quả làm bài của chính mình
drop policy if exists user_exam_results_insert on public.user_exam_results;
create policy user_exam_results_insert on public.user_exam_results
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_exam_results_delete on public.user_exam_results;
create policy user_exam_results_delete on public.user_exam_results
  for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());
