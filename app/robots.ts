import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mathlearn.vercel.app";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/quan-ly/*", "/dang-nhap", "/api/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
