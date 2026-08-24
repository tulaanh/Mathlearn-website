import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChapterDataById } from "@/lib/chapters";
import ChapterDetailDynamic from "@/components/ChapterDetailDynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const chapter = await getChapterDataById(id);
  return { title: chapter ? chapter.title : "Không tìm thấy chương" };
}

export default async function ChapterPage({ params }: Props) {
  const { id } = await params;
  const chapter = await getChapterDataById(id);

  if (!chapter) notFound();

  return <ChapterDetailDynamic chapter={chapter} />;
}
