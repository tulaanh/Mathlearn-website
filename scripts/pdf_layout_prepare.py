#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Render PDF pages and create editable initial layout regions."""
from __future__ import annotations
import argparse, json, sys, time
from pathlib import Path
from typing import Any
import pymupdf
from PIL import Image

# The layout tool is intentionally visual-only: text regions are left for
# manual editing or downstream recognition and are not auto-created here.
CONFIDENCE_THRESHOLD = 0.18
# NMS is intentionally class-aware: only predictions with the same detector
# label compete with each other. 0.50 removes the duplicate/parent boxes seen
# in the sample while retaining neighboring boxes of the same class.
SAME_LABEL_NMS_IOU = 0.50
CONTAINMENT_EPSILON_PX = 2


def write_json(path: Path, value: Any) -> None:
    temp = path.with_suffix(path.suffix + ".tmp")
    temp.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding="utf-8")
    temp.replace(path)

def status(path: Path, **updates: Any) -> None:
    current = {}
    if path.exists():
        try: current = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError): pass
    current.update(updates); write_json(path, current)

def box(values: list[float], width: int, height: int) -> list[int]:
    x1, y1, x2, y2 = values
    left = max(0, min(width - 2, round(min(x1, x2))))
    top = max(0, min(height - 2, round(min(y1, y2))))
    right = max(left + 2, min(width, round(max(x1, x2))))
    bottom = max(top + 2, min(height, round(max(y1, y2))))
    return [left, top, right, bottom]


# Only visual detector labels become automatic regions. Text, titles,
# captions, formulas and PDF text blocks are intentionally excluded. Tables are
# visual assets too, so they use the same image/crop kind as figures.
VISUAL_DETECTOR_KINDS = {
    "figure": "image",
    "picture": "image",
    "image": "image",
    "table": "image",
}


def kind_from_detected_class(detected_class: str) -> str | None:
    """Map a DocLayOut-YOLO label to an auto-detectable application kind."""
    label = detected_class.lower().replace("_", " ").strip()
    return VISUAL_DETECTOR_KINDS.get(label)

def model_for(path: str | None) -> Any:
    if not path or not Path(path).exists(): return None
    try:
        from doclayout_yolo import YOLOv10
        return YOLOv10(path)
    except Exception as exc:
        print(f"Không nạp được DocLayout-YOLO: {exc}", file=sys.stderr); return None

def region_area(region: dict[str, Any]) -> int:
    left, top, right, bottom = region["bbox"]
    return max(0, right - left) * max(0, bottom - top)


def intersection_area(first: dict[str, Any], second: dict[str, Any]) -> int:
    a_left, a_top, a_right, a_bottom = first["bbox"]
    b_left, b_top, b_right, b_bottom = second["bbox"]
    return max(0, min(a_right, b_right) - max(a_left, b_left)) * max(
        0, min(a_bottom, b_bottom) - max(a_top, b_top)
    )


def iou(first: dict[str, Any], second: dict[str, Any]) -> float:
    overlap = intersection_area(first, second)
    union = region_area(first) + region_area(second) - overlap
    return overlap / union if union else 0.0


def contains(outer: dict[str, Any], inner: dict[str, Any]) -> bool:
    outer_left, outer_top, outer_right, outer_bottom = outer["bbox"]
    inner_left, inner_top, inner_right, inner_bottom = inner["bbox"]
    epsilon = CONTAINMENT_EPSILON_PX
    return (
        outer_left <= inner_left + epsilon
        and outer_top <= inner_top + epsilon
        and outer_right >= inner_right - epsilon
        and outer_bottom >= inner_bottom - epsilon
    )


def same_detector_label(first: dict[str, Any], second: dict[str, Any]) -> bool:
    """Compare the original detector labels, not normalized application kinds."""
    return str(first.get("detectedClass", "")).strip().casefold() == str(
        second.get("detectedClass", "")
    ).strip().casefold()


def nms_score(region: dict[str, Any]) -> tuple[float, int]:
    """Rank same-label predictions by confidence, then area for stable ties."""
    return (float(region.get("confidence", 0.0)), region_area(region))


def suppress_same_label(candidate: dict[str, Any], kept: dict[str, Any]) -> bool:
    """Return True only for a same-label pair whose IoU reaches the NMS threshold."""
    if not same_detector_label(candidate, kept):
        return False
    return iou(candidate, kept) >= SAME_LABEL_NMS_IOU


def filter_contained_regions(regions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Apply class-aware NMS: different detector labels never suppress each other."""
    kept: list[dict[str, Any]] = []
    candidates = sorted(regions, key=nms_score, reverse=True)
    for candidate in candidates:
        if any(suppress_same_label(candidate, existing) for existing in kept):
            continue
        kept.append(candidate.copy())
    return kept


def overlap_on_smaller_region(first: dict[str, Any], second: dict[str, Any]) -> float:
    """Return intersection divided by the smaller region area."""
    smaller_area = min(region_area(first), region_area(second))
    return intersection_area(first, second) / smaller_area if smaller_area else 0.0


def suppress_same_kind(candidate: dict[str, Any], kept: dict[str, Any]) -> bool:
    """Suppress duplicate same-kind boxes, including boxes nested in a larger one."""
    if candidate.get("kind") != kept.get("kind"):
        return False
    return (
        iou(candidate, kept) >= SAME_LABEL_NMS_IOU
        or overlap_on_smaller_region(candidate, kept) >= 0.65
    )


def filter_overlapping_same_kind(regions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Second-pass NMS for application kinds.
    This catches cases like 'plain text' + 'title' both becoming 'text', while
    preserving neighboring text boxes that only touch or slightly overlap."""
    kept: list[dict[str, Any]] = []
    candidates = sorted(regions, key=nms_score, reverse=True)
    for candidate in candidates:
        if any(suppress_same_kind(candidate, existing) for existing in kept):
            continue
        kept.append(candidate.copy())
    return kept


def normalize_regions(regions: list[dict[str, Any]], page_no: int) -> list[dict[str, Any]]:
    """Deduplicate class-aware YOLO regions, then kind-aware, and assign reading order."""
    cleaned = filter_contained_regions(regions)
    # Second pass: merge overlapping regions that map to the same app kind (e.g., multiple 'text' labels)
    cleaned = filter_overlapping_same_kind(cleaned)
    cleaned.sort(key=lambda item: (item["bbox"][1], item["bbox"][0], -float(item.get("confidence", 0.0))))
    for index, region in enumerate(cleaned, start=1):
        region["id"] = f"p{page_no}-r{index}"
        region["order"] = index
        region["postprocessed"] = True
    return cleaned



def detect(page: Any, image: Image.Image, ai: Any, page_no: int) -> list[dict[str, Any]]:
    """Run YOLO and keep only visual figure/table predictions."""
    width, height = image.size
    if ai is None:
        print(f"DocLayout-YOLO chưa sẵn sàng ở trang {page_no}.", file=sys.stderr)
        return []
    try:
        results = ai.predict(
            image, imgsz=1024, conf=CONFIDENCE_THRESHOLD, verbose=False
        )
    except Exception as exc:
        print(f"DocLayout-YOLO trang {page_no} lỗi: {exc}", file=sys.stderr)
        return []

    regions = []
    for result in results:
        for item in result.boxes:
            class_id = int(item.cls[0])
            label = str(result.names[class_id])
            coords = box([float(v) for v in item.xyxy[0].tolist()], width, height)
            if coords[2] - coords[0] < 8 or coords[3] - coords[1] < 8:
                continue
            detected_kind = kind_from_detected_class(label)
            if detected_kind is None:
                continue
            candidate = {
                "id": f"p{page_no}-r{len(regions) + 1}",
                "kind": detected_kind,
                "role": "unassigned",
                "bbox": coords,
                "order": len(regions) + 1,
                "enabled": True,
                "confidence": round(float(item.conf[0]), 3),
                "detectedClass": label,
                "source": "doclayout-yolo",
            }
            regions.append(candidate)

    return normalize_regions(regions, page_no)

def main() -> int:
    parser = argparse.ArgumentParser(); parser.add_argument("pdf_path"); parser.add_argument("output_dir"); parser.add_argument("--dpi", type=int, default=120); parser.add_argument("--model", default=None)
    args = parser.parse_args(); pdf_path, output = Path(args.pdf_path).resolve(), Path(args.output_dir).resolve(); pages_dir = output / "pages"; status_path = output / "status.json"; pages_dir.mkdir(parents=True, exist_ok=True)
    status(status_path, status="processing", stage="opening", progress=0, error=None)
    if not pdf_path.exists(): status(status_path, status="error", stage="failed", error=f"Không tìm thấy PDF: {pdf_path}"); return 1
    ai = model_for(args.model)
    try:
        document = pymupdf.open(str(pdf_path)); total = len(document); pages = []
        status(status_path, status="processing", stage="rendering", progress=0, pages=total, modelLoaded=ai is not None)
        for index, page in enumerate(document):
            page_no = index + 1; target = pages_dir / f"page-{page_no:04d}.png"
            if not target.exists(): page.get_pixmap(dpi=args.dpi, alpha=False).save(str(target))
            with Image.open(target) as opened:
                image = opened.convert("RGB"); regions = detect(page, image, ai, page_no)
                pages.append({"page": page_no, "file": target.name, "width": image.width, "height": image.height, "regions": regions})
            status(status_path, status="processing", stage="detecting", progress=round(page_no / max(1, total) * 100), currentPage=page_no, pages=total, regions=sum(len(p["regions"]) for p in pages))
        document.close(); payload = {"version": 1, "kind": "pdf_layout_regions", "source": pdf_path.name, "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "pages": pages}; write_json(output / "regions.json", payload)
        status(status_path, status="done", stage="ready", progress=100, pages=total, regions=sum(len(p["regions"]) for p in pages), modelLoaded=ai is not None); return 0
    except Exception as exc:
        status(status_path, status="error", stage="failed", error=str(exc)); print(str(exc), file=sys.stderr); return 1

if __name__ == "__main__": raise SystemExit(main())
