import type { QuestionType } from "@/lib/document-types";
import type { BankQuestion, QuestionDifficulty } from "@/lib/question-bank-types";
import { isQuestionDifficulty } from "@/lib/question-bank-types";
import { topics } from "@/data/topics";

/**
 * Định dạng JSON trao đổi ngân hàng câu hỏi:
 *
 * {
 *   "version": 1,
 *   "kind": "question_bank",
 *   "questions": [
 *     {
 *       "text": "...",
 *       "type": "multiple_choice" | "true_false" | "short_answer" | "essay",
 *       "difficulty": "nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao",
 *       "grade": "Lớp 8",
 *       "topicIds": ["ham-so-va-do-thi"],
 *       "options": ["A","B","C","D"],        // trắc nghiệm
 *       "correctIndex": 0,
 *       "statements": [{ "text": "...", "correct": true }],  // đúng/sai
 *       "correctAnswer": "...",               // trả lời ngắn
 *       "points": 1,
 *       "explanation": "..."
 *     }
 *   ]
 * }
 */

export const QUESTION_BANK_JSON_VERSION = 1;
const OPTION_IDS = ["a", "b", "c", "d", "e", "f"];
const KNOWN_TOPIC_IDS = new Set(topics.map((t) => t.id));

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function countUnescapedDollars(value: string): number {
  let count = 0;
  let backslashes = 0;
  for (const char of value) {
    if (char === "\\") {
      backslashes += 1;
      continue;
    }
    if (char === "$" && backslashes % 2 === 0) count += 1;
    backslashes = 0;
  }
  return count;
}

function validateMathText(value: string, label: string): void {
  if (!value.includes("$") || countUnescapedDollars(value) % 2 === 0) return;
  throw new Error(`${label} chứa công thức LaTeX chưa đóng dấu $...$.`);
}

/** Xuất danh sách câu hỏi ngân hàng ra chuỗi JSON. */
export function serializeBankJson(questions: BankQuestion[]): string {
  return JSON.stringify(
    {
      version: QUESTION_BANK_JSON_VERSION,
      kind: "question_bank",
      exportedAt: new Date().toISOString(),
      questions: questions.map((q) => {
        const qType = q.type || "multiple_choice";
        const base: Record<string, unknown> = {
          text: q.text.trim(),
          type: qType,
          difficulty: q.difficulty,
          grade: q.grade,
          topicIds: q.topicIds,
        };
        if (qType === "multiple_choice") {
          const options = (q.options ?? []).map((o) => o.text.trim()).filter(Boolean);
          base.options = options;
          const idx = Math.max(0, (q.options ?? []).findIndex((o) => o.id === q.correctOptionId));
          base.correctIndex = Math.min(idx, Math.max(0, options.length - 1));
        }
        if (qType === "true_false") {
          base.statements = (q.statements ?? [])
            .filter((s) => s.text.trim())
            .map((s) => ({ text: s.text.trim(), correct: s.correctVal !== "false" }));
        }
        if (qType === "short_answer") {
          base.correctAnswer = (q.correctAnswer ?? "").trim();
        }
        if (qType !== "essay") base.points = q.points ?? 1;
        if (q.explanation?.trim()) base.explanation = q.explanation.trim();
        if (q.imageStoragePath) base.imageStoragePath = q.imageStoragePath;
        if (q.imageCaption?.trim()) base.imageCaption = q.imageCaption.trim();
        if (q.imageUrl) base.imageUrl = q.imageUrl;
        if (q.explanationImageStoragePath) base.explanationImageStoragePath = q.explanationImageStoragePath;
        if (q.explanationImageCaption?.trim()) base.explanationImageCaption = q.explanationImageCaption.trim();
        if (q.explanationImageUrl) base.explanationImageUrl = q.explanationImageUrl;
        if (Array.isArray(q.explanationImages) && q.explanationImages.length > 0) {
          base.explanationImages = q.explanationImages.map((img) => ({
            ...(img.storagePath ? { storagePath: img.storagePath } : {}),
            ...(img.caption?.trim() ? { caption: img.caption.trim() } : {}),
            ...(img.url ? { url: img.url } : {}),
          }));
        }
        return base;
      }),
    },
    null,
    2,
  );
}

export type BankImportResult =
  | {
      ok: true;
      questions: BankQuestion[]; // câu hỏi hợp lệ, chưa có id
      skipped: number;
      errors: string[];
    }
  | { ok: false; error: string };

/** Phân tích chuỗi JSON ngân hàng; bỏ qua câu lỗi và báo rõ từng lỗi. */
export function parseBankJson(raw: string): BankImportResult {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: `JSON không hợp lệ: ${(e as Error).message}` };
  }

  // Chấp nhận cả mảng thuần [ ... ] để tiện nhập nhanh.
  const rawQuestions = Array.isArray(json)
    ? json
    : typeof json === "object" && json !== null && Array.isArray((json as Record<string, unknown>).questions)
      ? (json as Record<string, unknown>).questions as unknown[]
      : null;

  if (!rawQuestions) {
    return { ok: false, error: 'Nội dung phải là mảng câu hỏi hoặc object có trường "questions".' };
  }

  const questions: BankQuestion[] = [];
  const errors: string[] = [];

  rawQuestions.forEach((item, i) => {
    const context = `Câu #${i + 1}`;
    try {
      questions.push(convertBankQuestion(item, context));
    } catch (err) {
      errors.push(`${context}: ${(err as Error).message}`);
    }
  });

  return {
    ok: true,
    questions,
    skipped: errors.length,
    errors,
  };
}

function convertBankQuestion(rawItem: unknown, context: string): BankQuestion {
  if (typeof rawItem !== "object" || rawItem === null) throw new Error("phải là một object.");
  const q = rawItem as Record<string, unknown>;

  const text = asText(q.text).trim();
  if (!text) throw new Error('thiếu "text".');
  validateMathText(text, `${context} — đề bài`);

  const type = (asText(q.type).trim() || "multiple_choice") as QuestionType;
  if (!["multiple_choice", "true_false", "short_answer", "essay"].includes(type)) {
    throw new Error('"type" phải là multiple_choice, true_false, short_answer hoặc essay.');
  }

  const difficultyRaw = q.difficulty ?? q.muc_do ?? q.level;
  const difficulty: QuestionDifficulty = isQuestionDifficulty(difficultyRaw)
    ? difficultyRaw
    : typeof difficultyRaw === "string"
      ? mapVietnameseDifficulty(difficultyRaw)
      : "nhan_biet";

  const grade = asText(q.grade).trim() || "Lớp 8";
  const topicIds = Array.isArray(q.topicIds)
    ? (q.topicIds as unknown[]).filter((id): id is string => typeof id === "string" && KNOWN_TOPIC_IDS.has(id))
    : [];

  const points =
    typeof q.points === "number" && Number.isFinite(q.points) && q.points > 0 ? q.points : 1;
  const explanation = asText(q.explanation).trim() || undefined;
  if (explanation) validateMathText(explanation, `${context} — lời giải`);

  const imageStoragePath = asText(q.imageStoragePath || q.storagePath).trim() || undefined;
  const imageSourceName = asText(q.imageSourceName || q.imageFileName || q.fileName || q.image).trim() || undefined;
  const imageCaption = asText(q.imageCaption).trim() || undefined;
  const imageUrl = asText(q.imageUrl).trim() || undefined;
  const explanationImageStoragePath = asText(q.explanationImageStoragePath || q.explanationStoragePath).trim() || undefined;
  const explanationImageSourceName = asText(q.explanationImageSourceName || q.explanationImageFileName || q.explanationFileName || q.explanationImage).trim() || undefined;
  const explanationImageCaption = asText(q.explanationImageCaption).trim() || undefined;
  const explanationImageUrl = asText(q.explanationImageUrl).trim() || undefined;

  const rawExplanationImages = Array.isArray(q.explanationImages) ? q.explanationImages : [];
  const explanationImages = rawExplanationImages.map((item) => {
    if (typeof item === "string" && item.trim()) {
      return { sourceName: item.trim() };
    }
    const it = typeof item === "object" && item !== null ? (item as Record<string, unknown>) : {};
    return {
      ...(asText(it.sourceName || it.fileName || it.imageFileName).trim() ? { sourceName: asText(it.sourceName || it.fileName || it.imageFileName).trim() } : {}),
      ...(asText(it.storagePath || it.explanationImageStoragePath).trim() ? { storagePath: asText(it.storagePath || it.explanationImageStoragePath).trim() } : {}),
      ...(asText(it.caption || it.explanationImageCaption).trim() ? { caption: asText(it.caption || it.explanationImageCaption).trim() } : {}),
      ...(asText(it.url || it.explanationImageUrl).trim() ? { url: asText(it.url || it.explanationImageUrl).trim() } : {}),
    };
  }).filter((it) => it.sourceName || it.storagePath || it.url);

  const imageProps = {
    ...(imageStoragePath ? { imageStoragePath } : {}),
    ...(imageSourceName ? { imageSourceName } : {}),
    ...(imageCaption ? { imageCaption } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(explanationImageStoragePath ? { explanationImageStoragePath } : {}),
    ...(explanationImageSourceName ? { explanationImageSourceName } : {}),
    ...(explanationImageCaption ? { explanationImageCaption } : {}),
    ...(explanationImageUrl ? { explanationImageUrl } : {}),
    ...(explanationImages.length > 0 ? { explanationImages } : {}),
  };

  if (type === "multiple_choice") {
    const optionTexts = (Array.isArray(q.options) ? q.options : [])
      .map((o) => (typeof o === "string" ? o.trim() : ""))
      .filter(Boolean);
    if (optionTexts.length < 2) throw new Error('trắc nghiệm cần ít nhất 2 đáp án trong "options".');
    if (optionTexts.length > OPTION_IDS.length) optionTexts.length = OPTION_IDS.length;
    optionTexts.forEach((optionText, index) => validateMathText(optionText, `${context} — phương án ${index + 1}`));
    const correctIndex =
      typeof q.correctIndex === "number" && Number.isInteger(q.correctIndex) &&
      q.correctIndex >= 0 && q.correctIndex < optionTexts.length
        ? q.correctIndex
        : 0;
    return {
      id: "",
      text,
      type,
      difficulty,
      grade,
      topicIds,
      points,
      ...(explanation ? { explanation } : {}),
      options: optionTexts.map((optionText, i) => ({ id: OPTION_IDS[i], text: optionText })),
      correctOptionId: OPTION_IDS[correctIndex],
      ...imageProps,
    };
  }

  if (type === "true_false") {
    const statements = (Array.isArray(q.statements) ? q.statements : []).map((rawStatement, idx) => {
      const s = typeof rawStatement === "object" && rawStatement !== null ? rawStatement as Record<string, unknown> : {};
      return {
        id: asText(s.id).trim() || `s-${idx + 1}`,
        text: asText(s.text).trim(),
        correctVal: s.correct === false || s.correctVal === "false" ? ("false" as const) : ("true" as const),
      };
    }).filter((s) => s.text);
    if (!statements.length) throw new Error('"true_false" cần ít nhất một mệnh đề không rỗng.');
    statements.forEach((statement, index) => validateMathText(statement.text, `${context} — mệnh đề ${index + 1}`));
    const trueFalsePoints = Array.isArray(q.trueFalsePoints)
      ? q.trueFalsePoints.filter((v): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0)
      : undefined;
    return {
      id: "",
      text,
      type,
      difficulty,
      grade,
      topicIds,
      points,
      statements,
      ...(trueFalsePoints?.length ? { trueFalsePoints } : {}),
      ...(explanation ? { explanation } : {}),
      ...imageProps,
    };
  }

  if (type === "short_answer") {
    const correctAnswer = asText(q.correctAnswer ?? q.correct_answer).trim();
    if (correctAnswer) validateMathText(correctAnswer, `${context} — đáp án ngắn`);
    return {
      id: "",
      text,
      type,
      difficulty,
      grade,
      topicIds,
      points,
      correctAnswer,
      ...(explanation ? { explanation } : {}),
      ...imageProps,
    };
  }

  return {
    id: "",
    text,
    type,
    difficulty,
    grade,
    topicIds,
    points: 0,
    ...(explanation ? { explanation } : {}),
    ...imageProps,
  };
}

/** Hỗ trợ nhập bằng tên tiếng Việt: "nhận biết" / "NB" / "vận dụng cao" / "VDC"... */
function mapVietnameseDifficulty(value: string): QuestionDifficulty {
  const normalized = value.trim().toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/nhan/.test(normalized)) return "nhan_biet";
  if (/hieu/.test(normalized)) return "thong_hieu";
  if (/cao|vdc/.test(normalized)) return "van_dung_cao";
  if (/vd|van/.test(normalized)) return "van_dung";
  return "nhan_biet";
}
