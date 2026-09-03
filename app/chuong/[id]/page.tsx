import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDataById } from "@/lib/chapters";
import ChapterDetailDynamic from "@/components/ChapterDetailDynamic";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const chapter = await getChapterDataById(id);

  if (!chapter) {
    return {
      title: "Không tìm thấy chương",
      description: "Chương học không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      alternates: { canonical: `/chuong/${id}` },
      openGraph: {
        title: "Không tìm thấy chương",
        description: "Chương học không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
        type: "website",
        siteName: "MathLearn",
      },
      twitter: {
        card: "summary",
        title: "Không tìm thấy chương",
        description: "Chương học không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      },
    };
  }

  const title = chapter.title;
  const description = getChapterDescription(chapter);

  return {
    title,
    description,
    alternates: { canonical: `/chuong/${id}` },
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

/** Mô tả SEO — dùng chung cho metadata và JSON-LD để tránh lệch nội dung. */
function getChapterDescription(chapter: { title: string; description: string | null; grade: string }): string {
  return (
    chapter.description?.trim() ||
    `Học tập và ôn luyện kiến thức ${chapter.title}${chapter.grade ? ` môn Toán ${chapter.grade}` : ""}. Đầy đủ tài liệu lý thuyết và bài tập trắc nghiệm kèm lời giải chi tiết.`
  );
}

export default async function ChapterPage({ params }: Props) {
  const { id } = await params;
  const chapter = await getChapterDataById(id);

  if (!chapter) notFound();

  const canonicalUrl = `${getSiteUrl()}/chuong/${id}`;
  // JSON-LD: Schema.org Course giúp Google hiểu đây là một khóa/chương học
  const courseJsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: chapter.title,
    description: getChapterDescription(chapter),
    url: canonicalUrl,
    inLanguage: "vi",
    ...(chapter.grade ? { educationalLevel: chapter.grade } : {}),
    coursePrerequisites: [],
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      inLanguage: "vi",
    },
    provider: {
      "@type": "Organization",
      name: "MathLearn",
      url: getSiteUrl(),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <ChapterDetailDynamic chapter={chapter} />
    </>
  );
}
