-- Migration: Hỗ trợ block_type 'lesson' (bài giảng), 'quiz' và phân loại tài liệu

-- Chạy câu lệnh này nếu database đã được tạo từ schema.sql trước đó.
alter table public.documents add column if not exists document_type text not null default 'normal';
alter table public.documents drop constraint if exists documents_document_type_check;
alter table public.documents add constraint documents_document_type_check check (document_type in ('normal', 'test'));
create index if not exists documents_document_type_idx on public.documents(document_type);
-- ⚠️ QUAN TRỌNG: Chạy TỪNG PHẦN riêng biệt trong Supabase SQL Editor
-- (PostgreSQL không cho phép dùng giá trị enum mới trong cùng transaction thêm vào)
--
-- ═══════════════════════════════════════════════════════════════
-- BƯỚC 1: Chạy phần này trước, nhấn RUN
-- ═══════════════════════════════════════════════════════════════

-- Thêm giá trị mới vào enum document_block_type
alter type public.document_block_type add value if not exists 'lesson';
alter type public.document_block_type add value if not exists 'quiz';

-- Thêm cột title và description cho document_blocks
alter table public.document_blocks add column if not exists title text;
alter table public.document_blocks add column if not exists description text;

-- ═══════════════════════════════════════════════════════════════
-- BƯỚC 2: Sau khi Bước 1 thành công, xóa phần trên đi,
--         dán phần này vào và nhấn RUN
-- ═══════════════════════════════════════════════════════════════

-- Xóa constraint cũ và tạo constraint mới cho phép cả 4 loại block
-- alter table public.document_blocks drop constraint if exists document_block_content_check;
--
-- alter table public.document_blocks add constraint document_block_content_check check (
--   (block_type = 'text' and content is not null and storage_path is null)
--   or (block_type = 'image' and storage_path is not null and alt_text is not null)
--   or (block_type = 'lesson' and content is not null and title is not null and storage_path is null)
--   or (block_type = 'quiz' and content is not null and title is not null and storage_path is null)
-- );