import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDocumentById } from "@/lib/documents";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import DocumentPrintView from "@/components/DocumentPrintView";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

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
  return <DocumentPrintView document={document} />;
}
