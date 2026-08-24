import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  BankQuestion,
  QuestionDifficulty,
} from "@/lib/question-bank-types";
import { bankQuestionToPayload, isQuestionDifficulty } from "@/lib/question-bank-types";
import type { QuestionType, QuizQuestion } from "@/lib/document-types";

/**
 * Lớp truy cập dữ liệu ngân hàng câu hỏi (chạy phía server).
 * Bảng: question_bank (+ question_bank_topics). RLS chỉ cho giáo viên đọc/ghi.
 */

export { bankQuestionToPayload };

export type BankQuestionFilters = {
  search?: string;
  grade?: string;
  topicId?: string;
  difficulty?: QuestionDifficulty | "";
  type?: QuestionType | "";
};

const QUESTION_COLUMNS = "id, text, type, difficulty, grade, content, created_at, updated_at";

export const BANK_PAGE_SIZE = 20;

export type Paged<T> = { items: T[]; total: number };

function mapRow(row: any, topicRows: any[] = []): BankQuestion {
  let content: Partial<QuizQuestion> = {};
  try {
    content = typeof row.content === "string" ? JSON.parse(row.content) : row.content ?? {};
  } catch {
    content = {};
  }
  return {
    ...(content as QuizQuestion),
    id: row.id,
    text: row.text,
    type: (row.type || "multiple_choice") as QuestionType,
    difficulty: isQuestionDifficulty(row.difficulty) ? row.difficulty : "nhan_biet",
    grade: row.grade,
    topicIds: topicRows.map((t) => t.topic_id).filter(Boolean),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function attachTopics(supabase: any, rows: any[]): Promise<BankQuestion[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const { data: topicRows } = await supabase
    .from("question_bank_topics")
    .select("question_id, topic_id")
    .in("question_id", ids);
  const topicsByQuestion: Record<string, any[]> = {};
  for (const t of topicRows ?? []) {
    (topicsByQuestion[t.question_id] ??= []).push(t);
  }
  return rows.map((row) => mapRow(row, topicsByQuestion[row.id] ?? []));
}

/** Danh sách câu hỏi có phân trang: chỉ tải 1 trang mỗi lần, total dùng để vẽ pager. */
export async function getBankQuestions(
  filters: BankQuestionFilters = {},
  page = 1,
  pageSize = BANK_PAGE_SIZE,
): Promise<Paged<BankQuestion>> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { items: [], total: 0 };

  let query = supabase
    .from("question_bank")
    .select(QUESTION_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search?.trim()) query = query.ilike("text", `%${filters.search.trim()}%`);
  if (filters.grade) query = query.eq("grade", filters.grade);
  if (filters.difficulty) query = query.eq("difficulty", filters.difficulty);
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.topicId) {
    const { data: links } = await supabase
      .from("question_bank_topics")
      .select("question_id")
      .eq("topic_id", filters.topicId);
    const ids = (links ?? []).map((l: { question_id: string }) => l.question_id);
    if (!ids.length) return { items: [], total: 0 };
    query = query.in("id", ids);
  }

  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const { data: rows, error, count } = await query.range(from, from + pageSize - 1);
  if (error || !rows) return { items: [], total: count ?? 0 };
  return { items: await attachTopics(supabase, rows), total: count ?? rows.length };
}

export async function getBankQuestionById(id: string): Promise<BankQuestion | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("question_bank")
    .select(QUESTION_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !row) return null;
  const [question] = await attachTopics(supabase, [row]);
  return question ?? null;
}

export type BankStats = {
  total: number;
  byDifficulty: Record<QuestionDifficulty, number>;
};

export async function getBankStats(): Promise<BankStats> {
  const supabase = await createServerSupabaseClient();
  const empty: BankStats = {
    total: 0,
    byDifficulty: { nhan_biet: 0, thong_hieu: 0, van_dung: 0, van_dung_cao: 0 },
  };
  if (!supabase) return empty;

  // Đếm bằng SQL (head count) thay vì tải toàn bộ bảng về JS.
  const difficulties: QuestionDifficulty[] = ["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"];
  const [totalRes, ...difficultyResults] = await Promise.all([
    supabase.from("question_bank").select("id", { count: "exact", head: true }),
    ...difficulties.map((d) =>
      supabase
        .from("question_bank")
        .select("id", { count: "exact", head: true })
        .eq("difficulty", d),
    ),
  ]);

  const stats = { ...empty };
  stats.total = totalRes.count ?? 0;
  difficulties.forEach((d, i) => {
    stats.byDifficulty[d] = difficultyResults[i]?.count ?? 0;
  });
  return stats;
}

const KNOWN_GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"];

/** Danh sách khối lớp đang có trong ngân hàng (cho bộ lọc): đếm head-count từng khối thay vì tải toàn bộ. */
export async function getBankGrades(): Promise<string[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const results = await Promise.all(
    KNOWN_GRADES.map((grade) =>
      supabase
        .from("question_bank")
        .select("id", { count: "exact", head: true })
        .eq("grade", grade)
        .limit(1),
    ),
  );
  return KNOWN_GRADES.filter((_, i) => (results[i]?.count ?? 0) > 0);
}

/**
 * Chọn ngẫu nhiên câu hỏi theo ma trận mức độ (server-side).
 * Mỗi mức độ chọn tối đa `count` câu, ưu tiên khớp bộ lọc grade/topicId/type.
 */
export async function pickRandomQuestionsByMatrix(
  matrix: Partial<Record<QuestionDifficulty, number>>,
  filters: Pick<BankQuestionFilters, "grade" | "topicId" | "type"> = {},
): Promise<{ picked: BankQuestion[]; available: Record<string, number> }> {
  const supabase = await createServerSupabaseClient();
  const difficulties: QuestionDifficulty[] = ["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"];
  const needed = difficulties.filter((d) => (matrix[d] ?? 0) > 0);
  const available: Record<string, number> = {};

  if (!supabase || !needed.length) return { picked: [], available };

  // Lấy liên kết chủ đề đúng một lần, dùng chung cho mọi mức độ.
  let topicIds: string[] | null = null;
  if (filters.topicId) {
    const { data: links } = await supabase
      .from("question_bank_topics")
      .select("question_id")
      .eq("topic_id", filters.topicId);
    topicIds = (links ?? []).map((l: { question_id: string }) => l.question_id);
    if (!topicIds.length) return { picked: [], available };
  }

  // Mỗi mức độ chỉ cần 1 query lấy id; available tính luôn từ độ dài danh sách
  // (bỏ hẳn các count query riêng biệt).
  const idsByDifficulty = await Promise.all(
    difficulties.map(async (d) => {
      if ((matrix[d] ?? 0) <= 0) return [d, [] as string[]] as const;
      let idQuery = supabase.from("question_bank").select("id").eq("difficulty", d);
      if (filters.grade) idQuery = idQuery.eq("grade", filters.grade);
      if (filters.type) idQuery = idQuery.eq("type", filters.type);
      if (topicIds) idQuery = idQuery.in("id", topicIds);
      const { data: idRows } = await idQuery;
      return [d, (idRows ?? []).map((r: any) => r.id as string)] as const;
    }),
  );

  const picked: BankQuestion[] = [];
  const chosenIds: string[] = [];
  for (const [d, allIds] of idsByDifficulty) {
    available[d] = allIds.length;
    if (!allIds.length) continue;
    for (let i = allIds.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIds[i], allIds[j]] = [allIds[j], allIds[i]];
    }
    chosenIds.push(...allIds.slice(0, Math.min(matrix[d] ?? 0, allIds.length)));
  }

  // Một query duy nhất tải nội dung tất cả câu được chọn.
  if (chosenIds.length) {
    const { data: rows } = await supabase.from("question_bank").select(QUESTION_COLUMNS).in("id", chosenIds);
    if (rows?.length) picked.push(...(await attachTopics(supabase, rows)));
  }

  return { picked, available };
}
