export function getDocumentImageUrl(storagePath?: string | null): string {
  if (!storagePath || typeof storagePath !== "string") return "";
  const trimmed = storagePath.trim();
  if (!trimmed) return "";

  // Nếu đã là URL tuyệt đối hoặc base64 data URI thì trả về trực tiếp
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return "";

  // Bỏ prefix bucket nếu người dùng hoặc công cụ import lỡ gắn 'document-images/'
  const cleanPath = trimmed.replace(/^document-images\//, "");
  const encodedPath = cleanPath.split("/").map(encodeURIComponent).join("/");
  return `${baseUrl}/storage/v1/object/public/document-images/${encodedPath}`;
}
