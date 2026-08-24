import type { EditorPreset } from "./document-templates";

/**
 * Ghép các file ảnh do người dùng cung cấp (thường cùng thư mục với file .tex)
 * vào các khối ảnh / câu hỏi được parseLatexToPreset đánh dấu bằng "sourceName".
 * Ảnh được gắn trực tiếp vào preset; việc tải lên Storage diễn ra khi lưu tài liệu.
 */

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MIME_BY_EXT: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** File có phải ảnh hợp lệ để đính kèm (JPG/PNG/WebP) — khớp validation của trình soạn thảo. */
export function isAcceptedImageFile(file: File): boolean {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return true;
  // Một số trình duyệt trả type rỗng: đoán qua phần mở rộng của tên file
  if (file.type) return false;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  return ext in MIME_BY_EXT;
}

/** Gán lại MIME đúng cho file có type rỗng (kéo thả, máy thiếu đăng ký MIME) để không bị chặn khi lưu. */
function normalizeImageFile(file: File): File {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return file;
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const mime = MIME_BY_EXT[ext];
  return mime ? new File([file], file.name, { type: mime }) : file;
}

/** Chuẩn hoá tên file để so khớp: bỏ đường dẫn, NFC, thường hoa, jpg ≡ jpeg. */
export function normalizeImageName(name: string): string {
  const base = name.split(/[\\/]/).pop()?.trim() ?? "";
  const norm = base.normalize("NFC").toLowerCase();
  return norm.endsWith(".jpeg") ? norm.slice(0, -5) + ".jpg" : norm;
}

export type ImageMatchResult = {
  /** Số chỗ (khối ảnh + câu hỏi) đã gắn được file. */
  matched: number;
  /** Tổng số chỗ cần ảnh. */
  total: number;
  /** Tên các file được tham chiếu trong .tex nhưng không tìm thấy. */
  missing: string[];
};

function buildFileMap(files: File[]): Map<string, File> {
  const map = new Map<string, File>();
  for (const raw of files) {
    const file = normalizeImageFile(raw);
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) continue;
    const key = normalizeImageName(file.name);
    if (!map.has(key)) map.set(key, file);
  }
  return map;
}

/** Gắn file ảnh vào preset tại chỗ (mutate preset). Trả về báo cáo so khớp. */
export function matchImagesToPreset(preset: EditorPreset, files: File[]): ImageMatchResult {
  const fileMap = buildFileMap(files);
  const missing = new Set<string>();
  let matched = 0;
  let total = 0;

  const tryAttach = (sourceName: string | undefined, alreadyHas: boolean, attach: (file: File) => void): void => {
    if (!sourceName || alreadyHas) return;
    total++;
    const file = fileMap.get(normalizeImageName(sourceName));
    if (file) {
      attach(file);
      matched++;
    } else {
      missing.add(sourceName);
    }
  };

  for (const block of preset.blocks) {
    if (block.type === "image") {
      tryAttach(block.sourceName, Boolean(block.file || block.storagePath), (file) => {
        block.file = file;
      });
    } else if (block.type === "quiz") {
      for (const question of block.questions) {
        tryAttach(question.imageSourceName, Boolean(question.imageFile || question.imageStoragePath), (file) => {
          question.imageFile = file;
        });
        tryAttach(question.explanationImageSourceName, Boolean(question.explanationImageFile || question.explanationImageStoragePath), (file) => {
          question.explanationImageFile = file;
        });
        if (question.explanationImages && question.explanationImages.length > 0) {
          for (const item of question.explanationImages) {
            tryAttach(item.sourceName, Boolean(item.file || item.storagePath), (file) => {
              item.file = file;
            });
          }
        }
      }
    }
  }

  return { matched, total, missing: [...missing] };
}
