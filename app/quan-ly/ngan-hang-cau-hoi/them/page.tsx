import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import BankQuestionForm from "@/components/BankQuestionForm";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Thêm câu hỏi" };

export default async function AddBankQuestionPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/quiz");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-sm font-medium text-indigo-600">NGÂN HÀNG CÂU HỎI</p>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Thêm câu hỏi mới</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Link href="/quan-ly/ngan-hang-cau-hoi" className="mb-4 inline-block text-sm font-semibold text-indigo-600">← Quay lại ngân hàng</Link>
        <BankQuestionForm />
      </div>
    </div>
  );
}
