/** URL gốc chính thức của website — dùng cho canonical, sitemap, robots và JSON-LD. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "https://mathlearn.vercel.app";
  return raw.replace(/\/+$/, "");
}
