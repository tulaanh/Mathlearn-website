/**
 * Tiện ích hỗ trợ tải ảnh lên Supabase Storage an toàn và chính xác.
 */

const ACCEPTED_IMAGE_EXTS = ["jpg", "jpeg", "png", "webp", "gif", "svg"];

const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
};

/** Lấy Content-Type chuẩn xác cho file ảnh (tránh lỗi file.type rỗng trên Windows/trình duyệt). */
export function getSafeImageContentType(file: File): string {
  if (file.type && file.type.startsWith("image/")) {
    return file.type.toLowerCase();
  }
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return MIME_BY_EXT[ext] || "image/png";
}

/** Kiểm tra xem file có phải là định dạng hình ảnh được chấp nhận hay không. */
export function isImageFile(file: File): boolean {
  if (file.type && file.type.startsWith("image/")) {
    return true;
  }
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return ACCEPTED_IMAGE_EXTS.includes(ext);
}

/**
 * Kiểm tra tính hợp lệ của file ảnh trước khi upload.
 * Trả về null nếu hợp lệ, hoặc chuỗi lỗi nếu không hợp lệ.
 */
export function validateImageFile(file: File, maxMb = 10): string | null {
  if (!isImageFile(file)) {
    return `File "${file.name}" không phải là định dạng ảnh hợp lệ (chấp nhận: JPG, PNG, WebP, GIF, SVG).`;
  }
  const maxBytes = maxMb * 1024 * 1024;
  if (file.size > maxBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return `Ảnh "${file.name}" có dung lượng ${sizeMb} MB vượt quá giới hạn cho phép (${maxMb} MB).`;
  }
  return null;
}
