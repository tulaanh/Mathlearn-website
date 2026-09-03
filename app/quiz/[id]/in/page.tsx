import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDocumentById } from "@/lib/documents";
import { getQuizById } from "@/data/quizzes";
import type { StudyDocument } from "@/lib/document-types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function PrintSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse p-8" role="status" aria-label="Đang tải bản in">
      <div className="mb-6 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-5 rounded bg-slate-100 dark:bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}

// Import động để tách ExamPrintView khỏi chunk trang ban đầu.
const ExamPrintView = dynamic(() => import("@/components/ExamPrintView"), {
  loading: () => <PrintSkeleton />,
});

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ mode?: string; code?: string }>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function convertQuizToStudyDocument(quiz: NonNullable<ReturnType<typeof getQuizById>>): StudyDocument {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    grade: quiz.grade,
    documentType: "test",
    status: "published",
    createdBy: "system",
    topics: quiz.topicIds.map((tid) => ({ id: tid, name: tid, description: "" })),
    blocks: [
      {
        id: `block-${quiz.id}`,
        type: "quiz",
        title: "Phần trắc nghiệm",
        position: 0,
        questions: quiz.questions.map((q) => ({
          id: q.id,
          type: "multiple_choice",
          text: q.text,
          options: q.options,
          correctOptionId: q.correctOptionId,
          explanation: q.explanation,
        })),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function resolveTestDocument(id: string): Promise<StudyDocument | null> {
  if (UUID_RE.test(id) && isSupabaseConfigured()) {
    const doc = await getDocumentById(id);
    if (doc && doc.documentType === "test") return doc;
  }
  const legacyQuiz = getQuizById(id);
  if (legacyQuiz) return convertQuizToStudyDocument(legacyQuiz);
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const document = await resolveTestDocument(id);
  return { title: `Bản in: ${document?.title ?? "Bài kiểm tra"}` };
}

/** Trang bản in / xuất PDF dành riêng cho bài kiểm tra (chuẩn A4, đề thi môn Toán). */
export default async function QuizPrintPage({ params, searchParams }: Props) {
  const { id } = await params;
  const document = await resolveTestDocument(id);
  if (!document) notFound();

  // Nếu là tài liệu nháp (chưa xuất bản), yêu cầu đăng nhập
  if (document.status !== "published") {
    const { user } = await getCurrentUser();
    if (!user) redirect("/dang-nhap");
  }

  const query = searchParams ? await searchParams : undefined;
  const initialMode =
    query?.mode === "solution" || query?.mode === "answer_key_only" || query?.mode === "student"
      ? query.mode
      : undefined;
  const initialCode = query?.code || undefined;

  return (
    <ExamPrintView
      document={document}
      backUrl={`/quiz/${id}`}
      initialMode={initialMode}
      initialExamCode={initialCode}
    />
  );
}

