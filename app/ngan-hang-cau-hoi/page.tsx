import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getBankOverview, getBankQuestions, BANK_PAGE_SIZE } from "@/lib/question-bank";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { QuestionType } from "@/lib/document-types";
import { DIFFICULTY_META } from "@/lib/question-bank-types";
import { topics as allTopics } from "@/data/topics";
import StudentBankQuestionList from "@/components/StudentBankQuestionList";
import Pagination from "@/components/Pagination";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = { title: "Ngân hàng câu hỏi" };

type Props = {
  searchParams: Promise<{
    tab?: string;
    q?: string;
    grade?: string;
    topic?: string;
    difficulty?: string;
    type?: string;
    page?: string;
  }>;
};

export default async function StudentQuestionBankPage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-4xl">
        <SupabaseConfigNotice />
      </div>
    );
  }

  const { user, profile } = await getCurrentUser();
  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto mb-4 text-5xl">🏦</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cần đăng nhập</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Hãy đăng nhập tài khoản để tra cứu và luyện tập với ngân hàng câu hỏi.
        </p>
        <Link
          href="/dang-nhap"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-700"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const sp = await searchParams;
  const isSavedTab = sp.tab === "saved";
  const difficulty = DIFFICULTY_META.some((d) => d.id === sp.difficulty)
    ? (sp.difficulty as QuestionDifficulty)
    : "";
  const type = ["multiple_choice", "true_false", "short_answer", "essay"].includes(sp.type ?? "")
    ? (sp.type as QuestionType)
    : "";

  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);
  const [questionsPage, overview] = await Promise.all([
    isSavedTab
      ? Promise.resolve({ items: [], total: 0 })
      : getBankQuestions(
          {
            search: sp.q,
            grade: sp.grade,
            topicId: sp.topic,
            difficulty,
            type,
          },
          page,
          BANK_PAGE_SIZE,
        ),
    getBankOverview(),
  ]);
  const { stats, grades } = overview;

  const questions = questionsPage.items;
  const isTeacher = profile?.role === "teacher";

  return (
    <div className="mx-auto max-w-[1380px]">
      {/* Header trang */}
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-indigo-600">KHO TÀI NGUYÊN HỌC TẬP</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Ngân hàng câu hỏi
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Tra cứu và ôn luyện câu hỏi theo từng khối lớp, chủ đề và mức độ nhận thức (Nhận biết – Thông hiểu – Vận dụng – Vận dụng cao).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isTeacher && (
            <Link
              href="/quan-ly/ngan-hang-cau-hoi"
              className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-4 py-2.5 text-xs font-bold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
            >
              ⚙️ Quản lý ngân hàng câu hỏi →
            </Link>
          )}
          <Link href="/" className="text-sm font-bold text-indigo-600 hover:underline">
            ← Về tổng quan
          </Link>
        </div>
      </div>

      {/* Thống kê theo mức độ */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-[#131b2e]">
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Tổng số câu
          </p>
        </div>
        {DIFFICULTY_META.map((meta) => (
          <div
            key={meta.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-2xs dark:border-slate-800 dark:bg-[#131b2e]"
          >
            <p className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${meta.badgeClass}`}>
              {meta.short}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {stats.byDifficulty[meta.id]}
            </p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{meta.label}</p>
          </div>
        ))}
      </div>

      {/* Danh sách câu hỏi */}
      <StudentBankQuestionList
        questions={questions}
        grades={grades}
        topics={allTopics}
        page={page}
        pageSize={BANK_PAGE_SIZE}
        totalAll={stats.total}
      />

      {/* Phân trang (chỉ hiện ở tab tất cả) */}
      {!isSavedTab && (
        <Pagination
          basePath="/ngan-hang-cau-hoi"
          params={{
            q: sp.q,
            grade: sp.grade,
            topic: sp.topic,
            difficulty: sp.difficulty,
            type: sp.type,
          }}
          page={page}
          total={questionsPage.total}
          pageSize={BANK_PAGE_SIZE}
        />
      )}
    </div>
  );
}
