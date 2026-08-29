"""
Script trích xuất toàn bộ các trang PDF thành ảnh PNG độ phân giải cao (200 DPI)
Sử dụng: python extract_pdf_pages.py <path-to-pdf> <path-to-output-folder>
"""
import sys
import os
import fitz
from PIL import Image

if len(sys.argv) < 2:
    print("Vui lòng truyền đường dẫn file PDF. Ví dụ: python extract_pdf_pages.py download.pdf ./output_images")
    sys.exit(1)

pdf_path = sys.argv[1]
out_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(pdf_path)[0] + "_images"
os.makedirs(out_dir, exist_ok=True)

if not os.path.exists(pdf_path):
    print(f"Không tìm thấy file: {pdf_path}")
    sys.exit(1)

doc = fitz.open(pdf_path)
total_pages = len(doc)
print(f"Bắt đầu xuất {total_pages} trang từ {pdf_path}...")

for i in range(total_pages):
    page = doc[i]
    pix = page.get_pixmap(dpi=200)
    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
    page_str = f"{i+1:02d}"
    out_file = os.path.join(out_dir, f"Trang_{page_str}.png")
    img.save(out_file, "PNG")
    print(f"Đã lưu: Trang_{page_str}.png ({pix.width}x{pix.height})")

print(f"✅ Hoàn tất xuất {total_pages} trang vào: {out_dir}")
