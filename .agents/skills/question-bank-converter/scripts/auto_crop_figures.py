"""
Script tự động phát hiện và cắt hình vẽ (figures, diagrams, charts) từ ảnh các trang PDF bằng DocLayout-YOLO
Sử dụng: python auto_crop_figures.py <input_images_dir_or_pdf> [output_figures_dir] [model_path]
"""
import sys
import os
import glob
import json
from PIL import Image

if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')

DEFAULT_MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "new-convert-bank",
    "models",
    "doclayout_yolo_docstructbench_imgsz1024.pt"
)

def run_crop(input_path, output_dir=None, model_path=None, padding_ratio=0.03, min_confidence=0.15):
    try:
        import torch
        if hasattr(torch, 'set_num_threads'):
            torch.set_num_threads(max(1, min(4, (os.cpu_count() or 4) // 2)))
    except Exception:
        pass

    from doclayout_yolo import YOLOv10
    import pymupdf as fitz
    
    if not model_path:
        model_path = DEFAULT_MODEL_PATH
        
    if not os.path.exists(model_path):
        print(f"❌ Không tìm thấy file trọng số model tại: {model_path}")
        print("Vui lòng tải model về thư mục models/ trước khi chạy.")
        sys.exit(1)
        
    print(f"📦 Đang nạp model DocLayout-YOLO từ: {model_path}")
    model = YOLOv10(model_path)

    temp_dir = None
    pdf_doc = None
    if os.path.isfile(input_path) and input_path.lower().endswith(".pdf"):
        print(f"📄 Phát hiện file PDF. Bắt đầu render các trang...")
        temp_dir = os.path.splitext(input_path)[0] + "_pages"
        os.makedirs(temp_dir, exist_ok=True)
        pdf_doc = fitz.open(input_path)
        for i, page in enumerate(pdf_doc):
            pix = page.get_pixmap(dpi=300)
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            img.save(os.path.join(temp_dir, f"Trang_{i+1:02d}.png"), "PNG")
        input_dir = temp_dir
    elif os.path.isdir(input_path):
        input_dir = input_path
    elif os.path.isfile(input_path):
        input_dir = os.path.dirname(input_path)
    else:
        print(f"❌ Đường dẫn không hợp lệ: {input_path}")
        sys.exit(1)

    if not output_dir:
        output_dir = os.path.join(input_dir, "figures")
    os.makedirs(output_dir, exist_ok=True)

    image_files = sorted(
        glob.glob(os.path.join(input_dir, "Trang_*.png")) or 
        glob.glob(os.path.join(input_dir, "*.png")) or 
        glob.glob(os.path.join(input_dir, "*.jpg"))
    )

    if not image_files:
        print(f"⚠️ Không tìm thấy file ảnh nào trong: {input_dir}")
        return

    print(f"🚀 Bắt đầu quét {len(image_files)} trang để tìm và cắt hình vẽ & Bảng Biến Thiên...")
    manifest = []
    total_cropped = 0

    for page_idx, img_path in enumerate(image_files):
        page_name = os.path.splitext(os.path.basename(img_path))[0]
        img = Image.open(img_path)
        img_w, img_h = img.size

        # Quét tọa độ tiêu đề BBT nếu có file PDF
        bbt_rects = []
        if pdf_doc is not None and page_idx < len(pdf_doc):
            p = pdf_doc[page_idx]
            for text_kw in ["Bảng biến thiên", "bảng biến thiên", "BẢNG BIẾN THIÊN", "BBT:"]:
                matches = p.search_for(text_kw)
                for m in matches:
                    scale_x = img_w / p.rect.width
                    scale_y = img_h / p.rect.height
                    bbt_rects.append({
                        "x1": m.x0 * scale_x,
                        "y1": m.y0 * scale_y,
                        "x2": m.x1 * scale_x,
                        "y2": m.y1 * scale_y,
                    })

        results = model.predict(img_path, imgsz=1024, conf=min_confidence, verbose=False)
        page_candidates = []

        for r in results:
            names = r.names
            for box in r.boxes:
                cls_id = int(box.cls[0])
                cls_name = names[cls_id]
                conf = float(box.conf[0])
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                w = x2 - x1
                h = y2 - y1
                ar = w / max(1.0, h)

                # Quy tắc 1: Hình vẽ / Đồ thị thực sự (figure)
                if cls_name == "figure":
                    if conf >= 0.18 and w >= 80 and h >= 80 and h <= 0.65 * img_h:
                        page_candidates.append({
                            "cls": "figure",
                            "conf": conf,
                            "box": [x1, y1, x2, y2],
                            "reason": "YOLO Figure"
                        })

                # Quy tắc 2: Bảng biểu / Bảng biến thiên (table)
                elif cls_name == "table":
                    if conf >= 0.20 and w >= 250 and h >= 100 and h <= 0.65 * img_h:
                        page_candidates.append({
                            "cls": "bbt",
                            "conf": conf,
                            "box": [x1, y1, x2, y2],
                            "reason": "YOLO Table"
                        })

                # Quy tắc 3: Bảng biến thiên nằm dưới tiêu đề "Bảng biến thiên"
                elif cls_name in ["isolate_formula", "plain text"]:
                    for bbt in bbt_rects:
                        if y1 >= bbt["y1"] - 50 and y1 <= bbt["y2"] + 250:
                            if w >= 600 and h >= 180 and ar >= 1.2:
                                page_candidates.append({
                                    "cls": "bbt",
                                    "conf": conf,
                                    "box": [x1, y1, x2, y2],
                                    "reason": "BBT below header"
                                })

        # Khử trùng lặp NMS
        clean_boxes = []
        for cand in sorted(page_candidates, key=lambda x: x['conf'], reverse=True):
            box_a = cand['box']
            overlap = False
            for kept in clean_boxes:
                box_b = kept['box']
                ix1 = max(box_a[0], box_b[0])
                iy1 = max(box_a[1], box_b[1])
                ix2 = min(box_a[2], box_b[2])
                iy2 = min(box_a[3], box_b[3])
                if ix2 > ix1 and iy2 > iy1:
                    inter_area = (ix2 - ix1) * (iy2 - iy1)
                    area_a = (box_a[2] - box_a[0]) * (box_a[3] - box_a[1])
                    if inter_area / area_a > 0.5:
                        overlap = True
                        break
            if not overlap:
                clean_boxes.append(cand)

        # Sắp xếp: cột trái (x < 50% page width) trước, rồi theo y
        mid_x = img_w / 2
        clean_boxes = sorted(clean_boxes, key=lambda x: (
            0 if (x['box'][0] + x['box'][2]) / 2 < mid_x else 1,  # left col = 0, right col = 1
            x['box'][1]  # then by y
        ))

        for item in clean_boxes:
            b = item['box']
            pad_x = (b[2] - b[0]) * padding_ratio
            pad_y = (b[3] - b[1]) * padding_ratio
            crop_x1 = max(0, int(b[0] - pad_x))
            crop_y1 = max(0, int(b[1] - pad_y))
            crop_x2 = min(img_w, int(b[2] + pad_x))
            crop_y2 = min(img_h, int(b[3] + pad_y))

            if (crop_x2 - crop_x1 < 50) or (crop_y2 - crop_y1 < 50):
                continue

            total_cropped += 1
            fig_filename = f"lt_{total_cropped}.png"
            fig_out_path = os.path.join(output_dir, fig_filename)

            crop_img = img.crop((crop_x1, crop_y1, crop_x2, crop_y2))
            crop_img.save(fig_out_path, "PNG")

            manifest.append({
                "figure_id": total_cropped,
                "filename": fig_filename,
                "page": page_name,
                "class": item["cls"],
                "confidence": round(item["conf"], 3),
                "box": [crop_x1, crop_y1, crop_x2, crop_y2],
                "rel_y": round(crop_y1 / img_h, 4),
                "rel_x": round(crop_x1 / img_w, 4),
                "width": crop_img.width,
                "height": crop_img.height
            })
            print(f"  📸 Đã cắt [{page_name}] -> {fig_filename} ({crop_img.width}x{crop_img.height}) [{item['cls'].upper()}]")

    manifest_path = os.path.join(output_dir, "crop_manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print("-" * 50)
    print(f"✅ HOÀN TẤT: Đã bóc tách thành công {total_cropped} hình vẽ & BBT chuẩn xác vào: {output_dir}")
    print(f"📋 Bảng danh sách chi tiết: {manifest_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Sử dụng: python auto_crop_figures.py <input_images_dir_or_pdf> [output_figures_dir] [model_path]")
        sys.exit(1)
        
    input_p = sys.argv[1]
    out_p = sys.argv[2] if len(sys.argv) > 2 else None
    model_p = sys.argv[3] if len(sys.argv) > 3 else None
    
    run_crop(input_p, out_p, model_p)
