"use client";

import { chuanHoaChu, type TreocoWord } from "@/lib/treoco-words";

type Props = {
  word: TreocoWord;
  revealedLetters: string[];
  wrongCount: number;
  /** Hiện toàn bộ đáp án (khi thua). */
  showAnswer?: boolean;
};

/** Các câu bình luận ngộ nghĩnh theo mức độ Lân con múa cọc mai hoa thung */
const LAN_STATUS_MESSAGES = [
  "🦁 Lân con múa dẻo trên cọc mai hoa thung, cùng giải đố nào!",
  "😲 Ôi chao! Lân con bước hụt một chân rồi!",
  "💨 Lân con chới với, rơi mất quả cầu bông trên sừng!",
  "🥁 Rơi mất chiếc trống con rồi, Lân lảo đảo giữ thăng bằng!",
  "💦 Lân trượt chân bám mép cọc, mồ hôi đầm đìa cầu cứu!",
  "😵 Lộn tùng phèo rồi! Mắt Lân xoay mòng mòng!",
  "🥮 Úi da! Lân con rơi bịch vào đĩa bánh trung thu rồi!",
];

export default function TreoCoHangman({ word, revealedLetters, wrongCount, showAnswer }: Props) {
  const revealedSet = new Set(revealedLetters.map(chuanHoaChu));
  const safeCount = Math.min(6, Math.max(0, wrongCount));

  return (
    <div className="rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#240c42] via-[#1a123f] to-[#0c0824] p-5 shadow-sm">
      {/* Khung tranh hoạt hình Chú Lân tinh nghịch múa lân */}
      <svg
        viewBox="0 0 340 230"
        className="mx-auto h-56 w-full max-w-sm select-none"
        role="img"
        aria-label={`Chú Lân múa cọc mai hoa thung: ${safeCount}/6 lần sai`}
      >
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#facc15" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#b91c1c" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>
        </defs>

        {/* Bầu trời sao đêm rằm */}
        <circle cx="40" cy="50" r="1.4" fill="#fef08a" opacity="0.8" />
        <circle cx="85" cy="30" r="1.8" fill="#ffffff" opacity="0.9" />
        <circle cx="130" cy="45" r="1.2" fill="#fef08a" opacity="0.7" />
        <circle cx="210" cy="35" r="1.6" fill="#ffffff" opacity="0.8" />
        <circle cx="315" cy="80" r="1.4" fill="#fef08a" opacity="0.7" />

        {/* Vầng trăng rằm vàng rực ở góc trên bên phải */}
        <circle cx="280" cy="45" r="38" fill="url(#moonGlow)" />
        <circle cx="280" cy="45" r="26" fill="#fbbf24" />
        <circle cx="270" cy="40" r="5" fill="#f59e0b" opacity="0.35" />
        <circle cx="288" cy="52" r="4" fill="#f59e0b" opacity="0.3" />

        {/* Dải cờ hội tam giác ngũ sắc đêm rằm */}
        <path d="M0,15 Q85,25 170,18 Q255,25 340,15" stroke="#fcd34d" strokeWidth="1.2" fill="none" opacity="0.8" />
        {/* Cờ 1 */}
        <polygon points="20,17 32,18 26,30" fill="#ef4444" />
        {/* Cờ 2 */}
        <polygon points="50,20 62,21 56,33" fill="#facc15" />
        {/* Cờ 3 */}
        <polygon points="80,21 92,21 86,34" fill="#3b82f6" />
        {/* Cờ 4 */}
        <polygon points="110,20 122,19 116,32" fill="#10b981" />
        {/* Cờ 5 */}
        <polygon points="140,18 152,18 146,31" fill="#ec4899" />
        {/* Cờ 6 */}
        <polygon points="170,18 182,19 176,32" fill="#f97316" />
        {/* Cờ 7 */}
        <polygon points="200,20 212,21 206,33" fill="#8b5cf6" />
        {/* Cờ 8 */}
        <polygon points="230,21 242,20 236,32" fill="#06b6d4" />

        {/* Đèn lồng đỏ treo góc trái */}
        <line x1="25" y1="0" x2="25" y2="45" stroke="#fbbf24" strokeWidth="1.2" />
        <ellipse cx="25" cy="53" rx="7" ry="9" fill="#dc2626" />
        <ellipse cx="25" cy="53" rx="3" ry="9" fill="#ef4444" opacity="0.7" />
        <line x1="25" y1="62" x2="25" y2="68" stroke="#fbbf24" strokeWidth="1.2" />

        {/* Sàn sân khấu lễ hội */}
        <path d="M0,212 L340,212 L340,230 L0,230 Z" fill="#450a0a" />
        <line x1="0" y1="212" x2="340" y2="212" stroke="#f59e0b" strokeWidth="2.5" />

        {/* Dàn cọc Mai Hoa Thung */}
        {/* Cọc 1 (Trái) */}
        <rect x="65" y="172" width="16" height="40" rx="3" fill="url(#pillarGrad)" stroke="#7f1d1d" strokeWidth="1" />
        <ellipse cx="73" cy="172" rx="14" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <ellipse cx="73" cy="172" rx="10" ry="3" fill="#fef08a" />

        {/* Cọc 3 (Phải) */}
        <rect x="242" y="165" width="16" height="47" rx="3" fill="url(#pillarGrad)" stroke="#7f1d1d" strokeWidth="1" />
        <ellipse cx="250" cy="165" rx="14" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
        <ellipse cx="250" cy="165" rx="10" ry="3" fill="#fef08a" />

        {/* Cọc 2 (Cọc chính ở giữa - cao nhất) */}
        <rect x="152" y="142" width="22" height="70" rx="3" fill="url(#pillarGrad)" stroke="#7f1d1d" strokeWidth="1.2" />
        {/* Đai trang trí vàng trên cọc chính */}
        <rect x="152" y="168" width="22" height="4" fill="#fbbf24" />
        <rect x="152" y="190" width="22" height="4" fill="#fbbf24" />
        {/* Đĩa đệm tròn đỉnh cọc chính */}
        <ellipse cx="163" cy="142" rx="22" ry="7" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
        <ellipse cx="163" cy="142" rx="17" ry="4.5" fill="#fef08a" />

        {/* Stage 2+: Quả cầu bông đỏ tuột rơi khỏi sừng */}
        {safeCount >= 2 && safeCount < 6 && (
          <g transform="translate(195, 160)">
            <circle cx="0" cy="0" r="4.5" fill="#dc2626" stroke="#fbbf24" strokeWidth="1" />
            <path d="M0,-8 L0,-4 M-3,-10 L-2,-5 M3,-9 L2,-5" stroke="#e2e8f0" strokeWidth="1" opacity="0.6" />
          </g>
        )}

        {/* Stage 3+: Chiếc trống con rơi lăn lóc ở chân cọc */}
        {safeCount >= 3 && safeCount < 6 && (
          <g transform="translate(112, 202) rotate(-18)">
            <rect x="-8" y="-5" width="16" height="10" rx="2" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
            <ellipse cx="0" cy="-5" rx="8" ry="2.5" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
            <ellipse cx="0" cy="5" rx="8" ry="2.5" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
            <line x1="-12" y1="-8" x2="-4" y2="-4" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* CHÚ LÂN CHIBI KHI CHƯA THUA (safeCount < 6) */}
        {safeCount < 6 && (
          <g
            transform={`translate(${
              safeCount === 0
                ? "163, 118"
                : safeCount === 1
                ? "163, 118) rotate(8, 163, 135"
                : safeCount === 2
                ? "163, 118) rotate(16, 163, 135"
                : safeCount === 3
                ? "163, 122) rotate(-22, 163, 135"
                : safeCount === 4
                ? "163, 150"
                : "163, 155) rotate(165, 163, 140"
            })`}
          >
            {/* Stage 4+: Giọt mồ hôi hoạt hình to tướng bắn ra hai bên */}
            {safeCount >= 4 && (
              <g>
                <path d="M-22,-18 Q-26,-22 -22,-26 Q-18,-22 -22,-18" fill="#38bdf8" />
                <path d="M22,-16 Q26,-20 22,-24 Q18,-20 22,-16" fill="#38bdf8" />
              </g>
            )}

            {/* Đuôi Lân ngoe nguẩy */}
            <path
              d="M-15,8 Q-26,2 -24,-6 Q-18,-1 -13,2"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.2"
            />
            <circle cx="-24" cy="-6" r="3" fill="#dc2626" />

            {/* Thân Lân Chibi & Áo choàng vảy rồng */}
            <path
              d="M-14,0 Q-16,14 0,16 Q16,14 14,0 Z"
              fill="#dc2626"
              stroke="#991b1b"
              strokeWidth="1.2"
            />
            {/* Vảy vàng rực rỡ */}
            <path d="M-8,5 Q-4,8 0,5 Q4,8 8,5" stroke="#fde047" strokeWidth="1.4" fill="none" />
            <path d="M-6,10 Q0,13 6,10" stroke="#fde047" strokeWidth="1.4" fill="none" />
            {/* Viền lông trắng mềm quanh hông */}
            <path d="M-15,14 Q0,19 15,14" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* Chân Lân Chibi múp míp */}
            {safeCount === 0 && (
              /* Đứng vững, 2 chân trước nhấc nhẹ nhí nhảnh */
              <g>
                <ellipse cx="-10" cy="18" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="10" cy="18" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="-4" cy="14" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="4" cy="14" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
              </g>
            )}
            {safeCount === 1 && (
              /* Hụt 1 chân trước ra ngoài cọc */
              <g>
                <ellipse cx="-10" cy="18" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="10" cy="18" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="-4" cy="14" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
                {/* Chân phải với hụt xuống dưới */}
                <ellipse cx="12" cy="24" rx="3.5" ry="4.5" fill="#ef4444" stroke="#b45309" strokeWidth="0.8" />
              </g>
            )}
            {(safeCount === 2 || safeCount === 3) && (
              /* Hai chân chới với giãy giãy */
              <g>
                <ellipse cx="-12" cy="22" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="12" cy="22" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="-5" cy="16" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="5" cy="16" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
              </g>
            )}
            {safeCount === 4 && (
              /* Hai chân trước bám chặt mép cọc, hai chân sau lơ lửng */
              <g>
                <ellipse cx="-10" cy="-6" rx="4.5" ry="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                <ellipse cx="10" cy="-6" rx="4.5" ry="4" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2" />
                <ellipse cx="-8" cy="22" rx="4" ry="5" fill="#ef4444" />
                <ellipse cx="8" cy="22" rx="4" ry="5" fill="#ef4444" />
              </g>
            )}
            {safeCount === 5 && (
              /* Bốn chân chổng lên trời */
              <g>
                <ellipse cx="-10" cy="-14" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="10" cy="-14" rx="4" ry="5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
                <ellipse cx="-5" cy="-8" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
                <ellipse cx="5" cy="-8" rx="3.5" ry="4" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
              </g>
            )}

            {/* ĐẦU LÂN CHIBI */}
            {/* Vòm lông xù trắng quanh đầu Lân */}
            <circle cx="0" cy="-10" r="19" fill="#ffffff" />
            {/* Khuôn mặt Lân đỏ cam */}
            <ellipse cx="0" cy="-10" rx="16" ry="14" fill="#ef4444" stroke="#b91c1c" strokeWidth="1.4" />

            {/* Sừng Lân & Quả cầu bông */}
            {safeCount < 2 ? (
              /* Sừng thẳng đứng có quả cầu bông đỏ */
              <g>
                <path d="M-2.5,-23 Q0,-32 2.5,-23 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
                <circle cx="0" cy="-33" r="4" fill="#dc2626" stroke="#fde047" strokeWidth="1" />
              </g>
            ) : (
              /* Sừng vẹo sang một bên, mất quả cầu bông */
              <g transform="rotate(28, 0, -22)">
                <path d="M-2.5,-23 Q0,-31 2.5,-23 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
              </g>
            )}

            {/* Hai tai Lân vểnh lên */}
            <polygon points="-12,-20 -18,-27 -9,-24" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <polygon points="12,-20 18,-27 9,-24" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />

            {/* Lông mày Lân rậm rạp vàng cam */}
            <path d="M-14,-17 Q-8,-23 -2,-17" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M14,-17 Q8,-23 2,-17" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" fill="none" />

            {/* MẮT LÂN THEO TỪNG GIAI ĐOẠN */}
            {safeCount === 0 && (
              /* Mắt to tròn sáng long lanh */
              <g>
                <circle cx="-6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="-6.5" cy="-12" r="2.8" fill="#1e1b4b" />
                <circle cx="6.5" cy="-12" r="2.8" fill="#1e1b4b" />
                <circle cx="-7.5" cy="-13.5" r="1.1" fill="#ffffff" />
                <circle cx="5.5" cy="-13.5" r="1.1" fill="#ffffff" />
              </g>
            )}
            {safeCount === 1 && (
              /* Mắt mở to ngơ ngác */
              <g>
                <circle cx="-6.5" cy="-12" r="5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="6.5" cy="-12" r="5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="-6.5" cy="-12" r="2" fill="#1e1b4b" />
                <circle cx="6.5" cy="-12" r="2" fill="#1e1b4b" />
              </g>
            )}
            {(safeCount === 2 || safeCount === 3) && (
              /* Mắt lác hoang mang */
              <g>
                <circle cx="-6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="-4.5" cy="-12" r="2.4" fill="#1e1b4b" />
                <circle cx="8.5" cy="-12" r="2.4" fill="#1e1b4b" />
              </g>
            )}
            {safeCount === 4 && (
              /* Mắt nhắm tịt nghiến răng */
              <g>
                <path d="M-10,-12 L-3,-10 L-10,-8" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                <path d="M10,-12 L3,-10 L10,-8" stroke="#1e1b4b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              </g>
            )}
            {safeCount === 5 && (
              /* Mắt xoáy mòng mòng (@_@) */
              <g>
                <circle cx="-6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <circle cx="6.5" cy="-12" r="4.5" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
                <path d="M-8.5,-12 A2,2 0 1,0 -4.5,-12" stroke="#1e1b4b" strokeWidth="1.5" fill="none" />
                <path d="M4.5,-12 A2,2 0 1,0 8.5,-12" stroke="#1e1b4b" strokeWidth="1.5" fill="none" />
              </g>
            )}

            {/* Mũi Lân & Quả cầu gương trên mũi */}
            <circle cx="0" cy="-7" r="3.5" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <circle cx="-1" cy="-8" r="1.2" fill="#ffffff" />

            {/* Miệng Lân */}
            {safeCount === 0 && (
              /* Miệng cười toe toét ngậm lưỡi hồng */
              <g>
                <path d="M-7,-3 Q0,4 7,-3" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="#ffffff" />
                <ellipse cx="0" cy="-0.5" rx="3" ry="1.8" fill="#ec4899" />
              </g>
            )}
            {safeCount >= 1 && safeCount <= 3 && (
              /* Há hốc mồm chữ O */
              <ellipse cx="0" cy="-2" rx="3.5" ry="4.5" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="1" />
            )}
            {safeCount === 4 && (
              /* Nghiến răng bám cọc */
              <rect x="-6" y="-4" width="12" height="4" rx="1.5" fill="#ffffff" stroke="#7f1d1d" strokeWidth="1" />
            )}
            {safeCount === 5 && (
              /* Mồm méo xệch chóng mặt */
              <path d="M-6,-2 Q-2,3 2,-3 Q6,2 8,-2" stroke="#7f1d1d" strokeWidth="1.8" strokeLinecap="round" fill="none" />
            )}
          </g>
        )}

        {/* STAGE 6 (THUA): LÂN RƠI BỊCH VÀO ĐĨA BÁNH TRUNG THU KHỔNG LỒ */}
        {safeCount >= 6 && (
          <g transform="translate(163, 195)">
            {/* Chiếc đĩa tròn trắng */}
            <ellipse cx="0" cy="12" rx="55" ry="15" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2" />

            {/* Chiếc Bánh Trung Thu khổng lồ nướng vàng óng */}
            <ellipse cx="0" cy="8" rx="46" ry="12" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
            <ellipse cx="0" cy="6" rx="44" ry="10" fill="#d97706" />
            {/* Hoa văn bánh nướng */}
            <path d="M-30,6 Q0,12 30,6" stroke="#92400e" strokeWidth="1.5" fill="none" />
            <path d="M-35,4 Q0,-2 35,4" stroke="#92400e" strokeWidth="1.5" fill="none" />

            {/* Vết lõm lòng đỏ trứng muối ở giữa bánh nơi Lân cắm đầu vào */}
            <ellipse cx="0" cy="6" rx="18" ry="7" fill="#ea580c" />
            <ellipse cx="0" cy="5" rx="14" ry="5.5" fill="#f97316" />

            {/* Chú Lân úp trọn đầu vào lòng đỏ, mông và hai chân sau chổng ngược lên trời */}
            <circle cx="0" cy="2" r="13" fill="#ffffff" /> {/* Viền lông trắng của đầu Lân cắm xuống */}
            <ellipse cx="0" cy="-6" rx="12" ry="10" fill="#dc2626" stroke="#991b1b" strokeWidth="1.2" /> {/* Mông Lân */}
            {/* Đuôi Lân rũ xuống */}
            <path d="M0,-16 Q-4,-22 -8,-18" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Hai chân sau chổng thẳng lên trời quơ quơ */}
            <ellipse cx="-10" cy="-18" rx="4" ry="5.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
            <ellipse cx="10" cy="-18" rx="4" ry="5.5" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />

            {/* Một chân phải cầm que cắm cờ trắng xin hàng nhỏ xíu */}
            <line x1="14" y1="-18" x2="26" y2="-32" stroke="#cbd5e1" strokeWidth="1.4" />
            <polygon points="26,-32 38,-28 26,-24" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
            <text x="28" y="-27" fontSize="5" fill="#dc2626" fontWeight="bold">HÀNG</text>

            {/* Vụn bánh & Khói hoạt hình lúc rơi cái BỊCH */}
            <ellipse cx="-28" cy="8" rx="3.5" ry="2" fill="#f59e0b" />
            <ellipse cx="28" cy="9" rx="3" ry="1.8" fill="#f59e0b" />
            <ellipse cx="-18" cy="14" rx="2.5" ry="1.5" fill="#f59e0b" />
            <ellipse cx="20" cy="13" rx="2.5" ry="1.5" fill="#f59e0b" />
            <ellipse cx="-25" cy="0" rx="8" ry="4" fill="#fef08a" opacity="0.6" />
            <ellipse cx="25" cy="0" rx="8" ry="4" fill="#fef08a" opacity="0.6" />
          </g>
        )}
      </svg>

      {/* Dòng bình luận trạng thái hoạt hình */}
      <div className="mt-2 text-center">
        <span className="inline-block rounded-full bg-indigo-900/70 px-3.5 py-1 text-xs font-bold text-amber-300 shadow-inner">
          {LAN_STATUS_MESSAGES[safeCount]}
        </span>
      </div>

      {/* Ô chữ */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {[...word.text].map((ch, index) => {
          if (ch === " ") {
            return <span key={index} className="w-3 sm:w-4" aria-hidden />;
          }
          const shown = showAnswer || revealedSet.has(chuanHoaChu(ch));
          return (
            <span
              key={index}
              className={`flex h-10 w-8 items-center justify-center rounded-md border-b-4 text-lg font-extrabold sm:h-11 sm:w-9 ${
                shown
                  ? showAnswer
                    ? "border-amber-400 text-amber-300"
                    : "border-emerald-400 text-white"
                  : "border-white/30 text-transparent"
              }`}
              aria-label={shown ? ch : "chưa đoán"}
            >
              {shown ? ch : "?"}
            </span>
          );
        })}
      </div>

      <p className="mt-4 text-center text-sm text-indigo-200/90">
        <span className="font-bold text-amber-300">Gợi ý:</span> {word.hint}
      </p>
    </div>
  );
}
