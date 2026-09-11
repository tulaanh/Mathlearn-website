/**
 * ============================================================
 *  GAME TREO CỔ TRUNG THU — Logic chạy phía server
 * ------------------------------------------------------------
 *  Dùng bởi các API route: chon-hu (chọn hũ lấy câu hỏi) và
 *  tra-loi (chấm điểm + hồi chiếu). Client không import module này.
 *  - Độ khó 3 hũ được xáo trộn và giữ kín ở server.
 *  - Câu hỏi lấy ngẫu nhiên từ bảng question_bank (trắc nghiệm),
 *    hết câu thì dùng pool dự phòng lib/treoco-cau-hoi-mac-dinh.ts.
 * ============================================================
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";
import { TREOCO_CAU_HOI_MAC_DINH } from "@/lib/treoco-cau-hoi-mac-dinh";
import { NGAN_HANG_CAU_HOI_GAME } from "@/lib/treoco-bank-questions";

/** 3 độ khó tương ứng 3 hũ (Dễ / Trung bình / Khó). */
export const TREOCO_JAR_DIFFICULTIES: QuestionDifficulty[] = ["nhan_biet", "thong_hieu", "van_dung"];

/** Dòng trạng thái đầy đủ của bảng treoco_state (snake_case như trong DB). */
export type TreocoRow = {
  user_id: string;
  word_key: string | null;
  revealed_letters: unknown;
  wrong_letters: unknown;
  turns: number;
  status: string;
  next_question_at: string;
  jar_difficulties: unknown;
  active_question: TreocoCauHoi | null;
  wins: number;
  losses: number;
};

const TREOCO_COLUMNS =
  "user_id, word_key, revealed_letters, wrong_letters, turns, status, next_question_at, jar_difficulties, active_question, wins, losses";

/** Bộ nhớ đệm phiên chơi global (chia sẻ an toàn giữa các route chon-hu và tra-loi). */
const GLOBAL_TREOCO_KEY = Symbol.for("mathlearn.treoco.memory_state");
const memoryTreocoState: Map<string, TreocoRow> =
  (globalThis as any)[GLOBAL_TREOCO_KEY] ||
  ((globalThis as any)[GLOBAL_TREOCO_KEY] = new Map<string, TreocoRow>());

function shuffle<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Xáo trộn 3 độ khó gán vào 3 hũ:
 * - 1 hũ Nhận biết (Dễ)
 * - 1 hũ Thông hiểu (Trung bình)
 * - 1 hũ Vận dụng (Khó)
 */
export function shuffleJarDifficulties(): QuestionDifficulty[] {
  return shuffle(["nhan_biet", "thong_hieu", "van_dung"]);
}

/** Đọc/xáo chuỗi jar_difficulties trong dòng DB; sai cấu trúc thì xáo mới. */
export function readJarDifficulties(row: TreocoRow): QuestionDifficulty[] {
  const jars = Array.isArray(row.jar_difficulties) ? (row.jar_difficulties as string[]) : [];
  const valid =
    jars.length === 3 &&
    jars.every((d) => ["nhan_biet", "thong_hieu", "van_dung"].includes(d));
  return valid ? (jars as QuestionDifficulty[]) : shuffleJarDifficulties();
}

/** Câu hỏi đang mở có hợp lệ để chơi tiếp không (resume sau reload). */
export function readActiveQuestion(row: TreocoRow): TreocoCauHoi | null {
  const q = row.active_question;
  if (!q || typeof q !== "object") return null;
  if (!Array.isArray(q.options) || q.options.length < 2) return null;
  if (typeof q.correctIndex !== "number" || q.correctIndex < 0 || q.correctIndex >= q.options.length) return null;
  if (typeof q.text !== "string" || !q.text.trim()) return null;
  return q;
}

/** Đảm bảo có dòng trạng thái cho user: ưu tiên DB, tự động fallback sang memory an toàn tuyệt đối. */
export async function ensureTreocoRow(supabase: SupabaseClient, userId: string): Promise<TreocoRow> {
  try {
    const { data: existing, error: selectError } = await supabase
      .from("treoco_state")
      .select(TREOCO_COLUMNS)
      .eq("user_id", userId)
      .maybeSingle();

    if (!selectError && existing) {
      const row = existing as unknown as TreocoRow;
      // Chuẩn hóa nếu tài khoản đang dính 30 vé từ bản test
      if (row.turns === 30 || (row.turns !== null && row.turns >= 25 && (row.wins || 0) === 0)) {
        row.turns = 3;
        try {
          await supabase.from("treoco_state").update({ turns: 3 }).eq("user_id", userId);
        } catch {
          // ignore error
        }
      }
      memoryTreocoState.set(userId, row);
      return row;
    }

    if (!selectError || selectError.code === "PGRST116") {
      // Chưa có dòng → tạo mới với default
      const { data: inserted, error: insertError } = await supabase
        .from("treoco_state")
        .insert({ user_id: userId, turns: 3 })
        .select(TREOCO_COLUMNS)
        .maybeSingle();
      if (!insertError && inserted) {
        const row = inserted as unknown as TreocoRow;
        memoryTreocoState.set(userId, row);
        return row;
      }
    }
  } catch (err) {
    console.warn("Lưu ý: Không kết nối được bảng treoco_state trên Supabase, dùng bộ nhớ đệm memory:", err);
  }

  // Fallback sang bộ nhớ in-memory: đảm bảo game KHÔNG BAO GIỜ bị lỗi 500
  let mem = memoryTreocoState.get(userId);
  if (!mem) {
    mem = {
      user_id: userId,
      word_key: null,
      revealed_letters: [],
      wrong_letters: [],
      turns: 3,
      status: "playing",
      next_question_at: new Date().toISOString(),
      jar_difficulties: shuffleJarDifficulties(),
      active_question: null,
      wins: 0,
      losses: 0,
    };
    memoryTreocoState.set(userId, mem);
  }
  return mem;
}

/** Cập nhật câu hỏi đang mở hoặc kết quả chấm điểm (đồng bộ cả memory và DB). */
export async function saveTreocoActiveState(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<TreocoRow>,
): Promise<void> {
  const current = memoryTreocoState.get(userId);
  if (current) {
    memoryTreocoState.set(userId, { ...current, ...updates });
  } else {
    memoryTreocoState.set(userId, {
      user_id: userId,
      word_key: null,
      revealed_letters: [],
      wrong_letters: [],
      turns: 3,
      status: "playing",
      next_question_at: new Date().toISOString(),
      jar_difficulties: shuffleJarDifficulties(),
      active_question: null,
      wins: 0,
      losses: 0,
      ...updates,
    });
  }

  try {
    await supabase
      .from("treoco_state")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  } catch {
    // Không chặn game nếu bảng treoco_state chưa tạo trên Supabase
  }
}

/** Chuyển câu trắc nghiệm ngân hàng (content jsonb) thành câu hỏi game. */
export function bankQuestionToTreocoCauHoi(
  row: { id: string; text: string; content: unknown; difficulty: string },
  difficulty: QuestionDifficulty,
): TreocoCauHoi | null {
  let content: Record<string, unknown> = {};
  try {
    content = typeof row.content === "string" ? JSON.parse(row.content) : (row.content as Record<string, unknown>) ?? {};
  } catch {
    return null;
  }
  const rawOptions = Array.isArray(content.options) ? (content.options as unknown[]) : [];
  if (rawOptions.length < 2) return null;

  let texts: string[] = [];
  let correctIndex = -1;

  if (typeof rawOptions[0] === "string") {
    texts = rawOptions.map((o) => String(o).trim());
    if (typeof content.correctIndex === "number") {
      correctIndex = content.correctIndex;
    }
  } else {
    const optObjects = rawOptions as { id?: string; text?: string }[];
    texts = optObjects.map((o) => (o?.text ? o.text.trim() : ""));
    const correctOptionId = content.correctOptionId;
    correctIndex = optObjects.findIndex((o) => o?.id && o.id === correctOptionId);
  }

  if (correctIndex < 0 || correctIndex >= texts.length || !texts[correctIndex]) return null;

  const imageStoragePath = (content.imageStoragePath || (content as any).storagePath) as string | undefined;
  const imageUrl = content.imageUrl as string | undefined;
  const imageCaption = content.imageCaption as string | undefined;
  const explanationImageStoragePath = content.explanationImageStoragePath as string | undefined;
  const explanationImageUrl = content.explanationImageUrl as string | undefined;
  const explanationImages = content.explanationImages as any;

  return {
    id: row.id,
    text: row.text,
    options: texts,
    correctIndex,
    explanation: typeof content.explanation === "string" ? content.explanation : "",
    difficulty,
    imageStoragePath: imageStoragePath?.trim() || undefined,
    imageUrl: imageUrl?.trim() || undefined,
    imageCaption: imageCaption?.trim() || undefined,
    explanationImageStoragePath: explanationImageStoragePath?.trim() || undefined,
    explanationImageUrl: explanationImageUrl?.trim() || undefined,
    explanationImages: Array.isArray(explanationImages) ? explanationImages : undefined,
  };
}

/**
 * Chọn ngẫu nhiên 1 câu trắc nghiệm của mức độ:
 * 1. Ưu tiên lấy trực tiếp từ bảng question_bank trên CSDL Supabase
 * 2. Ngân hàng câu hỏi Toán học thực tế (170 câu chuẩn từ các bộ đề thi NganHang_HamSo_De01..04.json)
 * 3. Pool dự phòng cơ bản
 */
export async function pickTreocoQuestion(
  supabase: SupabaseClient,
  difficulty: QuestionDifficulty,
): Promise<TreocoCauHoi | null> {
  // 1. Thử lấy từ bảng question_bank trên Supabase
  try {
    const { data: rows, error } = await supabase
      .from("question_bank")
      .select("id, text, content, difficulty, type")
      .eq("difficulty", difficulty)
      .eq("type", "multiple_choice");
    if (!error && rows && rows.length > 0) {
      const validQuestions: TreocoCauHoi[] = [];
      for (const r of rows) {
        const q = bankQuestionToTreocoCauHoi(
          { id: r.id, text: r.text, content: r.content, difficulty: r.difficulty },
          difficulty,
        );
        if (q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === "number") {
          // Bỏ qua các câu tích phân/nguyên hàm (kỳ 2)
          const allText = (q.text + " " + (q.explanation || "")).toLowerCase();
          if (!allText.includes("tích phân") && !allText.includes("nguyên hàm") && !allText.includes("\\int")) {
            validQuestions.push(q);
          }
        }
      }
      if (validQuestions.length > 0) {
        return shuffle(validQuestions)[0];
      }
    }
  } catch (err) {
    console.warn("Lưu ý: Không kết nối được bảng question_bank từ CSDL:", err);
  }

  // 2. Ngân hàng câu hỏi Toán học thực tế trích xuất từ các bộ đề ngân hàng (170 câu chuẩn)
  const bankPool = NGAN_HANG_CAU_HOI_GAME.filter((q) => q.difficulty === difficulty);
  if (bankPool.length > 0) {
    return shuffle(bankPool)[0];
  }

  // 3. Pool dự phòng cơ bản
  const pool = TREOCO_CAU_HOI_MAC_DINH.filter((q) => q.difficulty === difficulty);
  if (pool.length > 0) {
    return shuffle(pool)[0];
  }
  return TREOCO_CAU_HOI_MAC_DINH.length ? TREOCO_CAU_HOI_MAC_DINH[0] : null;
}

/** Tìm câu hỏi theo ID từ ngân hàng câu hỏi, pool dự phòng hoặc database Supabase. */
export async function findTreocoQuestionById(
  supabase: SupabaseClient,
  id: string,
): Promise<TreocoCauHoi | null> {
  // 1. Tìm trong ngân hàng câu hỏi game (78 câu chuẩn)
  const fromBank = NGAN_HANG_CAU_HOI_GAME.find((q) => q.id === id);
  if (fromBank) return fromBank;

  // 2. Tìm trong pool dự phòng
  const fromDefault = TREOCO_CAU_HOI_MAC_DINH.find((q) => q.id === id);
  if (fromDefault) return fromDefault;

  // 3. Tìm trong database Supabase
  try {
    const { data: row } = await supabase
      .from("question_bank")
      .select("id, text, content, difficulty")
      .eq("id", id)
      .maybeSingle();
    if (row) {
      return bankQuestionToTreocoCauHoi(
        { id: row.id, text: row.text, content: row.content, difficulty: row.difficulty },
        row.difficulty as QuestionDifficulty,
      );
    }
  } catch {
    // Bỏ qua lỗi DB
  }

  return null;
}
