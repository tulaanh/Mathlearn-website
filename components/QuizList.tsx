"use client";

import { useState } from "react";
import { topics } from "@/data/topics";
import { quizzes } from "@/data/quizzes";
import QuizCard from "./QuizCard";

export default function QuizList() {
  const [activeTopic, setActiveTopic] = useState("Tất cả");

  const filtered =
    activeTopic === "Tất cả"
      ? quizzes
      : quizzes.filter((quiz) => quiz.topicIds.includes(activeTopic));

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Lọc bài kiểm tra theo chủ đề
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Một bài kiểm tra có thể xuất hiện ở nhiều chủ đề.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ id: "Tất cả", name: "Tất cả" }, ...topics].map((topic) => (
          <button
            key={topic.id}
            onClick={() => setActiveTopic(topic.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              activeTopic === topic.id
                ? "bg-indigo-600 text-white shadow"
                : "border border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
            }`}
          >
            {topic.name}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-slate-500">
          Chưa có bài kiểm tra nào trong chủ đề này.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
