import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentFormBlock, DocumentType } from "./document-types";

export interface StagedDocumentData {
  tempId: string;
  isNew: true;
  title: string;
  description?: string;
  grade: string;
  documentType: DocumentType;
  status: "draft" | "published";
  blocks: DocumentFormBlock[];
}

/**
 * Lưu một tài liệu được tạo tạm (staged) vào Supabase và trả về ID thực tế vừa được tạo.
 */
export async function saveStagedDocument(
  supabase: SupabaseClient,
  userId: string,
  stagedDoc: StagedDocumentData,
): Promise<string> {
  const { data: doc, error: docError } = await supabase
    .from("documents")
    .insert({
      title: stagedDoc.title.trim(),
      description: stagedDoc.description?.trim() || null,
      subject: "Toán",
      grade: stagedDoc.grade,
      document_type: stagedDoc.documentType,
      status: stagedDoc.status || "published",
      created_by: userId,
    })
    .select("id")
    .single();

  if (docError || !doc) {
    throw docError || new Error(`Không thể tạo tài liệu: ${stagedDoc.title}`);
  }

  const document_id = doc.id;
  const rows: Record<string, unknown>[] = [];

  for (const [i, b] of stagedDoc.blocks.entries()) {
    if (b.type === "text") {
      if (b.content?.trim()) {
        rows.push({
          document_id,
          block_type: "text",
          content: b.content,
          position: i,
        });
      }
    } else if (b.type === "image") {
      if (b.storagePath) {
        rows.push({
          document_id,
          block_type: "image",
          storage_path: b.storagePath,
          alt_text: b.altText?.trim() || "Hình ảnh",
          caption: b.caption?.trim() || null,
          position: i,
        });
      }
    } else if (b.type === "lesson") {
      if (b.title?.trim() && b.content?.trim()) {
        rows.push({
          document_id,
          block_type: "lesson",
          title: b.title.trim(),
          description: b.description?.trim() || null,
          content: b.content.trim(),
          position: i,
        });
      }
    } else if (b.type === "quiz") {
      const cleanedQuestions = (b.questions || [])
        .filter((q) => q.text?.trim())
        .map((q) => {
          const qType = q.type || "multiple_choice";
          if (qType === "multiple_choice") {
            const options = (q.options || []).filter((o) => o.text?.trim());
            return {
              id: q.id,
              type: qType,
              text: q.text.trim(),
              options,
              correctOptionId: options.some((o) => o.id === q.correctOptionId)
                ? q.correctOptionId
                : options[0]?.id ?? "a",
              points: q.points ?? 1,
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
            };
          }
          if (qType === "true_false") {
            const source = q.statements ?? q.options ?? [];
            const statements = source
              .map((s, idx) => ({
                id: s.id || `s-${idx + 1}`,
                text: s.text.trim(),
                correctVal: s.correctVal === "false" ? ("false" as const) : ("true" as const),
              }))
              .filter((s) => s.text);
            return {
              id: q.id,
              type: qType,
              text: q.text.trim(),
              statements,
              points: q.points ?? 1,
              ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
            };
          }
          return {
            id: q.id,
            type: qType,
            text: q.text.trim(),
            correctAnswer: (q.correctAnswer || "").trim(),
            points: q.points ?? 1,
            ...(q.explanation?.trim() ? { explanation: q.explanation.trim() } : {}),
          };
        });

      if (b.title?.trim() && cleanedQuestions.length > 0) {
        rows.push({
          document_id,
          block_type: "quiz",
          title: b.title.trim(),
          description: b.description?.trim() || null,
          content: JSON.stringify(cleanedQuestions),
          position: i,
        });
      }
    }
  }

  if (rows.length > 0) {
    const { error: blockErr } = await supabase.from("document_blocks").insert(rows);
    if (blockErr) {
      console.warn("Lỗi lưu document_blocks cho tài liệu mới:", blockErr);
    }
  }

  return document_id;
}
