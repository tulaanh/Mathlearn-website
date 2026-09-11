"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProfile } from "@/components/ProfileProvider";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import {
  TREOCO_MAX_WRONG,
  TREOCO_START_TURNS,
  FRAGMENTS_PER_CAKE,
  MAX_CLAIMS_PER_CAKE,
  LAM_THUY_MOONCAKES,
  defaultTreocoState,
  formatTreocoCountdown,
  loadTreocoStateLocal,
  saveTreocoState,
  mergeTreocoStates,
  type TreocoState,
  type TreocoStatus,
} from "@/lib/treoco-state";
import {
  TREOCO_WORDS,
  VIETNAMESE_LETTERS,
  chuanHoaChu,
  getTreocoWord,
  isWordComplete,
  letterInWord,
  randomTreocoWordKey,
} from "@/lib/treoco-words";
import TreoCoHangman from "./TreoCoHangman";
import TreoCoKeyboard from "./TreoCoKeyboard";
import TreoCoJarPicker from "./TreoCoJarPicker";
import TreoCoQuestionPanel, { type TreocoCauHoiClient, type TreocoKetQua } from "./TreoCoQuestionPanel";
import TreoCoLuckyWheel, { type WheelPrize } from "./TreoCoLuckyWheel";
import TreoCoMooncakeTray from "./TreoCoMooncakeTray";

type Props = {
  /** Trạng thái đọc từ DB phía server; null khi người chơi mới chơi lần đầu. */
  initialState: TreocoState | null;
  /** Câu hỏi dở dang từ SSR (nếu có sau khi F5). */
  initialQuestion?: TreocoCauHoiClient | null;
  /** Độ khó của câu hỏi dở dang. */
  initialDifficulty?: QuestionDifficulty | null;
};

/** Khung chờ trong lúc tạo từ mới (chỉ chạy phía client, tránh lệch SSR). */
function TreoCoSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-label="Đang chuẩn bị từ bí mật">
      <span className="sr-only">Đang chuẩn bị từ bí mật...</span>
      <div className="mb-5 h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="h-[380px] rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-3" />
        <div className="h-[380px] rounded-2xl bg-slate-200 dark:bg-slate-800 lg:col-span-2" />
      </div>
    </div>
  );
}

export default function TreoCoRunner({ initialState, initialQuestion, initialDifficulty }: Props) {
  const { userId } = useProfile();
  const [state, setState] = useState<TreocoState | null>(initialState);
  const [activeTab, setActiveTab] = useState<"doan-tu" | "giai-toan" | "vong-quay" | "khay-banh">("doan-tu");
  const [now, setNow] = useState<number | null>(null);
  const [question, setQuestion] = useState<TreocoCauHoiClient | null>(initialQuestion ?? null);
  const [difficulty, setDifficulty] = useState<QuestionDifficulty | null>(initialDifficulty ?? null);
  const [answerIndex, setAnswerIndex] = useState<number | null>(null);
  const [result, setResult] = useState<TreocoKetQua | null>(null);
  const [jarLoading, setJarLoading] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const hasMergedRef = useRef(false);

  // Đồng hồ đếm ngược hồi chiếu (pattern EventCountdown)
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Khởi tạo: nạp và hợp nhất an toàn dữ liệu giữa Supabase DB và LocalStorage (giữ trọn vẹn bánh & mảnh ghép)
  useEffect(() => {
    if (!userId || hasMergedRef.current) return;
    hasMergedRef.current = true;

    const local = loadTreocoStateLocal(userId);
    const merged = mergeTreocoStates(initialState, local);
    setState(merged);
    saveTreocoState(merged, userId);
  }, [userId, initialState]);

  const applyState = useCallback(
    (next: TreocoState) => {
      setState(next);
      saveTreocoState(next, userId);
    },
    [userId],
  );

  /** Nhận thưởng từ Vòng quay may mắn (Mảnh bánh Trung Thu, Thử thách toán 60s) */
  const handleWheelPrizeWin = useCallback(
    (prize: WheelPrize, challengeSuccess?: boolean) => {
      if (!state) return;
      const currentTickets = state.spinTickets || 0;
      let remainingTickets = currentTickets;
      let turns = state.turns;
      const mooncakeFragments = { ...(state.mooncakeFragments || {}) };

      if (prize.type === "math_challenge") {
        if (challengeSuccess) {
          // Giải đúng: KHÔNG mất vé quay (bảo toàn)
          remainingTickets = currentTickets;
        } else {
          // Giải sai hoặc hết giờ: MẤT 1 vé quay
          remainingTickets = Math.max(0, currentTickets - 1);
        }
      } else if (prize.type === "mooncake_fragment") {
        // Mảnh bánh: trừ 1 vé, cộng 1 mảnh vào khay
        remainingTickets = Math.max(0, currentTickets - 1);
        if (prize.cakeId) {
          mooncakeFragments[prize.cakeId] = (mooncakeFragments[prize.cakeId] || 0) + (prize.value || 1);
        }
      } else if (prize.type === "spins") {
        remainingTickets = Math.max(0, currentTickets - 1) + prize.value;
      } else if (prize.type === "turns") {
        remainingTickets = Math.max(0, currentTickets - 1);
        turns += prize.value;
      }

      applyState({
        ...state,
        spinTickets: remainingTickets,
        turns,
        mooncakeFragments,
        updatedAt: new Date().toISOString(),
      });
    },
    [state, applyState],
  );

  /** Đổi thưởng bánh Trung Thu khi đủ 4 mảnh ghép (mỗi loại chỉ đổi được tối đa 1 cái) */
  const handleClaimCake = useCallback(
    (cakeId: string) => {
      if (!state) return;
      const cake = LAM_THUY_MOONCAKES.find((c) => c.id === cakeId);
      if (!cake) return;

      const currentCompleted = state.completedCakes?.[cakeId] || 0;
      if (currentCompleted >= MAX_CLAIMS_PER_CAKE) return;

      const currentFragments = state.mooncakeFragments?.[cakeId] || 0;
      if (currentFragments < FRAGMENTS_PER_CAKE) return;

      const nextFragments = { ...(state.mooncakeFragments || {}) };
      nextFragments[cakeId] = currentFragments - FRAGMENTS_PER_CAKE;

      const nextCompleted = { ...(state.completedCakes || {}) };
      nextCompleted[cakeId] = (nextCompleted[cakeId] || 0) + 1;

      const nextTurns = state.turns + cake.rewardTurns;
      const nextSpins = (state.spinTickets || 0) + cake.rewardSpins;

      applyState({
        ...state,
        turns: nextTurns,
        spinTickets: nextSpins,
        mooncakeFragments: nextFragments,
        completedCakes: nextCompleted,
        updatedAt: new Date().toISOString(),
      });
    },
    [state, applyState],
  );

  /** Đoán một chữ: đúng miễn phí, sai trừ 1 lượt và thêm 1 nét lên hình. */
  const guessLetter = useCallback(
    (letter: string) => {
      if (!state || state.status !== "playing" || state.turns <= 0) return;
      const normalized = chuanHoaChu(letter);
      const alreadyGuessed =
        state.revealedLetters.some((c) => chuanHoaChu(c) === normalized) ||
        state.wrongLetters.some((c) => chuanHoaChu(c) === normalized);
      if (alreadyGuessed) return;

      const word = getTreocoWord(state.wordKey);
      if (!word) return;

      const hit = letterInWord(word.text, letter);
      const revealedLetters = hit ? [...new Set([...state.revealedLetters, letter])] : state.revealedLetters;
      const wrongLetters = hit ? state.wrongLetters : [...state.wrongLetters, letter];
      const turns = hit ? state.turns : Math.max(0, state.turns - 1);

      let status: TreocoStatus = state.status;
      let wins = state.wins;
      let losses = state.losses;
      let spinTickets = state.spinTickets || 0;
      if (isWordComplete(word.text, revealedLetters)) {
        status = "won";
        wins += 1;
        spinTickets += 1;
      } else if (wrongLetters.length >= TREOCO_MAX_WRONG) {
        status = "lost";
        losses += 1;
      }

      applyState({
        ...state,
        revealedLetters,
        wrongLetters,
        turns,
        status,
        wins,
        losses,
        spinTickets,
        updatedAt: new Date().toISOString(),
      });
    },
    [state, applyState],
  );

  /** Chơi từ mới: reset tiến độ đoán, giữ lại số vé hiện có (tối thiểu 3 lượt), giữ thắng/thua và hồi chiếu. */
  const playNewWord = useCallback(() => {
    if (!state) return;
    applyState({
      ...state,
      wordKey: randomTreocoWordKey(state.wordKey),
      revealedLetters: [],
      wrongLetters: [],
      turns: Math.max(state.turns, TREOCO_START_TURNS),
      status: "playing",
      updatedAt: new Date().toISOString(),
    });
    setQuestion(null);
    setResult(null);
    setAnswerIndex(null);
    setDifficulty(null);
    setMessage(null);
  }, [state, applyState]);

  // Lắng nghe bàn phím vật lý trên máy tính (PC/Laptop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu đang gõ trong input/textarea hoặc tổ hợp phím (Ctrl, Meta, Alt)
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }
      if (!state || state.status !== "playing" || state.turns <= 0) return;

      const char = e.key;
      if (!char || char.length !== 1) return;

      const normalized = chuanHoaChu(char);
      if (VIETNAMESE_LETTERS.includes(normalized)) {
        e.preventDefault();
        guessLetter(normalized);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, guessLetter]);

  /** Chọn hũ → server kiểm tra hồi chiếu, xáo độ khó và trả câu hỏi. */
  const chooseJar = useCallback(
    async (jarId: number) => {
      if (jarLoading !== null || question || submitting) return;
      setJarLoading(jarId);
      setMessage(null);
      try {
        const res = await fetch("/api/tro-choi/treo-co/chon-hu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jarId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setQuestion(data.question as TreocoCauHoiClient);
          setDifficulty((data.difficulty ?? null) as QuestionDifficulty | null);
          setAnswerIndex(null);
          setResult(null);
        } else if (res.status === 429 && data.nextQuestionAt && state) {
          applyState({ ...state, nextQuestionAt: data.nextQuestionAt, updatedAt: new Date().toISOString() });
          setMessage(data.error ?? "Vui lòng đợi thêm chút nữa.");
        } else {
          setMessage(data.error ?? "Không lấy được câu hỏi. Vui lòng thử lại.");
        }
      } catch {
        setMessage("Lỗi kết nối. Vui lòng thử lại.");
      } finally {
        setJarLoading(null);
      }
    },
    [jarLoading, question, submitting, state, applyState],
  );

  /** Gửi đáp án → server chấm, cộng lượt và đặt hồi chiếu. */
  const submitAnswer = useCallback(async () => {
    if (!question || answerIndex === null || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/tro-choi/treo-co/tra-loi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, answerIndex }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({
          correct: Boolean(data.correct),
          correctIndex: Number(data.correctIndex),
          explanation: typeof data.explanation === "string" ? data.explanation : "",
          nextQuestionAt: data.nextQuestionAt,
        });
        if (state) {
          const nextTurns =
            typeof data.turns === "number" ? data.turns : data.correct ? state.turns + 1 : state.turns;
          applyState({
            ...state,
            turns: nextTurns,
            nextQuestionAt: data.nextQuestionAt,
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        setMessage(data.error ?? "Không chấm được câu trả lời. Vui lòng thử lại.");
      }
    } catch {
      setMessage("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }, [question, answerIndex, submitting, state, applyState]);

  /** Đóng panel câu hỏi để quay lại chọn hũ. */
  const clearPanel = useCallback(() => {
    setQuestion(null);
    setResult(null);
    setAnswerIndex(null);
    setDifficulty(null);
  }, []);

  if (!state) return <TreoCoSkeleton />;

  const word = getTreocoWord(state.wordKey) ?? TREOCO_WORDS[0];
  const remainingMs = now === null ? Number.POSITIVE_INFINITY : Math.max(0, new Date(state.nextQuestionAt).getTime() - now);
  const gameOver = state.status !== "playing";
  const keyboardDisabled = gameOver || state.turns <= 0;
  const jarsDisabled = gameOver || jarLoading !== null || submitting;

  const canClaimAnyCake = LAM_THUY_MOONCAKES.some(
    (c) =>
      (state.completedCakes?.[c.id] || 0) < MAX_CLAIMS_PER_CAKE &&
      (state.mooncakeFragments?.[c.id] || 0) >= FRAGMENTS_PER_CAKE,
  );
  const totalCompletedCakes = Object.values(state.completedCakes || {}).reduce((sum, n) => sum + (n || 0), 0);
  const totalFragments = Object.values(state.mooncakeFragments || {}).reduce((sum, n) => sum + (n || 0), 0);

  return (
    <div className="space-y-6">
      {/* Tab Navigation Bar - Segmented Control Hiện Đại */}
      <div className="flex justify-center">
        {/* 4 Tab Segmented Control */}
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/90 p-1.5 shadow-inner backdrop-blur-sm overflow-x-auto dark:border-slate-800/80 dark:bg-slate-900/90">
          {/* Tab 1: Đoán từ */}
          <button
            type="button"
            onClick={() => setActiveTab("doan-tu")}
            className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === "doan-tu"
                ? "bg-white text-indigo-700 shadow-sm dark:bg-[#1e293b] dark:text-indigo-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>🏮</span>
            <span>Đoán từ</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                activeTab === "doan-tu"
                  ? state.turns > 0
                    ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    : "bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {state.turns} vé
            </span>
          </button>

          {/* Tab 2: Giải toán */}
          <button
            type="button"
            onClick={() => setActiveTab("giai-toan")}
            className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === "giai-toan"
                ? "bg-white text-emerald-700 shadow-sm dark:bg-[#1e293b] dark:text-emerald-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>🧧</span>
            <span>Giải toán</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                activeTab === "giai-toan"
                  ? remainingMs > 0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : remainingMs > 0
                  ? "bg-amber-100/70 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {now !== null && remainingMs > 0 ? `⏳ ${formatTreocoCountdown(remainingMs)}` : "Sẵn sàng"}
            </span>
          </button>

          {/* Tab 3: Vòng quay */}
          <button
            type="button"
            onClick={() => setActiveTab("vong-quay")}
            className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === "vong-quay"
                ? "bg-white text-amber-700 shadow-sm dark:bg-[#1e293b] dark:text-amber-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>🎡</span>
            <span>Vòng quay</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                activeTab === "vong-quay"
                  ? (state.spinTickets || 0) > 0
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  : (state.spinTickets || 0) > 0
                  ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {state.spinTickets || 0} vé
            </span>
          </button>

          {/* Tab 4: Khay bánh */}
          <button
            type="button"
            onClick={() => setActiveTab("khay-banh")}
            className={`group flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
              activeTab === "khay-banh"
                ? "bg-white text-amber-700 shadow-sm dark:bg-[#1e293b] dark:text-amber-400"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>🥮</span>
            <span>Khay bánh</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-extrabold ${
                activeTab === "khay-banh"
                  ? totalCompletedCakes > 0
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                  : totalCompletedCakes > 0
                  ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                  : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {totalCompletedCakes > 0 ? `${totalCompletedCakes}/6 bánh` : `${totalFragments}/24 mảnh`}
            </span>
            {canClaimAnyCake && (
              <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-black text-white animate-bounce shadow-sm">
                Đổi!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* PHẦN 1: ĐOÁN TỪ BÍ MẬT */}
      {activeTab === "doan-tu" && (
        <div className="space-y-5">
          {/* Chú Lân trên cọc mai hoa thung */}
          <div className="mx-auto max-w-3xl">
            <TreoCoHangman
              word={word}
              revealedLetters={state.revealedLetters}
              wrongCount={state.wrongLetters.length}
              showAnswer={state.status === "lost"}
            />
          </div>

          {/* Banner cảnh báo khi hết vé đoán chữ */}
          {!gameOver && state.turns <= 0 && (
            <div className="mx-auto max-w-3xl rounded-2xl border border-rose-300 bg-rose-50 p-4 text-center dark:border-rose-900/60 dark:bg-rose-950/50">
              <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
                ⚠️ Bạn đã hết vé đoán chữ! Hãy giải toán hoặc quay Vòng quay may mắn để kiếm thêm vé nhé.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("giai-toan")}
                  className="cursor-pointer rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500"
                >
                  🧧 Sang Giải Toán (+1 vé/câu) →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("vong-quay")}
                  className="cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-sm transition hover:opacity-95 active:scale-95"
                >
                  🎡 Sang Vòng Quay ({state.spinTickets || 0} vé quay) →
                </button>
              </div>
            </div>
          )}

          {/* Bàn phím đoán chữ */}
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#131b2e]">
            <TreoCoKeyboard
              revealedLetters={state.revealedLetters}
              wrongLetters={state.wrongLetters}
              disabled={keyboardDisabled}
              onGuess={guessLetter}
            />
          </div>
        </div>
      )}

      {/* PHẦN 2: GIẢI TOÁN NHẬN VÉ */}
      {activeTab === "giai-toan" && (
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Header giải thích */}
          <div className="flex flex-col gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/30 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-extrabold text-indigo-950 dark:text-indigo-200">
                🧧 Thử Thách Toán Học Nhận Vé Đoán Chữ
              </h3>
              <p className="mt-0.5 text-xs text-indigo-700/80 dark:text-indigo-300/80">
                Mỗi câu toán trả lời đúng cộng ngay <span className="font-bold text-amber-600 dark:text-amber-400">+1 vé đoán chữ</span>.
              </p>
            </div>
            {now !== null && remainingMs > 0 && (
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  ⏳ Hồi chiêu: {formatTreocoCountdown(remainingMs)}
                </span>
              </div>
            )}
          </div>

          {/* Khung câu hỏi hoặc chọn hũ */}
          {question && difficulty ? (
            <TreoCoQuestionPanel
              question={question}
              difficulty={difficulty}
              answerIndex={answerIndex}
              result={result}
              submitting={submitting}
              onSelect={setAnswerIndex}
              onSubmit={submitAnswer}
              onClear={clearPanel}
              onGoToHangman={() => setActiveTab("doan-tu")}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#131b2e]">
              <TreoCoJarPicker
                disabled={jarsDisabled}
                loadingJar={jarLoading}
                remainingMs={remainingMs}
                nowReady={now !== null}
                onChoose={chooseJar}
              />
            </div>
          )}

          {message && (
            <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              {message}
            </p>
          )}
        </div>
      )}

      {/* PHẦN 3: VÒNG QUAY MAY MẮN (Độc lập, size lớn) */}
      {activeTab === "vong-quay" && (
        <div className="mx-auto max-w-4xl">
          <TreoCoLuckyWheel
            mode="inline"
            spinTickets={state.spinTickets || 0}
            onSpinSuccess={handleWheelPrizeWin}
            onGoToHangman={() => setActiveTab("doan-tu")}
            onGoToMooncakes={() => setActiveTab("khay-banh")}
          />
        </div>
      )}

      {/* PHẦN 4: BỘ SƯU TẬP KHAY BÁNH TRUNG THU (Độc lập) */}
      {activeTab === "khay-banh" && (
        <div className="mx-auto max-w-4xl">
          <TreoCoMooncakeTray
            mooncakeFragments={state.mooncakeFragments || {}}
            completedCakes={state.completedCakes || {}}
            spinTickets={state.spinTickets || 0}
            onClaimCake={handleClaimCake}
            onGoToWheel={() => setActiveTab("vong-quay")}
          />
        </div>
      )}

      {/* Overlay kết thúc từ khi thắng / thua */}
      {gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-700 dark:bg-[#131b2e]">
            <p className="text-6xl" aria-hidden>
              {state.status === "won" ? "🎉" : "🥮"}
            </p>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              {state.status === "won" ? "Xuất sắc! Lân con múa đỉnh chóp!" : "Úi da! Lân con ngã vào đĩa bánh rồi!"}
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {state.status === "won" ? (
                "Bạn đã đoán trúng toàn bộ từ bí mật, giúp Lân con hoàn thành bài múa đỉnh cao trên cọc mai hoa thung!"
              ) : (
                <>
                  Lân con lỡ trượt chân rơi trúng đĩa bánh trung thu trứng muối rồi! Từ bí mật là:{" "}
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">{word.text}</span>
                </>
              )}
            </p>
            {state.status === "won" && (
              <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-2.5 text-amber-800 dark:text-amber-300">
                <span className="text-xl animate-bounce">🎡</span>
                <span className="text-xs sm:text-sm font-black">+1 Vé Quay May Mắn đã được cộng!</span>
              </div>
            )}
            {state.status === "won" && (
              <button
                type="button"
                onClick={() => {
                  playNewWord();
                  setActiveTab("vong-quay");
                }}
                className="mt-3 w-full cursor-pointer rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 py-2.5 text-sm font-black text-white shadow-md shadow-orange-500/30 transition hover:scale-105 active:scale-95"
              >
                🎡 Đi Đến Vòng Quay May Mắn Ngay!
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playNewWord();
                setActiveTab("doan-tu");
              }}
              className="mt-3 w-full cursor-pointer rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {state.status === "won" ? "🏮 Múa tiếp từ mới" : "🏮 Cùng Lân múa lại từ mới"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
