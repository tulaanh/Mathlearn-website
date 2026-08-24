import { cache } from "react";
import type { ChapterData, ChapterItem } from "@/lib/chapter-types";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { quizzes } from "@/data/quizzes";

/** Map một row + items DB thành ChapterData */
function mapChapter(row: any, itemRows: any[]): ChapterData {
  const items: ChapterItem[] = itemRows
    .sort((a, b) => a.position - b.position)
    .map((item): ChapterItem => {
      if (item.item_type === "document" && item.documents) {
        return {
          id: item.id,
          itemType: "document",
          documentId: item.document_id,
          position: item.position,
          title: item.documents.title,
          description: item.documents.description,
          documentType: item.documents.document_type === "test" ? "test" : "normal",
          documentStatus: item.documents.status,
          grade: item.documents.grade,
        };
      }
      // Quiz (bài kiểm tra cũ từ data/quizzes.ts)
      const quiz = quizzes.find((q) => q.id === item.quiz_id);
      return {
        id: item.id,
        itemType: "quiz",
        quizId: item.quiz_id,
        position: item.position,
        title: quiz?.title ?? item.quiz_id,
        description: quiz?.description ?? null,
        grade: quiz?.grade,
      };
    });

  return {
    id: row.id,
    pathId: row.path_id ?? null,
    title: row.title,
    description: row.description,
    subject: row.subject,
    grade: row.grade,
    position: row.position,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items,
  };
}

/** Lấy các chương (kèm items) — sắp theo position.
 *  Một query lồng duy nhất (chapters → chapter_items → documents) thay vì 2 query tuần tự.
 *  pathId: chỉ tải chương thuộc lộ trình đó (dùng cho trang chi tiết lộ trình). */
export async function getChapters(options: { pathId?: string } = {}): Promise<ChapterData[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  let query = supabase
    .from("chapters")
    .select("*, chapter_items(*, documents(id, title, description, document_type, status, grade))")
    .order("position")
    .order("created_at");
  if (options.pathId) query = query.eq("path_id", options.pathId);

  const { data: rows, error } = await query;
  if (error || !rows || rows.length === 0) return [];

  return rows.map((row: any) => mapChapter(row, row.chapter_items ?? []));
}

/** Lấy chi tiết 1 chương theo id. Bọc cache() để metadata và trang dùng chung một lần tải. */
export const getChapterDataById = cache(async function getChapterDataById(id: string): Promise<ChapterData | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data: row, error } = await supabase
    .from("chapters")
    .select("*, chapter_items(*, documents(id, title, description, document_type, status, grade))")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) return null;
  return mapChapter(row, row.chapter_items ?? []);
});

/** Lấy tất cả chương cho giáo viên (kiểm tra quyền) */
export async function getTeacherChapters(): Promise<ChapterData[]> {
  const { getCurrentUser } = await import("@/lib/supabase/server");
  const { profile } = await getCurrentUser();
  if (profile?.role !== "teacher") return [];
  return getChapters();
}
