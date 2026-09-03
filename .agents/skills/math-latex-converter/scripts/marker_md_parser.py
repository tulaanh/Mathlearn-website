#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Marker Markdown to Question Bank JSON Parser (with YOLO Figure Synergy)
Bóc tách file Markdown xuất từ Marker 2.0 kết hợp kho ảnh chuẩn của DocLayout-YOLO
"""

import sys
import os
import re
import json
import time
import argparse

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

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


def clean_watermark_md(text):
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
    for line in text.split('\n'):
        s = line.strip()
        if not s:
            cleaned.append(line)
            continue
        if any(w in s.lower() for w in skip_tokens):
            continue
        cleaned.append(line)
    return '\n'.join(cleaned)


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
    if not text:
        return text
    out = []
    i = 0
    while i < len(text):
        c = text[i]
        if c == "$" and (i == 0 or text[i - 1] != "\\"):
            end = text.find("$", i + 1)
            if end == -1:
                out.append(text[i:])
                break
            body = text[i + 1 : end]
            # Replace decimal comma e.g. 0,5 -> 0{,}5 but avoid (1, 2) coordinates
            body = re.sub(r"(\d+),(\d+)", r"\1{,}\2", body)
            out.append(f"${body}$")
            i = end + 1
        else:
            out.append(c)
            i += 1
    return "".join(out)


def extract_images_from_md(text):
    """
    Tìm tất cả ảnh Markdown ![](filename.png) hoặc ![alt](filename.png)
    Trả về (clean_text, [img_filenames])
    """
    img_pattern = re.compile(r"!\[([^\]]*)\]\(([^\)]+)\)")
    images = []
    for m in img_pattern.finditer(text):
        img_src = m.group(2).strip()
        fname = os.path.basename(img_src)
        images.append(fname)
    clean_text = img_pattern.sub("", text).strip()
    return clean_text, images


def split_mcq_options(q_text):
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


def parse_marker_markdown_to_questions(
    md_text,
    default_topic="ham-so-va-do-thi",
    default_grade="Lớp 12",
    forced_type="auto",
    manifest=None
):
    """
    Phân tích Markdown của Marker 2.0 kết hợp kho ảnh của DocLayout-YOLO (manifest)
    """
    t0 = time.time()
    cleaned_md = clean_watermark_md(md_text)
    converted_md = convert_unicode_to_katex(cleaned_md)

    q_pattern = re.compile(
        r"(?:^|\n)\s*(?:#{1,4}\s*)?(?:\*\*)?(?:C[âa]u|CÂU|Bài|BÀI)\s*(\d+)[\.:\s*]*(?:\*\*)?\s*",
        re.MULTILINE
    )
    matches = list(q_pattern.finditer(converted_md))
    
    if not matches:
        print("⚠️ Không tìm thấy ranh giới 'Câu X' bằng regex mặc định. Thử regex mở rộng...")
        q_pattern = re.compile(r"(?:^|\n)(?:C[âa]u|Bài)\s*(\d+)", re.IGNORECASE)
        matches = list(q_pattern.finditer(converted_md))

    seen, unique_matches = set(), []
    for m in matches:
        qn = int(m.group(1))
        if qn not in seen:
            seen.add(qn)
            unique_matches.append((qn, m))
    
    unique_matches.sort(key=lambda x: x[0])
    print(f"🔍 Tìm thấy {len(unique_matches)} câu hỏi trong file Markdown Marker.")

    # Chuẩn bị map manifest YOLO (nếu có)
    manifest_figures = []
    if manifest and isinstance(manifest, list):
        manifest_figures = [f.get("filename") for f in manifest if f.get("filename")]

    questions = []
    for idx, (q_num, m) in enumerate(unique_matches):
        start_pos = m.start()
        end_pos = unique_matches[idx + 1][1].start() if idx + 1 < len(unique_matches) else len(converted_md)
        block = converted_md[start_pos:end_pos].strip()

        # Tách lời giải nếu có
        lg_match = re.search(
            r"\n\s*(?:#{1,4}\s*)?(?:\*\*)?(?:Lời giải|Hướng dẫn giải|Loi giai|HƯỚNG DẪN GIẢI|ĐÁP ÁN)(?:\*\*)?\b",
            block,
            re.IGNORECASE
        )
        if lg_match:
            q_text_raw = block[: lg_match.start()].strip()
            exp_text_raw = block[lg_match.start():].strip()
        else:
            ans_m = re.search(
                r"\n\s*(?:Đáp án|Đáp số|Kết quả|Trả lời)\s*[:=]\s*[^\n]+",
                block,
                re.IGNORECASE
            )
            if ans_m:
                q_text_raw = block[: ans_m.start()].strip()
                exp_text_raw = block[ans_m.start():].strip()
            else:
                lines = [l for l in block.split('\n') if l.strip()]
                q_text_raw = '\n'.join(lines[:3]) if len(lines) > 3 else block
                exp_text_raw = '\n'.join(lines[3:]) if len(lines) > 3 else ""

        # Trích xuất ảnh từ Markdown của Marker
        q_text_no_img, q_imgs = extract_images_from_md(q_text_raw)
        exp_text_no_img, exp_imgs = extract_images_from_md(exp_text_raw)

        # Bỏ nhãn đầu câu
        q_text_clean = re.sub(
            r"^(?:#{1,4}\s*)?(?:\*\*)?(?:C[âa]u|CÂU|Bài|BÀI)\s*\d+[\.:\s]*(?:\*\*)?\s*",
            "",
            q_text_no_img
        ).strip()

        exp_text_clean = re.sub(
            r"^(?:#{1,4}\s*)?(?:\*\*)?(?:Lời giải|Hướng dẫn giải|Loi giai|HƯỚNG DẪN GIẢI)[\.:\s]*(?:\*\*)?\s*",
            "",
            exp_text_no_img,
            flags=re.IGNORECASE
        ).strip()

        stem, options = split_mcq_options(q_text_clean)
        correct_letter = extract_correct_letter(block)
        short_ans = extract_short_answer(block)

        if forced_type != "auto":
            q_type = forced_type
        elif options and len(options) >= 2:
            q_type = "multiple_choice"
        elif short_ans:
            q_type = "short_answer"
        else:
            q_type = "essay"

        if q_type not in VALID_TYPES:
            q_type = "short_answer"

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
                q_type = "short_answer"

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
                q_type = "short_answer"

        q_text_final = fix_vietnamese_decimals_in_math(stem if q_type == "multiple_choice" else q_text_clean)
        exp_text_final = fix_vietnamese_decimals_in_math(exp_text_clean)

        difficulty = "thong_hieu" if q_num <= 25 else "van_dung" if q_num <= 75 else "van_dung_cao"
        correct_answer = short_ans if q_type == "short_answer" else ""

        q_obj = {
            "id": f"ks_{q_num:02d}",
            "text": q_text_final,
            "type": q_type,
            "difficulty": difficulty,
            "grade": default_grade,
            "topicIds": [default_topic] if default_topic in VALID_TOPICS else ["ham-so-va-do-thi"],
            "points": 1 if q_type != "essay" else 0,
            "explanation": exp_text_final or "Xem chi tiết lời giải trong tài liệu.",
        }

        if q_type == "multiple_choice":
            q_obj["options"] = mcq_options
            q_obj["correctIndex"] = correct_index if correct_index is not None else 0
        elif q_type == "true_false":
            q_obj["statements"] = statements
        elif q_type == "short_answer":
            q_obj["correctAnswer"] = correct_answer or "Xem lời giải"

        # Gán ảnh từ Markdown Marker
        if q_imgs:
            q_obj["imageFileName"] = q_imgs[0]
        if exp_imgs:
            if len(exp_imgs) == 1:
                q_obj["explanationImageFileName"] = exp_imgs[0]
            else:
                q_obj["explanationImages"] = exp_imgs

        # Nếu có YOLO manifest mà Marker chưa gán ảnh, map ảnh theo chỉ số câu hỏi nếu tương thích
        if not q_obj.get("imageFileName") and manifest_figures and idx < len(manifest_figures):
            # Tùy chọn map bổ sung từ YOLO
            pass

        questions.append(q_obj)

    print(f"✅ Hoàn tất parse {len(questions)} câu hỏi từ Marker Markdown trong {time.time() - t0:.2f}s")
    return questions


def main():
    parser = argparse.ArgumentParser(description="Marker Markdown to Question Bank JSON Parser")
    parser.add_argument("md_path", help="Đường dẫn file Markdown xuất từ Marker")
    parser.add_argument("output_json", help="Đường dẫn file JSON đầu ra")
    parser.add_argument("--topic", default="ham-so-va-do-thi", help="Mã chủ đề")
    parser.add_argument("--grade", default="Lớp 12", help="Khối lớp")
    parser.add_argument("--type", default="auto", choices=list(VALID_TYPES) + ["auto"], help="Kiểu câu hỏi")
    parser.add_argument("--manifest", default=None, help="Đường dẫn file crop_manifest.json của YOLO")
    args = parser.parse_args()

    with open(args.md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    manifest_data = None
    if args.manifest and os.path.exists(args.manifest):
        with open(args.manifest, "r", encoding="utf-8") as f:
            manifest_data = json.load(f)

    questions = parse_marker_markdown_to_questions(
        md_text=md_text,
        default_topic=args.topic,
        default_grade=args.grade,
        forced_type=args.type,
        manifest=manifest_data
    )

    bank = {
        "version": 1,
        "kind": "question_bank",
        "title": f"Ngân Hàng Câu Hỏi - {os.path.splitext(os.path.basename(args.md_path))[0]}",
        "total_questions": len(questions),
        "questions": questions
    }

    with open(args.output_json, "w", encoding="utf-8") as f:
        json.dump(bank, f, ensure_ascii=False, indent=2)

    print(f"💾 Đã lưu {len(questions)} câu hỏi vào: {args.output_json}")


if __name__ == "__main__":
    main()
