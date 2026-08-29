"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EventAttempt, EventSubmitResult, PublicEventQuestion } from "@/lib/event-types";
import { getDifficultyMeta } from "@/lib/question-bank-types";
import LazyMathText from "./LazyMathText";

const labels = ["A", "B", "C", "D", "E", "F"];

type Props = { eventId: string; activityId: string; activityTitle: string };

function formatRemaining(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function Result({ eventId, result }: { eventId: string; result: EventSubmitResult }) {
  return <div className="mx-auto max-w-2xl rounded-3xl border border-violet-200 bg-white p-8 text-center shadow-sm dark:border-violet-900/50 dark:bg-[#131b2e]"><p className="text-6xl">{result.bossDefeated ? "🏆" : result.damage > 0 ? "💥" : "📖"}</p><h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-white">{result.bossDefeated ? "Boss đã bị đánh bại!" : "Đã hoàn thành hoạt động"}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{result.expired ? "Lượt làm bài đã hết giờ." : `Bạn trả lời đúng ${result.correctCount}/${result.totalQuestions} câu.`}</p><div className="my-7 flex justify-center gap-3"><div className="rounded-2xl bg-orange-50 px-6 py-4 dark:bg-orange-950/30"><strong className="block text-4xl font-extrabold text-orange-600 dark:text-orange-400">🔥 {result.damage}</strong><span className="text-xs font-semibold text-slate-500">sát thương gây ra</span></div>{result.bossMaxHp !== null && <div className="rounded-2xl bg-rose-50 px-6 py-4 dark:bg-rose-950/30"><strong className="block text-4xl font-extrabold text-rose-600 dark:text-rose-400">{result.bossCurrentHp}</strong><span className="text-xs font-semibold text-slate-500">HP boss còn lại</span></div>}</div><Link href={`/su-kien/${eventId}`} className="inline-block rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700">← Về trang sự kiện</Link></div>;
}

function Question({ question, index, answers, onAnswer }: { question: PublicEventQuestion; index: number; answers: Record<string, string>; onAnswer: (key: string, value: string) => void }) {
  const meta = getDifficultyMeta(question.difficulty);
  const type = question.type ?? "multiple_choice";
  const answer = answers[question.id] ?? "";
  return <fieldset className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><legend className="sr-only">Câu {index + 1}</legend><div className="mb-4 flex flex-wrap items-start justify-between gap-2"><p className="font-semibold text-slate-900 dark:text-white"><span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white">{index + 1}</span><LazyMathText text={question.text} inline /></p><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${meta.badgeClass}`}>{meta.short} · 🔥 {question.damage}</span></div>{type === "multiple_choice" && <div className="grid gap-2.5">{(question.options ?? []).map((option, i) => <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm ${answer === option.id ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30" : "border-slate-200 dark:border-slate-800"}`}><input type="radio" name={question.id} checked={answer === option.id} onChange={() => onAnswer(question.id, option.id)} className="accent-violet-600" /><span className="font-bold text-slate-500">{labels[i]}.</span><LazyMathText text={option.text} inline /></label>)}</div>}{type === "true_false" && <div className="grid gap-2.5">{(question.statements ?? question.options ?? []).map((statement) => { const value = answers[`${question.id}:${statement.id}`] ?? ""; return <div key={statement.id} className="flex flex-col gap-2 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between"><LazyMathText text={statement.text} inline /><div className="flex gap-2"><button type="button" onClick={() => onAnswer(`${question.id}:${statement.id}`, "true")} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${value === "true" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Đúng</button><button type="button" onClick={() => onAnswer(`${question.id}:${statement.id}`, "false")} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${value === "false" ? "bg-rose-600 text-white" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>Sai</button></div></div>; })}</div>}{type === "short_answer" && <input value={answer} onChange={(event) => onAnswer(question.id, event.target.value)} placeholder="Nhập đáp án của bạn" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />}{type === "essay" && <textarea value={answer} onChange={(event) => onAnswer(question.id, event.target.value)} rows={4} placeholder="Nhập lời giải của bạn" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />}</fieldset>;
}

export default function EventActivityRunner({ eventId, activityId, activityTitle }: Props) {
  const [attempt, setAttempt] = useState<EventAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<EventSubmitResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    fetch(`/api/events/${activityId}/start`, { method: "POST" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Không thể bắt đầu hoạt động.");
        setAttempt(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể bắt đầu hoạt động."))
      .finally(() => setLoading(false));
  }, [activityId]);

  useEffect(() => {
    if (!attempt || result) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [attempt, result]);

  const remaining = attempt ? new Date(attempt.expiresAt).getTime() - now : 0;
  const answered = useMemo(() => {
    let count = 0;
    Object.values(answers).forEach((value) => {
      if (typeof value === "string" && value.trim()) count++;
    });
    return count;
  }, [answers]);

  useEffect(() => {
    if (attempt && remaining <= 0 && !result && !submitting) void submit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, attempt, result, submitting]);

  async function submit(auto = false) {
    if (!attempt || submitting || result) return;
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/events/${activityId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Không thể nộp bài.");
      setResult(data);
      if (auto && !data.expired) setError("Hết giờ — hệ thống đã tự động nộp bài.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể nộp bài.");
    } finally { setSubmitting(false); }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-[#131b2e]">Đang chuẩn bị đề…</div>;
  if (error && !attempt) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center dark:border-rose-900/50 dark:bg-rose-950/20"><p className="text-sm font-semibold text-rose-700 dark:text-rose-300">{error}</p><Link href={`/su-kien/${eventId}`} className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white">← Quay lại sự kiện</Link></div>;
  if (!attempt) return null;

  if (result) return <Result eventId={eventId} result={result} />;

  return <div className="mx-auto max-w-4xl"><div className="sticky top-[88px] z-10 mb-5 flex items-center justify-between gap-3 rounded-2xl border border-violet-200 bg-white/95 p-4 shadow-sm backdrop-blur dark:border-violet-900/50 dark:bg-[#131b2e]/95"><div><p className="text-xs font-bold uppercase tracking-wide text-violet-600">⚔️ Hoạt động</p><h1 className="text-lg font-extrabold text-slate-900 dark:text-white">{activityTitle}</h1></div><div className={`rounded-xl px-4 py-2 text-lg font-extrabold tabular-nums ${remaining < 60000 ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300"}`}>⏱️ {formatRemaining(remaining)}</div></div><div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400"><span>Đã trả lời <strong className="text-violet-600">{answered}/{attempt.questions.length}</strong></span><Link href={`/su-kien/${eventId}`} className="font-bold text-indigo-600 hover:underline">Thoát hoạt động</Link></div><div className="space-y-4">{attempt.questions.map((question, index) => <Question key={question.id} question={question} index={index} answers={answers} onAnswer={(key, value) => setAnswers((current) => ({ ...current, [key]: value }))} />)}</div>{error && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">{error}</p>}<button type="button" disabled={submitting} onClick={() => void submit()} className="mt-6 w-full rounded-xl bg-violet-600 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-violet-500/20 hover:bg-violet-700 disabled:opacity-60">{submitting ? "Đang chấm bài…" : "✅ Nộp bài & gây sát thương"}</button></div>;
}
