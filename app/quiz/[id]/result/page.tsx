import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedTestMetaById } from "@/lib/documents";
import { getQuizById } from "@/data/quizzes";
import ExamResultView from "@/components/ExamResultView";
import ResultSummary from "@/components/ResultSummary";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Chỉ cần id + tiêu đề của đề: kết quả chi tiết học sinh nằm trong sessionStorage,
 *  không tải toàn bộ nội dung đề như trước. */
async function findTestDocument(id: string) {
  if (!UUID_RE.test(id)) return null;
  return getPublishedTestMetaById(id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const test = await findTestDocument(id);
  if (test) return { title: `Kết quả – ${test.title}` };
  return { title: `Kết quả – ${getQuizById(id)?.title ?? "Bài kiểm tra"}` };
}

export default async function QuizResultPage({ params }: Props) {
  const { id } = await params;

  // Bài kiểm tra trong Supabase: đọc kết quả tạm từ sessionStorage
  const test = await findTestDocument(id);
  if (test) return <ExamResultView documentId={test.id} title={test.title} />;

  // Fallback: bài test tĩnh trong data/quizzes.ts
  const legacyQuiz = getQuizById(id);
  if (!legacyQuiz) notFound();

  return <ResultSummary quiz={legacyQuiz} />;
}
