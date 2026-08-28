import type { DocumentFormBlock, QuestionType } from "@/lib/document-types";
import { topics } from "@/data/topics";
import type { EditorPreset } from "@/lib/document-templates";

/**
 * Định dạng JSON trao đổi tài liệu (nhập/xuất):
 *
 * {
 *   "version": 1,
 *   "title": "Tên tài liệu",
 *   "description": "Mô tả",
 *   "grade": "Lớp 8",
 *   "status": "draft" | "published",
 *   "documentType": "normal" | "test",
 *   "topicIds": ["ham-so-va-do-thi"],
 *   "blocks": [
 *     { "type": "text",   "content": "..." },
 *     { "type": "image",  "altText": "...", "caption": "...", "fileName": "a.png",
 *       "storagePath": "...", "dataUrl": "data:image/png;base64,..." },
 *     { "type": "lesson", "title": "...", "description": "...", "content": "..." },
 *     { "type": "quiz",   "title": "...", "description": "...",
 *       "questions": [
 *         { "type": "multiple_choice", "text": "...", "options": ["A","B","C","D"], "correctIndex": 0, "points": 1 },
 *         { "type": "true_false", "text": "...", "statements": [{ "text": "...", "correct": true }],
 *           "points": 1, "trueFalsePoints": [0, 0.1, 0.25, 0.5, 1] }
 *       ] }
 *   ]
 * }
 *
 * Ưu tiên nguồn ảnh khi nhập: dataUrl > storagePath > placeholder (đính file sau).
 */

export const DOCUMENT_JSON_VERSION = 1;

const DEFAULT_GRADE = "Lớp 8";
const OPTION_IDS = ["a", "b", "c", "d", "e", "f"];
const IMAGE_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Khi xuất: chỉ nhúng ảnh base64 nếu nhỏ hơn ngưỡng này để file JSON không quá nặng
const EMBED_DATA_URL_LIMIT = 512 * 1024;

type FormQuizQuestion = Extract<DocumentFormBlock, { type: "quiz" }>["questions"][number];

export type ParseResult =
  | { ok: true; data: EditorPreset }
  | { ok: false; error: string };

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Không đọc được file ảnh."));
    reader.readAsDataURL(file);
  });
}

async function dataUrlToFile(dataUrl: string, fileName: unknown): Promise<File> {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,/i.exec(dataUrl.trim());
  if (!match) throw new Error('"dataUrl" phải là ảnh base64 dạng JPEG, PNG hoặc WebP.');
  const mime = match[1].toLowerCase();
  let blob: Blob;
  try {
    const res = await fetch(dataUrl.trim());
    blob = await res.blob();
  } catch {
    throw new Error('Không thể đọc dữ liệu ảnh base64 trong "dataUrl".');
  }
  if (blob.size > MAX_IMAGE_BYTES) throw new Error("Ảnh base64 vượt quá giới hạn 5 MB.");
  const ext = IMAGE_EXT_BY_MIME[mime];
  const safeName = (asText(fileName).trim() || `anh-tai-lieu.${ext}`).replace(/[^a-zA-Z0-9._-]/g, "-");
  return new File([blob], safeName, { type: mime });
}

function convertQuestion(raw: unknown, context: string): FormQuizQuestion {
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`${context}: mỗi câu hỏi phải là một object.`);
  }
  const q = raw as Record<string, unknown>;
  const text = asText(q.text).trim();
  if (!text) throw new Error(`${context}: thiếu "text" (nội dung câu hỏi).`);

  const type = (asText(q.type).trim() || "multiple_choice") as QuestionType;
  if (!["multiple_choice", "true_false", "short_answer", "essay"].includes(type)) {
    throw new Error(`${context}: "type" câu hỏi không hợp lệ (phải là multiple_choice, true_false, short_answer hoặc essay).`);
  }

  const explanation = asText(q.explanation).trim();
  const pointsValue = typeof q.points === "number" && Number.isFinite(q.points) && q.points > 0 ? q.points : 1;
  const rawTrueFalsePoints = Array.isArray(q.trueFalsePoints)
    ? q.trueFalsePoints.filter((value): value is number => typeof value === "number" && Number.isFinite(value) && value >= 0)
    : undefined;

  const imageStoragePath = asText(q.imageStoragePath || q.storagePath).trim() || undefined;
  const imageCaption = asText(q.imageCaption).trim() || undefined;
  const imageUrl = asText(q.imageUrl).trim() || undefined;
  const explanationImageStoragePath = asText(q.explanationImageStoragePath || q.explanationStoragePath).trim() || undefined;
  const explanationImageCaption = asText(q.explanationImageCaption).trim() || undefined;
  const explanationImageUrl = asText(q.explanationImageUrl).trim() || undefined;

  const rawExplanationImages = Array.isArray(q.explanationImages) ? q.explanationImages : [];
  const explanationImages = rawExplanationImages.map((item) => {
    const it = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return {
      ...(asText(it.storagePath || it.explanationImageStoragePath).trim() ? { storagePath: asText(it.storagePath || it.explanationImageStoragePath).trim() } : {}),
      ...(asText(it.caption || it.explanationImageCaption).trim() ? { caption: asText(it.caption || it.explanationImageCaption).trim() } : {}),
      ...(asText(it.url || it.explanationImageUrl).trim() ? { url: asText(it.url || it.explanationImageUrl).trim() } : {}),
    };
  }).filter((it) => it.storagePath || it.url);

  const imageProps = {
    ...(imageStoragePath ? { imageStoragePath } : {}),
    ...(imageCaption ? { imageCaption } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(explanationImageStoragePath ? { explanationImageStoragePath } : {}),
    ...(explanationImageCaption ? { explanationImageCaption } : {}),
    ...(explanationImageUrl ? { explanationImageUrl } : {}),
    ...(explanationImages.length > 0 ? { explanationImages } : {}),
  };

  if (type === "multiple_choice") {
    const rawOptions = Array.isArray(q.options) ? q.options : [];
    const optionTexts = rawOptions
      .map((o) => (typeof o === "string" ? o.trim() : ""))
      .filter(Boolean);
    if (optionTexts.length < 2) {
      throw new Error(`${context}: "options" của câu hỏi trắc nghiệm cần ít nhất 2 đáp án không rỗng.`);
    }
    if (optionTexts.length > OPTION_IDS.length) optionTexts.length = OPTION_IDS.length;

    const correctRaw = q.correctIndex;
    const correctIndex =
      typeof correctRaw === "number" && Number.isInteger(correctRaw) &&
      correctRaw >= 0 && correctRaw < optionTexts.length
        ? correctRaw
        : 0;

    return {
      id: `q-${Math.random().toString(36).slice(2, 10)}`,
      type,
      text,
      options: optionTexts.map((optionText, i) => ({ id: OPTION_IDS[i], text: optionText })),
      correctOptionId: OPTION_IDS[correctIndex],
      points: pointsValue,
      ...(explanation ? { explanation } : {}),
      ...imageProps,
    };
  }

  if (type === "true_false") {
    const rawStatements = Array.isArray(q.statements) ? q.statements : Array.isArray(q.options) ? q.options : [];
    const statements = rawStatements.map((rawStatement, idx) => {
      const statement = typeof rawStatement === "object" && rawStatement !== null ? rawStatement as Record<string, unknown> : {};
      return {
        id: asText(statement.id).trim() || `s-${idx + 1}`,
        text: asText(statement.text).trim(),
        correctVal: statement.correct === false || statement.correctVal === "false" ? "false" as const : "true" as const,
      };
    }).filter((statement) => statement.text);
    if (!statements.length) throw new Error(`${context}: "statements" cần ít nhất 1 mệnh đề không rỗng.`);
    return {
      id: `q-${Math.random().toString(36).slice(2, 10)}`,
      type,
      text,
      statements,
      points: pointsValue,
      ...(rawTrueFalsePoints ? { trueFalsePoints: rawTrueFalsePoints } : {}),
      ...(explanation ? { explanation } : {}),
      ...imageProps,
    };
  }

  if (type === "short_answer") {
    const correctAnswer = asText(q.correctAnswer || q.correct_answer).trim();
    return {
      id: `q-${Math.random().toString(36).slice(2, 10)}`,
      type,
      text,
      correctAnswer,
      points: pointsValue,
      ...(explanation ? { explanation } : {}),
      ...imageProps,
    };
  }

  // essay
  return {
    id: `q-${Math.random().toString(36).slice(2, 10)}`,
    type,
    text,
    points: 0,
    ...(explanation ? { explanation } : {}),
    ...imageProps,
  };
}

async function convertBlock(raw: unknown, index: number): Promise<DocumentFormBlock | null> {
  const label = `Khối #${index + 1}`;
  if (typeof raw !== "object" || raw === null) {
    throw new Error(`${label}: phải là một object.`);
  }
  const b = raw as Record<string, unknown>;

  if (b.type === "text") {
    const content = asText(b.content);
    if (!content.trim()) throw new Error(`${label} (text): thiếu "content".`);
    return { type: "text", content };
  }

  if (b.type === "image") {
    const altText = asText(b.altText).trim() || "Hình ảnh tài liệu Toán";
    const caption = asText(b.caption).trim();
    const dataUrl = asText(b.dataUrl).trim();
    const storagePath = asText(b.storagePath).trim();
    if (dataUrl) {
      const file = await dataUrlToFile(dataUrl, b.fileName);
      return { type: "image", file, altText, caption };
    }
    if (storagePath) {
      // Dùng lại ảnh đã có trên Storage, không cần tải lên lại
      return { type: "image", file: null, altText, caption, storagePath };
    }
    // Placeholder: giáo viên tự chọn file trước khi lưu (bước Lưu đã kiểm tra)
    return { type: "image", file: null, altText, caption };
  }

  if (b.type === "lesson") {
    const title = asText(b.title).trim();
    const content = asText(b.content).trim();
    if (!title || !content) throw new Error(`${label} (lesson): cần "title" và "content" khác rỗng.`);
    const description = asText(b.description).trim();
    return { type: "lesson", title, description: description || undefined, content };
  }

  if (b.type === "quiz") {
    const title = asText(b.title).trim();
    if (!title) throw new Error(`${label} (quiz): thiếu "title".`);
    const rawQuestions = Array.isArray(b.questions) ? b.questions : [];
    if (!rawQuestions.length) throw new Error(`${label} (quiz): "questions" cần ít nhất 1 câu hỏi.`);
    const questions = rawQuestions.map((rq, qi) => convertQuestion(rq, `${label} (quiz) câu #${qi + 1}`));
    const description = asText(b.description).trim();
    return { type: "quiz", title, description: description || undefined, questions };
  }

  throw new Error(`${label}: "type" phải là "text", "image", "lesson" hoặc "quiz".`);
}

/** Phân tích chuỗi JSON thành dữ liệu nạp vào trình soạn thảo. Báo lỗi rõ ràng theo từng khối. */
export async function parseDocumentJson(raw: string): Promise<ParseResult> {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `JSON không hợp lệ: ${(e as Error).message}` };
  }
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { ok: false, error: "Nội dung phải là một object JSON bắt đầu bằng { và kết thúc bằng }." };
  }
  const root = json as Record<string, unknown>;
  const errors: string[] = [];

  const title = asText(root.title).trim();
  if (!title) errors.push('Thiếu trường "title" (tên tài liệu).');
  else if (title.length > 200) errors.push('"title" không được quá 200 ký tự.');

  const description = asText(root.description);
  const grade = asText(root.grade).trim() || DEFAULT_GRADE;
  const status = root.status === "published" ? ("published" as const) : ("draft" as const);
  const documentType = root.documentType === "test" ? ("test" as const) : ("normal" as const);

  const knownTopicIds = new Set(topics.map((t) => t.id));
  const selectedTopics = Array.isArray(root.topicIds)
    ? root.topicIds.filter((id): id is string => typeof id === "string" && knownTopicIds.has(id))
    : [];

  const rawBlocks = Array.isArray(root.blocks) ? root.blocks : [];
  const blocks: DocumentFormBlock[] = [];
  for (const [i, rb] of rawBlocks.entries()) {
    try {
      const converted = await convertBlock(rb, i);
      if (converted) blocks.push(converted);
    } catch (err) {
      errors.push((err as Error).message);
    }
  }

  if (errors.length) return { ok: false, error: `Chưa nạp được tài liệu:\n${errors.join("\n")}` };
  if (!blocks.length) {
    return { ok: false, error: '"blocks" cần ít nhất một khối nội dung hợp lệ.' };
  }
  return { ok: true, data: { title, description, grade, status, documentType, selectedTopics, blocks } };
}

/** Xuất trạng thái hiện tại của trình soạn thảo ra chuỗi JSON (định dạng đẹp, dễ đọc). */
export async function serializeDocumentJson(preset: EditorPreset): Promise<string> {
  const blocks: Record<string, unknown>[] = [];

  for (const b of preset.blocks) {
    if (b.type === "text") {
      if (b.content.trim()) blocks.push({ type: "text", content: b.content });
      continue;
    }
    if (b.type === "image") {
      const entry: Record<string, unknown> = {
        type: "image",
        altText: b.altText,
        ...(b.caption.trim() ? { caption: b.caption.trim() } : {}),
      };
      if (b.file) {
        entry.fileName = b.file.name;
        if (b.file.size <= EMBED_DATA_URL_LIMIT) {
          try {
            entry.dataUrl = await readFileAsDataUrl(b.file);
          } catch {
            // Không nhúng được base64 thì bỏ qua, vẫn giữ fileName để đính lại sau
          }
        }
      }
      if (b.storagePath) entry.storagePath = b.storagePath;
      blocks.push(entry);
      continue;
    }
    if (b.type === "lesson") {
      if (b.title.trim() && b.content.trim()) {
        blocks.push({
          type: "lesson",
          title: b.title.trim(),
          ...(b.description?.trim() ? { description: b.description.trim() } : {}),
          content: b.content.trim(),
        });
      }
      continue;
    }
    if (b.type === "quiz") {
      const questions = b.questions
        .filter((q) => q.text.trim())
        .map((q) => {
          const qType = q.type || "multiple_choice";
          const imageFields = {
            ...(q.imageStoragePath ? { imageStoragePath: q.imageStoragePath } : {}),
            ...(q.imageCaption?.trim() ? { imageCaption: q.imageCaption.trim() } : {}),
            ...(q.imageUrl ? { imageUrl: q.imageUrl } : {}),
            ...(q.explanationImageStoragePath ? { explanationImageStoragePath: q.explanationImageStoragePath } : {}),
            ...(q.explanationImageCaption?.trim() ? { explanationImageCaption: q.explanationImageCaption.trim() } : {}),
            ...(q.explanationImageUrl ? { explanationImageUrl: q.explanationImageUrl } : {}),
            ...(q.explanationImages && q.explanationImages.length > 0
              ? {
                  explanationImages: q.explanationImages.map((img) => ({
                    ...(img.storagePath ? { storagePath: img.storagePath } : {}),
                    ...(img.caption?.trim() ? { caption: img.caption.trim() } : {}),
                    ...(img.url ? { url: img.url } : {}),
                  })),
                }
              : {}),
          };

          if (qType === "multiple_choice") {
            const options = (q.options || []).map((o) => o.text.trim()).filter(Boolean);
            const correctIndex = Math.max(0, (q.options || []).findIndex((o) => o.id === q.correctOptionId));
            return {
              type: "multiple_choice",
              text: q.text.trim(),
              options,
              correctIndex: Math.min(correctIndex, Math.max(0, options.length - 1)),
              points: q.points ?? 1,
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
              ...imageFields,
            };
          }
          if (qType === "true_false") {
            const source = q.statements ?? q.options ?? [];
            const statements = source.map((s) => ({ text: s.text.trim(), correct: s.correctVal !== "false" })).filter((s) => s.text);
            return {
              type: "true_false",
              text: q.text.trim(),
              statements,
              points: q.points ?? 1,
              ...(q.trueFalsePoints ? { trueFalsePoints: q.trueFalsePoints } : {}),
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
              ...imageFields,
            };
          }
          if (qType === "short_answer") {
            return {
              type: "short_answer",
              text: q.text.trim(),
              correctAnswer: (q.correctAnswer || "").trim(),
              points: q.points ?? 1,
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
              ...imageFields,
            };
          }
          // essay
          return {
            type: "essay",
            text: q.text.trim(),
            points: 0,
            ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
            ...imageFields,
          };
        })
        .filter((q) => {
          if (q.type === "multiple_choice") {
            return ((q as any).options as string[]).length >= 2;
          }
          return true;
        });
      if (b.title.trim() && questions.length) {
        blocks.push({
          type: "quiz",
          title: b.title.trim(),
          ...(b.description?.trim() ? { description: b.description.trim() } : {}),
          questions,
        });
      }
    }
  }

  return JSON.stringify(
    {
      version: DOCUMENT_JSON_VERSION,
      title: preset.title.trim(),
      description: preset.description.trim(),
      grade: preset.grade,
      status: preset.status,
      documentType: preset.documentType,
      topicIds: preset.selectedTopics,
      blocks,
    },
    null,
    2,
  );
}

/** Ví dụ mẫu để người dùng tham khảo cấu trúc nhanh trong giao diện nhập JSON. */
export const SAMPLE_DOCUMENT_JSON = JSON.stringify(
  {
    version: DOCUMENT_JSON_VERSION,
    title: "Ví dụ: Giải phương trình bậc nhất",
    description: "Tài liệu mẫu tạo bởi tính năng nhập JSON.",
    grade: "Lớp 8",
    status: "draft",
    documentType: "normal",
    topicIds: ["ham-so-va-do-thi"],
    blocks: [
      { type: "text", content: "Nhắc lại: phương trình bậc nhất một ẩn có dạng $ax + b = 0$ với $a \\neq 0$." },
      {
        type: "lesson",
        title: "Cách giải",
        description: "Các bước giải phương trình bậc nhất.",
        content: "Bước 1: Chuyển vế.\nBước 2: Chia hai vế cho $a$.\nKết luận: $x = -\\frac{b}{a}$.",
      },
      {
        type: "quiz",
        title: "Luyện tập",
        description: "Luyện tập các loại câu hỏi khác nhau.",
        questions: [
          {
            type: "multiple_choice",
            text: "Nghiệm của phương trình $2x - 6 = 0$ là:",
            options: ["x = 3", "x = -3", "x = 6", "x = 2"],
            correctIndex: 0,
            explanation: "Chuyển vế: $2x = 6 \\Rightarrow x = 3$.",
          },
          {
            type: "true_false",
            text: "Xét các phát biểu về phương trình $0x = 0$.",
            statements: [
              { text: "Phương trình có vô số nghiệm.", correct: true },
              { text: "Phương trình vô nghiệm.", correct: false },
            ],
            explanation: "Với mọi giá trị của $x$, vế trái luôn bằng 0, bằng vế phải.",
          },
          {
            type: "short_answer",
            text: "Tìm giá trị của $x$ biết $5x - 10 = 0$.",
            correctAnswer: "2",
            explanation: "$5x = 10 \\Rightarrow x = 2$.",
          },
        ],
      },
    ],
  },
  null,
  2,
);




