import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getChapterDataById } from "@/lib/chapters";
import { getAllTeacherDocumentCards } from "@/lib/documents";
import { getTeacherLearningPaths } from "@/lib/learning-paths";
import { quizzes } from "@/data/quizzes";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import ChapterEditor from "@/components/ChapterEditor";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const chapter = await getChapterDataById(id);
  return { title: chapter ? `Sửa: ${chapter.title}` : "Không tìm thấy chương" };
}

export default async function EditChapterPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const { id } = await params;
  const chapter = await getChapterDataById(id);
  if (!chapter) notFound();

  const documents = await getAllTeacherDocumentCards();
  const paths = await getTeacherLearningPaths();
  const docList = documents.map((d) => ({
    id: d.id,
    title: d.title,
    documentType: d.documentType,
    grade: d.grade,
  }));
  const quizList = quizzes.map((q) => ({
    id: q.id,
    title: q.title,
    grade: q.grade,
  }));
  const pathList = paths.map((p) => ({ id: p.id, title: p.title }));

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <Link
          href="/quan-ly/chuong"
          className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Quay lại quản lý
        </Link>
        <p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Sửa chương học
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Cập nhật tiêu đề, mô tả hoặc sắp xếp các nội dung bên trong chương học.
        </p>
      </div>
      <ChapterEditor initialData={chapter} documents={docList} quizzes={quizList} paths={pathList} />
    </div>
  );
}
