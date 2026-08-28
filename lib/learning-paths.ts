import { cache } from "react";
import type { LearningPathData } from "@/lib/path-types";
import { getChapters } from "@/lib/chapters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Lấy tất cả lộ trình học kèm các chương con — sắp theo position.
 *  Bọc cache() để deduplicate request giữa các component và metadata. */
export const getLearningPaths = cache(async function getLearningPaths(): Promise<LearningPathData[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  // Chạy song song 2 query thay vì nối tiếp — bớt 1 vòng mạng tới Supabase
  const [{ data: rows, error }, chapters] = await Promise.all([
    supabase
      .from("learning_paths")
      .select("*")
      .order("position")
      .order("created_at"),
    getChapters(),
  ]);

  if (error || !rows) return [];

  const chaptersByPathId: Record<string, typeof chapters> = {};
  for (const chapter of chapters) {
    if (!chapter.pathId) continue;
    if (!chaptersByPathId[chapter.pathId]) chaptersByPathId[chapter.pathId] = [];
    chaptersByPathId[chapter.pathId].push(chapter);
  }

  return (rows as any[]).map((row): LearningPathData => ({
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    grade: row.grade,
    position: row.position,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    chapters: chaptersByPathId[row.id] ?? [],
  }));
});

/** Lấy chi tiết 1 lộ trình theo id. Bọc cache() để metadata và trang dùng chung một lần tải. */
export const getLearningPathById = cache(async function getLearningPathById(id: string): Promise<LearningPathData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  // Query row lộ trình và chương của nó song song — tránh 2 vòng mạng nối tiếp
  const [{ data: row, error }, chapters] = await Promise.all([
    supabase.from("learning_paths").select("*").eq("id", id).maybeSingle(),
    // Chỉ tải chương thuộc lộ trình này thay vì toàn bộ chương trong DB rồi lọc phía JS
    getChapters({ pathId: id }),
  ]);

  if (error || !row) return null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    subject: row.subject,
    grade: row.grade,
    position: row.position,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    chapters,
  };
});

/** Lấy tất cả lộ trình cho giáo viên (kiểm tra quyền) */
export async function getTeacherLearningPaths(): Promise<LearningPathData[]> {
  const { getCurrentUser } = await import("@/lib/supabase/server");
  const { profile } = await getCurrentUser();
  if (profile?.role !== "teacher") return [];
  return getLearningPaths();
}
