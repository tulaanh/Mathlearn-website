import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getBankOverview, getBankQuestions, BANK_PAGE_SIZE } from "@/lib/question-bank";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { QuestionType } from "@/lib/document-types";
import { DIFFICULTY_META } from "@/lib/question-bank-types";
import { topics as allTopics } from "@/data/topics";
import BankQuestionList from "@/components/BankQuestionList";
import BankJsonTools from "@/components/BankJsonTools";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Ngân hàng câu hỏi" };

type Props = {
  searchParams: Promise<{
    q?: string;
    grade?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    page?: string;
  }>;
};

export default async function QuestionBankPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/quiz");

  const sp = await searchParams;
  const difficulty = DIFFICULTY_META.some((d) => d.id === sp.difficulty)
    ? (sp.difficulty as QuestionDifficulty)
    : "";
  const type = ["multiple_choice", "true_false", "short_answer", "essay"].includes(sp.type ?? "")
    ? (sp.type as QuestionType)
    : "";

  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [questionsPage, overview] = await Promise.all([
    getBankQuestions(
      {
        search: sp.q,
        grade: sp.grade,
        topicId: sp.topic,
        difficulty,
        type,
      },
      page,
    ),
    getBankOverview(),
  ]);
  const { stats, grades } = overview;
  const questions = questionsPage.items;

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">KHU VỰC GIÁO VIÊN</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">Ngân hàng câu hỏi</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Kho câu hỏi phân theo mức độ khó: nhận biết – thông hiểu – vận dụng – vận dụng cao. Ghép đề thủ công hoặc sinh đề tự động theo ma trận.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/quan-ly/ngan-hang-cau-hoi/khoanh-vung" className="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40">✂️ Khoanh vùng PDF</Link>
          <Link href="/quan-ly/ngan-hang-cau-hoi/sinh-de" className="rounded-xl border border-indigo-300 px-5 py-3 text-sm font-bold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/40">⚙ Sinh đề theo ma trận</Link>
          <Link href="/quan-ly/ngan-hang-cau-hoi/them" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700">+ Thêm câu hỏi</Link>
        </div>
      </div>

      {/* Thống kê theo mức độ */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tổng số câu</p>
        </div>
        {DIFFICULTY_META.map((meta) => (
          <div key={meta.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>{meta.short}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">{stats.byDifficulty[meta.id]}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{meta.label}</p>
          </div>
        ))}
      </div>

      <BankQuestionList questions={questions} grades={grades} topics={allTopics} />

      <Pagination
        basePath="/quan-ly/ngan-hang-cau-hoi"
        params={{ q: sp.q, grade: sp.grade, topic: sp.topic, difficulty: sp.difficulty, type: sp.type }}
        page={page}
        total={questionsPage.total}
        pageSize={BANK_PAGE_SIZE}
      />

      <div className="mt-6">
        <BankJsonTools />
      </div>
    </div>
  );
}
