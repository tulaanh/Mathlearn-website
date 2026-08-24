-- MathLearn: schema tài liệu Toán, tài khoản và phân quyền.
-- Chạy toàn bộ file này trong Supabase SQL Editor.

create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('teacher', 'student');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.document_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;
do $$ begin
  create type public.document_block_type as enum ('text', 'image', 'lesson', 'quiz');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now()
);

create table if not exists public.topics (
  id text primary key,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 200),
  description text,
  subject text not null default 'Toán' check (subject = 'Toán'),
  grade text not null,
  document_type text not null default 'normal' check (document_type in ('normal', 'test')),
  status public.document_status not null default 'draft',
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_blocks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  block_type public.document_block_type not null,
  content text,
  title text,
  description text,
  storage_path text,
  alt_text text,
  caption text,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  constraint document_block_content_check check (
    (block_type = 'text' and content is not null and storage_path is null)
    or (block_type = 'image' and storage_path is not null and alt_text is not null)
    or (block_type = 'lesson' and content is not null and title is not null and storage_path is null)
    or (block_type = 'quiz' and content is not null and title is not null and storage_path is null)
  )
);

create table if not exists public.document_topics (
  document_id uuid not null references public.documents(id) on delete cascade,
  topic_id text not null references public.topics(id) on delete restrict,
  primary key (document_id, topic_id)
);

-- Một tài liệu học tập có thể đính kèm nhiều bài kiểm tra (bài kiểm tra = documents có document_type='test').
create table if not exists public.document_attached_tests (
  document_id uuid not null references public.documents(id) on delete cascade,
  test_id uuid not null references public.documents(id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  primary key (document_id, test_id)
);

create index if not exists documents_status_idx on public.documents(status);
create index if not exists documents_grade_idx on public.documents(grade);
create index if not exists document_blocks_document_position_idx on public.document_blocks(document_id, position);
create index if not exists document_topics_topic_idx on public.document_topics(topic_id);
create index if not exists document_attached_tests_test_idx on public.document_attached_tests(test_id);

create or replace function public.is_teacher()
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles
    where id = (select auth.uid()) and role = 'teacher');
$$;

create or replace function public.touch_updated_at()
returns trigger language plpgsql
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists documents_touch_updated_at on public.documents;
create trigger documents_touch_updated_at before update on public.documents
for each row execute procedure public.touch_updated_at();

-- Bài kiểm tra không đính kèm bài kiểm tra: gỡ toàn bộ liên kết khi tài liệu đổi thành test.
create or replace function public.clear_attached_tests_on_type_change()
returns trigger language plpgsql as $$
begin
  if new.document_type = 'test' then
    delete from public.document_attached_tests where document_id = new.id;
  end if;
  return new;
end; $$;

drop trigger if exists documents_clear_attached_tests on public.documents;
create trigger documents_clear_attached_tests before update on public.documents
for each row execute procedure public.clear_attached_tests_on_type_change();

-- Chỉ tài liệu học tập mới được đính kèm bài kiểm tra
create or replace function public.validate_document_attached_test()
returns trigger language plpgsql as $$
begin
  if exists (
    select 1 from public.documents
    where id = new.document_id and document_type = 'test'
  ) then
    raise exception 'Bài kiểm tra không được đính kèm bài kiểm tra khác';
  end if;
  return new;
end; $$;

drop trigger if exists document_attached_tests_validate on public.document_attached_tests;
create trigger document_attached_tests_validate before insert or update
on public.document_attached_tests
for each row execute procedure public.validate_document_attached_test();

alter table public.profiles enable row level security;
alter table public.topics enable row level security;
alter table public.documents enable row level security;
alter table public.document_blocks enable row level security;
alter table public.document_topics enable row level security;
alter table public.document_attached_tests enable row level security;

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_teacher());

drop policy if exists topics_read_authenticated on public.topics;
create policy topics_read_authenticated on public.topics for select to authenticated using (true);
drop policy if exists topics_manage_teacher on public.topics;
create policy topics_manage_teacher on public.topics for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists documents_read_visible on public.documents;
create policy documents_read_visible on public.documents for select to authenticated
using (status = 'published' or created_by = (select auth.uid()) or public.is_teacher());
drop policy if exists documents_insert_teacher on public.documents;
create policy documents_insert_teacher on public.documents for insert to authenticated
with check (public.is_teacher() and created_by = (select auth.uid()));
drop policy if exists documents_update_teacher on public.documents;
create policy documents_update_teacher on public.documents for update to authenticated
using (public.is_teacher()) with check (public.is_teacher());
drop policy if exists documents_delete_teacher on public.documents;
create policy documents_delete_teacher on public.documents for delete to authenticated
using (public.is_teacher());

drop policy if exists blocks_read_visible_document on public.document_blocks;
create policy blocks_read_visible_document on public.document_blocks for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and
  (d.status = 'published' or d.created_by = (select auth.uid()) or public.is_teacher())));
drop policy if exists blocks_manage_teacher on public.document_blocks;
create policy blocks_manage_teacher on public.document_blocks for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists document_topics_read_visible on public.document_topics;
create policy document_topics_read_visible on public.document_topics for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and
  (d.status = 'published' or d.created_by = (select auth.uid()) or public.is_teacher())));
drop policy if exists document_topics_manage_teacher on public.document_topics;
create policy document_topics_manage_teacher on public.document_topics for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

drop policy if exists document_attached_tests_read_visible on public.document_attached_tests;
create policy document_attached_tests_read_visible on public.document_attached_tests for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and
  (d.status = 'published' or d.created_by = (select auth.uid()) or public.is_teacher())));
drop policy if exists document_attached_tests_manage_teacher on public.document_attached_tests;
create policy document_attached_tests_manage_teacher on public.document_attached_tests for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());

insert into public.topics (id, name, description) values
  ('hang-dang-thuc', 'Hằng đẳng thức', 'Nhận biết và vận dụng các hằng đẳng thức đáng nhớ.'),
  ('phan-tich-da-thuc', 'Phân tích đa thức', 'Phân tích đa thức thành nhân tử bằng nhiều phương pháp.'),
  ('phan-thuc-dai-so', 'Phân thức đại số', 'Rút gọn, thực hiện phép tính và giải bài toán với phân thức.'),
  ('phuong-trinh', 'Phương trình', 'Giải và vận dụng phương trình bậc nhất một ẩn.'),
  ('tam-giac-vuong', 'Tam giác vuông', 'Định lí Pythagore và các bài toán trong tam giác vuông.')
on conflict (id) do update set name = excluded.name, description = excluded.description;

insert into storage.buckets (id, name, public)
values ('document-images', 'document-images', true)
on conflict (id) do update set public = true;

drop policy if exists document_images_read on storage.objects;
create policy document_images_read on storage.objects for select to public
using (bucket_id = 'document-images');
drop policy if exists document_images_insert_teacher on storage.objects;
create policy document_images_insert_teacher on storage.objects for insert to authenticated
with check (bucket_id = 'document-images' and public.is_teacher());
drop policy if exists document_images_update_teacher on storage.objects;
create policy document_images_update_teacher on storage.objects for update to authenticated
using (bucket_id = 'document-images' and public.is_teacher())
with check (bucket_id = 'document-images' and public.is_teacher());
drop policy if exists document_images_delete_teacher on storage.objects;
create policy document_images_delete_teacher on storage.objects for delete to authenticated
using (bucket_id = 'document-images' and public.is_teacher());

-- Tắt đăng ký công khai trong Authentication > Providers > Email.
-- Tạo user và profile thủ công trong Supabase Dashboard:
-- insert into public.profiles (id, display_name, role)
-- values ('AUTH_USER_UUID', 'Tên học sinh', 'student');
