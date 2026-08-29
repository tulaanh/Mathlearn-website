-- ============================================================================
-- SỰ KIỆN TOÁN HỌC (Events / Activities / Type-specific targets)
-- Chạy toàn bộ file này trong Supabase SQL Editor SAU khi đã chạy:
--   schema.sql  →  migration-question-bank.sql
-- ============================================================================
--
-- Ý tưởng:
--   events              : một sự kiện, có mốc thời gian bắt đầu / kết thúc.
--   event_bosses        : các boss của sự kiện, có máu (HP) dùng chung cho cả lớp.
--   event_activities    : các hoạt động trong sự kiện, mỗi hoạt động đánh 1 boss,
--                         có giới hạn thời gian làm bài và số lượt tham gia.
--   event_activity_questions : câu hỏi (snapshot từ ngân hàng) của từng hoạt động.
--   event_attempts      : mỗi lượt làm bài của học sinh.
--   event_damage_logs   : lịch sử sát thương, dùng cho bảng xếp hạng.
--
-- ⚠️ AN TOÀN: đáp án đúng nằm trong event_activity_questions và CHỈ giáo viên
--    được SELECT bảng này. Học sinh lấy câu hỏi / nộp bài qua 2 hàm
--    SECURITY DEFINER (start_event_attempt, submit_event_attempt) — đề trả về
--    đã bị xóa đáp án, việc chấm điểm và trừ máu boss diễn ra hoàn toàn trong
--    Postgres nên không thể gian lận từ phía trình duyệt.

do $$ begin
  create type public.event_status as enum ('draft', 'published', 'ended');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_attempt_status as enum ('in_progress', 'submitted', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum ('boss_battle', 'tree_growth', 'race');
exception when duplicate_object then null; end $$;

-- ============================================================================
-- 1. BẢNG
-- ============================================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  grade text not null default 'Lớp 8',
  status public.event_status not null default 'draft',
  event_type public.event_type not null default 'boss_battle',
  scoring_config jsonb not null default '{"metric":"damage","aggregation":"sum","higherIsBetter":true}'::jsonb,
  display_config jsonb not null default '{}'::jsonb,
  start_at timestamptz not null default now(),
  end_at timestamptz not null,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_time_range_check check (end_at > start_at)
);

-- Bổ sung an toàn cho database đã chạy bản MVP trước đó.
alter table public.events add column if not exists event_type public.event_type not null default 'boss_battle';
alter table public.events add column if not exists scoring_config jsonb not null default '{"metric":"damage","aggregation":"sum","higherIsBetter":true}'::jsonb;
alter table public.events add column if not exists display_config jsonb not null default '{}'::jsonb;

create table if not exists public.event_bosses (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text,
  emoji text not null default '👾',
  max_hp integer not null check (max_hp > 0),
  current_hp integer not null check (current_hp >= 0),
  position integer not null default 0 check (position >= 0),
  is_defeated boolean not null default false,
  defeated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_activities (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  -- Target riêng của boss; các loại sự kiện khác có thể dùng target_id.
  boss_id uuid references public.event_bosses(id) on delete set null,
  target_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  position integer not null default 0 check (position >= 0),
  -- Giới hạn thời gian mỗi lượt (giây).
  time_limit_seconds integer not null default 600 check (time_limit_seconds between 30 and 21600),
  -- Số lượt tối đa mỗi học sinh; 0 = không giới hạn.
  max_attempts integer not null default 3 check (max_attempts >= 0),
  -- Số câu rút ra mỗi lượt; 0 = dùng toàn bộ câu hỏi của hoạt động.
  question_count integer not null default 5 check (question_count >= 0),
  -- Rút câu hỏi ngẫu nhiên mỗi lượt.
  shuffle_questions boolean not null default true,
  -- Sát thương theo mức độ khó: {"nhan_biet":10,"thong_hieu":20,...}
  damage_config jsonb not null default
    '{"nhan_biet":10,"thong_hieu":20,"van_dung":35,"van_dung_cao":50}'::jsonb,
  scoring_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.event_activities add column if not exists target_id uuid;
alter table public.event_activities add column if not exists scoring_config jsonb not null default '{}'::jsonb;

create table if not exists public.event_activity_questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.event_activities(id) on delete cascade,
  -- id câu hỏi (id của question_bank, dạng text để sau này thêm được câu tự soạn).
  question_id text not null,
  difficulty public.question_difficulty not null,
  -- Bản chụp toàn bộ câu hỏi (kèm đáp án) tại thời điểm thêm vào hoạt động,
  -- để sửa ngân hàng câu hỏi về sau không làm đổi đề của sự kiện đang chạy.
  question_data jsonb not null,
  -- Ghi đè sát thương riêng cho câu này (NULL = theo damage_config của hoạt động).
  damage_override integer check (damage_override is null or damage_override >= 0),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  constraint event_activity_questions_unique unique (activity_id, question_id)
);

create table if not exists public.event_attempts (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  activity_id uuid not null references public.event_activities(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Đề của lượt này (thứ tự câu hỏi đã rút).
  question_ids text[] not null,
  status public.event_attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  damage integer not null default 0
);

create table if not exists public.event_damage_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  boss_id uuid references public.event_bosses(id) on delete set null,
  activity_id uuid references public.event_activities(id) on delete set null,
  attempt_id uuid references public.event_attempts(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  -- Lưu sẵn tên hiển thị: học sinh không có quyền đọc profiles của người khác.
  user_name text not null default 'Học sinh',
  damage integer not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists events_status_idx on public.events(status);
create index if not exists events_time_idx on public.events(start_at, end_at);
create index if not exists event_bosses_event_position_idx on public.event_bosses(event_id, position);
create index if not exists event_activities_event_position_idx on public.event_activities(event_id, position);
create index if not exists event_activity_questions_activity_idx on public.event_activity_questions(activity_id, position);
create index if not exists event_attempts_user_activity_idx on public.event_attempts(user_id, activity_id);
create index if not exists event_attempts_status_idx on public.event_attempts(status);
create index if not exists event_damage_logs_event_user_idx on public.event_damage_logs(event_id, user_id);
create index if not exists event_damage_logs_boss_idx on public.event_damage_logs(boss_id);

-- Log điểm tổng quát cho mọi cơ chế sự kiện. event_damage_logs vẫn giữ để tương thích dữ liệu boss cũ.
create table if not exists public.event_score_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  activity_id uuid references public.event_activities(id) on delete set null,
  attempt_id uuid references public.event_attempts(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null default 'Học sinh',
  metric text not null check (char_length(metric) between 1 and 40),
  value integer not null default 0 check (value >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists event_score_logs_attempt_unique_idx
  on public.event_score_logs(attempt_id) where attempt_id is not null;
create index if not exists event_score_logs_event_user_idx on public.event_score_logs(event_id, user_id);

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at before update on public.events
for each row execute procedure public.touch_updated_at();

drop trigger if exists event_bosses_touch_updated_at on public.event_bosses;
create trigger event_bosses_touch_updated_at before update on public.event_bosses
for each row execute procedure public.touch_updated_at();

drop trigger if exists event_activities_touch_updated_at on public.event_activities;
create trigger event_activities_touch_updated_at before update on public.event_activities
for each row execute procedure public.touch_updated_at();

-- ============================================================================
-- 2. ROW LEVEL SECURITY
-- ============================================================================
-- Nguyên tắc: học sinh chỉ ĐỌC được sự kiện đã đăng (published/ended) và không
-- bao giờ đọc được bảng câu hỏi (chứa đáp án). Ghi dữ liệu lượt làm bài chỉ đi
-- qua các hàm SECURITY DEFINER ở phần 3.

alter table public.events enable row level security;
alter table public.event_bosses enable row level security;
alter table public.event_activities enable row level security;
alter table public.event_activity_questions enable row level security;
alter table public.event_attempts enable row level security;
alter table public.event_damage_logs enable row level security;
alter table public.event_score_logs enable row level security;

-- Hàm tiện dụng: sự kiện có được học sinh xem không?
create or replace function public.event_is_visible(target_event_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id
      and (e.status in ('published', 'ended') or public.is_teacher())
  );
$$;

-- events
drop policy if exists events_read_visible on public.events;
create policy events_read_visible on public.events for select to authenticated
using (status in ('published', 'ended') or public.is_teacher());

drop policy if exists events_insert_teacher on public.events;
create policy events_insert_teacher on public.events for insert to authenticated
with check (public.is_teacher() and created_by = (select auth.uid()));

drop policy if exists events_update_teacher on public.events;
create policy events_update_teacher on public.events for update to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists events_delete_teacher on public.events;
create policy events_delete_teacher on public.events for delete to authenticated
using (public.is_teacher());

-- event_bosses
drop policy if exists event_bosses_read_visible on public.event_bosses;
create policy event_bosses_read_visible on public.event_bosses for select to authenticated
using (public.event_is_visible(event_id));

drop policy if exists event_bosses_manage_teacher on public.event_bosses;
create policy event_bosses_manage_teacher on public.event_bosses for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- event_activities
drop policy if exists event_activities_read_visible on public.event_activities;
create policy event_activities_read_visible on public.event_activities for select to authenticated
using (public.event_is_visible(event_id));

drop policy if exists event_activities_manage_teacher on public.event_activities;
create policy event_activities_manage_teacher on public.event_activities for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- event_activity_questions: CHỈ giáo viên (chứa đáp án đúng)
drop policy if exists event_activity_questions_teacher_only on public.event_activity_questions;
create policy event_activity_questions_teacher_only on public.event_activity_questions
for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- event_attempts: học sinh chỉ đọc lượt của mình; ghi qua hàm SECURITY DEFINER
drop policy if exists event_attempts_read_own on public.event_attempts;
create policy event_attempts_read_own on public.event_attempts for select to authenticated
using (user_id = (select auth.uid()) or public.is_teacher());

drop policy if exists event_attempts_manage_teacher on public.event_attempts;
create policy event_attempts_manage_teacher on public.event_attempts for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- event_damage_logs: ai cũng đọc được để hiển thị bảng xếp hạng của sự kiện
drop policy if exists event_damage_logs_read_visible on public.event_damage_logs;
create policy event_damage_logs_read_visible on public.event_damage_logs for select to authenticated
using (public.event_is_visible(event_id));

drop policy if exists event_damage_logs_manage_teacher on public.event_damage_logs;
create policy event_damage_logs_manage_teacher on public.event_damage_logs for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- event_score_logs: học sinh chỉ đọc điểm của sự kiện đã hiển thị; ghi qua RPC.
drop policy if exists event_score_logs_read_visible on public.event_score_logs;
create policy event_score_logs_read_visible on public.event_score_logs for select to authenticated
using (public.event_is_visible(event_id));

drop policy if exists event_score_logs_manage_teacher on public.event_score_logs;
create policy event_score_logs_manage_teacher on public.event_score_logs for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

-- ============================================================================
-- 3. HÀM SERVER-SIDE (chấm điểm + trừ máu boss)
-- ============================================================================

/* Xóa toàn bộ dữ liệu đáp án khỏi một câu hỏi trước khi gửi cho học sinh. */
create or replace function public.event_question_public(qdata jsonb)
returns jsonb language sql immutable as $$
  select jsonb_strip_nulls(
    (qdata
      - 'correctOptionId' - 'correctAnswer' - 'explanation'
      - 'explanationImageStoragePath' - 'explanationImageCaption'
      - 'explanationImageUrl' - 'explanationImageFile' - 'explanationImages'
      - 'explanationImageSourceName')
    || jsonb_build_object(
      'options',
      case
        when jsonb_typeof(qdata -> 'options') = 'array' then (
          select coalesce(jsonb_agg(o - 'correctVal' order by ord), '[]'::jsonb)
          from jsonb_array_elements(qdata -> 'options') with ordinality t(o, ord)
        )
        else null
      end,
      'statements',
      case
        when jsonb_typeof(qdata -> 'statements') = 'array' then (
          select coalesce(jsonb_agg(s - 'correctVal' order by ord), '[]'::jsonb)
          from jsonb_array_elements(qdata -> 'statements') with ordinality t(s, ord)
        )
        else null
      end
    )
  );
$$;

/* Các mệnh đề Đúng/Sai của câu hỏi (fallback từ options như phía TypeScript). */
create or replace function public.event_statements(qdata jsonb)
returns jsonb language sql immutable as $$
  select case
    when jsonb_typeof(qdata -> 'statements') = 'array' then qdata -> 'statements'
    when jsonb_typeof(qdata -> 'options') = 'array' then (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', o ->> 'id',
            'text', o ->> 'text',
            'correctVal', coalesce(o ->> 'correctVal', 'true')
          ) order by ord
        ),
        '[]'::jsonb
      )
      from jsonb_array_elements(qdata -> 'options') with ordinality t(o, ord)
    )
    else '[]'::jsonb
  end;
$$;

/* Bắt đầu (hoặc tiếp tục) một lượt làm bài của hoạt động.
   Trả về đề đã xóa đáp án + thời điểm hết giờ. */
create or replace function public.start_event_attempt(p_activity_id uuid)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_act public.event_activities;
  v_event public.events;
  v_attempt public.event_attempts;
  v_used integer;
  v_take integer;
  v_ids text[];
  v_questions jsonb;
begin
  if v_user is null then
    raise exception 'Cần đăng nhập để tham gia sự kiện.';
  end if;

  select * into v_act from public.event_activities where id = p_activity_id;
  if not found then
    raise exception 'Không tìm thấy hoạt động.';
  end if;

  select * into v_event from public.events where id = v_act.event_id;
  if v_event.status <> 'published' then
    raise exception 'Sự kiện chưa mở hoặc đã đóng.';
  end if;
  if v_event.event_type <> 'boss_battle' then
    raise exception 'Loại sự kiện này chưa được mở cho học sinh.';
  end if;
  if now() < v_event.start_at then
    raise exception 'Sự kiện chưa bắt đầu.';
  end if;
  if now() > v_event.end_at then
    raise exception 'Sự kiện đã kết thúc.';
  end if;

  -- Đánh dấu các lượt quá giờ mà chưa nộp.
  update public.event_attempts
  set status = 'expired'
  where user_id = v_user
    and activity_id = p_activity_id
    and status = 'in_progress'
    and expires_at < now();

  -- Đang có lượt còn hiệu lực → tiếp tục lượt đó (chống mở nhiều tab để lấy đề mới).
  select * into v_attempt
  from public.event_attempts
  where user_id = v_user and activity_id = p_activity_id and status = 'in_progress'
  order by started_at desc
  limit 1;

  if not found then
    if v_act.max_attempts > 0 then
      select count(*) into v_used
      from public.event_attempts
      where user_id = v_user and activity_id = p_activity_id and status <> 'in_progress';
      if v_used >= v_act.max_attempts then
        raise exception 'Bạn đã dùng hết % lượt của hoạt động này.', v_act.max_attempts;
      end if;
    end if;

    v_take := nullif(v_act.question_count, 0);

    select array_agg(q.question_id order by q.ord) into v_ids
    from (
      select eaq.question_id,
             case when v_act.shuffle_questions then row_number() over (order by random())
                  else row_number() over (order by eaq.position, eaq.created_at) end as ord
      from public.event_activity_questions eaq
      where eaq.activity_id = p_activity_id
      order by case when v_act.shuffle_questions then random() else eaq.position::numeric end
      limit coalesce(v_take, 2147483647)
    ) q;

    if v_ids is null or array_length(v_ids, 1) is null then
      raise exception 'Hoạt động này chưa có câu hỏi nào.';
    end if;

    insert into public.event_attempts (
      event_id, activity_id, user_id, question_ids, expires_at, total_questions
    ) values (
      v_act.event_id,
      p_activity_id,
      v_user,
      v_ids,
      least(now() + make_interval(secs => v_act.time_limit_seconds), v_event.end_at),
      array_length(v_ids, 1)
    )
    returning * into v_attempt;
  end if;

  select coalesce(jsonb_agg(public.event_question_public(eaq.question_data) || jsonb_build_object(
           'id', eaq.question_id,
           'difficulty', eaq.difficulty,
           'damage', coalesce(eaq.damage_override,
             (v_act.damage_config ->> eaq.difficulty::text)::integer, 0)
         ) order by ord), '[]'::jsonb)
  into v_questions
  from unnest(v_attempt.question_ids) with ordinality u(qid, ord)
  join public.event_activity_questions eaq
    on eaq.activity_id = p_activity_id and eaq.question_id = u.qid;

  return jsonb_build_object(
    'attemptId', v_attempt.id,
    'activityId', p_activity_id,
    'eventId', v_act.event_id,
    'startedAt', v_attempt.started_at,
    'expiresAt', v_attempt.expires_at,
    'timeLimitSeconds', v_act.time_limit_seconds,
    'questions', v_questions
  );
end;
$$;

revoke all on function public.start_event_attempt(uuid) from public;
grant execute on function public.start_event_attempt(uuid) to authenticated;

/* Nộp bài một lượt: chấm điểm, tính sát thương theo độ khó, trừ máu boss.
   p_answers dạng { "questionId": "optionId", "questionId:statementId": "true" }.
   Toàn bộ chạy trong một transaction; boss được lock bằng SELECT ... FOR UPDATE
   nên nhiều học sinh nộp cùng lúc vẫn trừ máu chính xác. */
create or replace function public.submit_event_attempt(p_attempt_id uuid, p_answers jsonb)
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_attempt public.event_attempts;
  v_act public.event_activities;
  v_event public.events;
  v_boss public.event_bosses;
  v_row record;
  v_base integer;
  v_type text;
  v_statements jsonb;
  v_st jsonb;
  v_ok integer;
  v_st_total integer;
  v_correct_questions integer := 0;
  v_total_questions integer := 0;
  v_damage integer := 0;
  v_dealt integer := 0;
  v_expired boolean;
  v_user_name text;
begin
  if v_user is null then
    raise exception 'Cần đăng nhập để nộp bài.';
  end if;

  select * into v_attempt from public.event_attempts where id = p_attempt_id for update;
  if not found then
    raise exception 'Không tìm thấy lượt làm bài.';
  end if;
  if v_attempt.user_id <> v_user then
    raise exception 'Bạn không có quyền nộp lượt làm bài này.';
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'Lượt làm bài này đã được nộp trước đó.';
  end if;

  select * into v_act from public.event_activities where id = v_attempt.activity_id;
  select * into v_event from public.events where id = v_attempt.event_id;

  -- Quá giờ (kể cả do sự kiện kết thúc): ghi nhận nhưng không gây sát thương.
  v_expired := now() > v_attempt.expires_at + interval '5 seconds';

  for v_row in
    select eaq.question_id,
           eaq.question_data,
           eaq.difficulty,
           coalesce(eaq.damage_override,
             (v_act.damage_config ->> eaq.difficulty::text)::integer, 0) as base_damage
    from unnest(v_attempt.question_ids) with ordinality u(qid, ord)
    join public.event_activity_questions eaq
      on eaq.activity_id = v_attempt.activity_id and eaq.question_id = u.qid
    order by u.ord
  loop
    v_type := coalesce(v_row.question_data ->> 'type', 'multiple_choice');
    v_base := greatest(v_row.base_damage, 0);

    if v_type = 'essay' then
      continue; -- tự luận không tự chấm, không tính sát thương
    end if;

    v_total_questions := v_total_questions + 1;

    if v_type = 'true_false' then
      v_statements := public.event_statements(v_row.question_data);
      v_st_total := jsonb_array_length(v_statements);
      v_ok := 0;
      for v_st in select value from jsonb_array_elements(v_statements) loop
        if coalesce(p_answers ->> (v_row.question_id || ':' || (v_st ->> 'id')), '')
             = coalesce(v_st ->> 'correctVal', 'true') then
          v_ok := v_ok + 1;
        end if;
      end loop;
      if v_st_total > 0 and v_ok = v_st_total then
        v_correct_questions := v_correct_questions + 1;
      end if;
      if v_st_total > 0 then
        v_damage := v_damage + round(v_base::numeric * v_ok / v_st_total);
      end if;

    elsif v_type = 'short_answer' then
      if btrim(coalesce(v_row.question_data ->> 'correctAnswer', '')) <> ''
         and lower(btrim(coalesce(p_answers ->> v_row.question_id, '')))
             = lower(btrim(v_row.question_data ->> 'correctAnswer')) then
        v_correct_questions := v_correct_questions + 1;
        v_damage := v_damage + v_base;
      end if;

    else -- multiple_choice
      if coalesce(p_answers ->> v_row.question_id, '') <> ''
         and p_answers ->> v_row.question_id = v_row.question_data ->> 'correctOptionId' then
        v_correct_questions := v_correct_questions + 1;
        v_damage := v_damage + v_base;
      end if;
    end if;
  end loop;

  if v_expired then
    v_damage := 0;
  end if;

  -- Trừ máu boss (nếu hoạt động có gán boss và boss còn sống).
  if v_damage > 0 and v_act.boss_id is not null then
    select * into v_boss from public.event_bosses where id = v_act.boss_id for update;
    if found and not v_boss.is_defeated then
      v_dealt := least(v_damage, v_boss.current_hp);
      update public.event_bosses
      set current_hp = current_hp - v_dealt,
          is_defeated = (current_hp - v_dealt) <= 0,
          defeated_at = case when (current_hp - v_dealt) <= 0 then now() else defeated_at end
      where id = v_boss.id
      returning * into v_boss;
    else
      v_dealt := 0;
    end if;
  elsif v_act.boss_id is not null then
    select * into v_boss from public.event_bosses where id = v_act.boss_id;
  end if;

  update public.event_attempts
  set status = case when v_expired then 'expired' else 'submitted' end,
      submitted_at = now(),
      correct_count = v_correct_questions,
      total_questions = v_total_questions,
      damage = v_dealt
  where id = p_attempt_id
  returning * into v_attempt;

  if v_dealt > 0 then
    select display_name into v_user_name from public.profiles where id = v_user;
    insert into public.event_score_logs (
      event_id, activity_id, attempt_id, user_id, user_name, metric, value,
      metadata
    ) values (
      v_attempt.event_id, v_act.id, v_attempt.id, v_user,
      coalesce(v_user_name, 'Học sinh'), 'damage', v_dealt,
      jsonb_build_object(
        'correctCount', v_correct_questions,
        'totalQuestions', v_total_questions,
        'rawDamage', v_damage,
        'bossId', v_act.boss_id
      )
    );
    insert into public.event_damage_logs (
      event_id, boss_id, activity_id, attempt_id, user_id, user_name,
      damage, correct_count, total_questions
    ) values (
      v_attempt.event_id, v_act.boss_id, v_act.id, v_attempt.id, v_user,
      coalesce(v_user_name, 'Học sinh'), v_dealt, v_correct_questions, v_total_questions
    );
  end if;

  return jsonb_build_object(
    'attemptId', v_attempt.id,
    'expired', v_expired,
    'correctCount', v_correct_questions,
    'totalQuestions', v_total_questions,
    'damage', v_dealt,
    'score', v_dealt,
    'metric', 'damage',
    'eventType', v_event.event_type,
    'rawDamage', v_damage,
    'bossId', v_act.boss_id,
    'bossName', v_boss.name,
    'bossCurrentHp', v_boss.current_hp,
    'bossMaxHp', v_boss.max_hp,
    'bossDefeated', coalesce(v_boss.is_defeated, false)
  );
end;
$$;

revoke all on function public.submit_event_attempt(uuid, jsonb) from public;
grant execute on function public.submit_event_attempt(uuid, jsonb) to authenticated;

/* Bảng xếp hạng tổng quát. Log boss cũ được dùng nếu chưa có score log tương ứng,
   tránh cộng trùng các lượt boss đã được ghi ở cả hai bảng. */
create or replace function public.event_score_leaderboard(p_event_id uuid, p_limit integer default 20)
returns table (user_id uuid, user_name text, total_score bigint, metric text, attempts bigint)
language sql stable security definer set search_path = public
as $$
  with scores as (
    select s.user_id, s.user_name, s.value, s.metric, s.attempt_id
    from public.event_score_logs s
    where s.event_id = p_event_id
    union all
    select d.user_id, d.user_name, d.damage, 'damage', d.attempt_id
    from public.event_damage_logs d
    where d.event_id = p_event_id
      and not exists (
        select 1 from public.event_score_logs s
        where s.attempt_id = d.attempt_id
      )
  )
  select s.user_id,
         max(s.user_name) as user_name,
         sum(s.value)::bigint as total_score,
         coalesce(max(s.metric), 'points') as metric,
         count(*)::bigint as attempts
  from scores s
  where public.event_is_visible(p_event_id)
  group by s.user_id
  order by total_score desc
  limit greatest(coalesce(p_limit, 20), 1);
$$;

revoke all on function public.event_score_leaderboard(uuid, integer) from public;
grant execute on function public.event_score_leaderboard(uuid, integer) to authenticated;

/* Bảng xếp hạng legacy của boss, giữ nguyên cho client cũ. */
create or replace function public.event_leaderboard(p_event_id uuid, p_limit integer default 20)
returns table (user_id uuid, user_name text, total_damage bigint, attempts bigint)
language sql stable security definer set search_path = public
as $$
  select l.user_id,
         max(l.user_name) as user_name,
         sum(l.damage)::bigint as total_damage,
         count(*)::bigint as attempts
  from public.event_damage_logs l
  where l.event_id = p_event_id and public.event_is_visible(p_event_id)
  group by l.user_id
  order by total_damage desc
  limit greatest(coalesce(p_limit, 20), 1);
$$;

revoke all on function public.event_leaderboard(uuid, integer) from public;
grant execute on function public.event_leaderboard(uuid, integer) to authenticated;

/* Số câu hỏi của từng hoạt động + score cá nhân. Drop trước vì PostgreSQL không
   cho CREATE OR REPLACE thay đổi kiểu trả về của function hiện hữu. */
drop function if exists public.event_activity_stats(uuid);
create function public.event_activity_stats(p_event_id uuid)
returns table (
  activity_id uuid,
  pool_count integer,
  my_attempts integer,
  my_best_damage integer,
  my_total_damage bigint,
  my_best_score integer,
  my_total_score bigint
)
language sql stable security definer set search_path = public
as $$
  select a.id,
         (select count(*)::integer from public.event_activity_questions q where q.activity_id = a.id),
         (select count(*)::integer from public.event_attempts t
            where t.activity_id = a.id and t.user_id = auth.uid() and t.status <> 'in_progress'),
         (select coalesce(max(t.damage), 0)::integer from public.event_attempts t
            where t.activity_id = a.id and t.user_id = auth.uid()),
         (select coalesce(sum(t.damage), 0)::bigint from public.event_attempts t
            where t.activity_id = a.id and t.user_id = auth.uid()),
         (select coalesce(max(s.value), 0)::integer from public.event_score_logs s
            where s.activity_id = a.id and s.user_id = auth.uid()),
         (select coalesce(sum(s.value), 0)::bigint from public.event_score_logs s
            where s.activity_id = a.id and s.user_id = auth.uid())
  from public.event_activities a
  where a.event_id = p_event_id and public.event_is_visible(p_event_id);
$$;

revoke all on function public.event_activity_stats(uuid) from public;
grant execute on function public.event_activity_stats(uuid) to authenticated;
