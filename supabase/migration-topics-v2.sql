-- MathLearn: thay danh mục chủ đề cũ bằng danh mục 9 chủ đề mới.
-- Chạy file này sau schema.sql trên Supabase đang sử dụng.
-- Migration chỉ xóa liên kết phân loại cũ, không xóa tài liệu hoặc câu hỏi.

begin;

insert into public.topics (id, name, description) values
  ('ham-so-va-do-thi', 'Hàm số và Đồ thị', 'Các bài toán về hàm số, đồ thị và tính chất của hàm số.'),
  ('mu-va-logarit', 'Mũ và Logarit', 'Các bài toán về hàm mũ, phương trình mũ, hàm logarit và phương trình logarit.'),
  ('dao-ham', 'Đạo hàm', 'Tính đạo hàm và vận dụng đạo hàm vào các bài toán.'),
  ('nguyen-ham-va-tich-phan', 'Nguyên hàm và Tích phân', 'Tính nguyên hàm, tích phân và các bài toán ứng dụng.'),
  ('luong-giac', 'Lượng giác', 'Các công thức, phương trình và bất phương trình lượng giác.'),
  ('day-so-va-gioi-han', 'Dãy số và Giới hạn', 'Dãy số, cấp số cộng, cấp số nhân và giới hạn.'),
  ('hinh-hoc-khong-gian', 'Hình học không gian', 'Các bài toán về quan hệ không gian, hình khối và thể tích.'),
  ('vector-va-he-toa-do', 'Vector và Hệ tọa độ', 'Vector và phương pháp tọa độ trong hình học.'),
  ('xac-suat-va-thong-ke', 'Xác suất và Thống kê', 'Các bài toán về xác suất, số liệu và thống kê.')
on conflict (id) do update set name = excluded.name, description = excluded.description;

-- Các mã cũ không có ánh xạ tương đương trực tiếp trong danh mục mới.
delete from public.document_topics
where topic_id in ('hang-dang-thuc', 'phan-tich-da-thuc', 'phan-thuc-dai-so', 'phuong-trinh', 'tam-giac-vuong');

-- question_bank_topics chỉ có sau migration-question-bank.sql.
do $$
begin
  if to_regclass('public.question_bank_topics') is not null then
    execute $sql$
      delete from public.question_bank_topics
      where topic_id in ('hang-dang-thuc', 'phan-tich-da-thuc', 'phan-thuc-dai-so', 'phuong-trinh', 'tam-giac-vuong')
    $sql$;
  end if;
end
$$;

delete from public.topics
where id in ('hang-dang-thuc', 'phan-tich-da-thuc', 'phan-thuc-dai-so', 'phuong-trinh', 'tam-giac-vuong');

commit;

-- Sau migration, hãy gắn lại chủ đề mới cho các tài liệu/câu hỏi trước đây dùng mã cũ nếu cần.