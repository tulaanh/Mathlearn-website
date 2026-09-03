# -*- coding: utf-8 -*-
import sys, os, re, json, pymupdf

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def convert_math_symbols(text):
    if not text:
        return ''
    s = text
    s = s.replace(chr(178), '^2').replace(chr(179), '^3').replace(chr(8308), '^4').replace(chr(8319), '^n')
    s = s.replace(chr(8321), '_1').replace(chr(8322), '_2').replace(chr(8323), '_3').replace(chr(8324), '_4').replace(chr(8320), '_0')
    s = s.replace(chr(8805), r' \ge ').replace(chr(8804), r' \le ')
    s = s.replace(chr(8800), r' \ne ').replace(chr(8776), r' \approx ')
    s = s.replace(chr(8712), r' \in ').replace(chr(8713), r' \notin ')
    s = s.replace(chr(8477), r'\mathbb{R}').replace(chr(8710), r'\Delta ').replace(chr(916), r'\Delta ')
    s = s.replace(chr(177), r'\pm ').replace(chr(8734), r'\infty ')
    s = s.replace(chr(176), r'^\circ ')
    s = s.replace(chr(8594), r' \rightarrow ').replace(chr(8658), r' \Rightarrow ').replace(chr(8660), r' \Leftrightarrow ')
    s = s.replace(chr(960), r'\pi ').replace(chr(8869), r' \perp ')
    s = re.sub(r'√(\d+)', r'\\sqrt{\1}', s)
    s = re.sub(r'√\(([^)]+)\)', r'\\sqrt{\1}', s)
    s = re.sub(r'√([a-zA-Z0-9_]+)', r'\\sqrt{\1}', s)
    s = s.replace(chr(8730), r'\sqrt')
    return s

def clean_watermark(text):
    lines = text.split('\n')
    cleaned = []
    for l in lines:
        l_str = l.strip()
        if not l_str:
            continue
        if any(w in l_str.lower() for w in [
            'toannbv.vn', 'tracnghiemtoanthpt489', '0946798489', 'nguyen bao vuong', 'nguyễn bảo vương',
            'loi giai tham khao', 'lời giải tham khảo', 'trong qua trinh', 'trong quá trình',
            'bao vuong', 'bảo vương', 'zalo: 09467', 'tong hop', 'tổng hợp', 'chuc cac ban', 'chúc các bạn'
        ]):
            continue
        if re.match(r'^\s*\d+\s*$', l_str):
            continue
        cleaned.append(l)
    return '\n'.join(cleaned)

def balance_dollars_and_braces(text):
    if not text:
        return ''
    def fix_decimal(m):
        math_content = m.group(1)
        fixed = re.sub(r'(\d+),(\d+)', r'\1{,} \2', math_content)
        return f'${fixed}$'
    text = re.sub(r'\$([^$]+)\$', fix_decimal, text)
    count = 0
    for i, c in enumerate(text):
        if c == '$' and (i == 0 or text[i-1] != '\\'):
            count += 1
    if count % 2 != 0:
        text = text.strip() + '$'
    return text

KNOWN_ANSWERS = {
    1: '2,15 <= t <= 7,45 giờ',
    2: 'y=-x+8',
    3: '15/8',
    4: '(5;6)',
    5: '144',
    6: '[-3;0)',
    7: '8,3',
    8: '0,5',
    9: '6,22',
    10: '40,7',
    11: '160',
    12: '0,08',
    13: '41',
    14: '3',
    15: '0',
    16: '6300',
    17: '24',
    18: '40',
    19: '1200',
    20: '20,6',
    21: '284',
    22: '156',
    23: '13',
    24: '3,44',
    25: '4054',
    26: '4',
    27: '487',
    28: '17,7',
    29: '250',
    30: '8',
    31: '1,08',
    32: '1,67',
    33: '-2',
    34: '7',
    35: '0,75',
    36: '3,7',
    37: '12,1',
    38: '3',
    39: '50',
    40: '1200',
    41: '31,56',
    42: '1,25',
    43: '23',
    44: '101',
    45: '2',
    46: '100',
    47: '-3',
    48: '1,65',
    49: '100',
    50: '46',
    51: '0,83',
    52: '8',
    53: '10,6',
    54: '499',
    55: '18',
    56: '3,16',
    57: '184',
    58: '5,23',
    59: '19,3',
    60: '100',
    61: '2914',
    62: '280',
    63: '5,58',
    64: '5,35',
    65: '40,7',
    66: '14,8',
    67: '6375',
    68: '7,49',
    69: '3',
    70: '140',
    71: '157'
}

def run():
    pdf_path = r'D:\Download\TLN.pdf'
    output_dir = r'D:\DayThem\Big3\KhoTaiLieu\Khảo sát đồ thị hàm số\Trả lời ngắn'
    figures_dir = os.path.join(output_dir, 'figures')
    manifest_path = os.path.join(figures_dir, 'crop_manifest.json')

    manifest = []
    if os.path.exists(manifest_path):
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

    manifest_by_page = {}
    for item in manifest:
        p = item['page']
        if p not in manifest_by_page:
            manifest_by_page[p] = []
        manifest_by_page[p].append(item)

    doc = pymupdf.open(pdf_path)
    full_text = ''
    page_offsets = []
    for pno in range(min(64, len(doc))):
        p_num = pno + 1
        t = doc[pno].get_text('text', sort=True)
        start_idx = len(full_text)
        tag = f'\n[[PAGE_{p_num:02d}]]\n'
        full_text += tag + t
        page_offsets.append((p_num, start_idx))
    doc.close()

    matches = list(re.finditer(r'(?:Câu|CÂU|Bài|BÀI)\s*(\d+)[\.:\s]', full_text))
    seen = set()
    unique_matches = []
    for m in matches:
        num = int(m.group(1))
        if 1 <= num <= 71 and num not in seen:
            seen.add(num)
            unique_matches.append((num, m))

    unique_matches.sort(key=lambda x: x[0])
    print(f'Total unique questions identified: {len(unique_matches)}')

    questions = []
    for idx, (q_num, m) in enumerate(unique_matches):
        start_pos = m.start()
        end_pos = unique_matches[idx+1][1].start() if idx + 1 < len(unique_matches) else len(full_text)
        block = full_text[start_pos:end_pos].strip()
        
        pages_in_block = []
        for p_num, offset in page_offsets:
            tag = f'[[PAGE_{p_num:02d}]]'
            if tag in block:
                pages_in_block.append(f'Trang_{p_num:02d}')
                
        cleaned_block = re.sub(r'\[\[PAGE_\d+\]\]\n?', '', block).strip()
        cleaned_block = clean_watermark(cleaned_block)
        cleaned_block = convert_math_symbols(cleaned_block)
        
        loi_giai_m = re.search(r'\n\s*(?:Lời giải|Hướng dẫn giải|Loi giai|HƯỚNG DẪN GIẢI)\s*', cleaned_block, re.IGNORECASE)
        if loi_giai_m:
            q_text = cleaned_block[:loi_giai_m.start()].strip()
            exp_text = cleaned_block[loi_giai_m.start():].strip()
        else:
            ans_m = re.search(r'\n\s*(?:Đáp án|Đáp số|Kết quả|Trả lời)\s*[:=]\s*[^\n]+', cleaned_block, re.IGNORECASE)
            if ans_m:
                q_text = cleaned_block[:ans_m.start()].strip()
                exp_text = cleaned_block[ans_m.start():].strip()
            else:
                lines = [l for l in cleaned_block.split('\n') if l.strip()]
                q_text = '\n'.join(lines[:3]) if len(lines) > 3 else cleaned_block
                exp_text = '\n'.join(lines[3:]) if len(lines) > 3 else ''
                
        q_text = re.sub(r'^(?:\textbf\{)?(?:Câu|CÂU|Bài|BÀI)\s*\d+[\.:\s]*(?:\})?\s*', '', q_text).strip()
        
        # Extract answer from text or fallback to known answer
        extracted_ans = ''
        ans_match = re.search(r'(?:Đáp án|Đáp số|Kết quả|Trả lời)\s*[:=]\s*([^\n\.]+)', cleaned_block, re.IGNORECASE)
        if ans_match:
            extracted_ans = ans_match.group(1).strip()
            
        correct_ans = extracted_ans if extracted_ans else KNOWN_ANSWERS.get(q_num, '')
        
        q_figs = []
        for p_name in pages_in_block:
            if p_name in manifest_by_page:
                for fig in manifest_by_page[p_name]:
                    if fig['filename'] not in [f['filename'] for f in q_figs]:
                        q_figs.append(fig)
                        
        difficulty = 'thong_hieu' if q_num <= 20 else 'van_dung' if q_num <= 55 else 'van_dung_cao'
        
        q_obj = {
            'id': f'ks_tln_{q_num:02d}',
            'text': balance_dollars_and_braces(q_text),
            'type': 'short_answer',
            'difficulty': difficulty,
            'grade': 'Lớp 12',
            'topicIds': ['ham-so-va-do-thi'],
            'points': 1,
            'correctAnswer': str(correct_ans),
            'explanation': balance_dollars_and_braces(exp_text) if exp_text else 'Xem chi tiết lời giải trong tài liệu.'
        }
        
        if q_figs:
            if len(q_figs) == 1:
                if q_figs[0]['rel_y'] < 0.45:
                    q_obj['imageFileName'] = q_figs[0]['filename']
                else:
                    q_obj['explanationImageFileName'] = q_figs[0]['filename']
            else:
                q_obj['imageFileName'] = q_figs[0]['filename']
                q_obj['explanationImages'] = [f['filename'] for f in q_figs[1:]]
                
        questions.append(q_obj)

    out_json = os.path.join(output_dir, 'NganHang_CauHoi.json')
    bank_data = {
        'version': 1,
        'kind': 'question_bank',
        'title': 'Ngân Hàng Câu Hỏi Khảo Sát Đồ Thị Hàm Số - Trả Lời Ngắn',
        'total_questions': len(questions),
        'questions': questions
    }

    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(bank_data, f, ensure_ascii=False, indent=2)

    print(f'✅ Đã lưu {len(questions)} câu hỏi vào: {out_json}')

if __name__ == '__main__':
    run()
