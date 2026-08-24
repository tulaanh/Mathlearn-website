import Link from "next/link";
import { getTopicsByIds } from "@/data/topics";
import type { Quiz } from "@/lib/types";

export default function QuizCard({ quiz, compact = false }: { quiz: Quiz; compact?: boolean }) {
  const quizTopics = getTopicsByIds(quiz.topicIds);

  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className={`group flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-slate-800/80 dark:bg-[#131b2e] dark:hover:border-indigo-500/60 ${compact ? "p-4" : "p-6"}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
          {quiz.subject}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {quiz.grade}
        </span>
      </div>

      <h2 className="mb-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
        {quiz.title}
      </h2>
      <p className="mb-3 line-clamp-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {quiz.description}
      </p>

      {quizTopics.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {quizTopics.map((topic) => (
            <span
              key={topic.id}
              className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300"
            >
              {topic.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">📝 {quiz.questions.length} câu hỏi</span>
        <span className="font-semibold text-indigo-600 group-hover:underline dark:text-indigo-400">
          Làm bài →
        </span>
      </div>
    </Link>
  );
}
