import json
import os
import sys
import math
import subprocess

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

base_dir = r"D:\DayThem\Big3\KhoTaiLieu\Khảo sát đồ thị hàm số\Trả lời ngắn"
figures_dir = os.path.join(base_dir, "figures")
master_json_path = os.path.join(base_dir, "NganHang_CauHoi.json")

with open(master_json_path, "r", encoding="utf-8") as f:
    master_data = json.load(f)

all_questions = master_data.get("questions", [])
total_q = len(all_questions)
print(f"Tổng số câu hỏi: {total_q}")

# Chia thành 5 phần (mỗi phần khoảng 14 - 15 câu)
chunk_size = 15
parts = []

for i in range(0, total_q, chunk_size):
    chunk = all_questions[i:i + chunk_size]
    start_idx = i + 1
    end_idx = min(i + chunk_size, total_q)
    part_num = (i // chunk_size) + 1
    part_id = f"Phan_{part_num:02d}"
    part_title = f"Phần {part_num} (Câu {start_idx:02d} - Câu {end_idx:02d})"
    parts.append({
        "part_num": part_num,
        "part_id": part_id,
        "title": part_title,
        "start": start_idx,
        "end": end_idx,
        "questions": chunk
    })

print(f"Đã chia thành {len(parts)} phần nhỏ.")

# Tạo file JSON và HTML preview cho từng phần
index_parts_info = []

for p in parts:
    p_num = p["part_num"]
    p_title = p["title"]
    p_questions = p["questions"]
    
    # 1. Lưu file JSON từng phần
    p_json_filename = f"NganHang_Phan_{p_num:02d}_Cau_{p['start']:02d}_{p['end']:02d}.json"
    p_json_path = os.path.join(base_dir, p_json_filename)
    
    p_data = {
        "version": 1,
        "kind": "question_bank",
        "title": f"Ngân Hàng Câu Hỏi - Khảo Sát Đồ Thị - {p_title}",
        "total_questions": len(p_questions),
        "questions": p_questions
    }
    
    with open(p_json_path, "w", encoding="utf-8") as f:
        json.dump(p_data, f, ensure_ascii=False, indent=2)
        
    # 2. Tạo Preview HTML cho từng phần
    p_html_filename = f"preview_phan_{p_num:02d}.html"
    p_html_path = os.path.join(base_dir, p_html_filename)
    
    gen_cmd = [
        "node",
        r"d:\DayThem\Website\.agents\skills\new-convert-bank\scripts\generate_preview.js",
        p_json_path,
        figures_dir,
        p_html_path
    ]
    subprocess.run(gen_cmd, check=True)
    
    index_parts_info.append({
        "part_num": p_num,
        "title": p_title,
        "count": len(p_questions),
        "json_file": p_json_filename,
        "html_file": p_html_filename,
        "start": p["start"],
        "end": p["end"]
    })
    print(f"✅ Đã tạo {p_json_filename} và {p_html_filename} ({len(p_questions)} câu)")

# 3. Tạo trang trung tâm điều hướng (index.html)
index_html_path = os.path.join(base_dir, "index.html")

cards_html = ""
for item in index_parts_info:
    cards_html += f"""
    <div class="part-card">
      <div class="part-badge">Phần {item['part_num']}</div>
      <div class="part-title">{item['title']}</div>
      <div class="part-meta">Số lượng: <strong>{item['count']} câu hỏi</strong> (Câu {item['start']:02d} &rarr; Câu {item['end']:02d})</div>
      <div class="btn-group">
        <a href="{item['html_file']}" class="btn btn-primary" target="_blank">🔍 Xem Trước Preview</a>
        <a href="{item['json_file']}" class="btn btn-secondary" download>📥 Tải JSON ({item['count']} câu)</a>
      </div>
    </div>
    """

index_html = f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Ngân Hàng Câu Hỏi - Khảo Sát Đồ Thị Hàm Số (Trả Lời Ngắn)</title>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 40px 20px; line-height: 1.6; }}
    .container {{ max-width: 900px; margin: 0 auto; }}
    .header {{ text-align: center; margin-bottom: 36px; padding: 32px; background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }}
    .header h1 {{ margin: 0 0 10px; font-size: 26px; color: #1d4ed8; font-weight: 800; }}
    .header p {{ margin: 0; color: #64748b; font-size: 15px; }}
    .stats-bar {{ display: flex; justify-content: center; gap: 24px; margin-top: 20px; }}
    .stat-item {{ background: #f1f5f9; padding: 8px 18px; border-radius: 9999px; font-size: 14px; font-weight: 600; color: #334155; }}
    .parts-list {{ display: grid; gap: 18px; }}
    .part-card {{ background: white; border-radius: 12px; padding: 22px 28px; box-shadow: 0 2px 4px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; transition: transform 0.2s, box-shadow 0.2s; }}
    .part-card:hover {{ transform: translateY(-2px); box-shadow: 0 6px 12px rgba(0,0,0,0.08); border-color: #93c5fd; }}
    .part-badge {{ display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 6px; }}
    .part-title {{ font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }}
    .part-meta {{ font-size: 14px; color: #64748b; }}
    .btn-group {{ display: flex; gap: 10px; flex-shrink: 0; }}
    .btn {{ display: inline-block; padding: 10px 18px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all 0.2s; }}
    .btn-primary {{ background: #2563eb; color: white; }}
    .btn-primary:hover {{ background: #1d4ed8; }}
    .btn-secondary {{ background: #f1f5f9; color: #334155; border: 1px solid #cbd5e1; }}
    .btn-secondary:hover {{ background: #e2e8f0; }}
    .master-box {{ margin-top: 32px; background: #eff6ff; border: 1px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; }}
    .master-box a {{ color: #1d4ed8; font-weight: 700; text-decoration: underline; margin: 0 8px; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 Ngân Hàng Câu Hỏi - Khảo Sát Đồ Thị Hàm Số</h1>
      <p>Dạng bài: Trả lời ngắn & Tự luận vận dụng | Nguồn tài liệu: <code>TLN.pdf</code></p>
      <div class="stats-bar">
        <span class="stat-item">🎯 Tổng số: 71 câu hỏi</span>
        <span class="stat-item">📦 Đã chia: 5 phần nhỏ</span>
        <span class="stat-item">🖼️ 106 ảnh đồ thị / BBT</span>
      </div>
    </div>

    <div class="parts-list">
      {cards_html}
    </div>

    <div class="master-box">
      <strong>File tổng hợp toàn bộ 71 câu:</strong>
      <br><br>
      <a href="preview.html" target="_blank">🌐 Xem file Preview đầy đủ (71 câu)</a> |
      <a href="NganHang_CauHoi.json" download>📥 Tải file JSON đầy đủ (NganHang_CauHoi.json)</a>
    </div>
  </div>
</body>
</html>
"""

with open(index_html_path, "w", encoding="utf-8") as f:
    f.write(index_html)

print(f"🎉 Đã tạo trang điều hướng tổng hợp tại: {index_html_path}")
