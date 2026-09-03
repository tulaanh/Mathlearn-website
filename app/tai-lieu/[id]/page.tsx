import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getDocumentById } from "@/lib/documents";
import { getNavigationForDocument } from "@/lib/chapter-navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import DocumentViewer from "@/components/DocumentViewer";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chuong?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // getDocumentById được bọc cache() nên metadata và trang dùng chung một lần tải
  const document = await getDocumentById(id);

  if (!document) {
    return {
      title: "Không tìm thấy tài liệu",
      description: "Tài liệu không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      alternates: { canonical: `/tai-lieu/${id}` },
      openGraph: {
        title: "Không tìm thấy tài liệu",
        description: "Tài liệu không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
        type: "website",
        siteName: "MathLearn",
      },
      twitter: {
        card: "summary",
        title: "Không tìm thấy tài liệu",
        description: "Tài liệu không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      },
    };
  }

  const title = document.title;
  const description =
    document.description?.trim() ||
    `Đọc và học tài liệu ${document.title}${document.grade ? ` môn Toán ${document.grade}` : ""}. Tài liệu chi tiết kèm bài tập thực hành.`;

  return {
    title,
    description,
    alternates: { canonical: `/tai-lieu/${id}` },
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "MathLearn",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function DocumentPage({ params, searchParams }: Props) {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;
  const { id } = await params;
  const { chuong } = await searchParams;
  // Chạy song song 3 luồng độc lập: xác thực, tải tài liệu, định vị chương.
  // Middleware đã chắn user chưa đăng nhập trước khi vào trang nên không lo tải thừa.
  const [{ user, profile }, document, navigation] = await Promise.all([
    getCurrentUser(),
    getDocumentById(id),
    getNavigationForDocument(id, chuong),
  ]);
  if (!user) redirect("/dang-nhap");
  if (!document) notFound();
  const isTeacher = profile?.role === "teacher";
  return (
    <>
      <Link
        href={navigation ? `/chuong/${navigation.chapterId}` : isTeacher ? "/tai-lieu" : "/lo-trinh"}
        className="mx-auto mb-4 block max-w-3xl text-sm font-semibold text-indigo-600 hover:underline"
      >
        {navigation
          ? `← Về chương ${navigation.chapterTitle}`
          : isTeacher
            ? "← Về thư viện tài liệu"
            : "← Về lộ trình học"}
      </Link>
      <DocumentViewer document={document} navigation={navigation} />
    </>
  );
}
