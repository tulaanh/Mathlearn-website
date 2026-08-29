"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { BankQuestion, ExamMatrix } from "@/lib/question-bank-types";
import { DIFFICULTY_META } from "@/lib/question-bank-types";
import type { EventType } from "@/lib/event-types";
import { EVENT_TYPE_META } from "@/lib/event-types";
import EventQuestionSelector from "./EventQuestionSelector";

const grades = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"];
function iso(value: string) { return new Date(value).toISOString(); }
function localDate(value: Date) { const offset = value.getTimezoneOffset(); return new Date(value.getTime() - offset * 60000).toISOString().slice(0, 16); }

type DamageValues = Record<"nhan_biet" | "thong_hieu" | "van_dung" | "van_dung_cao", string>;

export default function EventAdminForm() {
  const router = useRouter();
  const [title, setTitle] = useState(""); const [description, setDescription] = useState(""); const [grade, setGrade] = useState("Lớp 8");
  const [eventType, setEventType] = useState<EventType>("boss_battle");
  const [startAt, setStartAt] = useState(() => localDate(new Date())); const [endAt, setEndAt] = useState(() => localDate(new Date(Date.now() + 7 * 86400000)));
  const [bossName, setBossName] = useState("Ma Vương Đại Số"); const [bossHp, setBossHp] = useState("1000");
  const [activityTitle, setActivityTitle] = useState("Thử thách khởi đầu"); const [timeLimit, setTimeLimit] = useState("10"); const [maxAttempts, setMaxAttempts] = useState("3");
  const [damage, setDamage] = useState<DamageValues>({ nhan_biet: "10", thong_hieu: "20", van_dung: "35", van_dung_cao: "50" });
  const [questionTopicIds, setQuestionTopicIds] = useState<string[]>([]);
  const [questionMatrix, setQuestionMatrix] = useState<ExamMatrix>({ nhan_biet: 5, thong_hieu: 5, van_dung: 3, van_dung_cao: 2 });
  const [questions, setQuestions] = useState<BankQuestion[]>([]); const [saving, setSaving] = useState(false); const [error, setError] = useState("");

  async function save(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (eventType !== "boss_battle") return setError("Loại sự kiện này chưa có bộ chấm điểm và giao diện hoạt động. Vui lòng chọn Đánh boss ở phase hiện tại.");
    if (!title.trim() || !bossName.trim() || !activityTitle.trim()) return setError("Vui lòng nhập tên sự kiện, boss và hoạt động.");
    const requestedQuestionCount = Object.values(questionMatrix).reduce((sum, count) => sum + count, 0);
    if (!questionTopicIds.length) return setError("Hãy chọn ít nhất một chủ đề câu hỏi.");
    if (!requestedQuestionCount) return setError("Hãy chọn ít nhất một câu hỏi theo ma trận độ khó.");
    if (!questions.length) return setError("Hãy bấm chọn câu hỏi từ ngân hàng trước khi lưu.");
    const missingDifficulty = DIFFICULTY_META.find((meta) => questions.filter((question) => question.difficulty === meta.id).length !== questionMatrix[meta.id]);
    if (missingDifficulty) return setError(`Số câu ${missingDifficulty.label} chưa đúng ma trận. Hãy chọn lại câu hỏi từ ngân hàng.`);
    const supabase = createClient(); if (!supabase) return setError("Website chưa được cấu hình Supabase."); setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser(); if (!user) throw new Error("Phiên đăng nhập đã hết hạn.");
      const eventRes = await supabase.from("events").insert({ title: title.trim(), description: description.trim() || null, grade, status: "draft", event_type: eventType, scoring_config: { metric: "damage", aggregation: "sum", higherIsBetter: true }, display_config: { icon: EVENT_TYPE_META[eventType].icon }, start_at: iso(startAt), end_at: iso(endAt), created_by: user.id }).select("id").single();
      if (eventRes.error || !eventRes.data) throw eventRes.error ?? new Error("Không thể tạo sự kiện.");
      const hp = Math.max(1, Number(bossHp) || 1000);
      const bossRes = await supabase.from("event_bosses").insert({ event_id: eventRes.data.id, name: bossName.trim(), emoji: "👾", max_hp: hp, current_hp: hp, position: 0 }).select("id").single();
      if (bossRes.error || !bossRes.data) throw bossRes.error ?? new Error("Không thể tạo boss.");
      const activityRes = await supabase.from("event_activities").insert({ event_id: eventRes.data.id, boss_id: bossRes.data.id, title: activityTitle.trim(), position: 0, time_limit_seconds: Math.max(30, (Number(timeLimit) || 10) * 60), max_attempts: Math.max(0, Number(maxAttempts) || 0), question_count: questions.length, scoring_config: { topicIds: questionTopicIds, matrix: questionMatrix }, damage_config: Object.fromEntries(Object.entries(damage).map(([key, value]) => [key, Math.max(0, Number(value) || 0)])) }).select("id").single();
      if (activityRes.error || !activityRes.data) throw activityRes.error ?? new Error("Không thể tạo hoạt động.");
      const rows = questions.map((question, position) => ({ activity_id: activityRes.data.id, question_id: question.id, difficulty: question.difficulty, question_data: question, position }));
      const questionRes = await supabase.from("event_activity_questions").insert(rows); if (questionRes.error) throw questionRes.error;
      router.push("/quan-ly/su-kien"); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể lưu sự kiện."); setSaving(false); }
  }

  return <form onSubmit={save} className="space-y-6">
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><h2 className="mb-4 text-lg font-bold dark:text-white">Thông tin sự kiện</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Tên sự kiện *" value={title} onChange={setTitle} /><Field label="Khối lớp" value={grade} onChange={(value) => { setGrade(value); setQuestions([]); }} options={grades} /><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Loại sự kiện</span><select value={eventType} onChange={(event) => setEventType(event.target.value as EventType)} className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">{(Object.entries(EVENT_TYPE_META) as [EventType, (typeof EVENT_TYPE_META)[EventType]][]).map(([type, meta]) => <option key={type} value={type} disabled={!meta.supported}>{meta.icon} {meta.label}{meta.supported ? "" : " — sắp hỗ trợ"}</option>)}</select><span className="mt-1.5 block text-xs text-slate-500 dark:text-slate-400">{EVENT_TYPE_META[eventType].description} Loại mới sẽ được bật sau khi hoàn tất handler server.</span></label><Field label="Mô tả" value={description} onChange={setDescription} /><Field label="Bắt đầu" type="datetime-local" value={startAt} onChange={setStartAt} /><Field label="Kết thúc" type="datetime-local" value={endAt} onChange={setEndAt} /></div></section>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><h2 className="mb-4 text-lg font-bold dark:text-white">Mục tiêu đánh boss</h2><div className="grid gap-4 sm:grid-cols-2"><Field label="Tên boss *" value={bossName} onChange={setBossName} /><Field label="HP boss" type="number" value={bossHp} onChange={setBossHp} /></div></section>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><h2 className="mb-4 text-lg font-bold dark:text-white">Hoạt động đầu tiên</h2><div className="grid gap-4 sm:grid-cols-3"><Field label="Tên hoạt động *" value={activityTitle} onChange={setActivityTitle} /><Field label="Thời gian mỗi lượt (phút)" type="number" value={timeLimit} onChange={setTimeLimit} /><Field label="Số lượt tối đa (0 = không giới hạn)" type="number" value={maxAttempts} onChange={setMaxAttempts} /></div><div className="mt-5 grid gap-3 sm:grid-cols-4">{DIFFICULTY_META.map((meta) => <Field key={meta.id} label={`Sát thương ${meta.label}`} type="number" value={damage[meta.id]} onChange={(value) => setDamage((current) => ({ ...current, [meta.id]: value }))} />)}</div></section>
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800/80 dark:bg-[#131b2e]"><h2 className="text-lg font-bold dark:text-white">Câu hỏi hoạt động</h2><EventQuestionSelector grade={grade} selected={questions} topicIds={questionTopicIds} onTopicChange={(topicIds) => { setQuestionTopicIds(topicIds); setQuestions([]); }} matrix={questionMatrix} onMatrixChange={(matrix) => { setQuestionMatrix(matrix); setQuestions([]); }} onChange={setQuestions} /></section>
    {error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}<div className="flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold dark:border-slate-700 dark:text-slate-300">Hủy</button><button disabled={saving} className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60">{saving ? "Đang tạo…" : "Tạo sự kiện nháp"}</button></div>
  </form>;
}

function Field({ label, value, onChange, type = "text", options }: { label: string; value: string; onChange: (value: string) => void; type?: string; options?: string[] }) { return <label><span className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</span>{options ? <select value={value} onChange={(event) => onChange(event.target.value || "")} className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-white">{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type={type} value={value} onChange={(event) => onChange(event.target.value || "")} className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white" />}</label>; }
