"use client";

import { useState, useRef, useEffect } from "react";
import MooncakeIcon, { getMooncakeSrc } from "./MooncakeIcon";
import { LAM_THUY_MOONCAKES } from "@/lib/treoco-state";
import LazyMathText from "@/components/LazyMathText";
import { resolveQuestionImageSrc, resolveAllExplanationImages } from "@/lib/document-preview";
import { NGAN_HANG_CAU_HOI_GAME } from "@/lib/treoco-bank-questions";
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";
import {
  isTreocoSoundEnabled,
  setTreocoSoundEnabled,
  preloadMillionaireSounds,
  playWheelSpinSound,
  stopWheelSound,
  startMillionaireTheme,
  stopMillionaireTheme,
  updateMillionaireUrgency,
  playMillionaireCorrectSound,
  playMillionaireWrongSound,
  playMooncakePrizeSound,
} from "@/lib/treoco-sound";

export type WheelPrize = {
  id: number;
  label: string;
  shortLabel: string;
  icon: string;
  type: "math_challenge" | "mooncake_fragment" | "turns" | "spins";
  cakeId?: string;
  value: number;
  color: string;
  textColor: string;
  weight: number;
};

/**
 * 10 Giải thưởng trên Vòng Quay May Mắn (Tỉ lệ ngầm: Mảnh bánh 1/5 = 20%, Thử thách toán 4/5 = 80%):
 * - 4 Ô "Thử thách giải toán 60s": Trọng số ngầm 80% (mỗi ô 20%)
 * - 6 Ô "Mảnh bánh trung thu": Trọng số ngầm 20% (chia theo độ hiếm)
 * - Giao diện hiển thị các cung tròn đều 36 độ đối xứng, không hiển thị tỉ lệ số ra ngoài
 */
export const WHEEL_PRIZES: WheelPrize[] = [
  {
    id: 0,
    label: "Thử thách giải toán 60s",
    shortLabel: "Toán 60s",
    icon: "⚡",
    type: "math_challenge",
    value: 1,
    color: "#d97706",
    textColor: "#ffffff",
    weight: 20,
  },
  {
    id: 1,
    label: "Mảnh Thập Cẩm Xá Xíu",
    shortLabel: "Thập Cẩm",
    icon: "🥮",
    type: "mooncake_fragment",
    cakeId: "thap_cam_xa_xiu",
    value: 1,
    color: "#059669",
    textColor: "#ffffff",
    weight: 5,
  },
  {
    id: 2,
    label: "Thử thách giải toán 60s",
    shortLabel: "Toán 60s",
    icon: "⏱️",
    type: "math_challenge",
    value: 1,
    color: "#4f46e5",
    textColor: "#ffffff",
    weight: 20,
  },
  {
    id: 3,
    label: "Mảnh Sữa Dừa Sợi Non",
    shortLabel: "Sữa Dừa",
    icon: "🥥",
    type: "mooncake_fragment",
    cakeId: "sua_dua_soi_non",
    value: 1,
    color: "#0284c7",
    textColor: "#ffffff",
    weight: 3.5,
  },
  {
    id: 4,
    label: "Thử thách giải toán 60s",
    shortLabel: "Toán 60s",
    icon: "🧠",
    type: "math_challenge",
    value: 1,
    color: "#dc2626",
    textColor: "#ffffff",
    weight: 20,
  },
  {
    id: 5,
    label: "Mảnh Đậu Xanh Hạt Dưa",
    shortLabel: "Đậu Xanh",
    icon: "🥮",
    type: "mooncake_fragment",
    cakeId: "dau_xanh_hat_dua",
    value: 1,
    color: "#16a34a",
    textColor: "#ffffff",
    weight: 5,
  },
  {
    id: 6,
    label: "Mảnh Mochi Khoai Môn",
    shortLabel: "Mochi",
    icon: "🍠",
    type: "mooncake_fragment",
    cakeId: "mochi_khoai_mon",
    value: 1,
    color: "#9333ea",
    textColor: "#ffffff",
    weight: 2,
  },
  {
    id: 7,
    label: "Mảnh Cốm Non Dừa Dẻo",
    shortLabel: "Cốm Non",
    icon: "🌾",
    type: "mooncake_fragment",
    cakeId: "com_non_dua_deo",
    value: 1,
    color: "#0d9488",
    textColor: "#ffffff",
    weight: 3.5,
  },
  {
    id: 8,
    label: "Mảnh Lava Trứng Chảy",
    shortLabel: "Lava",
    icon: "🍯",
    type: "mooncake_fragment",
    cakeId: "lava_trung_chay",
    value: 1,
    color: "#b45309",
    textColor: "#ffffff",
    weight: 1,
  },
  {
    id: 9,
    label: "Thử thách giải toán 60s",
    shortLabel: "Toán 60s",
    icon: "🎯",
    type: "math_challenge",
    value: 1,
    color: "#db2777",
    textColor: "#ffffff",
    weight: 20,
  },
];

type Props = {
  spinTickets: number;
  onSpinSuccess: (prize: WheelPrize, challengeSuccess?: boolean) => void;
  onClose?: () => void;
  mode?: "inline" | "modal";
  onGoToHangman?: () => void;
  onGoToMooncakes?: () => void;
};

const OPTION_PREFIXES = ["A", "B", "C", "D"];

export default function TreoCoLuckyWheel({
  spinTickets,
  onSpinSuccess,
  onClose,
  mode = "inline",
  onGoToHangman,
  onGoToMooncakes,
}: Props) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<WheelPrize | null>(null);
  const currentRotationRef = useRef(0);

  // State Bật/Tắt âm thanh
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setSoundEnabled(isTreocoSoundEnabled());
    preloadMillionaireSounds();
    return () => {
      stopWheelSound();
      stopMillionaireTheme();
    };
  }, []);

  const toggleSound = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = !soundEnabled;
    setSoundEnabled(next);
    setTreocoSoundEnabled(next);
    if (next && challengeQuestion && challengeResult === "playing") {
      startMillionaireTheme();
    }
  };

  // State mở Popup lớn toàn màn hình
  const [isExpandedPopup, setIsExpandedPopup] = useState(false);

  // Lắng nghe phím ESC để đóng popup lớn
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpandedPopup && !spinning) {
        setIsExpandedPopup(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpandedPopup, spinning]);

  // State Thử thách Giải Toán 60s
  const [challengeQuestion, setChallengeQuestion] = useState<TreocoCauHoi | null>(null);
  const [challengeSecondsLeft, setChallengeSecondsLeft] = useState(60);
  const [challengeResult, setChallengeResult] = useState<"playing" | "correct" | "wrong" | "timeout">("playing");
  const [challengeSelectedIndex, setChallengeSelectedIndex] = useState<number | null>(null);
  const [currentChallengePrize, setCurrentChallengePrize] = useState<WheelPrize | null>(null);
  const prefetchedQuestionRef = useRef<TreocoCauHoi | null>(null);

  const startMathChallenge = (prize: WheelPrize) => {
    setCurrentChallengePrize(prize);

    // Ưu tiên câu hỏi đã tải trực tiếp từ ngân hàng đề thi CSDL Supabase
    let selected = prefetchedQuestionRef.current;
    if (!selected) {
      const pool = NGAN_HANG_CAU_HOI_GAME.filter(
        (q) => q.difficulty === "nhan_biet" || q.difficulty === "thong_hieu",
      );
      selected = pool[Math.floor(Math.random() * pool.length)] || NGAN_HANG_CAU_HOI_GAME[0];
    }
    setChallengeQuestion(selected);
    setChallengeSecondsLeft(60);
    setChallengeSelectedIndex(null);
    setChallengeResult("playing");
    // Bắt đầu nhạc nền căng thẳng Ai Là Triệu Phú
    startMillionaireTheme();
  };

  // Đồng hồ đếm ngược 60 giây
  useEffect(() => {
    if (!challengeQuestion || challengeResult !== "playing") return;

    const timer = setInterval(() => {
      setChallengeSecondsLeft((prev) => {
        if (prev <= 16 && prev > 1) {
          // Tăng nhịp tim dồn dập kịch tính khi sắp hết giờ
          updateMillionaireUrgency(true);
        }
        if (prev <= 1) {
          clearInterval(timer);
          setChallengeResult("timeout");
          playMillionaireWrongSound(); // Âm thanh hết giờ / thất bại
          if (currentChallengePrize) {
            onSpinSuccess(currentChallengePrize, false);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeQuestion, challengeResult, currentChallengePrize, onSpinSuccess]);

  // Người chơi bấm chọn phương án
  const handleSelectChallengeOption = (index: number) => {
    if (!challengeQuestion || challengeResult !== "playing" || !currentChallengePrize) return;
    setChallengeSelectedIndex(index);
    const isCorrect = index === challengeQuestion.correctIndex;
    if (isCorrect) {
      setChallengeResult("correct");
      playMillionaireCorrectSound(); // Âm thanh trả lời đúng Ai Là Triệu Phú
      onSpinSuccess(currentChallengePrize, true);
    } else {
      setChallengeResult("wrong");
      playMillionaireWrongSound(); // Âm thanh trả lời sai
      onSpinSuccess(currentChallengePrize, false);
    }
  };

  const closeChallengeModal = () => {
    stopMillionaireTheme();
    setChallengeQuestion(null);
    setCurrentChallengePrize(null);
    setChallengeResult("playing");
    setChallengeSelectedIndex(null);
  };

  const spinWheel = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (spinning || spinTickets <= 0) return;

    setSpinning(true);
    setWonPrize(null);

    // Phát âm thanh tiếng kim gõ vào các chấu bánh xe quay tạch tạch
    playWheelSpinSound(4600);

    // Quay theo trọng số ngầm (weighted random: Bánh 1/5, Toán 4/5)
    const totalWeight = WHEEL_PRIZES.reduce((sum, p) => sum + p.weight, 0);
    let rand = Math.random() * totalWeight;
    let prizeIndex = 0;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) {
      if (rand < WHEEL_PRIZES[i].weight) {
        prizeIndex = i;
        break;
      }
      rand -= WHEEL_PRIZES[i].weight;
    }
    const prize = WHEEL_PRIZES[prizeIndex];

    // Nếu kết quả rơi vào Thử thách Toán 60s, tải câu hỏi trực tiếp từ CSDL Supabase trong lúc bánh xe đang quay
    prefetchedQuestionRef.current = null;
    if (prize.type === "math_challenge") {
      fetch("/api/tro-choi/treo-co/cau-hoi-60s")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.question) {
            prefetchedQuestionRef.current = data.question;
          }
        })
        .catch((err) => {
          console.warn("Không kết nối được API câu hỏi 60s:", err);
        });
    }

    // 10 ô: mỗi cung 36 độ
    const sliceDeg = 360 / WHEEL_PRIZES.length;
    const extraRounds = 5 * 360; // quay ít nhất 5 vòng đầy
    const current = currentRotationRef.current;
    const currentMod = current % 360;
    // Kim chỉ ở đỉnh trên cùng (0 độ). Vị trí giữa cung i là: (i * sliceDeg + sliceDeg / 2)
    const desiredMod = (360 - (prizeIndex * sliceDeg + sliceDeg / 2)) % 360;
    let diff = desiredMod - currentMod;
    if (diff <= 0) diff += 360;

    const nextRotation = current + extraRounds + diff;
    currentRotationRef.current = nextRotation;
    setRotation(nextRotation);

    setTimeout(() => {
      setSpinning(false);
      if (prize.type === "math_challenge") {
        setWonPrize(null);
        startMathChallenge(prize);
      } else {
        setWonPrize(prize);
        playMooncakePrizeSound(); // Âm thanh leng keng trúng bánh trung thu
        onSpinSuccess(prize);
      }
    }, 4600);
  };

  // Hàm render card vòng quay (hỗ trợ cả dạng compact inline và dạng popup lớn)
  const renderWheelCard = (isLargePopup: boolean) => {
    const wheelSizeClasses = isLargePopup
      ? "h-[320px] w-[320px] sm:h-[450px] sm:w-[450px] md:h-[530px] md:w-[530px] lg:h-[580px] lg:w-[580px]"
      : "h-[270px] w-[270px] sm:h-[340px] sm:w-[340px] md:h-[400px] md:w-[400px]";

    const spinBtnClasses = isLargePopup
      ? "h-22 w-22 sm:h-28 sm:w-28 md:h-32 md:w-32 text-base sm:text-lg md:text-xl"
      : "h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-xs sm:text-sm md:text-base";

    return (
      <div
        className={`relative w-full ${
          isLargePopup ? "max-w-4xl" : "max-w-2xl"
        } mx-auto rounded-3xl border-2 ${
          isLargePopup
            ? "border-amber-400/80 bg-gradient-to-b from-[#2d0e52] via-[#1a0f38] to-[#0c0620] shadow-[0_0_60px_rgba(251,191,36,0.35)]"
            : "border-amber-500/40 bg-gradient-to-b from-[#2b0f4c] via-[#1a0f38] to-[#0d0722] shadow-2xl"
        } p-4 sm:p-7 text-center text-white`}
      >
        {/* Nút góc trên: Âm thanh & Phóng to / Đóng */}
        <div className="absolute right-4 top-4 flex items-center gap-2 z-20">
          {/* Nút Bật/Tắt âm thanh */}
          <button
            type="button"
            onClick={toggleSound}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:bg-white/25 active:scale-90"
            title={soundEnabled ? "Tắt âm thanh (Mute)" : "Bật âm thanh (Unmute)"}
            aria-label="Bật/Tắt âm thanh"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>

          {/* Nút phóng to ở chế độ inline */}
          {!isLargePopup && (
            <button
              type="button"
              onClick={() => setIsExpandedPopup(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-amber-400/50 bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-300 transition hover:bg-amber-500/40 hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20"
              title="Bấm để mở popup vòng quay lớn toàn màn hình"
            >
              <span>⛶</span>
              <span>Phóng to</span>
            </button>
          )}

          {/* Nút đóng ở chế độ popup lớn */}
          {isLargePopup && (
            <button
              type="button"
              disabled={spinning}
              onClick={() => setIsExpandedPopup(false)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/15 text-slate-200 transition hover:bg-white/25 active:scale-90 disabled:opacity-50"
              title="Đóng popup phóng to (Esc)"
              aria-label="Đóng popup"
            >
              ✕
            </button>
          )}

          {/* Nút đóng (nếu là chế độ modal ban đầu) */}
          {!isLargePopup && mode === "modal" && onClose && (
            <button
              type="button"
              disabled={spinning}
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 disabled:opacity-50"
              aria-label="Đóng vòng quay"
            >
              ✕
            </button>
          )}
        </div>

        {/* Tiêu đề */}
        <div className="mb-2">
          <span className="inline-block rounded-full bg-amber-400/20 px-3.5 py-1 text-xs font-extrabold tracking-wider text-amber-300">
            🏮 ĐÊM HỘI TRĂNG RẰM
          </span>
          <h2
            className={`mt-1 ${
              isLargePopup ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl md:text-3xl"
            } font-black tracking-tight text-amber-400 drop-shadow-sm`}
          >
            🎡 Vòng Quay May Mắn {isLargePopup && <span className="text-sm font-bold text-amber-300">(Cỡ Lớn)</span>}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200/80">
            Quay nhận <span className="font-bold text-amber-300">mảnh bánh trung thu</span> hoặc thử thách{" "}
            <span className="font-bold text-amber-300">giải toán 60s</span> (đúng bảo toàn vé, sai mất vé)!
          </p>
        </div>

        {/* Thông tin vé quay */}
        <div className="my-2.5 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-extrabold text-amber-300">
            🎟️ Bạn có: <span className="text-base text-white">{spinTickets}</span> vé quay
          </span>
        </div>

        {!isLargePopup && (
          <p className="text-[11px] font-semibold text-amber-300/80 animate-pulse">
            💡 Bấm trực tiếp vào vòng quay để mở Popup phóng to toàn màn hình!
          </p>
        )}

        {/* KHU VỰC VÒNG QUAY */}
        <div
          onClick={() => {
            if (!isLargePopup && !spinning) {
              setIsExpandedPopup(true);
            }
          }}
          className={`relative mx-auto my-4 flex ${wheelSizeClasses} items-center justify-center ${
            !isLargePopup ? "cursor-pointer group" : ""
          }`}
          title={!isLargePopup ? "Bấm vào vòng quay để mở popup lớn" : undefined}
        >
          {/* Lớp phủ hover gợi ý phóng to ở chế độ inline */}
          {!isLargePopup && !spinning && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-full bg-slate-950/40 opacity-0 backdrop-blur-[1px] transition-all duration-300 group-hover:opacity-100 pointer-events-none">
              <span className="rounded-full border border-amber-400 bg-amber-500/90 px-3.5 py-1.5 text-xs font-black text-rose-950 shadow-xl">
                ⛶ Bấm để mở Popup phóng to
              </span>
            </div>
          )}

          {/* Kim chỉ ở đỉnh trên lớn và sắc nét */}
          <div className="absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 drop-shadow-xl pointer-events-none">
            <svg
              width={isLargePopup ? "50" : "40"}
              height={isLargePopup ? "50" : "40"}
              viewBox="0 0 44 44"
              fill="none"
            >
              <polygon points="22,40 7,8 37,8" fill="#facc15" stroke="#78350f" strokeWidth="2.5" />
              <circle cx="22" cy="13" r="5" fill="#ef4444" stroke="#78350f" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Vành ngoài trang trí đèn hội rực rỡ */}
          <div
            className={`absolute inset-0 rounded-full border-4 border-amber-400/70 ${
              isLargePopup
                ? "shadow-[0_0_45px_rgba(250,204,21,0.55)]"
                : "shadow-[0_0_30px_rgba(250,204,21,0.4)]"
            }`}
          />

          {/* Vòng quay chính */}
          <div
            className="h-full w-full rounded-full transition-transform select-none"
            style={{
              transform: `rotate(${rotation}deg)`,
              transitionDuration: spinning ? "4.5s" : "0s",
              transitionTimingFunction: "cubic-bezier(0.18, 0.75, 0.12, 0.99)",
            }}
          >
            <svg viewBox="0 0 300 300" className="h-full w-full select-none">
              <defs>
                <circle id="centerPin" cx="150" cy="150" r="32" fill="#1e1b4b" stroke="#facc15" strokeWidth="3" />
              </defs>

              {WHEEL_PRIZES.map((prize, i) => {
                const count = WHEEL_PRIZES.length;
                const angle = 360 / count; // 36 độ đều nhau
                const startAngle = i * angle - 90;
                const endAngle = startAngle + angle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const r = 145;
                const x1 = 150 + r * Math.cos(startRad);
                const y1 = 150 + r * Math.sin(startRad);
                const x2 = 150 + r * Math.cos(endRad);
                const y2 = 150 + r * Math.sin(endRad);

                const midAngle = startAngle + angle / 2;
                const midRad = (midAngle * Math.PI) / 180;
                const textR = 104;
                const tx = 150 + textR * Math.cos(midRad);
                const ty = 150 + textR * Math.sin(midRad);

                return (
                  <g key={prize.id}>
                    {/* Cung hình quạt */}
                    <path
                      d={`M 150,150 L ${x1},${y1} A ${r},${r} 0 0,1 ${x2},${y2} Z`}
                      fill={prize.color}
                      stroke="#fbbf24"
                      strokeWidth="1.2"
                    />
                    {/* Chữ và icon */}
                    <g transform={`translate(${tx}, ${ty}) rotate(${midAngle + 90})`}>
                      {prize.type === "mooncake_fragment" && prize.cakeId ? (
                        <image
                          href={getMooncakeSrc(prize.cakeId)}
                          x="-14"
                          y="-22"
                          width="28"
                          height="28"
                          preserveAspectRatio="xMidYMid meet"
                        />
                      ) : (
                        <text
                          x="0"
                          y="-7"
                          textAnchor="middle"
                          fontSize="15"
                          fill={prize.textColor}
                        >
                          {prize.icon}
                        </text>
                      )}
                      <text
                        x="0"
                        y="11"
                        textAnchor="middle"
                        fontSize="8.5"
                        fontWeight="900"
                        fill={prize.textColor}
                      >
                        {prize.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Tâm vòng tròn */}
              <circle cx="150" cy="150" r="36" fill="#311042" stroke="#facc15" strokeWidth="4" />
              <circle cx="150" cy="150" r="29" fill="#facc15" />
              <circle cx="150" cy="150" r="24" fill="#ef4444" />
            </svg>
          </div>

          {/* Nút QUAY lớn ở giữa */}
          <button
            type="button"
            disabled={spinning || spinTickets <= 0}
            onClick={(e) => spinWheel(e)}
            className={`absolute z-30 flex ${spinBtnClasses} cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-center font-black text-rose-950 shadow-2xl shadow-amber-500/60 transition hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="font-black tracking-tighter">
              {spinning ? "..." : spinTickets <= 0 ? "HẾT VÉ" : "QUAY"}
            </span>
          </button>
        </div>

        {/* Thông báo kết quả trúng thưởng (Mảnh bánh) */}
        {wonPrize && (
          <div className="mt-3 animate-bounce rounded-2xl border border-amber-400 bg-amber-400/20 p-3 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-300">🎉 CHÚC MỪNG BẠN ĐÃ TRÚNG</p>
            <div className="mt-1 flex items-center justify-center gap-2 text-base sm:text-lg font-black text-white">
              {wonPrize.type === "mooncake_fragment" && wonPrize.cakeId ? (
                <MooncakeIcon cakeId={wonPrize.cakeId} size={36} className="h-9 w-9 shrink-0" />
              ) : (
                <span className="text-2xl">{wonPrize.icon}</span>
              )}
              <span>{wonPrize.label}</span>
            </div>
            {wonPrize.type === "mooncake_fragment" && (
              <p className="mt-1 text-xs text-amber-200">
                Đã dùng 1 vé quay và cộng 1 mảnh vào Khay Bánh! Gom đủ 4 mảnh để đổi trọn vẹn 1 bánh.
              </p>
            )}
          </div>
        )}

        {/* Thanh liên kết nhanh dưới chân */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          {isLargePopup && (
            <button
              type="button"
              disabled={spinning}
              onClick={() => setIsExpandedPopup(false)}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 transition hover:bg-white/20 active:scale-95 disabled:opacity-50"
            >
              <span>✕</span>
              <span>Đóng popup lớn</span>
            </button>
          )}

          {!isLargePopup && mode === "inline" && onGoToHangman && (
            <button
              type="button"
              disabled={spinning}
              onClick={onGoToHangman}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-indigo-400/30 bg-indigo-600/30 px-4 py-2 text-xs sm:text-sm font-bold text-indigo-200 transition hover:bg-indigo-600/50 active:scale-95 disabled:opacity-50"
            >
              <span>🏮</span>
              <span>Sang Đoán từ →</span>
            </button>
          )}

          {!isLargePopup && mode === "inline" && onGoToMooncakes && (
            <button
              type="button"
              disabled={spinning}
              onClick={onGoToMooncakes}
              className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-500/20 px-4 py-2 text-xs sm:text-sm font-bold text-amber-300 transition hover:bg-amber-500/30 active:scale-95 disabled:opacity-50"
            >
              <span>🥮</span>
              <span>Sang Khay bánh →</span>
            </button>
          )}

          {!isLargePopup && mode === "modal" && onClose && (
            <button
              type="button"
              disabled={spinning}
              onClick={onClose}
              className="flex cursor-pointer items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 transition hover:bg-white/20"
            >
              Đóng lại
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Vòng quay thông thường (inline hoặc modal cơ bản) */}
      {mode === "modal" ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md">
          {renderWheelCard(false)}
        </div>
      ) : (
        <div className="flex w-full justify-center py-2">{renderWheelCard(false)}</div>
      )}

      {/* POPUP MODAL PHÓNG TO TOÀN MÀN HÌNH CỠ LỚN */}
      {isExpandedPopup && (
        <div
          onClick={() => {
            if (!spinning) setIsExpandedPopup(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/85 p-3 sm:p-6 backdrop-blur-xl animate-fadeIn"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full flex justify-center">
            {renderWheelCard(true)}
          </div>
        </div>
      )}

      {/* MODAL THỬ THÁCH GIẢI TOÁN 60 GIÂY (Z-index 70 để luôn hiển thị trên cả Popup phóng to) */}
      {challengeQuestion && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl border-2 border-amber-400/60 bg-gradient-to-b from-[#240c42] via-[#1a0f38] to-[#0d0722] p-5 sm:p-7 text-white shadow-2xl">
            {/* Nút Bật/Tắt âm thanh trong lúc giải toán */}
            <button
              type="button"
              onClick={toggleSound}
              className="absolute right-4 top-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm transition hover:bg-white/25 active:scale-90"
              title={soundEnabled ? "Tắt âm thanh (Mute)" : "Bật âm thanh (Unmute)"}
              aria-label="Bật/Tắt âm thanh"
            >
              {soundEnabled ? "🔊" : "🔇"}
            </button>

            {/* Header: Đồng hồ đếm ngược 60s & luật chơi */}
            <div className="text-center pr-8 sm:pr-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-4 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                <span>⚡ THỬ THÁCH VÒNG QUAY MAY MẮN</span>
              </div>
              <h3 className="mt-2 text-xl sm:text-2xl font-black text-amber-400">
                Thử Thách Giải Toán Trong 60 Giây
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-indigo-200/90">
                🎯 Giải <strong className="text-emerald-300">ĐÚNG</strong>: Không mất vé quay! · Giải{" "}
                <strong className="text-rose-400">SAI</strong> hoặc <strong className="text-rose-400">HẾT GIỜ</strong>: Bị mất 1 vé quay.
              </p>
            </div>

            {/* Đồng hồ đếm ngược trực quan */}
            <div className="my-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Thời gian còn lại</span>
                <span
                  className={`text-base font-black ${
                    challengeSecondsLeft <= 10
                      ? "text-rose-500 animate-pulse"
                      : challengeSecondsLeft <= 25
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  ⏱️ {challengeSecondsLeft < 10 ? `0${challengeSecondsLeft}` : challengeSecondsLeft}s
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700/60">
                <div
                  className={`h-full transition-all duration-1000 ${
                    challengeSecondsLeft <= 10
                      ? "bg-rose-500"
                      : challengeSecondsLeft <= 25
                      ? "bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                  style={{ width: `${(challengeSecondsLeft / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* Nội dung câu hỏi Toán học (KaTeX qua LazyMathText) */}
            <div className="my-3 rounded-2xl border border-indigo-400/30 bg-slate-900/60 p-4 text-left">
              <span className="mb-2 inline-block rounded-md bg-indigo-500/30 px-2 py-0.5 text-[11px] font-bold text-indigo-200">
                Câu hỏi
              </span>
              <div className="text-sm sm:text-base font-medium leading-relaxed text-slate-100">
                <LazyMathText text={challengeQuestion.text} />
              </div>

              {/* Hình ảnh minh họa (nếu có trong CSDL) */}
              {(() => {
                const imgUrl = resolveQuestionImageSrc(challengeQuestion as any);
                if (!imgUrl) return null;
                return (
                  <div className="mt-3 flex justify-center">
                    <img
                      src={imgUrl}
                      alt={challengeQuestion.imageCaption || "Hình minh họa câu hỏi"}
                      className="max-h-72 max-w-full rounded-xl border border-white/15 bg-white/5 object-contain p-1 shadow-md"
                    />
                  </div>
                );
              })()}
            </div>

            {/* Danh sách 4 đáp án A, B, C, D */}
            <div className="space-y-2.5">
              {challengeQuestion.options.map((optText, idx) => {
                const isSelected = challengeSelectedIndex === idx;
                const isCorrect = challengeResult !== "playing" && idx === challengeQuestion.correctIndex;
                const isWrongChosen = challengeResult !== "playing" && !isCorrect && isSelected;

                let btnStyle = "border-white/15 bg-white/5 hover:border-amber-400/60 hover:bg-white/10 text-slate-100";

                if (isCorrect) {
                  btnStyle = "border-emerald-400 bg-emerald-500/25 text-emerald-200 shadow-md shadow-emerald-500/20";
                } else if (isWrongChosen) {
                  btnStyle = "border-rose-400 bg-rose-500/25 text-rose-200 line-through";
                } else if (isSelected) {
                  btnStyle = "border-amber-400 bg-amber-400/20 text-white";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={challengeResult !== "playing"}
                    onClick={() => handleSelectChallengeOption(idx)}
                    className={`group flex w-full items-start gap-3 rounded-xl border-2 px-3.5 py-3 text-left transition ${
                      challengeResult === "playing" ? "cursor-pointer active:scale-[0.99]" : "cursor-default"
                    } ${btnStyle}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-black">
                      {OPTION_PREFIXES[idx] || idx + 1}
                    </span>
                    <div className="flex-1 text-sm font-medium leading-6">
                      <LazyMathText text={optText} />
                    </div>
                    {isCorrect && <span className="font-bold text-emerald-300">✓ Đúng</span>}
                    {isWrongChosen && <span className="font-bold text-rose-400">✗ Sai</span>}
                  </button>
                );
              })}
            </div>

            {/* Khối hiển thị kết quả sau khi chọn hoặc hết giờ */}
            {challengeResult !== "playing" && (
              <div className="mt-4 rounded-2xl border p-4 text-center animate-fadeIn">
                {challengeResult === "correct" && (
                  <div className="border-emerald-500/50 bg-emerald-500/10 p-3 rounded-xl">
                    <p className="text-lg font-black text-emerald-300">🎉 XUẤT SẮC! BẠN ĐÃ GIẢI ĐÚNG!</p>
                    <p className="mt-1 text-xs text-emerald-200">
                      Vé quay của bạn đã được <strong className="underline">BẢO TOÀN NGUYÊN VẸN</strong> (Không bị trừ vé)!
                    </p>
                  </div>
                )}

                {challengeResult === "wrong" && (
                  <div className="border-rose-500/50 bg-rose-500/10 p-3 rounded-xl">
                    <p className="text-lg font-black text-rose-300">❌ RẤT TIẾC! BẠN ĐÃ CHỌN CHƯA ĐÚNG!</p>
                    <p className="mt-1 text-xs text-rose-200">
                      Bạn đã bị mất 1 vé quay may mắn. Hãy xem lại lời giải chi tiết bên dưới nhé!
                    </p>
                  </div>
                )}

                {challengeResult === "timeout" && (
                  <div className="border-rose-500/50 bg-rose-500/10 p-3 rounded-xl">
                    <p className="text-lg font-black text-rose-300">⏱️ ĐÃ HẾT 60 GIÂY!</p>
                    <p className="mt-1 text-xs text-rose-200">
                      Bạn không kịp đưa ra đáp án trong thời gian quy định nên bị mất 1 vé quay.
                    </p>
                  </div>
                )}

                {/* Lời giải chi tiết (kèm hình ảnh minh họa lời giải nếu có) */}
                {(() => {
                  const expImages = resolveAllExplanationImages(challengeQuestion as any);
                  const hasExp = Boolean(challengeQuestion.explanation?.trim() || expImages.length > 0);
                  if (!hasExp) return null;
                  return (
                    <div className="mt-3 text-left rounded-xl border border-white/10 bg-slate-900/70 p-3.5 text-xs sm:text-sm">
                      <span className="font-bold text-amber-300">💡 Lời giải chi tiết:</span>
                      {challengeQuestion.explanation && (
                        <div className="mt-1.5 leading-relaxed text-slate-200">
                          <LazyMathText text={challengeQuestion.explanation} />
                        </div>
                      )}
                      {expImages.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {expImages.map((img, idx) => (
                            <figure key={idx} className="text-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img.src}
                                alt={img.caption || `Hình vẽ lời giải ${idx + 1}`}
                                className="mx-auto max-h-64 max-w-full rounded-xl border border-white/10 bg-white/5 object-contain p-1"
                              />
                              {img.caption && (
                                <figcaption className="mt-1 text-xs text-slate-400">
                                  {img.caption}
                                </figcaption>
                              )}
                            </figure>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Nút đóng thử thách tiếp tục */}
                <button
                  type="button"
                  onClick={closeChallengeModal}
                  className={`mt-4 w-full cursor-pointer rounded-xl py-3 text-sm font-extrabold text-white transition hover:opacity-90 active:scale-95 ${
                    challengeResult === "correct"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-600/40"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600"
                  }`}
                >
                  {challengeResult === "correct" ? "🎉 Tiếp tục quay may mắn" : "Đã hiểu & Tiếp tục"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
