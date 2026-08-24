-- Migration: Một tài liệu học tập có thể đính kèm NHIỀU bài kiểm tra.
-- Thay thế cột đơn attached_test_id bằng bảng nối document_attached_tests.
-- Chạy trong Supabase SQL Editor sau schema.sql / migration-attached-test.sql.

create table if not exists public.document_attached_tests (
  document_id uuid not null references public.documents(id) on delete cascade,
  test_id uuid not null references public.documents(id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  primary key (document_id, test_id)
);

create index if not exists document_attached_tests_test_idx
  on public.document_attached_tests(test_id);

-- Chuyển dữ liệu đính kèm cũ (một bài mỗi tài liệu) sang bảng nối
insert into public.document_attached_tests (document_id, test_id, position)
select d.id, d.attached_test_id, 0
from public.documents d
where d.attached_test_id is not null
on conflict do nothing;

-- Gỡ cột và trigger cũ
alter table public.documents drop column if exists attached_test_id;
drop index if exists public.documents_attached_test_idx;
drop trigger if exists documents_clear_attached_test on public.documents;
drop function if exists public.clear_attached_test_on_type_change();

-- Bài kiểm tra không đính kèm bài kiểm tra: gỡ toàn bộ liên kết khi tài liệu đổi thành test
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

-- RLS: đọc theo quyền xem tài liệu cha, ghi chỉ dành cho giáo viên (giống document_topics)
alter table public.document_attached_tests enable row level security;

drop policy if exists document_attached_tests_read_visible on public.document_attached_tests;
create policy document_attached_tests_read_visible on public.document_attached_tests for select to authenticated
using (exists (select 1 from public.documents d where d.id = document_id and
  (d.status = 'published' or d.created_by = (select auth.uid()) or public.is_teacher())));

drop policy if exists document_attached_tests_manage_teacher on public.document_attached_tests;
create policy document_attached_tests_manage_teacher on public.document_attached_tests for all to authenticated
using (public.is_teacher()) with check (public.is_teacher());
