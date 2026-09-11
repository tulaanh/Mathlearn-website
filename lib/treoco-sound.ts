/**
 * =========================================================================
 *  TREO CỔ TRUNG THU — HỆ THỐNG ÂM THANH CHÍNH HÃNG "AI LÀ TRIỆU PHÚ" (VTV3)
 * =========================================================================
 *  - Sử dụng trực tiếp bộ âm thanh chất lượng cao chuẩn phòng thu từ chương trình
 *    "Ai Là Triệu Phú" Việt Nam (Keith Strachan soundtrack):
 *      1. Nhạc nền suy nghĩ câu hỏi kinh điển: êm dịu, kịch tính, chân thực 100%,
 *         âm lượng vừa phải không gây chói tai/đau tai.
 *      2. Âm thanh trả lời đúng: tiếng chuông vinh quang chiến thắng rạng rỡ.
 *      3. Âm thanh trả lời sai / hết giờ: tiếng nhạc tiếc nuối kịch tính.
 *  - Âm thanh Bánh xe quay: tiếng chấu gỗ gõ nhẹ nhàng, mượt mà (đã lọc tần số cao).
 *  - Hỗ trợ nút Bật/Tắt âm thanh tiện lợi cho người dùng (lưu vào LocalStorage).
 * =========================================================================
 */

let audioCtx: AudioContext | null = null;

// Tham chiếu các đối tượng HTMLAudioElement
let thinkingAudio: HTMLAudioElement | null = null;
let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;

/** Đường dẫn file âm thanh chính hãng Ai Là Triệu Phú trong public */
const SOUND_PATHS = {
  THINKING: "/tro-choi/sounds/millionaire_thinking.mp3",
  CORRECT: "/tro-choi/sounds/millionaire_correct.mp3",
  WRONG: "/tro-choi/sounds/millionaire_wrong.mp3",
};

/** Lấy hoặc khởi tạo AudioContext an toàn cho hiệu ứng phụ (click kim vòng quay) */
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/** Khởi tạo hoặc lấy audio nhạc suy nghĩ Ai Là Triệu Phú */
function getThinkingAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!thinkingAudio) {
    thinkingAudio = new Audio(SOUND_PATHS.THINKING);
    thinkingAudio.loop = true;
    thinkingAudio.volume = 0.38; // Âm lượng êm ái, dễ chịu, không chói tai
    thinkingAudio.preload = "auto";
  }
  return thinkingAudio;
}

/** Khởi tạo hoặc lấy audio trả lời đúng */
function getCorrectAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!correctAudio) {
    correctAudio = new Audio(SOUND_PATHS.CORRECT);
    correctAudio.volume = 0.55;
    correctAudio.preload = "auto";
  }
  return correctAudio;
}

/** Khởi tạo hoặc lấy audio trả lời sai */
function getWrongAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!wrongAudio) {
    wrongAudio = new Audio(SOUND_PATHS.WRONG);
    wrongAudio.volume = 0.55;
    wrongAudio.preload = "auto";
  }
  return wrongAudio;
}

// Buffer âm thanh gõ kim chấu vòng quay (wheel_tick.mp3)
let wheelTickBuffer: AudioBuffer | null = null;
let isPreloadingWheelTick = false;

/** Tải trước AudioBuffer của âm thanh gõ chấu bánh xe để phát siêu tốc với Web Audio API */
export function preloadWheelTickSound(): void {
  if (typeof window === "undefined" || wheelTickBuffer || isPreloadingWheelTick) return;
  const ctx = getAudioCtx();
  if (!ctx) return;

  isPreloadingWheelTick = true;
  fetch("/tro-choi/sounds/wheel_tick.mp3")
    .then((res) => res.arrayBuffer())
    .then((buffer) => ctx.decodeAudioData(buffer))
    .then((decoded) => {
      wheelTickBuffer = decoded;
      isPreloadingWheelTick = false;
    })
    .catch(() => {
      isPreloadingWheelTick = false;
    });
}

/** Tải trước tất cả file âm thanh vào bộ đệm trình duyệt để phát ngay tức thì */
export function preloadMillionaireSounds(): void {
  try {
    getThinkingAudio()?.load();
    getCorrectAudio()?.load();
    getWrongAudio()?.load();
    preloadWheelTickSound();
  } catch {}
}

/** Kiểm tra trạng thái bật âm thanh của người dùng */
export function isTreocoSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = localStorage.getItem("treoco_sound_enabled");
    return val !== "false";
  } catch {
    return true;
  }
}

/** Bật / Tắt âm thanh và lưu vào LocalStorage */
export function setTreocoSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("treoco_sound_enabled", enabled ? "true" : "false");
    if (!enabled) {
      stopMillionaireTheme();
      stopWheelSound();
    }
  } catch {
    // silent fallback
  }
}

// -----------------------------------------------------------------------------
// 1. ÂM THANH QUAY BÁNH XE (WHEEL TICKING SOUND) - TO RÕ, TỰ NHIÊN, KHÔNG ĐAU TAI
// -----------------------------------------------------------------------------
let wheelTimerIds: number[] = [];

/** Phát tiếng kim gõ vào các chấu bánh xe (nhanh rồi chậm dần theo nhịp quay) */
export function playWheelSpinSound(durationMs = 4600): void {
  stopWheelSound();
  preloadMillionaireSounds();
  if (!isTreocoSoundEnabled()) return;

  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }

  // Lập lịch các tiếng tick mô phỏng chuyển động giảm tốc của bánh xe
  const clickTimes: number[] = [];
  let currentTime = 0;
  let interval = 45; // Khởi đầu nhịp nhàng

  while (currentTime < durationMs - 150) {
    clickTimes.push(currentTime);
    const progress = currentTime / durationMs;
    // Đường cong giảm tốc tự nhiên
    interval = 45 + Math.pow(progress, 2.4) * 360;
    currentTime += interval;
  }
  // Click chốt cuối cùng khi bánh xe dừng lại
  clickTimes.push(durationMs - 50);

  clickTimes.forEach((delay, index) => {
    const tid = window.setTimeout(() => {
      playSingleWheelClick(index === clickTimes.length - 1);
    }, delay);
    wheelTimerIds.push(tid);
  });
}

/** Dừng âm thanh bánh xe ngay lập tức */
export function stopWheelSound(): void {
  wheelTimerIds.forEach((id) => clearTimeout(id));
  wheelTimerIds = [];
}

/** Tạo 1 tiếng gõ chấu cơ học rõ ràng, tự nhiên, êm dịu */
function playSingleWheelClick(isFinal = false): void {
  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // Ưu tiên 1: Phát tệp âm thanh thu âm thực tế (wheel_tick.mp3) nếu đã giải mã
    if (wheelTickBuffer) {
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      source.buffer = wheelTickBuffer;
      gain.gain.setValueAtTime(isFinal ? 0.75 : 0.45, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      return;
    }

    // Ưu tiên 2 (Fallback): Tổng hợp sóng âm chấu cơ học rõ ràng, giòn tan, không chói tai
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    const startFreq = isFinal ? 440 : 540 + Math.random() * 40;
    const endFreq = isFinal ? 200 : 270;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + (isFinal ? 0.12 : 0.035));

    gain.gain.setValueAtTime(isFinal ? 0.42 : 0.26, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.13 : 0.038));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + (isFinal ? 0.14 : 0.04));
  } catch {
    // silent
  }
}

// -----------------------------------------------------------------------------
// 2. NHẠC NỀN SUY NGHĨ KINH ĐIỂN "AI LÀ TRIỆU PHÚ" (CHÍNH HÃNG VTV3)
// -----------------------------------------------------------------------------

/**
 * Bắt đầu phát bản nhạc suy nghĩ chính thức của "Ai Là Triệu Phú" (Keith Strachan soundtrack):
 * - Âm sắc dàn nhạc giao hưởng, tiếng bass đệm trầm ấm, dây vĩ cầm huyền bí.
 * - Âm lượng được điều chỉnh ở mức 0.38 êm dịu, tập trung, tuyệt đối không đau tai.
 */
export function startMillionaireTheme(): void {
  stopMillionaireTheme();
  if (!isTreocoSoundEnabled()) return;

  const audio = getThinkingAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.playbackRate = 1.0;
    audio.volume = 0.38;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn("Autoplay audio was blocked by browser:", err);
      });
    }
  } catch (err) {
    console.warn("Cannot play thinking audio:", err);
  }
}

/** Khi thời gian còn ít (<= 15 giây), tăng nhẹ tốc độ nhạc để tạo kịch tính */
export function updateMillionaireUrgency(isUrgent: boolean): void {
  const audio = getThinkingAudio();
  if (!audio) return;

  try {
    if (isUrgent) {
      // Tăng nhịp độ 15% khi vào 15s cuối cùng
      audio.playbackRate = 1.15;
      audio.volume = 0.45;
    } else {
      audio.playbackRate = 1.0;
      audio.volume = 0.38;
    }
  } catch {
    // silent
  }
}

/** Dừng nhạc nền Ai Là Triệu Phú ngay lập tức */
export function stopMillionaireTheme(): void {
  if (thinkingAudio) {
    try {
      thinkingAudio.pause();
      thinkingAudio.currentTime = 0;
      thinkingAudio.playbackRate = 1.0;
    } catch {
      // silent
    }
  }
}

// -----------------------------------------------------------------------------
// 3. ÂM THANH TRẢ LỜI ĐÚNG / SAI & TRÚNG BÁNH (CHÍNH HÃNG AI LÀ TRIỆU PHÚ)
// -----------------------------------------------------------------------------

/** Âm thanh Trả lời đúng (Bản thu chuẩn âm thanh chiến thắng Ai Là Triệu Phú) */
export function playMillionaireCorrectSound(): void {
  stopMillionaireTheme();
  if (!isTreocoSoundEnabled()) return;

  const audio = getCorrectAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch {
    // silent
  }
}

/** Âm thanh Trả lời sai / Hết giờ (Bản thu chuẩn âm thanh tiếc nuối Ai Là Triệu Phú) */
export function playMillionaireWrongSound(): void {
  stopMillionaireTheme();
  if (!isTreocoSoundEnabled()) return;

  const audio = getWrongAudio();
  if (!audio) return;

  try {
    audio.currentTime = 0;
    audio.volume = 0.55;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  } catch {
    // silent
  }
}

/** Âm thanh Trúng Mảnh Bánh Trung Thu (Leng keng châu báu & lấp lánh nhẹ nhàng) */
export function playMooncakePrizeSound(): void {
  if (!isTreocoSoundEnabled()) return;

  const ctx = getAudioCtx();
  if (!ctx) return;

  try {
    // Chuỗi âm thanh leng keng nhẹ dịu: C5 -> E5 -> G5 -> C6
    const freqs = [523.25, 659.25, 783.99, 1046.5];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        playBellNote(f, 0.4, 0.12);
      }, i * 90);
    });
  } catch {
    // silent
  }
}

/** Phát một nốt chuông ngân thanh thoát êm tai */
function playBellNote(frequency: number, duration: number, volume: number): void {
  const ctx = getAudioCtx();
  if (!ctx || ctx.state !== "running") return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1600, ctx.currentTime);

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration + 0.05);
  } catch {
    // silent
  }
}
