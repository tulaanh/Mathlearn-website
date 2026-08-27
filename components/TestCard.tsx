import Link from "next/link";
import type { DocumentCardData } from "@/lib/documents";
import TestCardStatus from "./TestCardStatus";

/** Thẻ bài kiểm tra (tài liệu có document_type = 'test') hiển thị tại /quiz. */
export default function TestCard({ card }: { card: DocumentCardData }) {
  return (
    <Link
      href={`/quiz/${card.id}`}
      className="group flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:-translate-y-1 hover:border-purple-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e] dark:hover:border-purple-500/60"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950/70 dark:text-purple-300">📝 Bài kiểm tra</span>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">Toán</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{card.grade}</span>
        </div>
        <TestCardStatus documentId={card.id} />
      </div>
      <h2 className="text-lg font-bold leading-snug text-slate-900 group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">{card.title}</h2>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {card.description || "Bài kiểm tra môn Toán có chấm điểm tự động."}
      </p>
      {card.topics.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {card.topics.map((topic) => (
            <span key={topic.id} className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300">
              {topic.name}
            </span>
          ))}
        </div>
      )}
      <div className="mt-5 flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">🧩 {card.questionCount} câu hỏi</span>
        <span className="font-semibold text-purple-600 group-hover:underline dark:text-purple-400">Làm bài →</span>
      </div>
    </Link>
  );
}
