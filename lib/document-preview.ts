import type { DocumentFormBlock } from "@/lib/document-types";
import { getDocumentImageUrl } from "@/lib/document-url";

/**
 * Cache URL tạo từ File bằng WeakMap: mỗi File chỉ tạo một object URL duy nhất,
 * giúp preview cập nhật trực tiếp theo form mà không tạo URL mới liên tục
 * (browser tự giải phóng khi File bị thu gom hoặc trang đóng).
 */
const localObjectUrlCache = new WeakMap<File, string>();

export function getLocalImageUrl(file: File): string {
  let url = localObjectUrlCache.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    localObjectUrlCache.set(file, url);
  }
  return url;
}

/**
 * Xác định nguồn ảnh hiển thị cho khối ảnh ở chế độ xem trước:
 * 1. Ảnh mới chọn trong máy (chưa upload) → object URL cục bộ.
 * 2. Ảnh đã có trên Supabase Storage → đường dẫn công khai.
 * 3. Chưa có ảnh → null (hiển thị ô placeholder).
 */
export function resolvePreviewImageSrc(block: Extract<DocumentFormBlock, { type: "image" }>): string | null {
  if (block.file) return getLocalImageUrl(block.file);
  if (block.storagePath) {
    const url = getDocumentImageUrl(block.storagePath);
    return url || null;
  }
  return null;
}

export function resolveQuestionImageSrc(q: { imageFile?: File | null; imageStoragePath?: string; imageUrl?: string }): string | null {
  if (q.imageFile) return getLocalImageUrl(q.imageFile);
  if (q.imageStoragePath) {
    const url = getDocumentImageUrl(q.imageStoragePath);
    return url || null;
  }
  if (q.imageUrl) return q.imageUrl;
  return null;
}

export function resolveExplanationImageSrc(q: { explanationImageFile?: File | null; explanationImageStoragePath?: string; explanationImageUrl?: string }): string | null {
  if (q.explanationImageFile) return getLocalImageUrl(q.explanationImageFile);
  if (q.explanationImageStoragePath) {
    const url = getDocumentImageUrl(q.explanationImageStoragePath);
    return url || null;
  }
  if (q.explanationImageUrl) return q.explanationImageUrl;
  return null;
}

export function resolveAllExplanationImages(q: {
  explanationImageFile?: File | null;
  explanationImageStoragePath?: string;
  explanationImageUrl?: string;
  explanationImageCaption?: string;
  explanationImages?: Array<{ storagePath?: string; caption?: string; url?: string; file?: File | null }>;
}): Array<{ src: string; caption?: string }> {
  const results: Array<{ src: string; caption?: string }> = [];

  if (Array.isArray(q.explanationImages) && q.explanationImages.length > 0) {
    for (const item of q.explanationImages) {
      let src: string | null = null;
      if (item.file) src = getLocalImageUrl(item.file);
      else if (item.storagePath) src = getDocumentImageUrl(item.storagePath) || null;
      else if (item.url) src = item.url;
      if (src) results.push({ src, caption: item.caption });
    }
  }

  // Fallback: nếu không có mảng hoặc mảng rỗng nhưng có trường ảnh đơn
  if (results.length === 0) {
    const single = resolveExplanationImageSrc(q);
    if (single) results.push({ src: single, caption: q.explanationImageCaption });
  }

  return results;
}


