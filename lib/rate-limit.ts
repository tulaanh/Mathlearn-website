// Sliding window rate limiter cho Vercel Serverless
// Lưu ý: mỗi serverless instance có Map riêng, nên đây là best-effort rate limiting.
// Đủ tốt để chặn abuse cơ bản. Muốn chính xác hơn cần dùng Upstash Redis.

type RateLimitResult = { success: boolean; remaining: number; reset: number };

// Map<limiterName, Map<clientKey, timestamps[]>>
const rateLimiters = new Map<string, Map<string, number[]>>();

/**
 * Kiểm tra rate limit cho một key (thường là IP).
 *
 * @param key        - Identifier, thường là IP address
 * @param options.interval - Thời gian window tính bằng ms (vd: 60_000 = 1 phút)
 * @param options.limit    - Số request tối đa trong window
 * @param options.uniqueTokenPerInterval - Số IP tối đa để track (tránh memory leak), default 500
 */
export function rateLimit(
  key: string,
  options: { interval: number; limit: number; uniqueTokenPerInterval?: number },
): RateLimitResult {
  const { interval, limit, uniqueTokenPerInterval = 500 } = options;
  const now = Date.now();

  // Tạo limiter name dựa trên interval + limit để tách biệt các config khác nhau
  const limiterName = `${interval}_${limit}`;

  if (!rateLimiters.has(limiterName)) {
    rateLimiters.set(limiterName, new Map<string, number[]>());
  }
  const tokenCache = rateLimiters.get(limiterName)!;

  // Dọn dẹp entries cũ — chạy mỗi lần gọi nhưng rất nhẹ
  const windowStart = now - interval;
  for (const [cachedKey, timestamps] of tokenCache) {
    // Lọc bỏ timestamps ngoài window
    const valid = timestamps.filter((t) => t > windowStart);
    if (valid.length === 0) {
      tokenCache.delete(cachedKey);
    } else {
      tokenCache.set(cachedKey, valid);
    }
  }

  // Giới hạn số lượng unique keys để tránh memory leak
  if (!tokenCache.has(key) && tokenCache.size >= uniqueTokenPerInterval) {
    // Xóa entry cũ nhất
    const oldestKey = tokenCache.keys().next().value;
    if (oldestKey !== undefined) {
      tokenCache.delete(oldestKey);
    }
  }

  // Lấy hoặc tạo timestamps cho key hiện tại
  const timestamps = tokenCache.get(key) ?? [];
  const validTimestamps = timestamps.filter((t) => t > windowStart);

  // Tính thời gian reset (khi timestamp cũ nhất hết hạn)
  const reset = validTimestamps.length > 0
    ? Math.ceil((validTimestamps[0] + interval - now) / 1000)
    : Math.ceil(interval / 1000);

  if (validTimestamps.length >= limit) {
    // Vượt quá giới hạn
    tokenCache.set(key, validTimestamps);
    return { success: false, remaining: 0, reset };
  }

  // Cho phép — thêm timestamp mới
  validTimestamps.push(now);
  tokenCache.set(key, validTimestamps);

  return {
    success: true,
    remaining: limit - validTimestamps.length,
    reset,
  };
}

/**
 * Lấy IP client từ request headers.
 * Ưu tiên x-forwarded-for (Vercel/proxy), rồi x-real-ip.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}
