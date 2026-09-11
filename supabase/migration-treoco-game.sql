-- ============================================================================
-- MathLearn: Game Treo Cổ Trung Thu — lưu trạng thái chơi theo tài khoản
-- Chạy toàn bộ file này trong Supabase SQL Editor.
-- ============================================================================

-- BẢNG TRẠNG THÁI GAME TREO CỔ (1 dòng mỗi người chơi)
-- - word_key/revealed_letters/wrong_letters/turns/status: tiến độ đoán chữ hiện tại
-- - next_question_at: thời điểm được giải câu toán tiếp theo (hồi chiếu server-side)
-- - jar_difficulties: xáo trộn độ khó 3 hũ hiện tại (chỉ server biết)
-- - active_question: câu toán đang mở {id, text, options, correctIndex, explanation, difficulty}
-- - wins/losses: số từ đã thắng/thua
create table if not exists public.treoco_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word_key text not null default '',
  revealed_letters jsonb not null default '[]'::jsonb,
  wrong_letters jsonb not null default '[]'::jsonb,
  turns integer not null default 3 check (turns >= 0),
  status text not null default 'playing' check (status in ('playing', 'won', 'lost')),
  next_question_at timestamptz not null default now(),
  jar_difficulties jsonb not null default '[]'::jsonb,
  active_question jsonb,
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  spin_tickets integer not null default 0 check (spin_tickets >= 0),
  mooncake_fragments jsonb not null default '{}'::jsonb,
  completed_cakes jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint treoco_state_user_unique unique (user_id)
);

-- Bổ sung cột spin_tickets, mooncake_fragments, completed_cakes nếu bảng đã được tạo trước đó trên Supabase
alter table if exists public.treoco_state
  add column if not exists spin_tickets integer not null default 0 check (spin_tickets >= 0),
  add column if not exists mooncake_fragments jsonb not null default '{}'::jsonb,
  add column if not exists completed_cakes jsonb not null default '{}'::jsonb;

create index if not exists treoco_state_user_idx on public.treoco_state(user_id);

-- RLS cho treoco_state
alter table public.treoco_state enable row level security;

-- Học sinh đọc trạng thái của chính mình, Giáo viên đọc được tất cả
drop policy if exists treoco_state_select on public.treoco_state;
create policy treoco_state_select on public.treoco_state
  for select to authenticated
  using (user_id = (select auth.uid()) or public.is_teacher());

-- Học sinh tạo dòng trạng thái của chính mình
drop policy if exists treoco_state_insert on public.treoco_state;
create policy treoco_state_insert on public.treoco_state
  for insert to authenticated
  with check (user_id = (select auth.uid()));

-- Học sinh cập nhật trạng thái của chính mình
drop policy if exists treoco_state_update on public.treoco_state;
create policy treoco_state_update on public.treoco_state
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Cập nhật tất cả tài khoản đang có 30 vé (từ bản test) về chuẩn 3 vé khởi đầu
update public.treoco_state
set turns = 3
where turns = 30 or (turns >= 25 and wins = 0);

