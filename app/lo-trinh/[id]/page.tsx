import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearningPathById } from "@/lib/learning-paths";
import ChapterCardDynamic from "@/components/ChapterCardDynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const path = await getLearningPathById(id);

  if (!path) {
    return {
      title: "Không tìm thấy lộ trình",
      description: "Lộ trình học tập không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      openGraph: {
        title: "Không tìm thấy lộ trình",
        description: "Lộ trình học tập không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
        type: "website",
        siteName: "MathLearn",
      },
      twitter: {
        card: "summary",
        title: "Không tìm thấy lộ trình",
        description: "Lộ trình học tập không tồn tại hoặc đã bị xóa trên hệ thống MathLearn.",
      },
    };
  }

  const title = path.title;
  const description =
    path.description?.trim() ||
    `Khám phá lộ trình học tập ${path.title}${path.grade ? ` ${path.grade}` : ""} với hệ thống chương học, bài giảng và bài tập được sắp xếp bài bản.`;

  return {
    title,
    description,
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

export default async function LearningPathPage({ params }: Props) {
  const { id } = await params;
  const path = await getLearningPathById(id);

  if (!path) notFound();

  return (
    <div className="mx-auto max-w-[1380px]">
      <Link
        href="/lo-trinh"
        className="mb-3 inline-block text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        ← Về danh sách lộ trình
      </Link>

      {/* Thông tin lộ trình */}
      <div className="mb-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-[#131b2e]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
            {path.subject}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {path.grade}
          </span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">🧭 {path.title}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {path.description || "Chưa có mô tả."}
        </p>
      </div>

      {/* Danh sách chương trong lộ trình */}
      <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
        📚 Các chương ({path.chapters.length})
      </h2>
      {path.chapters.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700 bg-white dark:bg-[#131b2e]">
          <div className="mx-auto mb-4 text-5xl">📚</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Lộ trình này chưa có chương nào. Nội dung sẽ xuất hiện khi giáo viên thêm chương.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {path.chapters.map((chapter) => (
            <ChapterCardDynamic key={chapter.id} chapter={chapter} />
          ))}
        </div>
      )}
    </div>
  );
}
