import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getQuestionReports, getReportStats, REPORT_PAGE_SIZE } from "@/lib/reports";
import type { ReportErrorType, ReportStatus } from "@/lib/report-types";
import ReportManageList from "@/components/ReportManageList";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

export const metadata = {
  title: "Quản lý báo lỗi câu hỏi",
};

type Props = {
  searchParams: Promise<{
    status?: string;
    errorType?: string;
    q?: string;
    page?: string;
  }>;
};

export default async function ReportManagePage({ searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user, profile } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  if (profile?.role !== "teacher") redirect("/");

  const sp = await searchParams;
  const status = (sp.status ?? "all") as ReportStatus | "all";
  const errorType = (sp.errorType ?? "all") as ReportErrorType | "all";
  const search = sp.q ?? undefined;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [paged, stats] = await Promise.all([
    getQuestionReports(
      {
        status,
        errorType,
        search,
      },
      page,
      REPORT_PAGE_SIZE,
    ),
    getReportStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1380px]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              Quản trị
            </span>
            <span className="text-xs text-slate-400">Phản hồi người học</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Quản lý Báo lỗi câu hỏi
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tiếp nhận và xử lý phản hồi về lỗi giải sai, đề sai, thiếu đề, đề mở từ học sinh.
          </p>
        </div>
      </div>

      <ReportManageList
        reports={paged.items}
        total={paged.total}
        stats={stats}
        currentStatus={status}
        currentErrorType={errorType}
        currentSearch={search}
        currentPage={page}
      />
    </div>
  );
}
