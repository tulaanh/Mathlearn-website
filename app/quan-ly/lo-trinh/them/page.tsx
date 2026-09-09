import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getTeacherChapters } from "@/lib/chapters";
import { getAllTeacherDocumentCards } from "@/lib/documents";
import { quizzes } from "@/data/quizzes";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import PathEditor from "@/components/PathEditor";

export const metadata = { title: "Tạo lộ trình mới" };

export default async function AddPathPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/lo-trinh");

  const [chapters, documents] = await Promise.all([
    getTeacherChapters(),
    getAllTeacherDocumentCards(),
  ]);

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

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-7">
        <Link
          href="/quan-ly/lo-trinh"
          className="mb-3 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← Quay lại quản lý lộ trình
        </Link>
        <p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
          Tạo lộ trình mới
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Bạn có thể nhập thông tin lộ trình và tạo các chương (kèm tài liệu) trực tiếp ngay tại đây.
        </p>
      </div>
      <PathEditor
        availableChapters={chapters}
        documents={docList}
        quizzes={quizList}
      />
    </div>
  );
}
