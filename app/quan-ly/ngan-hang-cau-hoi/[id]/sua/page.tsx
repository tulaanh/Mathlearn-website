import dynamic from "next/dynamic";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getBankQuestionById } from "@/lib/question-bank";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

const BankQuestionForm = dynamic(() => import("@/components/BankQuestionForm"), {
  loading: () => <div className="mx-auto max-w-4xl animate-pulse"><div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div>,
});

export const metadata = { title: "Sửa câu hỏi" };

type Props = { params: Promise<{ id: string }> };

export default async function EditBankQuestionPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/quiz");

  const { id } = await params;
  const question = await getBankQuestionById(id);
  if (!question) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-sm font-medium text-indigo-600">NGÂN HÀNG CÂU HỎI</p>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Sửa câu hỏi</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Link href="/quan-ly/ngan-hang-cau-hoi" className="mb-4 inline-block text-sm font-semibold text-indigo-600">← Quay lại ngân hàng</Link>
        <BankQuestionForm initial={question} />
      </div>
    </div>
  );
}
