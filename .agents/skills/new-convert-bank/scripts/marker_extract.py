#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Marker 2.0 Extraction Script for MathLearn Converter
Chuyển đổi PDF thành Markdown + LaTeX + Hình ảnh tự động bằng Marker 2.0
"""

import sys
import os
import time
import json
import argparse
import subprocess
from PIL import Image

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr and hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Cấu hình tự động đường dẫn llama-server.exe trên ổ D
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


def run_marker_via_python_api(pdf_path, output_dir, page_range=None, force_ocr=False, languages='vi,en'):
    """
    Sử dụng trực tiếp Python API của Marker 2.0 để render PDF sang Markdown + Hình ảnh.
    """
    try:
        from marker.converters.pdf import PdfConverter
        from marker.models import create_model_dict
        from marker.output import text_from_rendered
        from marker.config.parser import ConfigParser

        config_dict = {
            'output_format': 'markdown',
            'disable_image_extraction': False,
            'force_ocr': force_ocr,
        }
        if page_range:
            config_dict['page_range'] = page_range
        if languages:
            config_dict['languages'] = languages

        config_parser = ConfigParser(config_dict)

        print('🤖 [Marker] Đang nạp model Marker 2.0 (Surya Layout, Texify, OCR)...')
        t0 = time.time()
        artifact_dict = create_model_dict()

        converter = PdfConverter(
            config=config_parser.generate_config_dict(),
            artifact_dict=artifact_dict,
            processor_list=config_parser.get_processors(),
            renderer=config_parser.get_renderer(),
            llm_service=config_parser.get_llm_service()
        )
        print(f'✅ Nạp model thành công trong {time.time() - t0:.2f}s')

        print(f'📄 [Marker] Đang convert tài liệu: {pdf_path}...')
        t_conv = time.time()
        rendered = converter(pdf_path)
        text, metadata, images = text_from_rendered(rendered)
        print(f'✅ Convert hoàn tất trong {time.time() - t_conv:.2f}s')

        # Lưu file markdown và hình ảnh
        os.makedirs(output_dir, exist_ok=True)
        figures_dir = os.path.join(output_dir, 'figures')
        os.makedirs(figures_dir, exist_ok=True)

        md_path = os.path.join(output_dir, 'marker_output.md')
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(text)

        saved_images = {}
        for fname, img in images.items():
            out_img_path = os.path.join(figures_dir, fname)
            if isinstance(img, Image.Image):
                img.save(out_img_path)
            saved_images[fname] = out_img_path

        meta_path = os.path.join(output_dir, 'marker_meta.json')
        with open(meta_path, 'w', encoding='utf-8') as f:
            json.dump({
                'pdf_path': os.path.abspath(pdf_path),
                'total_images': len(saved_images),
                'images': list(saved_images.keys()),
                'metadata': metadata if isinstance(metadata, dict) else str(metadata),
                'time_seconds': round(time.time() - t0, 2)
            }, f, ensure_ascii=False, indent=2)

        print(f'💾 Đã lưu: {md_path} và {len(saved_images)} hình ảnh vào {figures_dir}')
        return md_path, figures_dir, text, saved_images
    except Exception as e:
        print(f'⚠️ Marker Python API gặp lỗi ({e}). Đang chuyển sang gọi CLI marker_single...')
        return run_marker_via_cli(pdf_path, output_dir, page_range, force_ocr)


def run_marker_via_cli(pdf_path, output_dir, page_range=None, force_ocr=False):
    """
    Fallback gọi CLI marker_single
    """
    os.makedirs(output_dir, exist_ok=True)
    cmd = ['marker_single', pdf_path, output_dir, '--output_format', 'markdown']
    if page_range:
        cmd.extend(['--page_range', page_range])
    if force_ocr:
        cmd.append('--force_ocr')

    print('🚀 [Marker CLI] Chạy lệnh: ' + ' '.join(cmd))
    t0 = time.time()
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='replace')
    if res.returncode != 0:
        print(f'❌ Marker CLI thất bại:\n{res.stderr}')
        raise RuntimeError(f'Marker CLI failed with exit code {res.returncode}: {res.stderr}')

    print(f'✅ Marker CLI hoàn tất trong {time.time() - t0:.2f}s')
    
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    possible_md = [
        os.path.join(output_dir, f'{base_name}.md'),
        os.path.join(output_dir, f'{base_name}/{base_name}.md'),
        os.path.join(output_dir, 'output.md'),
    ]
    md_path = None
    for p in possible_md:
        if os.path.exists(p):
            md_path = p
            break

    if not md_path:
        import glob
        mds = glob.glob(os.path.join(output_dir, '**/*.md'), recursive=True)
        if mds:
            md_path = mds[0]

    if not md_path:
        raise FileNotFoundError(f'Không tìm thấy file markdown kết quả trong {output_dir}')

    with open(md_path, 'r', encoding='utf-8') as f:
        text = f.read()

    target_md = os.path.join(output_dir, 'marker_output.md')
    if md_path != target_md:
        with open(target_md, 'w', encoding='utf-8') as f:
            f.write(text)
        md_path = target_md

    figures_dir = os.path.join(output_dir, 'figures')
    os.makedirs(figures_dir, exist_ok=True)
    
    import glob
    import shutil
    for img_p in glob.glob(os.path.join(output_dir, '**/*.png'), recursive=True):
        if not os.path.abspath(os.path.dirname(img_p)) == os.path.abspath(figures_dir):
            shutil.copy2(img_p, os.path.join(figures_dir, os.path.basename(img_p)))

    return md_path, figures_dir, text, {}


def main():
    parser = argparse.ArgumentParser(description='Marker 2.0 PDF to Markdown Converter')
    parser.add_argument('pdf_path', help='Đường dẫn file PDF')
    parser.add_argument('output_dir', help='Thư mục xuất kết quả')
    parser.add_argument('--page-range', default=None, help='Giới hạn trang, ví dụ: 0-10')
    parser.add_argument('--force-ocr', action='store_true', help='Bắt buộc OCR lại toàn bộ')
    parser.add_argument('--languages', default='vi,en', help='Ngôn ngữ nhận diện')
    args = parser.parse_args()

    md_path, figures_dir, _, _ = run_marker_via_python_api(
        pdf_path=args.pdf_path,
        output_dir=args.output_dir,
        page_range=args.page_range,
        force_ocr=args.force_ocr,
        languages=args.languages
    )
    print(f'🎉 Hoàn tất trích xuất Marker tại: {md_path}')


if __name__ == '__main__':
    main()
