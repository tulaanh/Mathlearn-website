/**
 * ============================================================
 *  GAME TREO CỔ TRUNG THU — Trạng thái & đồng bộ theo tài khoản
 * ------------------------------------------------------------
 *  - Nguồn chân lý: bảng `treoco_state` trên Supabase (1 dòng/user).
 *  - LocalStorage là tầng đệm hiển thị tức thì (pattern lib/progress.ts).
 *  - Client chỉ ghi các cột "sân chơi" (chữ đoán, lượt, thắng/thua);
 *    KHÔNG bao giờ đụng các cột do server quản: active_question,
 *    jar_difficulties, next_question_at — nhờ vậy upsert không bao
 *    giờ ghi đè câu hỏi đang mở hay hồi chiếu.
 * ============================================================
 */

import { getTreocoWord, randomTreocoWordKey } from "@/lib/treoco-words";

export type TreocoStatus = "playing" | "won" | "lost";

export type MooncakeRarity = "pho_thong" | "hiem" | "cuc_hiem";

export type MooncakeInfo = {
  id: string;
  name: string;
  rarity: MooncakeRarity;
  rarityLabel: string;
  rarityBadgeColor: string;
  borderColor: string;
  icon: string;
  imageSrc: string;
  description: string;
  rewardTurns: number;
  rewardSpins: number;
};

/** Số mảnh ghép cần để đổi 1 hộp bánh hoàn chỉnh */
export const FRAGMENTS_PER_CAKE = 4;

/** Giới hạn số lần đổi tối đa cho mỗi loại bánh (mỗi bánh chỉ đổi được 1 cái) */
export const MAX_CLAIMS_PER_CAKE = 1;

/** Danh sách 6 loại bánh Trung Thu phân chia theo 3 cấp độ hiếm */
export const LAM_THUY_MOONCAKES: MooncakeInfo[] = [
  // 1. Phổ thông
  {
    id: "thap_cam_xa_xiu",
    name: "Thập Cẩm Xá Xíu Trứng Muối",
    rarity: "pho_thong",
    rarityLabel: "Phổ Thông",
    rarityBadgeColor: "bg-emerald-500 text-white",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    icon: "🥮",
    imageSrc: "/tro-choi/mooncakes/thap-cam-xa-xiu.svg",
    description: "Vị cổ truyền đặc trưng: xá xíu, lạp xưởng nướng vàng, hạt sen bùi ngậy quyện trứng muối béo thơm.",
    rewardTurns: 12,
    rewardSpins: 0,
  },
  {
    id: "dau_xanh_hat_dua",
    name: "Đậu Xanh Hạt Dưa Trứng Muối",
    rarity: "pho_thong",
    rarityLabel: "Phổ Thông",
    rarityBadgeColor: "bg-emerald-500 text-white",
    borderColor: "border-emerald-500/40 hover:border-emerald-400",
    icon: "🥮",
    imageSrc: "/tro-choi/mooncakes/dau-xanh-hat-dua.svg",
    description: "Vị nhân ngọt truyền thống: đậu xanh sên tay mềm mượt, hạt dưa giòn rụm và lòng đỏ trứng muối đỏ au.",
    rewardTurns: 12,
    rewardSpins: 0,
  },
  // 2. Hiếm
  {
    id: "sua_dua_soi_non",
    name: "Sữa Dừa Sợi Non",
    rarity: "hiem",
    rarityLabel: "Hiếm",
    rarityBadgeColor: "bg-sky-500 text-white",
    borderColor: "border-sky-500/40 hover:border-sky-400",
    icon: "🥥",
    imageSrc: "/tro-choi/mooncakes/sua-dua-soi-non.svg",
    description: "Hương vị signature độc đáo: dừa non nạo sợi giòn sần sật béo ngậy sữa tươi và cốt dừa thơm ngát.",
    rewardTurns: 20,
    rewardSpins: 1,
  },
  {
    id: "com_non_dua_deo",
    name: "Cốm Non Dừa Dẻo",
    rarity: "hiem",
    rarityLabel: "Hiếm",
    rarityBadgeColor: "bg-sky-500 text-white",
    borderColor: "border-sky-500/40 hover:border-sky-400",
    icon: "🌾",
    imageSrc: "/tro-choi/mooncakes/com-non-dua-deo.svg",
    description: "Hương vị mùa thu Hà Nội: cốm mộc dẻo thơm nức mũi, xào quyện sợi dừa ngào đường phèn thanh khiết.",
    rewardTurns: 20,
    rewardSpins: 1,
  },
  // 3. Cực hiếm / Huyền thoại
  {
    id: "mochi_khoai_mon",
    name: "Mochi Khoai Môn Trứng Muối",
    rarity: "cuc_hiem",
    rarityLabel: "Cực Hiếm",
    rarityBadgeColor: "bg-purple-600 text-white",
    borderColor: "border-purple-500/50 hover:border-purple-400",
    icon: "🍠",
    imageSrc: "/tro-choi/mooncakes/mochi-khoai-mon.svg",
    description: "Dòng bánh nướng kéo sợi mochi hot-trend: khoai môn dẻo bùi bọc mochi sữa kéo sợi dai mềm quyến rũ.",
    rewardTurns: 35,
    rewardSpins: 2,
  },
  {
    id: "lava_trung_chay",
    name: "Lava Trứng Chảy Hoàng Kim",
    rarity: "cuc_hiem",
    rarityLabel: "Huyền Thoại",
    rarityBadgeColor: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",
    borderColor: "border-amber-500/60 hover:border-amber-400",
    icon: "🍯",
    imageSrc: "/tro-choi/mooncakes/lava-trung-chay.svg",
    description: "Tuyệt phẩm bánh nướng cao cấp: nhân kim sa lava trứng muối sánh mịn ngập tràn vị giác khi cắn.",
    rewardTurns: 50,
    rewardSpins: 3,
  },
];

export type TreocoState = {
  wordKey: string;
  revealedLetters: string[];
  wrongLetters: string[];
  turns: number;
  status: TreocoStatus;
  /** Thời điểm được phép giải câu toán tiếp theo (ISO). */
  nextQuestionAt: string;
  wins: number;
  losses: number;
  updatedAt: string;
  /** Số vé quay thưởng may mắn. */
  spinTickets: number;
  /** Mảnh ghép các loại bánh Trung Thu (id bánh -> số mảnh sở hữu). */
  mooncakeFragments: Record<string, number>;
  /** Số bánh Trung Thu đã đổi thành công (id bánh -> số lượng). */
  completedCakes: Record<string, number>;
};

/** Số lượt khởi đầu cho mỗi từ mới (đang set 30 để test thoải mái). */
export const TREOCO_START_TURNS = 30;
/** Số lần đoán sai tối đa trước khi thua. */
export const TREOCO_MAX_WRONG = 6;
/** Hồi chiếu sau khi trả lời ĐÚNG (ms). */
export const TREOCO_COOLDOWN_DUNG_MS = 3 * 60 * 1000;
/** Hồi chiếu sau khi trả lời SAI (ms). */
export const TREOCO_COOLDOWN_SAI_MS = 10 * 60 * 1000;

/** Định dạng mm:ss cho đồng hồ hồi chiếu. */
export function formatTreocoCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const STORAGE_KEY_PREFIX = "treoco-state";

export function getTreocoStorageKey(userId?: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : STORAGE_KEY_PREFIX;
}

/** Trạng thái mặc định: từ ngẫu nhiên, 30 lượt, 1 vé quay trải nghiệm, khay bánh trống. */
export function defaultTreocoState(now = new Date()): TreocoState {
  return {
    wordKey: randomTreocoWordKey(),
    revealedLetters: [],
    wrongLetters: [],
    turns: TREOCO_START_TURNS,
    status: "playing",
    nextQuestionAt: now.toISOString(),
    wins: 0,
    losses: 0,
    updatedAt: now.toISOString(),
    spinTickets: 1,
    mooncakeFragments: {},
    completedCakes: {},
  };
}

/** Kiểm tra/sửa dữ liệu đầu vào: từ không còn trong danh sách thì đổi từ mới. */
export function normalizeTreocoState(raw: Partial<TreocoState> | null | undefined): TreocoState {
  const now = new Date().toISOString();
  const wordKey = raw?.wordKey && getTreocoWord(raw.wordKey) ? raw.wordKey : randomTreocoWordKey();
  
  const rawFragments = raw?.mooncakeFragments;
  const mooncakeFragments: Record<string, number> = {};
  if (rawFragments && typeof rawFragments === "object") {
    for (const [k, v] of Object.entries(rawFragments)) {
      if (typeof v === "number" && v >= 0) mooncakeFragments[k] = Math.floor(v);
    }
  }

  const rawCakes = raw?.completedCakes;
  const completedCakes: Record<string, number> = {};
  if (rawCakes && typeof rawCakes === "object") {
    for (const [k, v] of Object.entries(rawCakes)) {
      if (typeof v === "number" && v >= 0) completedCakes[k] = Math.floor(v);
    }
  }

  return {
    wordKey,
    revealedLetters: Array.isArray(raw?.revealedLetters) ? raw.revealedLetters.filter((c) => typeof c === "string") : [],
    wrongLetters: Array.isArray(raw?.wrongLetters) ? raw.wrongLetters.filter((c) => typeof c === "string") : [],
    turns: Math.max(0, Math.floor(Number(raw?.turns ?? TREOCO_START_TURNS)) || 0),
    status: raw?.status === "won" || raw?.status === "lost" ? raw.status : "playing",
    nextQuestionAt: raw?.nextQuestionAt || now,
    wins: Math.max(0, Math.floor(Number(raw?.wins ?? 0)) || 0),
    losses: Math.max(0, Math.floor(Number(raw?.losses ?? 0)) || 0),
    updatedAt: raw?.updatedAt || now,
    spinTickets: Math.max(0, Math.floor(Number(raw?.spinTickets ?? 1)) || 0),
    mooncakeFragments,
    completedCakes,
  };
}

/**
 * Hợp nhất an toàn giữa trạng thái từ cơ sở dữ liệu (Supabase) và bộ nhớ đệm (LocalStorage):
 * - Giữ lại số mảnh bánh lớn nhất (Math.max) cho mỗi loại bánh -> Đảm bảo 100% không mất mảnh bánh.
 * - Giữ lại số bánh đã đổi lớn nhất (Math.max) cho mỗi loại bánh -> Đảm bảo không mất bánh đã đổi.
 * - Giữ lại số vé quay lớn nhất (Math.max) -> Đảm bảo không mất vé quay.
 * - Chọn trạng thái có thời gian updatedAt mới hơn làm gốc cho các trường tiến trình đoán chữ.
 */
export function mergeTreocoStates(
  dbState: TreocoState | null | undefined,
  localState: TreocoState | null | undefined
): TreocoState {
  if (!dbState && !localState) return defaultTreocoState();
  if (!dbState) return normalizeTreocoState(localState);
  if (!localState) return normalizeTreocoState(dbState);

  const dbNorm = normalizeTreocoState(dbState);
  const locNorm = normalizeTreocoState(localState);

  const dbTime = new Date(dbNorm.updatedAt || 0).getTime();
  const locTime = new Date(locNorm.updatedAt || 0).getTime();
  const base = locTime > dbTime ? locNorm : dbNorm;

  // Hợp nhất mảnh bánh (mooncakeFragments)
  const mergedFragments: Record<string, number> = { ...(base.mooncakeFragments || {}) };
  const allFragmentKeys = new Set([
    ...Object.keys(dbNorm.mooncakeFragments || {}),
    ...Object.keys(locNorm.mooncakeFragments || {}),
  ]);
  for (const k of allFragmentKeys) {
    const v1 = dbNorm.mooncakeFragments[k] || 0;
    const v2 = locNorm.mooncakeFragments[k] || 0;
    mergedFragments[k] = Math.max(v1, v2);
  }

  // Hợp nhất bánh đã đổi (completedCakes)
  const mergedCompleted: Record<string, number> = { ...(base.completedCakes || {}) };
  const allCakeKeys = new Set([
    ...Object.keys(dbNorm.completedCakes || {}),
    ...Object.keys(locNorm.completedCakes || {}),
  ]);
  for (const k of allCakeKeys) {
    const v1 = dbNorm.completedCakes[k] || 0;
    const v2 = locNorm.completedCakes[k] || 0;
    mergedCompleted[k] = Math.max(v1, v2);
  }

  // Hợp nhất vé quay (spinTickets)
  const mergedSpinTickets = Math.max(dbNorm.spinTickets || 0, locNorm.spinTickets || 0);

  return {
    ...base,
    spinTickets: mergedSpinTickets,
    mooncakeFragments: mergedFragments,
    completedCakes: mergedCompleted,
  };
}

/** Đọc trạng thái từ localStorage (cache tức thời). */
export function loadTreocoStateLocal(userId?: string | null): TreocoState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getTreocoStorageKey(userId));
    return raw ? normalizeTreocoState(JSON.parse(raw) as Partial<TreocoState>) : null;
  } catch {
    return null;
  }
}

/** Chỉ ghi vào localStorage. */
export function persistTreocoStateLocal(state: TreocoState, userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getTreocoStorageKey(userId), JSON.stringify(state));
  } catch {
    // trình duyệt chặn localStorage — bỏ qua
  }
}

export type TreocoDbRow = {
  word_key: string | null;
  revealed_letters: unknown;
  wrong_letters: unknown;
  turns: number | null;
  status: string | null;
  next_question_at: string | null;
  wins: number | null;
  losses: number | null;
  updated_at: string | null;
  spin_tickets?: number | null;
  mooncake_fragments?: unknown;
  completed_cakes?: unknown;
};

/** Đổi dòng DB (snake_case) thành trạng thái client (camelCase). */
export function treocoRowToState(row: TreocoDbRow): TreocoState {
  return normalizeTreocoState({
    wordKey: row.word_key ?? undefined,
    revealedLetters: Array.isArray(row.revealed_letters) ? (row.revealed_letters as string[]) : [],
    wrongLetters: Array.isArray(row.wrong_letters) ? (row.wrong_letters as string[]) : [],
    turns: row.turns ?? undefined,
    status: row.status === "won" || row.status === "lost" ? row.status : "playing",
    nextQuestionAt: row.next_question_at ?? undefined,
    wins: row.wins ?? 0,
    losses: row.losses ?? 0,
    updatedAt: row.updated_at ?? undefined,
    spinTickets: row.spin_tickets ?? undefined,
    mooncakeFragments: (row.mooncake_fragments && typeof row.mooncake_fragments === "object") ? (row.mooncake_fragments as Record<string, number>) : {},
    completedCakes: (row.completed_cakes && typeof row.completed_cakes === "object") ? (row.completed_cakes as Record<string, number>) : {},
  });
}

/** Đọc trạng thái từ Supabase; trả về null khi chưa có dòng hoặc lỗi. */
export async function loadTreocoStateFromDb(userId: string): Promise<TreocoState | null> {
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    if (!supabase) return null;
    let res = await supabase
      .from("treoco_state")
      .select("word_key, revealed_letters, wrong_letters, turns, status, next_question_at, wins, losses, updated_at, spin_tickets, mooncake_fragments, completed_cakes")
      .eq("user_id", userId)
      .maybeSingle();

    // Nếu DB chưa có các cột mới (spin_tickets, mooncake_fragments, completed_cakes), fallback về các cột ban đầu
    if (res.error) {
      res = await supabase
        .from("treoco_state")
        .select("word_key, revealed_letters, wrong_letters, turns, status, next_question_at, wins, losses, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
    }

    if (res.error || !res.data) return null;
    return treocoRowToState(res.data as TreocoDbRow);
  } catch {
    return null;
  }
}

/**
 * Lưu trạng thái: ghi localStorage ngay lập tức + upsert Supabase.
 * Upsert dùng onConflict user_id và chỉ chứa các cột "sân chơi" nên
 * không ảnh hưởng câu hỏi đang mở / hồi chiếu do server quản.
 */
export function saveTreocoState(state: TreocoState, userId?: string | null) {
  persistTreocoStateLocal(state, userId);
  if (!userId) return;
  import("@/lib/supabase/client").then(({ createClient }) => {
    const supabase = createClient();
    if (!supabase) return;

    const fullPayload = {
      user_id: userId,
      word_key: state.wordKey,
      revealed_letters: state.revealedLetters,
      wrong_letters: state.wrongLetters,
      turns: state.turns,
      status: state.status,
      wins: state.wins,
      losses: state.losses,
      updated_at: state.updatedAt,
      spin_tickets: state.spinTickets ?? 0,
      mooncake_fragments: state.mooncakeFragments ?? {},
      completed_cakes: state.completedCakes ?? {},
    };

    supabase
      .from("treoco_state")
      .upsert(fullPayload, { onConflict: "user_id" })
      .then(({ error }) => {
        if (error) {
          // Bảng chưa có cột mở rộng -> upsert các cột cơ bản để vẫn bảo toàn tiến trình
          const fallbackPayload = {
            user_id: userId,
            word_key: state.wordKey,
            revealed_letters: state.revealedLetters,
            wrong_letters: state.wrongLetters,
            turns: state.turns,
            status: state.status,
            wins: state.wins,
            losses: state.losses,
            updated_at: state.updatedAt,
          };
          supabase
            .from("treoco_state")
            .upsert(fallbackPayload, { onConflict: "user_id" })
            .then(() => {}, () => {});
        }
      });
  });
}

/** Xóa cache local khi đăng xuất (giữ dữ liệu trên DB). */
export function clearTreocoStorage(userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(getTreocoStorageKey(userId));
  } catch {
    // bỏ qua
  }
}
