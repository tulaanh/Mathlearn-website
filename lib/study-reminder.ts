/** Cấu hình và helpers cho tính năng nhắc nhở học tập định kỳ (client-side). */

export const REMINDER_INTERVAL_MS = 30 * 60 * 1000; // nhắc mỗi 30 phút
export const REMINDER_CHECK_MS = 30_000; // chu kỳ kiểm tra đến hạn
export const TOAST_DURATION_MS = 8000; // thời gian toast tự ẩn

const BASELINE_KEY = "study-reminder-baseline";
const ENABLED_KEY = "study-reminder-enabled";
const SHOWN_COUNT_KEY = "study-reminder-shown-count";

/** Event phát khi cài đặt bật/tắt thay đổi (sync provider trong cùng tab) */
export const REMINDER_SETTINGS_EVENT = "study-reminder-settings-changed";

/** Các câu nhắc động viên, xoay vòng theo số lần đã hiện */
export const REMINDER_MESSAGES: string[] = [
  "Bạn đã học 30 phút rồi, giữ đà nào! 💪",
  "Học chăm quá! Tiếp tục chinh phục Toán nhé ✨",
  "30 phút nữa trôi qua rồi — cố lên, bạn làm được mà! 🚀",
  "Kiến thức tích lũy từng phút một, đừng dừng lại nhé! 📚",
  "Giữ nhịp học đều đặn, thành công sẽ đến! 🌟",
  "Bạn đang tiến bộ từng ngày, tiếp tục nào! 🎯",
  "Mỗi 30 phút học là một bước gần hơn đến điểm 10! 🏆",
  "Tuyệt vời, lại 30 phút học tập hiệu quả rồi! 👏",
];

function safeGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // bỏ qua nếu trình duyệt chặn localStorage
  }
}

/** Mốc thời điểm bắt đầu đếm 30 phút (epoch ms). Tự khởi tạo nếu thiếu. */
export function getReminderBaseline(): number {
  const raw = safeGet(BASELINE_KEY);
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  const now = Date.now();
  setReminderBaseline(now);
  return now;
}

export function setReminderBaseline(timestamp: number): void {
  safeSet(BASELINE_KEY, String(timestamp));
}

/** Cài đặt bật/tắt nhắc nhở (mặc định bật) */
export function isReminderEnabled(): boolean {
  return safeGet(ENABLED_KEY) !== "0";
}

export function setReminderEnabled(enabled: boolean): void {
  safeSet(ENABLED_KEY, enabled ? "1" : "0");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(REMINDER_SETTINGS_EVENT));
  }
}

/** Số lần lời nhắc đã hiện — dùng để xoay vòng câu chữ */
export function getReminderShownCount(): number {
  const raw = safeGet(SHOWN_COUNT_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

export function incrementReminderShownCount(): number {
  const next = getReminderShownCount() + 1;
  safeSet(SHOWN_COUNT_KEY, String(next));
  return next;
}
