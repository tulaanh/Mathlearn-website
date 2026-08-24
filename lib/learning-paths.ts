import { cache } from "react";
import type { LearningPathData } from "@/lib/path-types";
import { getChapters } from "@/lib/chapters";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Lấy tất cả lộ trình học kèm các chương con — sắp theo position */
export async function getLearningPaths(): Promise<LearningPathData[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: rows, error } = await supabase
    .from("learning_paths")
    .select("*")
    .order("position")
    .order("created_at");

  if (error || !rows) return [];

  const chapters = await getChapters();
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
}

/** Lấy chi tiết 1 lộ trình theo id. Bọc cache() để metadata và trang dùng chung một lần tải. */
export const getLearningPathById = cache(async function getLearningPathById(id: string): Promise<LearningPathData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from("learning_paths")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return null;

  // Chỉ tải chương thuộc lộ trình này thay vì toàn bộ chương trong DB rồi lọc phía JS
  const chapters = await getChapters({ pathId: id });

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
