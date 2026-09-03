import dynamic from "next/dynamic";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDocumentById } from "@/lib/documents";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

function PrintSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse p-8" role="status" aria-label="Đang tải bản in">
      <div className="mb-6 h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-5 rounded bg-slate-100 dark:bg-slate-800/60" />
        ))}
      </div>
    </div>
  );
}

// Import động: mỗi lần chỉ render 1 trong 2 view theo loại tài liệu,
// tránh kéo cả ExamPrintView (752 dòng) lẫn DocumentPrintView vào cùng một chunk.
const DocumentPrintView = dynamic(() => import("@/components/DocumentPrintView"), {
  loading: () => <PrintSkeleton />,
});
const ExamPrintView = dynamic(() => import("@/components/ExamPrintView"), {
  loading: () => <PrintSkeleton />,
});

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  // getDocumentById được bọc cache() nên metadata và trang dùng chung một lần tải
  const document = await getDocumentById(id);
  return { title: `Bản in: ${document?.title ?? "Tài liệu"}` };
}

/** Trang bản in / xuất PDF: trình bày chuẩn A4, in qua hộp thoại của trình duyệt. */
export default async function DocumentPrintPage({ params }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { user } = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  const { id } = await params;
  const document = await getDocumentById(id);
  if (!document) notFound();

  if (document.documentType === "test") {
    return <ExamPrintView document={document} backUrl={`/tai-lieu/${id}`} />;
  }

  return <DocumentPrintView document={document} />;
}

