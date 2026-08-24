-- Ngân hàng câu hỏi theo mức độ khó (nhận biết / thông hiểu / vận dụng / vận dụng cao).
-- Chạy toàn bộ file này trong Supabase SQL Editor (sau schema.sql).
--
-- LƯU Ý AN TOÀN: ngân hàng chứa đáp án đúng nên RLS CHỈ cho giáo viên đọc/ghi,
-- học sinh không được phép truy cập bảng này qua bất kỳ chính sách nào.

do $$ begin
  create type public.question_difficulty as enum ('nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao');
exception when duplicate_object then null; end $$;

create table if not exists public.question_bank (
  id uuid primary key default gen_random_uuid(),
  text text not null check (char_length(text) between 1 and 5000),
  type text not null default 'multiple_choice' check (type in ('multiple_choice', 'true_false', 'short_answer', 'essay')),
  difficulty public.question_difficulty not null,
  grade text not null,
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_bank_topics (
  question_id uuid not null references public.question_bank(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete restrict,
  primary key (question_id, topic_id)
);

create index if not exists question_bank_difficulty_idx on public.question_bank(difficulty);
create index if not exists question_bank_grade_idx on public.question_bank(grade);
create index if not exists question_bank_type_idx on public.question_bank(type);
create index if not exists question_bank_created_by_idx on public.question_bank(created_by);
create index if not exists question_bank_topics_topic_idx on public.question_bank_topics(topic_id);

alter table public.question_bank enable row level security;
alter table public.question_bank_topics enable row level security;

-- Chỉ giáo viên: đọc toàn bộ ngân hàng (câu hỏi chứa đáp án đúng).
drop policy if exists question_bank_read_teacher on public.question_bank;
create policy question_bank_read_teacher on public.question_bank for select to authenticated
using (public.is_teacher());

drop policy if exists question_bank_insert_teacher on public.question_bank;
create policy question_bank_insert_teacher on public.question_bank for insert to authenticated
with check (public.is_teacher() and created_by = (select auth.uid()));

drop policy if exists question_bank_update_teacher on public.question_bank;
create policy question_bank_update_teacher on public.question_bank for update to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists question_bank_delete_teacher on public.question_bank;
create policy question_bank_delete_teacher on public.question_bank for delete to authenticated
using (public.is_teacher());

-- Chủ đề của câu hỏi đi theo quyền của câu hỏi tương ứng.
drop policy if exists question_bank_topics_read_teacher on public.question_bank_topics;
create policy question_bank_topics_read_teacher on public.question_bank_topics for select to authenticated
using (public.is_teacher());

drop policy if exists question_bank_topics_manage_teacher on public.question_bank_topics;
create policy question_bank_topics_manage_teacher on public.question_bank_topics for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- Cập nhật updated_at tự động.
drop trigger if exists question_bank_touch_updated_at on public.question_bank;
create trigger question_bank_touch_updated_at before update on public.question_bank
for each row execute procedure public.touch_updated_at();
