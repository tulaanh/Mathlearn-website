import { cache } from "react";
import type { DocumentBlock, DocumentStatus, StudyDocument } from "@/lib/document-types";
import { createServerSupabaseClient, getCurrentUser } from "@/lib/supabase/server";

function mapDocument(row: any, blocks: any[], topicRows: any[], attachedTest?: { id: string; title: string } | null): StudyDocument {
  const topics = topicRows
    .map((item) => item.topics)
    .filter(Boolean)
    .map((topic) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description,
    }));

  const mappedBlocks: DocumentBlock[] = blocks
    .sort((a, b) => a.position - b.position)
    .map((block): DocumentBlock => {
      if (block.block_type === "text") {
        return { id: block.id, type: "text", content: block.content ?? "", position: block.position };
      }
      if (block.block_type === "lesson") {
        return {
          id: block.id,
          type: "lesson",
          title: block.title ?? "",
          description: block.description ?? undefined,
          content: block.content ?? "",
          position: block.position,
        };
      }
      if (block.block_type === "quiz") {
        let questions: any[] = [];
        try {
          questions = typeof block.content === "string" ? JSON.parse(block.content) : [];
        } catch {
          questions = [];
        }
        return {
          id: block.id,
          type: "quiz",
          title: block.title ?? "",
          description: block.description ?? undefined,
          questions,
          position: block.position,
        };
      }
      return {
        id: block.id,
        type: "image",
        storagePath: block.storage_path,
        altText: block.alt_text ?? "Hình ảnh tài liệu Toán",
        caption: block.caption ?? undefined,
        position: block.position,
      };
    });

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    grade: row.grade,
    status: row.status as DocumentStatus,
    documentType: row.document_type === "test" ? "test" : "normal",
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachedTestId: row.attached_test_id ?? null,
    attachedTest: attachedTest ?? null,
    blocks: mappedBlocks,
    topics,
  };
}

async function loadDocuments(query: (supabase: any) => any): Promise<StudyDocument[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  const { data: rows, error } = await query(supabase);
  if (error || !rows || rows.length === 0) return [];

  const docIds = rows.map((r: any) => r.id);

  const [{ data: allBlocksMeta }, { data: allQuizContents }, { data: allTopicRows }] = await Promise.all([
    supabase
      .from("document_blocks")
      .select("id, document_id, block_type, position, title, description, storage_path, alt_text, caption")
      .in("document_id", docIds)
      .order("position"),
    supabase
      .from("document_blocks")
      .select("id, content")
      .in("document_id", docIds)
      .eq("block_type", "quiz"),
    supabase
      .from("document_topics")
      .select("document_id, topic_id, topics(id, name, description)")
      .in("document_id", docIds),
  ]);

  const quizContentsById: Record<string, string> = {};
  for (const q of allQuizContents ?? []) {
    quizContentsById[q.id] = q.content;
  }

  const allBlocks = (allBlocksMeta ?? []).map((b: any) => {
    if (b.block_type === "quiz") {
      return { ...b, content: quizContentsById[b.id] };
    }
    return b;
  });

  const blocksByDocId: Record<string, any[]> = {};
  const topicsByDocId: Record<string, any[]> = {};

  for (const block of allBlocks) {
    if (!blocksByDocId[block.document_id]) blocksByDocId[block.document_id] = [];
    blocksByDocId[block.document_id].push(block);
  }

  for (const topicRow of allTopicRows ?? []) {
    if (!topicsByDocId[topicRow.document_id]) topicsByDocId[topicRow.document_id] = [];
    topicsByDocId[topicRow.document_id].push(topicRow);
  }

  return rows.map((row: any) => mapDocument(row, blocksByDocId[row.id] ?? [], topicsByDocId[row.id] ?? []));
}

export async function getPublishedDocuments(topicId?: string): Promise<StudyDocument[]> {
  return loadDocuments(async (supabase) => {
    let query = supabase.from("documents").select("*").eq("status", "published").eq("document_type", "normal").order("updated_at", { ascending: false });
    if (topicId) {
      const { data: links } = await supabase.from("document_topics").select("document_id").eq("topic_id", topicId);
      const ids = (links ?? []).map((link: { document_id: string }) => link.document_id);
      if (!ids.length) return { data: [] };
      query = query.in("id", ids);
    }
    return query;
  });
}

export async function getPublishedTestDocuments(topicId?: string): Promise<StudyDocument[]> {
  return loadDocuments(async (supabase) => {
    let query = supabase.from("documents").select("*").eq("status", "published").eq("document_type", "test").order("updated_at", { ascending: false });
    if (topicId) {
      const { data: links } = await supabase.from("document_topics").select("document_id").eq("topic_id", topicId);
      const ids = (links ?? []).map((link: { document_id: string }) => link.document_id);
      if (!ids.length) return { data: [] };
      query = query.in("id", ids);
    }
    return query;
  });
}

/** Bọc cache() để generateMetadata và trang chia sẻ cùng một lần tải trong mỗi request. */
export const getDocumentById = cache(async function getDocumentById(id: string): Promise<StudyDocument | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data: row, error } = await supabase.from("documents").select("*").eq("id", id).maybeSingle();
  if (error || !row) return null;
  const [{ data: blocks }, { data: topicRows }, attachedTest] = await Promise.all([
    supabase.from("document_blocks").select("*").eq("document_id", id).order("position"),
    supabase.from("document_topics").select("topic_id, topics(id, name, description)").eq("document_id", id),
    loadAttachedTest(supabase, row.attached_test_id),
  ]);
  return mapDocument(row, blocks ?? [], topicRows ?? [], attachedTest);
});

/** Lấy thông tin rút gọn của bài kiểm tra được đính kèm (nếu còn xem được). */
async function loadAttachedTest(supabase: any, testId: string | null | undefined): Promise<{ id: string; title: string } | null> {
  if (!testId) return null;
  const { data } = await supabase.from("documents").select("id, title").eq("id", testId).maybeSingle();
  return data ? { id: data.id, title: data.title } : null;
}

/** Danh sách bài kiểm tra đã xuất bản (rút gọn) cho dropdown đính kèm trong trình soạn thảo. */
export async function getPublishedTestOptions(): Promise<{ id: string; title: string; grade: string }[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("documents")
    .select("id, title, grade")
    .eq("document_type", "test")
    .eq("status", "published")
    .order("title");
  return data ?? [];
}

export async function getTeacherDocuments(): Promise<StudyDocument[]> {
  const { supabase, profile } = await getCurrentUser();
  if (!supabase || profile?.role !== "teacher") return [];
  return loadDocuments((client) => client.from("documents").select("*").order("updated_at", { ascending: false }));
}

export type DocumentCardData = {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  status: DocumentStatus;
  documentType: "normal" | "test";
  updatedAt: string;
  blockCount: number;
  questionCount: number;
  imageStoragePaths: string[];
  topics: { id: string; name: string }[];
};

export const DOCS_PAGE_SIZE = 24;

export type PagedDocs = { items: DocumentCardData[]; total: number };

/** Chỉ các cột cần cho card danh sách — không tải toàn bộ dòng. */
const DOC_CARD_COLUMNS = "id, title, description, grade, status, document_type, updated_at";

/** Factory trả về { builder } (bọc object) — await trực tiếp một PostgrestBuilder
 *  sẽ thực thi truy vấn và làm mất .range, nên không được trả builder trần. */
type DocQueryResult = { builder: any } | null;

/** Dữ liệu rút gọn cho các trang danh sách: không dựng toàn bộ blocks/questions.
 *  withQuestionCount = false bỏ hẳn việc đọc content JSON của khối quiz (chỉ cần khi card hiển thị số câu hỏi).
 *  Khi có page: đếm tổng bằng count="exact" và chỉ tải đúng trang đó (.range). */
async function loadDocumentCards(
  query: (supabase: any, columns: string) => DocQueryResult | Promise<DocQueryResult>,
  withQuestionCount: boolean,
  page?: number,
  pageSize = DOCS_PAGE_SIZE,
): Promise<PagedDocs> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { items: [], total: 0 };

  const usePaging = typeof page === "number";
  const from = (Math.max(1, page ?? 1) - 1) * pageSize;

  const result = await query(supabase, DOC_CARD_COLUMNS);
  if (!result) return { items: [], total: 0 };
  if (!result.builder) {
    console.error(
      "[documents] loadDocumentCards: query factory phải trả về { builder }, không được trả PostgrestBuilder trần (await sẽ thực thi query và mất .range).",
    );
    return { items: [], total: 0 };
  }
  const { builder } = result;

  const rowsResponse: any = usePaging
    ? await builder.range(from, from + pageSize - 1)
    : await builder;
  const rows: any[] = rowsResponse?.data ?? [];
  if (rowsResponse?.error) {
    console.error("[documents] loadDocumentCards query failed:", rowsResponse.error);
    return { items: [], total: 0 };
  }
  const total: number = rowsResponse?.count ?? rows.length;
  if (rows.length === 0) return { items: [], total };

  const docIds = rows.map((r: any) => r.id);

  const [blockMetasRes, quizContentsRes, topicRowsRes] = await Promise.all([
    supabase.from("document_blocks").select("document_id, block_type, storage_path").in("document_id", docIds),
    withQuestionCount
      ? supabase.from("document_blocks").select("document_id, content").in("document_id", docIds).eq("block_type", "quiz")
      : Promise.resolve({ data: null }),
    supabase.from("document_topics").select("document_id, topics(id, name)").in("document_id", docIds),
  ]);

  const questionCountByDoc: Record<string, number> = {};
  for (const row of (quizContentsRes as { data: any[] | null } | null)?.data ?? []) {
    let count = 0;
    try {
      const parsed = typeof row.content === "string" ? JSON.parse(row.content) : [];
      count = Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      count = 0;
    }
    questionCountByDoc[row.document_id] = (questionCountByDoc[row.document_id] ?? 0) + count;
  }

  const blockCountByDoc: Record<string, number> = {};
  const imagePathsByDoc: Record<string, string[]> = {};
  for (const b of blockMetasRes?.data ?? []) {
    blockCountByDoc[b.document_id] = (blockCountByDoc[b.document_id] ?? 0) + 1;
    if (b.block_type === "image" && b.storage_path) {
      (imagePathsByDoc[b.document_id] ??= []).push(b.storage_path);
    }
  }

  const topicsByDoc: Record<string, { id: string; name: string }[]> = {};
  for (const row of (topicRowsRes?.data ?? []) as any[]) {
    if (row.topics) (topicsByDoc[row.document_id] ??= []).push({ id: row.topics.id, name: row.topics.name });
  }

  return {
    items: rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      grade: row.grade,
      status: row.status as DocumentStatus,
      documentType: row.document_type === "test" ? ("test" as const) : ("normal" as const),
      updatedAt: row.updated_at,
      blockCount: blockCountByDoc[row.id] ?? 0,
      questionCount: questionCountByDoc[row.id] ?? 0,
      imageStoragePaths: imagePathsByDoc[row.id] ?? [],
      topics: topicsByDoc[row.id] ?? [],
    })),
    total,
  };
}

function publishedDocumentsQuery(documentType: "normal" | "test", topicId?: string) {
  return async (supabase: any, columns: string): Promise<DocQueryResult> => {
    let builder = supabase
      .from("documents")
      .select(columns, { count: "exact" })
      .eq("status", "published")
      .eq("document_type", documentType)
      .order("updated_at", { ascending: false });
    if (topicId) {
      const { data: links } = await supabase.from("document_topics").select("document_id").eq("topic_id", topicId);
      const ids = (links ?? []).map((link: { document_id: string }) => link.document_id);
      if (!ids.length) return null;
      builder = builder.in("id", ids);
    }
    return { builder };
  };
}

/** Danh sách có phân trang cho các trang liệt kê. */
export async function getPublishedDocumentCards(topicId?: string, page = 1): Promise<PagedDocs> {
  return loadDocumentCards(publishedDocumentsQuery("normal", topicId), false, page);
}

export async function getPublishedTestDocumentCards(topicId?: string, page = 1): Promise<PagedDocs> {
  return loadDocumentCards(publishedDocumentsQuery("test", topicId), true, page);
}

export async function getTeacherDocumentCards(page = 1): Promise<PagedDocs> {
  const { supabase, profile } = await getCurrentUser();
  if (!supabase || profile?.role !== "teacher") return { items: [], total: 0 };
  const query = (client: any, columns: string): DocQueryResult => ({
    builder: client.from("documents").select(columns, { count: "exact" }).order("updated_at", { ascending: false }),
  });
  return loadDocumentCards(query, false, page);
}

/** Chỉ lấy id + tiêu đề của một bài kiểm tra đã xuất bản — dùng cho trang kết quả
 *  (đáp án chi tiết nằm trong sessionStorage, không cần tải toàn bộ nội dung đề). */
export async function getPublishedTestMetaById(id: string): Promise<{ id: string; title: string } | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("documents")
    .select("id, title")
    .eq("id", id)
    .eq("status", "published")
    .eq("document_type", "test")
    .maybeSingle();
  return data ? { id: data.id, title: data.title } : null;
}

/** Toàn bộ tài liệu của giáo viên — dùng cho các picker chọn tài liệu trong form. */
export async function getAllTeacherDocumentCards(): Promise<DocumentCardData[]> {
  const { supabase, profile } = await getCurrentUser();
  if (!supabase || profile?.role !== "teacher") return [];
  const result = await loadDocumentCards(
    (client: any, columns: string): DocQueryResult => ({
      builder: client.from("documents").select(columns).order("updated_at", { ascending: false }),
    }),
    false,
  );
  return result.items;
}
