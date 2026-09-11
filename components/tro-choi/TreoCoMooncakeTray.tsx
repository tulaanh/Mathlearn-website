"use client";

import { useState } from "react";
import MooncakeIcon from "./MooncakeIcon";
import {
  FRAGMENTS_PER_CAKE,
  MAX_CLAIMS_PER_CAKE,
  LAM_THUY_MOONCAKES,
  type MooncakeInfo,
  type MooncakeRarity,
} from "@/lib/treoco-state";

type Props = {
  mooncakeFragments: Record<string, number>;
  completedCakes: Record<string, number>;
  onClaimCake: (cakeId: string) => void;
  onGoToWheel?: () => void;
  spinTickets?: number;
};

const RARITY_ORDER: { key: MooncakeRarity; label: string; icon: string; headerColor: string; desc: string }[] = [
  {
    key: "pho_thong",
    label: "Cấp Độ 1: Phổ Thông (Common)",
    icon: "🟢",
    headerColor: "from-emerald-500/20 via-emerald-600/10 to-transparent text-emerald-300 border-emerald-500/30",
    desc: "Các vị bánh cổ truyền trứ danh đậm đà phong vị. Tỷ lệ quay ra mảnh cao nhất!",
  },
  {
    key: "hiem",
    label: "Cấp Độ 2: Hiếm (Rare)",
    icon: "🟣",
    headerColor: "from-sky-500/20 via-indigo-600/10 to-transparent text-sky-300 border-sky-500/30",
    desc: "Những vị best-seller signature độc đáo, thơm ngon nức tiếng.",
  },
  {
    key: "cuc_hiem",
    label: "Cấp Độ 3: Cực Hiếm & Huyền Thoại (Epic / Legendary)",
    icon: "👑",
    headerColor: "from-amber-500/25 via-orange-600/15 to-transparent text-amber-300 border-amber-500/40",
    desc: "Dòng bánh cao cấp hot-trend & lava trứng chảy tan chảy đỉnh cao nhất!",
  },
];

export default function TreoCoMooncakeTray({
  mooncakeFragments,
  completedCakes,
  onClaimCake,
  onGoToWheel,
  spinTickets,
}: Props) {
  const [lastClaimed, setLastClaimed] = useState<MooncakeInfo | null>(null);

  const totalCakes = Object.values(completedCakes).reduce((sum, n) => sum + (n || 0), 0);
  const totalFragments = Object.values(mooncakeFragments).reduce((sum, n) => sum + (n || 0), 0);

  const handleClaim = (cake: MooncakeInfo) => {
    onClaimCake(cake.id);
    setLastClaimed(cake);
    setTimeout(() => {
      setLastClaimed(null);
    }, 4000);
  };

  return (
    <div className="rounded-3xl border border-amber-500/40 bg-gradient-to-b from-[#1a0f38] via-[#120a28] to-[#0a0518] p-5 sm:p-7 text-white shadow-2xl">
      {/* Tiêu đề & Giới thiệu */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400/20 px-3 py-0.5 text-xs font-black tracking-wider text-amber-300">
              🥮 BỘ SƯU TẬP TRUNG THU
            </span>
          </div>
          <h2 className="mt-1 text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-sm">
            Khay Bánh Trung Thu
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-indigo-200/80">
            Mỗi loại bánh gồm đúng <span className="font-bold text-amber-300">4 mảnh ghép</span> (mỗi loại chỉ đổi được tối đa 1 cái). Thu thập đủ 4 mảnh để đổi thưởng vé đoán chữ và lượt quay may mắn!
          </p>
        </div>

        {/* Thống kê nhanh & Nút sang vòng quay */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onGoToWheel && (
            <button
              type="button"
              onClick={onGoToWheel}
              className="cursor-pointer rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 px-3.5 py-2 text-xs sm:text-sm font-black text-slate-950 shadow-md transition hover:scale-105 active:scale-95"
            >
              🎡 Sang Vòng Quay ({spinTickets ?? 0} vé) →
            </button>
          )}
          <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-amber-300/80 font-bold">Bánh đã đổi</p>
            <p className="text-lg font-black text-amber-300">{totalCakes} / 6 <span className="text-xs font-normal">hộp</span></p>
          </div>
          <div className="rounded-2xl border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-2 text-center">
            <p className="text-[10px] uppercase tracking-wider text-indigo-300/80 font-bold">Mảnh hiện có</p>
            <p className="text-lg font-black text-indigo-300">{totalFragments} <span className="text-xs font-normal">mảnh</span></p>
          </div>
        </div>
      </div>

      {/* Thông báo chúc mừng khi đổi bánh thành công */}
      {lastClaimed && (
        <div className="mt-4 flex items-center justify-center gap-3 animate-bounce rounded-2xl border border-emerald-400 bg-emerald-500/20 p-3.5 text-center shadow-lg">
          <MooncakeIcon cakeId={lastClaimed.id} size={44} className="h-11 w-11 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-300">🎉 ĐỔI THƯỞNG THÀNH CÔNG!</p>
            <p className="mt-0.5 text-base sm:text-lg font-black text-white">
              Bạn đã gom đủ 4 mảnh và thưởng thức trọn vẹn bánh <span className="text-amber-300">{lastClaimed.name}</span>!
            </p>
          </div>
        </div>
      )}

      {/* Banner chúc mừng khi gom đủ trọn vẹn cả 6 bánh */}
      {totalCakes >= 6 && (
        <div className="mt-4 flex items-center justify-center gap-3 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 p-4 text-center shadow-xl">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-300">ĐẠI TIỆC TRUNG THU HOÀN HẢO</p>
            <p className="mt-0.5 text-sm sm:text-base font-black text-white">
              Chúc mừng bạn đã thu thập trọn bộ 6/6 Bánh Trung Thu Đêm Rằm!
            </p>
          </div>
        </div>
      )}

      {/* Danh sách 6 loại bánh theo 3 cấp độ hiếm */}
      <div className="mt-6 space-y-7">
        {RARITY_ORDER.map((tier) => {
          const cakesInTier = LAM_THUY_MOONCAKES.filter((c) => c.rarity === tier.key);
          return (
            <div key={tier.key} className="space-y-3">
              {/* Tiêu đề cấp độ tinh gọn */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl border bg-gradient-to-r px-4 py-2 ${tier.headerColor}`}>
                <div className="flex items-center gap-2">
                  <span className="text-base">{tier.icon}</span>
                  <h3 className="text-xs sm:text-sm font-black tracking-wide">{tier.label}</h3>
                </div>
                <span className="text-[11px] text-slate-300/80">{tier.desc}</span>
              </div>

              {/* Grid 2 bánh trong nhóm - Thẻ Compact hiện đại */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {cakesInTier.map((cake) => {
                  const fragmentCount = mooncakeFragments[cake.id] || 0;
                  const completed = completedCakes[cake.id] || 0;
                  const isAlreadyClaimed = completed >= MAX_CLAIMS_PER_CAKE;
                  const canClaim = !isAlreadyClaimed && fragmentCount >= FRAGMENTS_PER_CAKE;

                  return (
                    <div
                      key={cake.id}
                      className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                        isAlreadyClaimed
                          ? "border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.12)]"
                          : canClaim
                          ? "border-amber-400/80 bg-gradient-to-b from-amber-500/10 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.2)] ring-1 ring-amber-400/60"
                          : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]"
                      }`}
                    >
                      {/* Hàng 1: Rarity badge & Tên trạng thái */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${cake.rarityBadgeColor}`}>
                            {cake.rarityLabel}
                          </span>
                          {isAlreadyClaimed ? (
                            <span className="rounded-md border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                              ✅ Đã đổi (1/1)
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              Chưa đổi (0/1)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hàng 2: Icon bánh 56px + Tên + Mô tả & Quà tặng */}
                      <div className="mt-3 flex items-center gap-3.5">
                        <div
                          className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl p-1.5 transition-transform ${
                            isAlreadyClaimed
                              ? "border border-emerald-500/40 bg-emerald-500/10 shadow-inner"
                              : canClaim
                              ? "border border-amber-400/50 bg-amber-400/15 shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse"
                              : "border border-white/10 bg-white/5"
                          }`}
                        >
                          <MooncakeIcon cakeId={cake.id} size={54} className="h-14 w-14 drop-shadow-md" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm sm:text-base font-black text-white leading-tight">
                            {cake.name}
                          </h4>
                          <p className="mt-0.5 text-xs text-indigo-200/70 line-clamp-1">
                            {cake.description}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <span className="rounded-md bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[11px] font-extrabold text-amber-300">
                              🎁 +{cake.rewardTurns} Vé đoán
                            </span>
                            {cake.rewardSpins > 0 && (
                              <span className="rounded-md bg-sky-400/15 border border-sky-400/30 px-2 py-0.5 text-[11px] font-extrabold text-sky-300">
                                +{cake.rewardSpins} Quay
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Hàng 3: Cụm 4 Mảnh Ghép Liền Khối (Segmented Jigsaw Bar) */}
                      <div className="mt-3.5 rounded-xl border border-white/10 bg-black/25 p-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-400">Tiến độ mảnh ghép:</span>
                          <span
                            className={`font-black ${
                              isAlreadyClaimed
                                ? "text-emerald-300"
                                : canClaim
                                ? "text-amber-300 animate-pulse"
                                : "text-slate-300"
                            }`}
                          >
                            {isAlreadyClaimed ? "Đã gom đủ 4/4" : `${fragmentCount} / ${FRAGMENTS_PER_CAKE} mảnh`}
                          </span>
                        </div>

                        {/* Thanh 4 nấc liền khối bo tròn */}
                        <div className="mt-1.5 grid grid-cols-4 gap-1.5">
                          {[1, 2, 3, 4].map((pieceNum) => {
                            const isOwned = isAlreadyClaimed || fragmentCount >= pieceNum;
                            return (
                              <div
                                key={pieceNum}
                                className={`flex items-center justify-center gap-1 rounded-lg py-1 px-1.5 text-center text-[10px] font-black transition-all ${
                                  isAlreadyClaimed
                                    ? "border border-emerald-400/50 bg-emerald-500/25 text-emerald-200"
                                    : isOwned
                                    ? "border border-amber-400/70 bg-gradient-to-r from-amber-400/30 to-amber-500/30 text-amber-200 shadow-sm"
                                    : "border border-dashed border-white/15 bg-white/[0.02] text-white/30"
                                }`}
                              >
                                <span>{isAlreadyClaimed ? "⭐" : isOwned ? "🧩" : "○"}</span>
                                <span>Mảnh {pieceNum}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hàng 4: Nút Đổi Bánh thanh thoát */}
                      <div className="mt-3">
                        <button
                          type="button"
                          disabled={!canClaim}
                          onClick={() => handleClaim(cake)}
                          className={`w-full rounded-xl py-2 px-3 text-center text-xs sm:text-sm font-black transition-all ${
                            isAlreadyClaimed
                              ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300/80 cursor-default"
                              : canClaim
                              ? "cursor-pointer bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 shadow-md shadow-orange-500/25 hover:scale-[1.01] active:scale-95 animate-pulse"
                              : "bg-white/10 text-white/40 cursor-not-allowed"
                          }`}
                        >
                          {isAlreadyClaimed
                            ? "✅ Đã Đổi Bánh (Tối đa 1 cái)"
                            : canClaim
                            ? `🎉 Đổi Bánh Ngay (+${cake.rewardTurns} Vé)`
                            : `Thu thập thêm ${Math.max(0, FRAGMENTS_PER_CAKE - fragmentCount)} mảnh`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
