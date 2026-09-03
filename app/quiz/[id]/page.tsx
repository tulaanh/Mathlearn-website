import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getQuizById } from "@/data/quizzes";
import { getDocumentById } from "@/lib/documents";
import { getNavigationForTestDocument } from "@/lib/chapter-navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 600;

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ chuong?: string }>;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function RunnerSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse" role="status" aria-label="Đang tải bài kiểm tra">
      <span className="sr-only">Đang tải bài kiểm tra...</span>
      <div className="mb-4 h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="mb-6 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        ))}
      </div>
    </div>
  );
}

// Import động: mỗi lần chỉ 1 trong 2 runner được render,
// nên trình duyệt chỉ tải chunk của runner thực sự dùng.
const ExamRunner = dynamic(() => import("@/components/ExamRunner"), {
  loading: () => <RunnerSkeleton />,
});
const QuizRunner = dynamic(() => import("@/components/QuizRunner"), {
  loading: () => <RunnerSkeleton />,
});

async function findPublishedTest(id: string) {
  if (!UUID_RE.test(id) || !isSupabaseConfigured()) return null;
  const document = await getDocumentById(id);
  if (document?.status === "published" && document.documentType === "test") return document;
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const document = await findPublishedTest(id);

  if (document) {
    const title = document.title;
    const description =
      document.description?.trim() ||
      `Làm bài kiểm tra ${document.title}${document.grade ? ` ${document.grade}` : ""} trực tuyến trên MathLearn. Chấm điểm tự động và có đáp án chi tiết.`;
    return {
      title,
      description,
      alternates: { canonical: `/quiz/${id}` },
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

  const quiz = getQuizById(id);
  if (quiz) {
    const title = quiz.title;
    const description =
      quiz.description?.trim() ||
      `Làm bài kiểm tra trắc nghiệm ${quiz.title}${quiz.grade ? ` ${quiz.grade}` : ""} trên MathLearn với hệ thống chấm điểm tự động và giải thích chi tiết.`;
    return {
      title,
      description,
      alternates: { canonical: `/quiz/${id}` },
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

  return {
    title: "Không tìm thấy bài kiểm tra",
    description: "Bài kiểm tra không tồn tại hoặc chưa được xuất bản trên hệ thống MathLearn.",
    alternates: { canonical: `/quiz/${id}` },
    openGraph: {
      title: "Không tìm thấy bài kiểm tra",
      description: "Bài kiểm tra không tồn tại hoặc chưa được xuất bản trên hệ thống MathLearn.",
      type: "website",
      siteName: "MathLearn",
    },
    twitter: {
      card: "summary",
      title: "Không tìm thấy bài kiểm tra",
      description: "Bài kiểm tra không tồn tại hoặc chưa được xuất bản trên hệ thống MathLearn.",
    },
  };
}

/** JSON-LD: Schema.org Quiz giúp Google hiểu đây là một bài kiểm tra trắc nghiệm. */
function buildQuizJsonLd(
  id: string,
  quiz: { title: string; description: string; grade: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Quiz",
    name: quiz.title,
    description: quiz.description,
    url: `${getSiteUrl()}/quiz/${id}`,
    inLanguage: "vi",
    ...(quiz.grade ? { educationalLevel: quiz.grade } : {}),
    provider: {
      "@type": "Organization",
      name: "MathLearn",
      url: getSiteUrl(),
    },
  };
}

export default async function QuizPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { chuong } = await searchParams;
  // Tải song song bài test và gợi ý bài kế tiếp — hai truy vấn độc lập nhau
  const [document, nextStep] = await Promise.all([
    findPublishedTest(id),
    getNavigationForTestDocument(id, chuong),
  ]);
  if (document) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildQuizJsonLd(id, {
                title: document.title,
                description:
                  document.description?.trim() ||
                  `Làm bài kiểm tra ${document.title}${document.grade ? ` ${document.grade}` : ""} trực tuyến trên MathLearn. Chấm điểm tự động và có đáp án chi tiết.`,
                grade: document.grade,
              }),
            ),
          }}
        />
        <ExamRunner document={document} nextStep={nextStep} />
      </>
    );
  }

  const quiz = getQuizById(id);
  if (!quiz) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildQuizJsonLd(id, {
              title: quiz.title,
              description:
                quiz.description?.trim() ||
                `Làm bài kiểm tra trắc nghiệm ${quiz.title}${quiz.grade ? ` ${quiz.grade}` : ""} trên MathLearn với hệ thống chấm điểm tự động và giải thích chi tiết.`,
              grade: quiz.grade,
            }),
          ),
        }}
      />
      <QuizRunner quiz={quiz} />
    </>
  );
}
