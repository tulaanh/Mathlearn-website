/**
 * ============================================================
 *  GAME TREO CỔ TRUNG THU — Danh sách từ & bàn phím
 * ------------------------------------------------------------
 *  - Từ đoán: chủ đề Trung Thu, VIẾT HOA có dấu tiếng Việt đầy đủ
 *    để hiển thị đẹp (VD: "ĐÈN ÔNG SAO").
 *  - Đoán chữ KHÔNG phân biệt dấu: mọi chữ được chuẩn hoá về chữ cái
 *    Latin chuẩn (Ă→A, Đ→D, Ộ→O, Ự→U...). Bàn phím chỉ có 22 chữ cái
 *    tiếng Việt viết bằng chữ chuẩn (không có F, J, W, Z).
 *  - Dùng bảng map cứng để tránh pitfall Unicode NFD.
 * ============================================================
 */

export type TreocoWord = {
  key: string;
  /** Từ đoán, VIẾT HOA có dấu (VD: "ĐÈN ÔNG SAO") — chỉ để hiển thị. */
  text: string;
  /** Câu gợi ý hiển thị cho người chơi. */
  hint: string;
};

/** Bàn phím 22 chữ cái chuẩn (không dấu, không có F J W Z). */
export const VIETNAMESE_LETTERS: string[] = [
  "A", "B", "C", "D", "E", "G", "H", "I", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y",
];

/** Bảng bỏ dấu thanh (giữ nguyên dấu phụ ă â đ ê ô ơ ư và chữ thường/hoa). */
const TONE_MAP: Record<string, string> = {
  à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
  À: "A", Á: "A", Ả: "A", Ã: "A", Ạ: "A",
  ằ: "ă", ắ: "ă", ẳ: "ă", ẵ: "ă", ặ: "ă",
  Ằ: "Ă", Ắ: "Ă", Ẳ: "Ă", Ẵ: "Ă", Ặ: "Ă",
  ầ: "â", ấ: "â", ẩ: "â", ẫ: "â", ậ: "â",
  Ầ: "Â", Ấ: "Â", Ẩ: "Â", Ẫ: "Â", Ậ: "Â",
  è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
  È: "E", É: "E", Ẻ: "E", Ẽ: "E", Ẹ: "E",
  ề: "ê", ế: "ê", ể: "ê", ễ: "ê", ệ: "ê",
  Ề: "Ê", Ế: "Ê", Ể: "Ê", "Ễ": "Ê", "Ệ": "Ê",
  ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
  Ì: "I", Í: "I", Ỉ: "I", Ĩ: "I", Ị: "I",
  ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
  Ò: "O", Ó: "O", Ỏ: "O", Õ: "O", Ọ: "O",
  ồ: "ô", ố: "ô", ổ: "ô", ỗ: "ô", ộ: "ô",
  Ồ: "Ô", Ố: "Ô", Ổ: "Ô", Ỗ: "Ô", Ộ: "Ô",
  ờ: "ơ", ớ: "ơ", ở: "ơ", ỡ: "ơ", ợ: "ơ",
  Ờ: "Ơ", Ớ: "Ơ", Ở: "Ơ", Ỡ: "Ơ", Ợ: "Ơ",
  ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
  Ù: "U", Ú: "U", Ủ: "U", Ũ: "U", Ụ: "U",
  ừ: "ư", ứ: "ư", ử: "ư", ữ: "ư", ự: "ư",
  Ừ: "Ư", Ứ: "Ư", Ử: "Ư", Ữ: "Ư", Ự: "Ư",
  ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  Ỳ: "Y", Ý: "Y", Ỷ: "Y", Ỹ: "Y", Ỵ: "Y",
};

/** Bảng gộp chữ gốc có dấu phụ về chữ cái Latin chuẩn. */
const BASE_MAP: Record<string, string> = {
  ă: "a", Ă: "A",
  â: "a", Â: "A",
  đ: "d", Đ: "D",
  ê: "e", Ê: "E",
  ô: "o", Ô: "O",
  ơ: "o", Ơ: "O",
  ư: "u", Ư: "U",
};

/** Chuẩn hoá một chữ cái về chữ Latin không dấu: bỏ dấu thanh rồi gộp ăâđêôơư (HẰNG→A, ĐÈN→D, CỖ→O). */
export function chuanHoaChu(chu: string): string {
  const upper = chu.toUpperCase();
  const noTone = TONE_MAP[upper] ?? upper;
  return BASE_MAP[noTone] ?? noTone;
}

/** Danh sách từ đoán chủ đề Trung Thu. */
export const TREOCO_WORDS: TreocoWord[] = [
  { key: "banh-trang-trang", text: "BÁNH TRÁNG TRĂNG", hint: "Bánh tròn dẹp nhân đậu xanh nướng trên bếp, đặc sản miền Nam." },
  { key: "banh-nuong", text: "BÁNH NƯỚNG", hint: "Bánh trung thu vỏ nướng vàng ủ nâu, nhân mặn hoặc ngọt." },
  { key: "banh-deo", text: "BÁNH DẺO", hint: "Bánh trung thu vỏ mềm dẻo, trắng trong như pha lê." },
  { key: "den-ong-sao", text: "ĐÈN ÔNG SAO", hint: "Chiếc đèn giấy năm cánh sao lấp lánh trong đêm hội." },
  { key: "den-long", text: "ĐÈN LỒNG", hint: "Đèn đỏ treo trước cửa nhà mỗi dịp lễ hội." },
  { key: "chu-cuoi", text: "CHÚ CUỘI", hint: "Cậu bé ngồi trên cội cây đa dưới bóng trăng." },
  { key: "cung-trang", text: "CUNG TRĂNG", hint: "Cung điện của nàng tiên trên bầu trời đêm." },
  { key: "mat-trang", text: "MẶT TRĂNG", hint: "Vầng sáng tròn đầy nhất trên trời đêm rằm." },
  { key: "mua-lan", text: "MÚA LÂN", hint: "Ông đầu lân nhảy nhót theo nhịp trống ngày hội." },
  { key: "mua-rong", text: "MÚA RỒNG", hint: "Đoàn múa uốn lượn cây đèn như con rồng bay." },
  { key: "trang-ram", text: "TRĂNG RẰM", hint: "Đêm 15 âm lịch, trăng tròn và sáng nhất tháng." },
  { key: "le-hoi", text: "LỄ HỘI", hint: "Ngày vui rộn ràng đèn lồng, múa hát và bánh trái." },
  { key: "cay-da", text: "CÂY ĐA", hint: "Loại cây cổ thụ gắn với tích chuyện chú Cuội." },
  { key: "tho-ngoc", text: "THỎ NGỌC", hint: "Chú thỏ ngồi giã thuốc dưới ánh trăng." },
  { key: "chi-hang", text: "CHỊ HẰNG", hint: "Nàng tiên sống trên cung trăng trong tích truyện xưa." },
  { key: "pha-co", text: "PHÁ CỖ", hint: "Mâm bày đủ bánh trái, trái cây ngày rằm tháng tám." },
  { key: "doan-vien", text: "ĐOÀN VIÊN", hint: "Hai tiếng chỉ sự sum vầy, quây quần của gia đình." },
];

/** Tìm từ theo key (undefined nếu key không còn trong danh sách). */
export function getTreocoWord(key: string): TreocoWord | undefined {
  return TREOCO_WORDS.find((w) => w.key === key);
}

/** Chọn ngẫu nhiên một từ, tránh trùng từ hiện tại nếu có thể. */
export function randomTreocoWordKey(excludeKey?: string): string {
  const pool = TREOCO_WORDS.filter((w) => w.key !== excludeKey);
  const list = pool.length ? pool : TREOCO_WORDS;
  return list[Math.floor(Math.random() * list.length)].key;
}

/** Chữ đã đoán đúng có nằm trong từ hay không (so khớp bỏ dấu thanh). */
export function letterInWord(word: string, letter: string): boolean {
  const normalizedLetter = chuanHoaChu(letter);
  return [...word].some((c) => c !== " " && chuanHoaChu(c) === normalizedLetter);
}

/** Từ đã được đoán hết chưa (mọi chữ cái đã nằm trong revealedLetters). */
export function isWordComplete(word: string, revealedLetters: string[]): boolean {
  const revealed = new Set(revealedLetters.map(chuanHoaChu));
  return [...word].every((c) => c === " " || revealed.has(chuanHoaChu(c)));
}
