import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getBankGrades } from "@/lib/question-bank";
import { topics as allTopics } from "@/data/topics";
import ExamMatrixGenerator from "@/components/ExamMatrixGenerator";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Sinh đề theo ma trận" };

export default async function GenerateExamPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/quiz");

  const grades = await getBankGrades();

  return (
    <div className="mx-auto max-w-4xl">
      <p className="mb-2 text-sm font-medium text-indigo-600">NGÂN HÀNG CÂU HỎI</p>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sinh đề theo ma trận</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Nhập số câu hỏi cho từng mức độ khó, hệ thống chọn ngẫu nhiên từ ngân hàng và lưu thành bài kiểm tra nháp.
      </p>
      <Link href="/quan-ly/ngan-hang-cau-hoi" className="mb-5 inline-block text-sm font-semibold text-indigo-600">← Quay lại ngân hàng</Link>
      <ExamMatrixGenerator grades={grades} topics={allTopics} />
    </div>
  );
}
