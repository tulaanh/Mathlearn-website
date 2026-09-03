#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Retype PDF region crops through a local 9router OpenAI-compatible endpoint.

Protocol: read one JSON object from stdin and write one JSON object to stdout.
The legacy Google Antigravity SDK backend remains available when explicitly
selected with ANTIGRAVITY_BACKEND=sdk.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from io import BytesIO
from pathlib import Path
from PIL import Image as PILImage
from typing import Any



if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


def emit(value: dict[str, Any]) -> None:
    sys.stdout.write(json.dumps(value, ensure_ascii=False, separators=(",", ":")) + "\n")
    sys.stdout.flush()


def empty_result(error: str, status: str = "error") -> dict[str, Any]:
    return {"status": status, "rawText": "", "content": "", "contentType": "none", "confidence": 0.0,
            "needsReview": True, "warnings": [error], "error": error}


def make_crop(item: dict[str, Any]) -> bytes:
    page_path = Path(str(item.get("pagePath", ""))).resolve()
    bbox = item.get("bbox")
    if not page_path.is_file() or not isinstance(bbox, list) or len(bbox) != 4:
        raise ValueError("Không tìm thấy ảnh trang hoặc bbox vùng không hợp lệ.")
    with PILImage.open(page_path) as page_image:
        width, height = page_image.size
        x1, y1, x2, y2 = [int(round(float(value))) for value in bbox]
        if x2 <= x1 or y2 <= y1: raise ValueError("bbox vùng phải có kích thước dương.")
        pad_x, pad_y = max(2, round((x2 - x1) * 0.03)), max(2, round((y2 - y1) * 0.03))
        crop = page_image.crop((max(0, x1 - pad_x), max(0, y1 - pad_y), min(width, x2 + pad_x), min(height, y2 + pad_y))).convert("RGB")
        buffer = BytesIO(); crop.save(buffer, format="PNG")
        return buffer.getvalue()


def save_crop(item: dict[str, Any], crop_bytes: bytes) -> None:
    crop_path = item.get("cropPath")
    if isinstance(crop_path, str) and crop_path:
        crop_file = Path(crop_path).resolve()
        crop_file.parent.mkdir(parents=True, exist_ok=True)
        crop_file.write_bytes(crop_bytes)


def asset_result(item: dict[str, Any]) -> dict[str, Any]:
    crop_path = Path(str(item.get("cropPath", ""))).resolve()
    file_name = crop_path.name
    return {
        "fileName": file_name,
        # Tables are visual crops too; normalize legacy table regions to image assets.
        "kind": "image" if str(item.get("kind", "image")) == "table" else str(item.get("kind", "image")),
        "mimeType": "image/png",
        "page": item.get("page"),
        "bbox": item.get("bbox"),
    }


def is_visual_kind(item: dict[str, Any]) -> bool:
    return str(item.get("kind", "")) in {"image", "table"}


def router_timeout() -> float:
    try:
        return max(1.0, float(os.environ.get("NINE_ROUTER_TIMEOUT_SECONDS", "300")))
    except ValueError:
        return 300.0


def router_content(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        parts = [router_content(part) for part in value]
        return "".join(part for part in parts if part)
    if isinstance(value, dict):
        for key in ("content", "text", "reasoning_content", "refusal"):
            text = router_content(value.get(key))
            if text.strip():
                return text
    return ""


def run_9router(item: dict[str, Any], crop_bytes: bytes) -> dict[str, Any]:
    base_url = os.environ.get("NINE_ROUTER_BASE_URL", "http://localhost:20128/v1").rstrip("/")
    model = os.environ.get("NINE_ROUTER_MODEL", "ag/gemini-3.7-flash-high").strip()
    if not model:
        raise ValueError("NINE_ROUTER_MODEL không được để trống.")
    prompt = PROMPT + "\nLoại vùng: " + str(item.get("kind", "text"))
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": [
            {"type": "text", "text": prompt},
            {"type": "image_url", "image_url": {
                "url": "data:image/png;base64," + base64.b64encode(crop_bytes).decode("ascii")
            }},
        ]}],
        "temperature": 0,
        "response_format": {"type": "json_object"},
    }
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    api_key = os.environ.get("NINE_ROUTER_API_KEY", "").strip()
    if api_key:
        headers["Authorization"] = "Bearer " + api_key
    request = urllib.request.Request(
        base_url + "/chat/completions", data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers=headers, method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=router_timeout()) as response:
            response_body = response.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:1000]
        raise RuntimeError(f"9router HTTP {exc.code}: {detail}") from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Không kết nối được 9router tại {base_url}: {exc.reason}") from exc
    except TimeoutError as exc:
        raise RuntimeError(f"9router timeout sau {router_timeout():g} giây.") from exc
    try:
        envelope = json.loads(response_body)
    except json.JSONDecodeError as exc:
        raise RuntimeError("9router không trả về JSON hợp lệ.") from exc
    if not isinstance(envelope, dict):
        raise RuntimeError("9router trả về response không hợp lệ.")
    if envelope.get("error"):
        error = envelope["error"]
        detail = error.get("message", str(error)) if isinstance(error, dict) else str(error)
        raise RuntimeError("9router error: " + detail)
    choices = envelope.get("choices")
    if not isinstance(choices, list) or not choices or not isinstance(choices[0], dict):
        raise RuntimeError("9router không trả về choices.")
    message = choices[0].get("message")
    text = router_content(message) if isinstance(message, dict) else router_content(choices[0].get("text"))
    if not text:
        raise RuntimeError("9router trả về nội dung rỗng.")
    return result_from_agent(parse_json_object(text), str(item.get("kind", "text")))


def mock_result(item: dict[str, Any]) -> dict[str, Any]:
    kind = item.get("kind", "text")
    content = "[MOCK] Chưa kết nối AI — hãy cấu hình NINE_ROUTER_BASE_URL hoặc ANTIGRAVITY_BACKEND=sdk."
    return {"status": "review", "rawText": content, "content": content,
            "contentType": "latex" if kind == "formula" else "text", "confidence": 0.0,
            "needsReview": True, "warnings": ["Kết quả mock, không phải nhận diện AI."]}


def parse_json_object(text: str) -> dict[str, Any]:
    cleaned = text.strip()
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL | re.IGNORECASE)
    if fenced:
        cleaned = fenced.group(1)
    try:
        value = json.loads(cleaned)
    except json.JSONDecodeError:
        start, end = cleaned.find("{"), cleaned.rfind("}")
        if start < 0 or end <= start:
            raise ValueError("Agent không trả về JSON object hợp lệ.")
        value = json.loads(cleaned[start:end + 1])
    if not isinstance(value, dict):
        raise ValueError("Agent phải trả về một JSON object.")
    return value


def result_from_agent(value: dict[str, Any], kind: str) -> dict[str, Any]:
    raw = value.get("rawText", value.get("content", ""))
    content = value.get("content", "")
    raw = raw.strip() if isinstance(raw, str) else ""
    content = content.strip() if isinstance(content, str) else ""
    warnings = value.get("warnings", [])
    if not isinstance(warnings, list): warnings = [str(warnings)]
    warnings = [str(w) for w in warnings if str(w).strip()]
    confidence = value.get("confidence", 0.0)
    try: confidence = max(0.0, min(1.0, float(confidence)))
    except (TypeError, ValueError): confidence = 0.0
    content_type = value.get("contentType", "latex" if kind == "formula" else "text")
    if content_type not in {"text", "latex", "mixed", "none"}: content_type = "none"
    needs_review = bool(value.get("needsReview", False)) or confidence < 0.8 or not content
    if not content: warnings.append("Agent trả về nội dung rỗng.")
    return {"status": "review" if needs_review else "done", "rawText": raw, "content": content,
            "contentType": content_type, "confidence": confidence, "needsReview": needs_review,
            "warnings": list(dict.fromkeys(warnings))}


PROMPT = """Bạn là người chép lại chính xác một vùng PDF Toán bằng tiếng Việt.
Chỉ xử lý vùng ảnh được gửi, không suy đoán phần ngoài vùng.
- Giữ nguyên Unicode và dấu câu nhìn thấy.
- Với công thức, dùng KaTeX LaTeX trong dấu $...$ hoặc $$...$$.
- Với bảng, chuyển nội dung thành văn bản/Markdown dễ chỉnh sửa; không dùng lệnh LaTeX tabular.
- Không dùng \\(, \\[ hoặc các lệnh \\textbf, \\textit, \\vspace, \\par, tabular.
- Không thêm nhãn Câu/Bài nếu không nhìn thấy trong crop.
- Nếu không chắc một ký tự, giữ nguyên cách đọc gần nhất nhưng đặt needsReview=true.
Chỉ trả về JSON object, không markdown, theo schema:
{"rawText":"...","content":"...","contentType":"text|latex|mixed|none","confidence":0.0,"needsReview":false,"warnings":[]}
"""


async def run_agent(item: dict[str, Any]) -> dict[str, Any]:
    asset = None
    try:
        crop_bytes = make_crop(item)
        save_crop(item, crop_bytes)
        asset = asset_result(item) if is_visual_kind(item) else None
        # Hình, đồ thị và bảng đều được giữ nguyên dưới dạng asset, không ép model OCR.
        if is_visual_kind(item):
            return {"asset": asset}
        backend = os.environ.get("ANTIGRAVITY_BACKEND", "9router").strip().lower()
        if backend in {"9router", "9-router", "router"}:
            transcription = await asyncio.to_thread(run_9router, item, crop_bytes)
        elif backend == "sdk":
            try:
                from google.antigravity import Agent, LocalAgentConfig
                from google.antigravity.types import Image
            except Exception as exc:
                return {"asset": asset, "transcription": empty_result(f"Chưa cài Google Antigravity SDK: {exc}")}
            image = Image(data=crop_bytes, mime_type="image/png", description="PDF region crop")
            config = LocalAgentConfig(system_instructions=PROMPT)
            async with Agent(config) as agent:
                response = await agent.chat([PROMPT + "\nLoại vùng: " + str(item.get("kind", "text")), image])
                text = await response.text()
            transcription = result_from_agent(parse_json_object(text), str(item.get("kind", "text")))
        else:
            raise ValueError("ANTIGRAVITY_BACKEND phải là 9router hoặc sdk.")
        return {"asset": asset, "transcription": transcription}
    except Exception as exc:
        return {"asset": asset_result(item) if is_visual_kind(item) else None,
                "transcription": empty_result(f"Retype backend lỗi: {exc}")}


async def main() -> None:
    try:
        request = json.loads(sys.stdin.read())
        items = request.get("items", []) if isinstance(request, dict) else []
        if not isinstance(items, list): raise ValueError('Request phải có mảng "items".')
        results = []
        for item in items:
            if not isinstance(item, dict):
                results.append({"regionId": "", "transcription": empty_result("Item vùng không hợp lệ.")})
                continue
            if os.environ.get("ANTIGRAVITY_MOCK", "false").lower() == "true":
                try:
                    crop_bytes = make_crop(item)
                    save_crop(item, crop_bytes)
                    result = {"asset": asset_result(item)} if is_visual_kind(item) else {"transcription": mock_result(item)}
                except Exception as exc:
                    result = {"transcription": empty_result(f"Không tạo được crop: {exc}")}
            else:
                result = await run_agent(item)
            results.append({"regionId": str(item.get("regionId", "")), "page": item.get("page"), **result})
        emit({"ok": True, "results": results})
    except Exception as exc:
        emit({"ok": False, "error": str(exc), "results": []})
        raise SystemExit(1)


if __name__ == "__main__": asyncio.run(main())
