-- Bảng lưu trữ câu hỏi cá nhân của học sinh từ các bài kiểm tra và bài tập.
-- Chạy script này trong Supabase SQL Editor.

create table if not exists public.student_saved_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  question_data jsonb not null default '{}'::jsonb,
  source_doc_id uuid references public.documents(id) on delete set null,
  source_doc_title text,
  created_at timestamptz not null default now(),
  constraint student_saved_questions_user_question_unique unique (user_id, question_id)
);

create index if not exists student_saved_questions_user_idx on public.student_saved_questions(user_id);
create index if not exists student_saved_questions_created_at_idx on public.student_saved_questions(created_at desc);

alter table public.student_saved_questions enable row level security;

-- Học sinh chỉ có quyền SELECT, INSERT, DELETE câu hỏi của chính mình
drop policy if exists student_saved_questions_select_own on public.student_saved_questions;
create policy student_saved_questions_select_own on public.student_saved_questions
for select to authenticated
using (user_id = (select auth.uid()));

drop policy if exists student_saved_questions_insert_own on public.student_saved_questions;
create policy student_saved_questions_insert_own on public.student_saved_questions
for insert to authenticated
with check (user_id = (select auth.uid()));

drop policy if exists student_saved_questions_delete_own on public.student_saved_questions;
create policy student_saved_questions_delete_own on public.student_saved_questions
for delete to authenticated
using (user_id = (select auth.uid()));
