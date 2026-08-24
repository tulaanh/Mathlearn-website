import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getQuizById } from "@/data/quizzes";
import QuizRunner from "@/components/QuizRunner";
import ExamRunner from "@/components/ExamRunner";
import { getDocumentById } from "@/lib/documents";
import { getNavigationForTestDocument } from "@/lib/chapter-navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chuong?: string }>;
};

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function findPublishedTest(id: string) {
  if (!UUID_RE.test(id) || !isSupabaseConfigured()) return null;
  const document = await getDocumentById(id);
  if (document?.status === "published" && document.documentType === "test") return document;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const document = await findPublishedTest(id);
  if (document) return { title: document.title };
  const quiz = getQuizById(id);
  return { title: quiz ? quiz.title : "Không tìm thấy bài kiểm tra" };
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { chuong } = await searchParams;
  // Tải song song bài test và gợi ý bài kế tiếp — hai truy vấn độc lập nhau
  const [document, nextStep] = await Promise.all([
    findPublishedTest(id),
    getNavigationForTestDocument(id, chuong),
  ]);
  if (document) return <ExamRunner document={document} nextStep={nextStep} />;

  const quiz = getQuizById(id);
  if (!quiz) notFound();
  return <QuizRunner quiz={quiz} />;
}
