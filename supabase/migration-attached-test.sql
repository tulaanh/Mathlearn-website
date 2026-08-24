-- Migration: Tài liệu học tập có thể (hoặc không) đính kèm một bài kiểm tra.
-- Chạy trong Supabase SQL Editor sau schema.sql.

alter table public.documents
  add column if not exists attached_test_id uuid
  references public.documents(id) on delete set null;

create index if not exists documents_attached_test_idx
  on public.documents(attached_test_id);

-- Gỡ đính kèm nếu tài liệu bị đổi thành bài kiểm tra (bài kiểm tra không đính kèm bài kiểm tra).
create or replace function public.clear_attached_test_on_type_change()
returns trigger language plpgsql as $$
begin
  if new.document_type = 'test' and new.attached_test_id is not null then
    new.attached_test_id := null;
  end if;
  return new;
end; $$;

drop trigger if exists documents_clear_attached_test on public.documents;
create trigger documents_clear_attached_test before insert or update on public.documents
for each row execute procedure public.clear_attached_test_on_type_change();
