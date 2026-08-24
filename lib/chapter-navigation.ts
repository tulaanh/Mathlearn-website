import { cache } from "react";
import type { ChapterNavigation, ChapterNextItem, TestNextStep } from "@/lib/chapter-types";
import { getChapterItemUrl } from "@/lib/chapter-types";
import { quizzes } from "@/data/quizzes";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Thông tin chương vừa đủ cho điều hướng */
type NavChapter = { id: string; title: string; position: number; path_id: string | null };

/** Một row chapter_items, đính kèm sẵn vài cột của documents để lấy tiêu đề bài kế
 *  mà không cần thêm một vòng query riêng. */
type NavItemRow = {
  id: string;
  item_type: "document" | "quiz";
  document_id: string | null;
  quiz_id: string | null;
  position: number;
  documents?: { id: string; title: string; document_type: string } | null;
};

const NAV_ITEMS_SELECT = "id, item_type, document_id, quiz_id, position, documents(id, title, document_type)";

/** Danh sách item của một chương, sắp theo position (đi qua index chapter_id+position). */
async function loadItems(supabase: any, chapterId: string): Promise<NavItemRow[]> {
  const { data } = await supabase
    .from("chapter_items")
    .select(NAV_ITEMS_SELECT)
    .eq("chapter_id", chapterId)
    .order("position")
    .order("created_at");
  return (data as NavItemRow[] | null) ?? [];
}

/** Chương kế tiếp trong cùng lộ trình — chỉ lấy 1 dòng nhắm index (path_id, position). */
async function findNextChapter(
  supabase: any,
  chapter: { path_id: string | null; position: number },
): Promise<{ id: string; title: string } | null> {
  if (!chapter.path_id) return null;
  const { data } = await supabase
    .from("chapters")
    .select("id, title")
    .eq("path_id", chapter.path_id)
    .gt("position", chapter.position)
    .order("position")
    .order("created_at")
    .limit(1);
  return data?.[0] ?? null;
}

/** Gợi ý bài kế tiếp từ row item (tiêu đề lấy từ documents đã đính kèm hoặc quiz tĩnh). */
function nextItemFromRow(row: NavItemRow, chapterId: string): ChapterNextItem {
  if (row.item_type === "document") {
    return {
      title: row.documents?.title ?? "Bài kế tiếp",
      url: getChapterItemUrl(
        {
          itemType: "document",
          documentId: row.document_id ?? "",
          documentType: row.documents?.document_type === "test" ? "test" : "normal",
        },
        chapterId,
      ),
      isTest: row.documents?.document_type === "test",
    };
  }
  const quiz = quizzes.find((q) => q.id === row.quiz_id);
  return {
    title: quiz?.title ?? "Bài kế tiếp",
    url: getChapterItemUrl({ itemType: "quiz", quizId: row.quiz_id ?? "" }, chapterId),
    isTest: true,
  };
}

/** Ghép kết quả điều hướng: vị trí mục hiện tại, bài kế tiếp, chương kế (query riêng khi hết bài). */
async function assemble(
  supabase: any,
  chapter: NavChapter,
  items: NavItemRow[],
  documentId: string,
): Promise<ChapterNavigation | null> {
  const currentIndex = items.findIndex((row) => row.item_type === "document" && row.document_id === documentId);
  if (currentIndex === -1) return null;

  const nextRow = items[currentIndex + 1] ?? null;
  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    currentIndex,
    totalItems: items.length,
    nextItem: nextRow ? nextItemFromRow(nextRow, chapter.id) : null,
    nextChapter: nextRow ? null : await findNextChapter(supabase, chapter),
  };
}

/** Tìm chương chứa tài liệu và tính bài kế tiếp trong chương đó.
 *  Đường nhanh khi có ?chuong= (link từ danh sách chương / nút "Bài kế tiếp"):
 *  1 vòng query song song [chương + item của chương]. Đường tổng quát: 2 vòng.
 *  Tiêu đề bài kế lấy từ documents đính kèm sẵn — không phát sinh query thêm.
 *  Bọc cache() để dùng lại trong cùng request. */
export const getNavigationForDocument = cache(async function getNavigationForDocument(
  documentId: string,
  preferredChapterId?: string,
): Promise<ChapterNavigation | null> {
  if (!UUID_RE.test(documentId)) return null;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  // Đường nhanh: đã biết chương từ ?chuong=, chỉ cần 1 vòng song song
  if (preferredChapterId && UUID_RE.test(preferredChapterId)) {
    const [chapterRes, items] = await Promise.all([
      supabase.from("chapters").select("id, title, position, path_id").eq("id", preferredChapterId).maybeSingle(),
      loadItems(supabase, preferredChapterId),
    ]);
    const chapter = chapterRes.data as NavChapter | null;
    if (chapter && items.length > 0) {
      const nav = await assemble(supabase, chapter, items, documentId);
      if (nav) return nav;
    }
    // ?chuong= không khớp (tài liệu không thuộc chương đó) → rơi xuống đường tìm kiếm
  }

  // Đường tổng quát: tìm chương chứa tài liệu (index document_id) rồi tải item của chương
  const { data: currentRows } = await supabase
    .from("chapter_items")
    .select("id, chapters(id, title, position, created_at, path_id)")
    .eq("document_id", documentId);
  const rows = (currentRows as any[] | null)?.filter((row) => row.chapters) ?? [];
  if (rows.length === 0) return null;

  let chosen = rows.find((row) => row.chapters.id === preferredChapterId);
  if (!chosen) {
    const sorted = [...rows].sort(
      (a, b) =>
        a.chapters.position - b.chapters.position ||
        String(a.chapters.created_at).localeCompare(String(b.chapters.created_at)),
    );
    chosen = sorted[0];
  }

  const items = await loadItems(supabase, chosen.chapters.id);
  if (items.length === 0) return null;
  return assemble(supabase, chosen.chapters as NavChapter, items, documentId);
});

/** Tính gợi ý bước tiếp theo cho trang làm bài kiểm tra (/quiz/[id]).
 *  Bài test có thể là một mục trực tiếp của chương, hoặc là test đính kèm
 *  của một tài liệu — khi đó định vị theo tài liệu cha và trả kèm parentDocument
 *  để hiện nút "Quay lại bài học" và tự đánh dấu hoàn thành tài liệu cha. */
export const getNavigationForTestDocument = cache(async function getNavigationForTestDocument(
  testDocumentId: string,
  preferredChapterId?: string,
): Promise<TestNextStep | null> {
  if (!UUID_RE.test(testDocumentId)) return null;

  const direct = await getNavigationForDocument(testDocumentId, preferredChapterId);
  if (direct) return { navigation: direct, parentDocument: null };

  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("documents")
    .select("id, title")
    .eq("attached_test_id", testDocumentId)
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(1);
  const parent = (data as any[] | null)?.[0];
  if (!parent) return null;

  const navigation = await getNavigationForDocument(parent.id, preferredChapterId);
  if (!navigation) return null;
  return { navigation, parentDocument: { id: parent.id, title: parent.title } };
});
