#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Next-Gen Full Question Bank Builder for MathLearn Website
Quy trình 3 pha (text PDF) hoặc rẽ nhánh Vision (PDF scan):
- Pha 0: Phân loại text/scan
- Pha 1: Render 200 DPI + DocLayout-YOLO tự cắt hình vào figures/
- Pha 2: Hybrid Parser — bóc text stream, tách MCQ/true_false/short_answer, map hình theo tọa độ
- Pha 3: auto_fix_bank_json.js (KaTeX) → validate_bank_json.js (gate) → generate_preview.js

Có 2 chế độ:
  - Mặc định (--mode auto|text): chạy trọn gói 3 pha cho PDF có text.
  - --mode scan: chỉ render PDF thành ảnh + sinh vision_batches.json để subagent vision xử lý.
  - --from-vision <file.json>: bỏ qua Pha 1+2, nạp mảng câu hỏi từ vision rồi chạy Pha 3.
"""

import sys
import os
import re
import json
import time
import argparse
import glob
import subprocess
from PIL import Image
import pymupdf

if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "models",
    "doclayout_yolo_docstructbench_imgsz1024.pt",
)

DEFAULT_LLAMA_BIN_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "bin",
    "llama-cpp"
)
DEFAULT_LLAMA_EXE = os.path.join(DEFAULT_LLAMA_BIN_DIR, "llama-server.exe")
if os.path.exists(DEFAULT_LLAMA_EXE):
    os.environ["LLAMA_CPP_BINARY"] = DEFAULT_LLAMA_EXE
    if DEFAULT_LLAMA_BIN_DIR not in os.environ.get("PATH", ""):
        os.environ["PATH"] = DEFAULT_LLAMA_BIN_DIR + os.pathsep + os.environ.get("PATH", "")

# Số ký tự text trung bình/trang dưới ngưỡng này → coi như PDF scan
SCAN_TEXT_THRESHOLD = 20

VALID_TOPICS = {
    "ham-so-va-do-thi",
    "mu-va-logarit",
    "dao-ham",
    "nguyen-ham-va-tich-phan",
    "luong-giac",
    "day-so-va-gioi-han",
    "hinh-hoc-khong-gian",
    "vector-va-he-toa-do",
    "xac-suat-va-thong-ke",
}
VALID_DIFFICULTIES = {"nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"}
VALID_TYPES = {"multiple_choice", "true_false", "short_answer", "essay"}


# -------------------------------------------------------------
# PHA 0: PHÂN LOẠI TEXT / SCAN
# -------------------------------------------------------------
def classify_pdf(pdf_path):
    doc = pymupdf.open(pdf_path)
    per_page_chars = []
    for page in doc:
        text = page.get_text("text") or ""
        per_page_chars.append(len(text.strip()))
    num_pages = len(doc)
    doc.close()
    avg = sum(per_page_chars) / max(1, num_pages)
    empty_pages = sum(1 for c in per_page_chars if c < 5)
    return {
        "num_pages": num_pages,
        "avg_chars_per_page": round(avg, 1),
        "empty_pages": empty_pages,
        "is_scan": avg < SCAN_TEXT_THRESHOLD or empty_pages > num_pages / 2,
    }


def parse_page_range_indices(page_range, total_pages):
    if not page_range:
        return list(range(total_pages))
    indices = set()
    for part in page_range.split(','):
        part = part.strip()
        if '-' in part:
            s, e = part.split('-', 1)
            indices.update(range(int(s), min(int(e) + 1, total_pages)))
        elif part.isdigit():
            idx = int(part)
            if idx < total_pages:
                indices.add(idx)
    return sorted(list(indices))


def run_phase1_extract_and_crop(
    pdf_path, output_dir, model_path=None, dpi=200, padding_ratio=0.03, min_confidence=0.25, page_range=None
):
    pages_dir = os.path.join(output_dir, "extracted_pages")
    figures_dir = os.path.join(output_dir, "figures")
    manifest_path = os.path.join(figures_dir, "crop_manifest.json")

    os.makedirs(pages_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    print(f"📄 [Pha 1.1] Đang render các trang PDF sang ảnh ({dpi} DPI)...")
    t0 = time.time()
    doc = pymupdf.open(pdf_path)
    total_pages = len(doc)
    target_indices = parse_page_range_indices(page_range, total_pages)
    for i in target_indices:
        page = doc[i]
        p_num = i + 1
        img_out = os.path.join(pages_dir, f"Trang_{p_num:02d}.png")
        if not os.path.exists(img_out):
            pix = page.get_pixmap(dpi=dpi)
            pix.save(img_out)
    doc.close()
    print(f"✅ Đã chuẩn bị {len(target_indices)}/{total_pages} trang ảnh trong {time.time() - t0:.2f}s")

    if not model_path:
        model_path = DEFAULT_MODEL_PATH

    manifest = []
    if not os.path.exists(model_path):
        print(f"ℹ️ Model YOLO không tìm thấy tại {model_path}, bỏ qua cắt ảnh tự động.")
        return pages_dir, figures_dir, manifest

    print(f"🤖 [Pha 1.2] Đang chạy Local DocLayout-YOLO bóc tách hình vẽ...")
    try:
        import torch
        if hasattr(torch, 'set_num_threads'):
            torch.set_num_threads(max(1, min(4, (os.cpu_count() or 4) // 2)))
        from doclayout_yolo import YOLOv10

        model = YOLOv10(model_path)
        image_files = sorted(glob.glob(os.path.join(pages_dir, "Trang_*.png")))
        total_cropped = 0

        for img_path in image_files:
            page_name = os.path.splitext(os.path.basename(img_path))[0]
            results = model.predict(img_path, imgsz=1024, conf=min_confidence, verbose=False)
            img = None
            for result in results:
                names = result.names
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    cls_name = names[cls_id]
                    conf = float(box.conf[0])
                    if img is None:
                        img = Image.open(img_path)
                    w, h = img.size
                    x1, y1, x2, y2 = box.xyxy[0].tolist()
                    bx_w = x2 - x1
                    bx_h = y2 - y1
                    aspect_ratio = bx_w / max(1.0, bx_h)

                    # 1. Hình vẽ thực sự (figure: đồ thị, hình không gian):
                    is_figure = (
                        cls_name == "figure"
                        and conf >= min_confidence
                        and bx_h <= h * 0.55
                        and bx_w >= 60
                        and bx_h >= 60
                    )

                    # 2. Bảng biến thiên (BBT) từ table hoặc isolate_formula:
                    is_bbt = (
                        cls_name in ("table", "isolate_formula")
                        and conf >= 0.30
                        and aspect_ratio >= 1.4
                        and 80 <= bx_h <= 380
                        and bx_w >= 300
                    )

                    if not (is_figure or is_bbt):
                        continue

                    pad_x = bx_w * padding_ratio
                    pad_y = bx_h * padding_ratio
                    crop_x1 = max(0, int(x1 - pad_x))
                    crop_y1 = max(0, int(y1 - pad_y))
                    crop_x2 = min(w, int(x2 + pad_x))
                    crop_y2 = min(h, int(y2 + pad_y))
                    if (crop_x2 - crop_x1 < 50) or (crop_y2 - crop_y1 < 50):
                        continue
                    total_cropped += 1
                    fig_filename = f"lt_{total_cropped}.png"
                    fig_out_path = os.path.join(figures_dir, fig_filename)
                    img.crop((crop_x1, crop_y1, crop_x2, crop_y2)).save(fig_out_path, "PNG")
                    manifest.append(
                        {
                            "page": page_name,
                            "figure_index": total_cropped,
                            "filename": fig_filename,
                            "filepath": fig_out_path,
                            "bbox": [crop_x1, crop_y1, crop_x2, crop_y2],
                            "rel_y": round(crop_y1 / h, 3),
                            "confidence": round(conf, 2),
                        }
                    )
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
        print(f"✅ Đã cắt tự động {total_cropped} hình vẽ chuẩn xác vào: {figures_dir}")
    except Exception as e:
        print(f"⚠️ Không thể chạy DocLayout-YOLO ({e}). Sẽ sử dụng manifest hiện có nếu có.")
    return pages_dir, figures_dir, manifest


# -------------------------------------------------------------
# PHA 2: BÓC TÁCH VĂN BẢN & TÁI CẤU TRÚC CÂU HỎI
# -------------------------------------------------------------
def clean_watermark(text):
    skip_tokens = [
        "toannbv.vn",
        "tracnghiemtoanthpt",
        "0946798489",
        "nguyễn bảo vương",
        "lời giải tham khảo",
        "trong quá trình biên soạn",
        "chân thành cám ơn",
    ]
    cleaned = []
    for line in text.split("\n"):
        s = line.strip()
        if not s:
            continue
        if any(w in s.lower() for w in skip_tokens):
            continue
        if re.match(r"^\s*\d+\s*$", s):  # số trang cô đơn
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


def convert_unicode_to_katex(text):
    s = text
    s = s.replace("²", "^2").replace("³", "^3").replace("⁴", "^4").replace("ⁿ", "^n")
    s = s.replace("₁", "_1").replace("₂", "_2").replace("₃", "_3").replace("₄", "_4")
    s = s.replace("≥", r" \ge ").replace("≤", r" \le ")
    s = s.replace("≠", r" \ne ").replace("≈", r" \approx ")
    s = s.replace("∈", r" \in ").replace("∉", r" \notin ")
    s = s.replace("ℝ", r"\mathbb{R}").replace("∆", r"\Delta ")
    s = s.replace("±", r"\pm ").replace("∞", r"\infty ")
    s = s.replace("°", r"^\circ ")
    s = s.replace("→", r" \rightarrow ").replace("⇒", r" \Rightarrow ").replace("⇔", r" \Leftrightarrow ")
    s = re.sub(r"√(\d+)", lambda m: r"\sqrt{" + m.group(1) + "}", s)
    s = re.sub(r"√\(([^)]+)\)", lambda m: r"\sqrt{" + m.group(1) + "}", s)
    s = s.replace("√", r"\sqrt ")
    return s


def fix_vietnamese_decimals_in_math(text):
    """Chuyển 0,5 -> 0{,}5 trong math mode, nhưng tránh tọa độ (a,b) và dấu ;"""
    if not text:
        return text

    def fix_one(match):
        body = match.group(1)
        fixed = re.sub(r"(\d+),(\d+)", r"\1{,}\2", body)
        return f"${fixed}$"

    def skip_one(match):
        return match.group(0)

    out = []
    i = 0
    in_math = False
    while i < len(text):
        c = text[i]
        if c == "$" and (i == 0 or text[i - 1] != "\\"):
            if not in_math:
                end = text.find("$", i + 1)
                if end == -1:
                    out.append(text[i:])
                    break
                body = text[i + 1 : end]
                body = re.sub(r"(\d+),(\d+)", r"\1{,}\2", body)
                out.append(f"${body}$")
                i = end + 1
                in_math = False
            else:
                out.append(c)
                in_math = False
                i += 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def split_mcq_options(q_text):
    """Tách options từ text câu hỏi MCQ. Trả (question_stem, [opt1..optN])."""
    pattern = re.compile(r"(?:^|\n)\s*([A-D])[\.\)\:]\s+", re.MULTILINE)
    matches = list(pattern.finditer(q_text))
    if len(matches) < 2:
        return q_text.strip(), []
    stem = q_text[: matches[0].start()].strip()
    options = []
    for i, m in enumerate(matches):
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(q_text)
        options.append(q_text[start:end].strip())
    return stem, options


def extract_correct_letter(text):
    m = re.search(
        r"(?:Đáp án|Đáp số|Kết quả|Trả lời|Chọn)\s*[:=]?\s*([A-D])(?:\b|$)",
        text,
        re.IGNORECASE,
    )
    return m.group(1).upper() if m else None


def extract_short_answer(text):
    m = re.search(
        r"(?:Đáp án|Đáp số|Kết quả|Trả lời)\s*[:=]\s*([^\n\r,;]+?)(?:\n|$|\.|;)",
        text,
        re.IGNORECASE,
    )
    if m:
        return m.group(1).strip().replace("$", "")
    return ""


def detect_solution_section(pages):
    """Tìm trang bắt đầu phần lời giải (heading) và câu số trên mỗi trang."""
    sol_start_page = None
    page_question_offsets = {}  # p_num -> [(y, q_num)]
    for idx, page in enumerate(pages):
        text = page.get_text("text", sort=True) or ""
        cleaned = clean_watermark(text)
        # vị trí heading lời giải
        if sol_start_page is None:
            if re.search(r"(HƯỚNG DẪN GIẢI|LỜI GIẢI|ĐÁP ÁN CHI TIẾT|LỜI GIẢI CHI TIẾT)", cleaned, re.IGNORECASE):
                sol_start_page = idx + 1
        # vị trí các câu
        offsets = []
        page_dict = page.get_text("dict")
        for block in page_dict.get("blocks", []):
            for line in block.get("lines", []):
                for span in line.get("spans", []):
                    s = span.get("text", "")
                    m = re.match(r"^\s*(?:Câu|Bài)\s*(\d+)\b", s, re.IGNORECASE)
                    if m:
                        offsets.append((span["bbox"][1], int(m.group(1))))
        page_question_offsets[idx + 1] = offsets
    return sol_start_page, page_question_offsets


def get_question_y_in_page(pdf_doc, q_num, page_question_offsets, upto_page=None):
    """Trả về (page_num, y) của dòng mở đầu câu q_num (None nếu không thấy)."""
    for p_num, offsets in page_question_offsets.items():
        if upto_page and p_num > upto_page:
            continue
        for y, num in offsets:
            if num == q_num:
                return p_num, y
    return None, None


def parse_pdf_to_questions(pdf_path, manifest, default_topic, default_grade, forced_type, review):
    t0 = time.time()
    doc = pymupdf.open(pdf_path)
    pages = list(doc)

    # Phát hiện section lời giải + offset câu
    sol_start_page, page_question_offsets = detect_solution_section(pages)

    full_text = ""
    page_offsets = []
    for idx, page in enumerate(pages):
        p_num = idx + 1
        raw = page.get_text("text", sort=True) or ""
        cleaned = clean_watermark(raw)
        converted = convert_unicode_to_katex(cleaned)
        start_idx = len(full_text)
        tag = f"\n[[PAGE_{p_num:02d}]]\n"
        full_text += tag + converted
        page_offsets.append((p_num, start_idx))
    doc.close()

    matches = list(re.finditer(r"(?:Câu|CÂU|Bài|BÀI)\s*(\d+)[\.:\s]", full_text))
    seen, unique = set(), []
    for m in matches:
        n = int(m.group(1))
        if n not in seen:
            seen.add(n)
            unique.append((n, m))
    unique.sort(key=lambda x: x[0])
    print(f"🔍 Tìm thấy {len(unique)} câu hỏi trong tài liệu (section lời giải bắt đầu từ trang {sol_start_page or 'N/A'}).")

    # manifest map page -> list
    manifest_by_page = {}
    for item in manifest:
        p_name = item.get("page", "")
        manifest_by_page.setdefault(p_name, []).append(item)

    # Nếu có section lời giải riêng, chia text thành 2 vùng theo sol_start_page
    def split_block(block, upto_page):
        """Tách đề/lời giải nếu block trải qua trang sol_start_page."""
        tag = f"[[PAGE_{upto_page + 1:02d}]]"
        if sol_start_page and upto_page + 1 >= sol_start_page and tag in block:
            return block, ""  # toàn bộ block đã ở phần lời giải
        return block, ""

    # Lời giải riêng: tìm theo số câu trong vùng sau sol_start_page
    explanation_by_qnum = {}
    if sol_start_page:
        sol_text = full_text[full_text.find(f"[[PAGE_{sol_start_page:02d}]]"):]
        for m in re.finditer(r"(?:Câu|Bài)\s*(\d+)\b", sol_text, re.IGNORECASE):
            qn = int(m.group(1))
            start = m.end()
            # tìm câu tiếp theo
            nxt = re.search(r"(?:Câu|Bài)\s*(\d+)\b", sol_text[start:], re.IGNORECASE)
            end = start + nxt.start() if nxt else len(sol_text)
            explanation_by_qnum[qn] = sol_text[start:end].strip()

    pdf_for_mapping = pymupdf.open(pdf_path)
    questions = []
    for idx, (q_num, m) in enumerate(unique):
        start_pos = m.start()
        end_pos = unique[idx + 1][1].start() if idx + 1 < len(unique) else len(full_text)
        block = full_text[start_pos:end_pos].strip()
        pages_in_block = []
        for p_num, off in page_offsets:
            tag = f"[[PAGE_{p_num:02d}]]"
            if tag in block:
                pages_in_block.append(f"Trang_{p_num:02d}")
        cleaned_block = re.sub(r"\[\[PAGE_\d+\]\]\n?", "", block).strip()

        # Tách đề / lời giải
        lg_match = re.search(
            r"\n\s*(?:Lời giải|Hướng dẫn giải|Loi giai|HƯỚNG DẪN GIẢI)\b",
            cleaned_block,
            re.IGNORECASE,
        )
        if lg_match:
            q_text_raw = cleaned_block[: lg_match.start()].strip()
            exp_text = cleaned_block[lg_match.start():].strip()
        else:
            ans_m = re.search(
                r"\n\s*(?:Đáp án|Đáp số|Kết quả|Trả lời)\s*[:=]\s*[^\n]+",
                cleaned_block,
                re.IGNORECASE,
            )
            if ans_m:
                q_text_raw = cleaned_block[: ans_m.start()].strip()
                exp_text = cleaned_block[ans_m.start():].strip()
            else:
                lines = [l for l in cleaned_block.split("\n") if l.strip()]
                q_text_raw = "\n".join(lines[:3]) if len(lines) > 3 else cleaned_block
                exp_text = "\n".join(lines[3:]) if len(lines) > 3 else ""

        # Nếu có section lời giải riêng → lấy lời giải từ đó
        if sol_start_page and q_num in explanation_by_qnum:
            exp_text = explanation_by_qnum[q_num]

        # Bỏ nhãn đầu câu
        q_text_clean = re.sub(
            r"^(?:\\textbf\{)?(?:C[âa]u|CÂU|Bài|BÀI)\s*\d+[\.:\s]*(?:\})?\s*",
            "",
            q_text_raw,
        ).strip()

        # Xác định loại
        stem, options = split_mcq_options(q_text_clean)
        correct_letter = extract_correct_letter(cleaned_block)
        short_ans = extract_short_answer(cleaned_block)

        if forced_type != "auto":
            q_type = forced_type
        elif options and len(options) >= 2:
            q_type = "multiple_choice"
        elif short_ans:
            q_type = "short_answer"
        else:
            q_type = "essay"

        # Validate type
        if q_type not in VALID_TYPES:
            q_type = "short_answer"

        # Build options/correctIndex cho MCQ
        mcq_options = None
        correct_index = None
        if q_type == "multiple_choice":
            if options:
                mcq_options = [fix_vietnamese_decimals_in_math(o) for o in options]
                if correct_letter and correct_letter in "ABCD":
                    correct_index = "ABCD".index(correct_letter)
                else:
                    correct_index = 0
            else:
                # Không tách được options → hạ về short_answer
                review.append(f"Câu #{q_num}: hạ về short_answer (không tách được options MCQ)")
                q_type = "short_answer"
                correct_index = None

        # True/false: đơn giản dùng mệnh đề theo nhãn a), b), c), d) trong stem
        statements = None
        if q_type == "true_false":
            tf_pattern = re.compile(r"(?:^|\n)\s*([a-d])[\.\)\:]\s+", re.IGNORECASE)
            tf_matches = list(tf_pattern.finditer(stem))
            if len(tf_matches) >= 2:
                tf_options = []
                for i, tm in enumerate(tf_matches):
                    s = tm.end()
                    e = tf_matches[i + 1].start() if i + 1 < len(tf_matches) else len(stem)
                    tf_options.append(stem[s:e].strip())
                statements = [{"text": fix_vietnamese_decimals_in_math(o), "correct": True} for o in tf_options]
            else:
                review.append(f"Câu #{q_num}: hạ về short_answer (không tách được mệnh đề true_false)")
                q_type = "short_answer"

        # Áp KaTeX cleanup an toàn
        q_text_final = fix_vietnamese_decimals_in_math(
            stem if q_type == "multiple_choice" else q_text_clean
        )
        usd = q_text_final.count("$")
        if usd % 2 != 0:
            review.append(f"Câu #{q_num} [text]: lẻ dấu $ ({usd})")
        usd2 = exp_text.count("$") if exp_text else 0
        if usd2 % 2 != 0:
            review.append(f"Câu #{q_num} [explanation]: lẻ dấu $ ({usd2})")

        # Map hình theo tọa độ: chỉ gán hình nằm GIỮA câu N và câu N+1
        q_figures = []
        q_pnum, q_y = get_question_y_in_page(pdf_for_mapping, q_num, page_question_offsets, upto_page=sol_start_page)
        # Tìm tọa độ y của câu kế tiếp trên cùng trang
        next_q_y = None
        if q_pnum is not None:
            # Tìm câu kế tiếp
            found_current = False
            for other_qnum, other_offsets in page_question_offsets.items():
                if other_qnum == q_num:
                    found_current = True
                    continue
                if found_current and other_qnum > q_num:
                    other_pnum, other_y = get_question_y_in_page(pdf_for_mapping, other_qnum, page_question_offsets, upto_page=sol_start_page)
                    if other_pnum == q_pnum:
                        next_q_y = other_y
                    break

        if q_pnum is not None:
            page_key = f"Trang_{q_pnum:02d}"
            if page_key in manifest_by_page:
                for fig in manifest_by_page[page_key]:
                    fig_y = fig["box"][1]  # y-coordinate of figure top
                    # Figure belongs to question N if: fig_y >= q_y AND (no next question OR fig_y < next_q_y)
                    if q_y is not None and fig_y >= q_y:
                        if next_q_y is None or fig_y < next_q_y:
                            if fig["filename"] not in [f["filename"] for f in q_figures]:
                                q_figures.append(fig)
                    elif q_y is None:
                        # q_y unknown: fallback include all on page (keep old behavior)
                        if fig["filename"] not in [f["filename"] for f in q_figures]:
                            q_figures.append(fig)
        else:
            # fallback: lấy theo pages_in_block (keep for compatibility)
            for p_name in pages_in_block:
                if p_name in manifest_by_page:
                    for fig in manifest_by_page[p_name]:
                        if fig["filename"] not in [f["filename"] for f in q_figures]:
                            q_figures.append(fig)

        # Phân loại vị trí hình
        image_for_question = None
        images_for_explanation = []
        for fig in q_figures:
            rel_y = fig.get("rel_y", 0.5)
            if rel_y < 0.4:
                if image_for_question is None:
                    image_for_question = fig["filename"]
                else:
                    images_for_explanation.append(fig["filename"])
            else:
                images_for_explanation.append(fig["filename"])

        # Difficulty: dựa trên số câu (mặc định)
        difficulty = "thong_hieu" if q_num <= 25 else "van_dung" if q_num <= 75 else "van_dung_cao"

        # Đáp án cho short_answer
        correct_answer = ""
        if q_type == "short_answer":
            correct_answer = short_ans or "Xem lời giải"

        q_obj = {
            "id": f"ks_{q_num:02d}",
            "text": q_text_final,
            "type": q_type,
            "difficulty": difficulty,
            "grade": default_grade,
            "topicIds": [default_topic] if default_topic in VALID_TOPICS else ["ham-so-va-do-thi"],
            "points": 1 if q_type != "essay" else 0,
            "explanation": exp_text or "Xem chi tiết lời giải trong tài liệu.",
        }
        if q_type == "multiple_choice":
            q_obj["options"] = mcq_options
            q_obj["correctIndex"] = correct_index if correct_index is not None else 0
        elif q_type == "true_false":
            q_obj["statements"] = statements
        elif q_type == "short_answer":
            q_obj["correctAnswer"] = correct_answer

        if image_for_question:
            q_obj["imageFileName"] = image_for_question
        if len(images_for_explanation) == 1:
            q_obj["explanationImageFileName"] = images_for_explanation[0]
        elif len(images_for_explanation) > 1:
            q_obj["explanationImages"] = images_for_explanation

        # BUG FIX: Không đẩy ảnh lời giải thành ảnh đề bài
        # (giữ ảnh ở vị trí đúng - đề bài hoặc lời giải)
        # if image_for_question is None and images_for_explanation:
        #     q_obj["imageFileName"] = images_for_explanation[0]
        #     q_obj.pop("explanationImageFileName", None)
        #     q_obj.pop("explanationImages", None)

        questions.append(q_obj)

    pdf_for_mapping.close()
    print(f"✅ Hoàn tất phân tích {len(questions)} câu hỏi trong {time.time() - t0:.2f}s")
    return questions


# -------------------------------------------------------------
# PHA 3: XUẤT JSON, AUTO-FIX, VALIDATE, PREVIEW
# -------------------------------------------------------------
def run_node_script(script_name, *args):
    script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), script_name)
    if not os.path.exists(script_path):
        print(f"⚠️ Không tìm thấy script: {script_name}")
        return 0
    try:
        result = subprocess.run(["node", script_path, *args], check=False, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout.rstrip())
        if result.stderr:
            print(result.stderr.rstrip())
        return result.returncode
    except FileNotFoundError:
        print("⚠️ Node.js chưa cài đặt — bỏ qua script Node.")
        return 0


def export_and_validate(questions, output_dir, output_json_name, title, review):
    os.makedirs(output_dir, exist_ok=True)
    json_path = os.path.join(output_dir, output_json_name)
    bank_data = {
        "version": 1,
        "kind": "question_bank",
        "title": title,
        "total_questions": len(questions),
        "questions": questions,
    }
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(bank_data, f, ensure_ascii=False, indent=2)
    print(f"💾 Đã lưu file JSON: {json_path}")

    print("\n🔧 [Pha 3.1] Chạy auto_fix_bank_json.js...")
    run_node_script("auto_fix_bank_json.js", json_path)

    print("\n🛡️ [Pha 3.2] Chạy validate_bank_json.js (gate)...")
    validate_rc = run_node_script("validate_bank_json.js", json_path)

    print("\n🌐 [Pha 3.3] Tạo preview.html...")
    figures_dir = os.path.join(output_dir, "figures")
    html_path = os.path.join(output_dir, "preview.html")
    run_node_script("generate_preview.js", json_path, figures_dir, html_path)

    # Ghi review report
    review_path = os.path.join(output_dir, "review_report.md")
    with open(review_path, "w", encoding="utf-8") as f:
        f.write(f"# Review Report — {title}\n\n")
        f.write(f"- Tổng câu: {len(questions)}\n")
        f.write(f"- Validate exit code: {validate_rc}\n\n")
        if review:
            f.write("## Cảnh báo / lỗi cần kiểm tra tay\n\n")
            for r in review:
                f.write(f"- {r}\n")
        else:
            f.write("✅ Không có cảnh báo nào.\n")
    print(f"📝 Đã ghi review report: {review_path}")
    return validate_rc


def write_vision_batches(output_dir, pdf_path, batch_size=3):
    """Sinh vision_batches.json cho luồng PDF scan."""
    pages_dir = os.path.join(output_dir, "extracted_pages")
    figures_dir = os.path.join(output_dir, "figures")
    os.makedirs(pages_dir, exist_ok=True)
    os.makedirs(figures_dir, exist_ok=True)

    doc = pymupdf.open(pdf_path)
    image_files = []
    for i, page in enumerate(doc):
        p_num = i + 1
        img_out = os.path.join(pages_dir, f"Trang_{p_num:02d}.png")
        if not os.path.exists(img_out):
            pix = page.get_pixmap(dpi=200)
            pix.save(img_out)
        image_files.append(img_out)
    doc.close()

    batches = []
    for i in range(0, len(image_files), batch_size):
        batches.append(image_files[i : i + batch_size])

    payload = {
        "pdf_path": os.path.abspath(pdf_path),
        "pages_dir": os.path.abspath(pages_dir),
        "figures_dir": os.path.abspath(figures_dir),
        "cropped_figures": sorted(glob.glob(os.path.join(figures_dir, "lt_*.png"))),
        "batch_size": batch_size,
        "batches": batches,
    }
    out_path = os.path.join(output_dir, "vision_batches.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    return out_path, payload


# -------------------------------------------------------------
# MAIN
# -------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(
        description="Next-Gen Hybrid Question Bank Converter for MathLearn Website"
    )
    parser.add_argument("pdf_path", help="Đường dẫn file PDF (bỏ trống nếu dùng --from-vision)")
    parser.add_argument("output_dir", help="Thư mục xuất kết quả")
    parser.add_argument("--topic", default="ham-so-va-do-thi", help="Mã chủ đề mặc định")
    parser.add_argument("--grade", default="Lớp 12", help="Khối lớp mặc định")
    parser.add_argument(
        "--type",
        default="auto",
        choices=["auto", "multiple_choice", "true_false", "short_answer", "essay"],
        help="Loại câu hỏi mặc định",
    )
    parser.add_argument(
        "--engine",
        default="auto",
        choices=["auto", "marker", "legacy"],
        help="Engine trích xuất: auto (ưu tiên Marker nếu có), marker (bắt buộc Marker AI), legacy (PyMuPDF + DocLayout-YOLO)",
    )
    parser.add_argument("--page-range", default=None, help="Giới hạn trang cho Marker (ví dụ: 0-10)")
    parser.add_argument("--force-ocr", action="store_true", help="Bắt buộc OCR lại toàn bộ (cho Marker)")
    parser.add_argument("--languages", default="vi,en", help="Ngôn ngữ cho Marker OCR")
    parser.add_argument("--model", default=None, help="Đường dẫn file trọng số YOLOv10")
    parser.add_argument("--model-cache", default=None, help="Thư mục cache model AI (mặc định không ép)")
    parser.add_argument("--skip-crop", action="store_true", help="Bỏ qua cắt ảnh YOLO, dùng manifest có sẵn")
    parser.add_argument(
        "--mode",
        default="auto",
        choices=["auto", "text", "scan"],
        help="auto: tự phát hiện; text: chỉ text-stream; scan: chỉ render ảnh + vision",
    )
    parser.add_argument(
        "--from-vision",
        default=None,
        help="Bỏ qua Pha 1+2, nạp mảng câu hỏi từ file JSON (do vision subagent tạo)",
    )
    args = parser.parse_args()

    review = []
    start_all = time.time()
    print("=" * 60)
    print("🚀 BẮT ĐẦU QUY TRÌNH CHUYỂN ĐỔI PDF → JSON NGÂN HÀNG CÂU HỎI")
    print(f"📄 File nguồn: {args.pdf_path or '(không, dùng --from-vision)'}")
    print(f"📂 Thư mục đích: {args.output_dir}")
    print(f"⚙️ Engine: {args.engine.upper()}")
    print("=" * 60)

    if args.model_cache:
        for var in ("HF_HOME", "TORCH_HOME", "TRANSFORMERS_CACHE"):
            os.environ[var] = args.model_cache

    os.makedirs(args.output_dir, exist_ok=True)

    # ---- LUỒNG --from-vision: bỏ qua Pha 1+2 ----
    if args.from_vision:
        with open(args.from_vision, "r", encoding="utf-8") as f:
            questions = json.load(f)
        if not isinstance(questions, list):
            print("❌ File --from-vision phải là mảng JSON các câu hỏi.")
            sys.exit(2)
        # Gán metadata mặc định nếu thiếu
        for q in questions:
            q.setdefault("grade", args.grade)
            q.setdefault("topicIds", [args.topic])
            q.setdefault("points", 1 if q.get("type") != "essay" else 0)
        rc = export_and_validate(
            questions,
            args.output_dir,
            "NganHang_CauHoi.json",
            title=f"Ngân Hàng Câu Hỏi - {os.path.splitext(os.path.basename(args.pdf_path or 'vision'))[0]}",
            review=review,
        )
        print("=" * 60)
        print(f"🎉 Hoàn tất luồng vision trong {time.time() - start_all:.2f}s")
        sys.exit(rc)

    if not os.path.exists(args.pdf_path):
        print(f"❌ Không tìm thấy file PDF: {args.pdf_path}")
        sys.exit(1)

    # ---- LUỒNG MARKER ENGINE ----
    use_marker = False
    if args.engine == "marker":
        use_marker = True
    elif args.engine == "auto" and args.mode != "scan":
        try:
            import marker
            use_marker = True
        except ImportError:
            use_marker = False

    if use_marker:
        print("⚡ [Engine] Kích hoạt mô hình kết hợp: Marker 2.0 AI (LaTeX) + DocLayout-YOLO (HQ Figures)...")
        try:
            # Thêm thư mục scripts vào sys.path nếu chưa có
            script_dir = os.path.dirname(os.path.abspath(__file__))
            if script_dir not in sys.path:
                sys.path.insert(0, script_dir)

            from marker_extract import run_marker_via_python_api
            from marker_md_parser import parse_marker_markdown_to_questions

            # 1. Cắt hình ảnh sắc nét bằng DocLayout-YOLO
            manifest = []
            figures_dir = os.path.join(args.output_dir, "figures")
            manifest_path = os.path.join(figures_dir, "crop_manifest.json")
            if not args.skip_crop:
                print("🎯 [YOLO] Quét và cắt hình ảnh/đồ thị/bảng biến thiên chuẩn sắc nét...")
                run_phase1_extract_and_crop(
                    pdf_path=args.pdf_path,
                    output_dir=args.output_dir,
                    model_path=args.model,
                    page_range=args.page_range,
                )
                if os.path.exists(manifest_path):
                    with open(manifest_path, "r", encoding="utf-8") as f:
                        manifest = json.load(f)

            # 2. Dịch công thức toán học và văn bản bằng Marker 2.0
            print("🚀 [Marker] OCR công thức Toán học sang LaTeX chuẩn...")
            md_path, figures_dir, md_text, _ = run_marker_via_python_api(
                pdf_path=args.pdf_path,
                output_dir=args.output_dir,
                page_range=args.page_range,
                force_ocr=args.force_ocr,
                languages=args.languages
            )
            
            # 3. Kết hợp Markdown + Kho ảnh YOLO
            questions = parse_marker_markdown_to_questions(
                md_text=md_text,
                default_topic=args.topic,
                default_grade=args.grade,
                forced_type=args.type,
                manifest=manifest
            )

            rc = export_and_validate(
                questions,
                args.output_dir,
                "NganHang_CauHoi.json",
                title=f"Ngân Hàng Câu Hỏi - {os.path.splitext(os.path.basename(args.pdf_path))[0]}",
                review=review,
            )

            total_time = time.time() - start_all
            print("=" * 60)
            print(f"🎉 HOÀN TẤT VỚI HYBRID ENGINE trong {total_time:.2f}s — {len(questions)} câu hỏi.")
            if rc == 0:
                print("✅ Validate 0 lỗi — sẵn sàng import.")
            else:
                print(f"⚠️ Validate còn lỗi (exit {rc}). Xem review_report.md và preview.html.")
            print(f"🌐 Mở {os.path.join(args.output_dir, 'preview.html')} để rà soát.")
            print("=" * 60)
            sys.exit(rc)
        except Exception as e:
            if args.engine == "marker":
                print(f"❌ Marker Engine gặp lỗi: {e}")
                sys.exit(1)
            else:
                print(f"⚠️ Marker Engine gặp lỗi ({e}). Đang tự động chuyển sang Legacy Engine (PyMuPDF + DocLayout-YOLO)...")

    # ---- Pha 0: phân loại (Legacy) ----
    if args.mode in ("auto", "text"):
        info = classify_pdf(args.pdf_path)
        print(f"🔎 [Pha 0] Phân loại: {info['avg_chars_per_page']} ký tự/trang, "
              f"{info['empty_pages']}/{info['num_pages']} trang rỗng → "
              f"{'SCAN' if info['is_scan'] else 'TEXT'}")
        if info["is_scan"] and args.mode == "auto":
            args.mode = "scan"

    # ---- Luồng scan: render ảnh + sinh vision_batches.json, exit 2 ----
    if args.mode == "scan":
        print("🖼️ [Pha scan] Render ảnh + cắt hình YOLO...")
        run_phase1_extract_and_crop(
            pdf_path=args.pdf_path,
            output_dir=args.output_dir,
            model_path=args.model,
        )
        out_path, payload = write_vision_batches(args.output_dir, args.pdf_path)
        print(f"📦 Đã sinh {out_path}: {len(payload['batches'])} batch(es), "
              f"{len(payload['cropped_figures'])} ảnh đã crop sẵn.")
        print("👉 Bước tiếp theo: spawn subagent vision (xem SKILL.md §'Chế độ PDF scan')")
        print("    rồi chạy: build_full_question_bank.py <pdf> <out> --from-vision <questions_vision.json>")
        print("=" * 60)
        sys.exit(2)

    # ---- Luồng legacy text: trọn gói 3 pha ----
    manifest = []
    figures_dir = os.path.join(args.output_dir, "figures")
    manifest_path = os.path.join(figures_dir, "crop_manifest.json")

    if args.skip_crop and os.path.exists(manifest_path):
        print(f"⏩ [Pha 1] Bỏ qua cắt ảnh, tải manifest: {manifest_path}")
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    else:
        run_phase1_extract_and_crop(
            pdf_path=args.pdf_path,
            output_dir=args.output_dir,
            model_path=args.model,
        )
        if os.path.exists(manifest_path):
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)

    questions = parse_pdf_to_questions(
        pdf_path=args.pdf_path,
        manifest=manifest,
        default_topic=args.topic,
        default_grade=args.grade,
        forced_type=args.type,
        review=review,
    )

    rc = export_and_validate(
        questions,
        args.output_dir,
        "NganHang_CauHoi.json",
        title=f"Ngân Hàng Câu Hỏi - {os.path.splitext(os.path.basename(args.pdf_path))[0]}",
        review=review,
    )

    total_time = time.time() - start_all
    print("=" * 60)
    print(f"🎉 HOÀN TẤT trong {total_time:.2f}s — {len(questions)} câu hỏi.")
    if rc == 0:
        print("✅ Validate 0 lỗi — sẵn sàng import.")
    else:
        print(f"⚠️ Validate còn lỗi (exit {rc}). Xem review_report.md và preview.html.")
    print(f"🌐 Mở {os.path.join(args.output_dir, 'preview.html')} để rà soát.")
    print("=" * 60)
    sys.exit(rc)


if __name__ == "__main__":
    main()
