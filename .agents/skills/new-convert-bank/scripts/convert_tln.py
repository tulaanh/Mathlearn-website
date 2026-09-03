import sys
import os
import re
import json

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def clean_watermark(text):
    skip_tokens = [
        "toannbv.vn",
        "tracnghiemtoanthpt",
        "0946798489",
        "nguyễn bảo vương",
        "nguyen bao vuong",
        "lời giải tham khảo",
        "trong quá trình biên soạn",
        "chân thành cám ơn",
        "chúc các bạn học tập tốt",
        "tổng hợp: nguyễn bảo vương",
    ]
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        if not s:
            cleaned.append("")
            continue
        if any(w in s.lower() for w in skip_tokens):
            continue
        line = re.sub(r'0946798489|toannbv\.vn|tracnghiemtoanthpt\d*', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Zalo\s*:\s*\d*', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Tổng hợp\s*:\s*Nguyễn Bảo Vương.*', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Bảo Vương\s*-\s*Zalo\s*:\s*\d*', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Nguyễn Bảo Vương', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Ng\s*hợp\s*:\s*Ng\s*ng', '', line, flags=re.IGNORECASE)
        line = re.sub(r'Tôns\s*', '', line, flags=re.IGNORECASE)
        cleaned.append(line)
    return '\n'.join(cleaned)

def clean_html_tags(text):
    text = re.sub(r'<sup>(.*?)</sup>', r'\1', text)
    text = re.sub(r'<sub>(.*?)</sub>', r'\1', text)
    text = re.sub(r'<[^>]+>', '', text)
    return text

def convert_unicode_math(text):
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

def extract_images(text):
    img_pattern = re.compile(r'!\[([^\]]*)\]\(([^\)]+)\)')
    images = []
    for m in img_pattern.finditer(text):
        src = m.group(2).strip()
        fname = os.path.basename(src)
        images.append(fname)
    clean = img_pattern.sub('', text)
    return clean.strip(), images

def normalize_math_display(text):
    text = re.sub(r'\$\$\s*(.*?)\s*\$\$', r' $\1$ ', text, flags=re.DOTALL)
    def fix_commas(match):
        inner = match.group(1)
        inner = re.sub(r'(\d+),(\d+)', r'\1{,}\2', inner)
        return f"${inner}$"
    text = re.sub(r'\$([^\$]+)\$', fix_commas, text)
    return text

def parse_tln_file(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_text = f.read()

    q_starts = []
    for q in range(1, 102):
        m = re.search(r'(?:C[âa]u|Bài)\s*' + str(q) + r'(?:[\.:\s*]|\*\*)', raw_text, re.IGNORECASE)
        if m:
            q_starts.append((q, m.start()))
        else:
            print(f"Warning: Question {q} not found!")

    q_starts.sort(key=lambda x: x[1])

    questions = []
    for i in range(len(q_starts)):
        q_num, start_pos = q_starts[i]
        end_pos = q_starts[i+1][1] if i+1 < len(q_starts) else len(raw_text)
        
        block = raw_text[start_pos:end_pos].strip()

        if q_num == 96:
            m_real_stem = re.search(r'(\*\*\s*)?\([^\)]*(?:202\d|THPT|Sở|Chuyên)', block)
            if m_real_stem and m_real_stem.start() > 10:
                prev_text = block[:m_real_stem.start()].strip()
                block = block[m_real_stem.start():].strip()
                if questions:
                    questions[-1]['explanation'] += '\n' + prev_text

        block = re.sub(r'^(?:C[âa]u|Bài)\s*' + str(q_num) + r'[\.:\s*]*(\*\*)?', '', block, flags=re.IGNORECASE).strip()

        block_clean, all_imgs = extract_images(block)

        block_clean = clean_watermark(block_clean)
        block_clean = clean_html_tags(block_clean)
        block_clean = convert_unicode_math(block_clean)

        lg_match = re.search(r'(?:\n|^)\s*(?:\*\*)?(?:Lời giải|Hướng dẫn giải|Loi giai|HƯỚNG DẪN GIẢI)(?:\*\*)?[\.:\s]*', block_clean, re.IGNORECASE)
        if lg_match:
            stem_raw = block_clean[:lg_match.start()].strip()
            exp_raw = block_clean[lg_match.end():].strip()
        else:
            ans_m = re.search(r'(?:\n|^)\s*(?:\*\*)?(?:Đáp án|Đáp số|Kết quả)[\s:=]', block_clean, re.IGNORECASE)
            if ans_m:
                stem_raw = block_clean[:ans_m.start()].strip()
                exp_raw = block_clean[ans_m.start():].strip()
            else:
                lines = [l for l in block_clean.split('\n') if l.strip()]
                stem_raw = lines[0] if lines else ""
                exp_raw = '\n'.join(lines[1:]) if len(lines) > 1 else ""

        ans_pattern = re.search(r'(?:Đáp án|Đáp số|Kết quả)\s*[:=]?\s*([^\n\r]+)', exp_raw, re.IGNORECASE)
        correct_ans = ""
        if ans_pattern:
            correct_ans = ans_pattern.group(1).strip().replace('**', '').replace('$', '').strip()
            if correct_ans.endswith('.'):
                correct_ans = correct_ans[:-1].strip()
        else:
            vay_m = re.search(r'Vậy\s+([^\n\r\.\;]+)', exp_raw, re.IGNORECASE)
            if vay_m:
                correct_ans = vay_m.group(1).strip().replace('**', '').replace('$', '')

        stem_final = normalize_math_display(stem_raw)
        exp_final = normalize_math_display(exp_raw)

        stem_final = re.sub(r'\n{3,}', '\n\n', stem_final).strip()
        exp_final = re.sub(r'\n{3,}', '\n\n', exp_final).strip()
        stem_final = re.sub(r'\s*Đáp án\s*:\s*\d+[\d\.,]*', '', stem_final).strip()

        if q_num <= 25:
            diff = "thong_hieu"
        elif q_num <= 75:
            diff = "van_dung"
        else:
            diff = "van_dung_cao"

        q_img = None
        exp_imgs = []

        for img in all_imgs:
            if img in block[:lg_match.start() if lg_match else len(block)]:
                if not q_img:
                    q_img = img
            else:
                exp_imgs.append(img)

        q_obj = {
            "id": f"ks_tln_{q_num:02d}",
            "text": stem_final,
            "type": "short_answer",
            "difficulty": diff,
            "grade": "Lớp 12",
            "topicIds": ["ham-so-va-do-thi"],
            "points": 1,
            "correctAnswer": correct_ans or "Xem lời giải",
            "explanation": exp_final or "Xem chi tiết lời giải trong tài liệu."
        }

        if q_img:
            q_obj["imageFileName"] = q_img
        if len(exp_imgs) == 1:
            q_obj["explanationImageFileName"] = exp_imgs[0]
        elif len(exp_imgs) > 1:
            q_obj["explanationImages"] = exp_imgs

        questions.append(q_obj)

    return questions

def main():
    md_path = r'D:\DayThem\Big3\KhoTaiLieu\Khảo sát đồ thị hàm số\Trả lời ngắn\marker_output.md'
    out_path = r'D:\DayThem\Big3\KhoTaiLieu\Khảo sát đồ thị hàm số\Trả lời ngắn\NganHang_CauHoi.json'

    questions = parse_tln_file(md_path)
    print(f"Parsed {len(questions)} questions successfully!")

    data = {
        "version": 1,
        "kind": "question_bank",
        "title": "Ngân Hàng Câu Hỏi Khảo Sát Đồ Thị Hàm Số - Trả Lời Ngắn",
        "total_questions": len(questions),
        "questions": questions
    }

    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Saved to {out_path}")

if __name__ == '__main__':
    main()
