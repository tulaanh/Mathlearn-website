import type { MetadataRoute } from "next";
import { createPublicSupabaseClient, createServerSupabaseClient } from "@/lib/supabase/server";
import { quizzes } from "@/data/quizzes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mathlearn.vercel.app";
  const baseUrl = rawBaseUrl.replace(/\/+$/, "");
  const now = new Date().toISOString();

  // 1. Các routes tĩnh
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/chuong`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/ngan-hang-cau-hoi`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/lo-trinh`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/su-kien`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Lấy Supabase client (ưu tiên client phi trạng thái, an toàn cho static/public data)
  const supabase = createPublicSupabaseClient() ?? (await createServerSupabaseClient());

  let chapterRoutes: MetadataRoute.Sitemap = [];
  let testDocRoutes: MetadataRoute.Sitemap = [];
  let documentRoutes: MetadataRoute.Sitemap = [];

  if (supabase) {
    try {
      // Chạy song song các truy vấn để tối ưu hiệu năng
      const [chaptersRes, testDocsRes, docsRes] = await Promise.all([
        supabase.from("chapters").select("id, updated_at, created_at"),
        supabase
          .from("documents")
          .select("id, updated_at, created_at")
          .eq("document_type", "test")
          .eq("status", "published"),
        supabase
          .from("documents")
          .select("id, updated_at, created_at")
          .eq("status", "published"),
      ]);

      if (chaptersRes.data) {
        chapterRoutes = chaptersRes.data.map((chapter) => ({
          url: `${baseUrl}/chuong/${chapter.id}`,
          lastModified: chapter.updated_at || chapter.created_at || now,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      }

      if (testDocsRes.data) {
        testDocRoutes = testDocsRes.data.map((doc) => ({
          url: `${baseUrl}/quiz/${doc.id}`,
          lastModified: doc.updated_at || doc.created_at || now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      }

      if (docsRes.data) {
        documentRoutes = docsRes.data.map((doc) => ({
          url: `${baseUrl}/tai-lieu/${doc.id}`,
          lastModified: doc.updated_at || doc.created_at || now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));
      }
    } catch (error) {
      console.error("Error generating dynamic sitemap from Supabase:", error);
    }
  }

  // 3. Quiz routes từ static data (quizzes.ts) kết hợp với tests từ documents
  const existingQuizUrls = new Set(testDocRoutes.map((r) => r.url));
  const staticQuizRoutes: MetadataRoute.Sitemap = quizzes
    .filter((quiz) => quiz?.id && !existingQuizUrls.has(`${baseUrl}/quiz/${quiz.id}`))
    .map((quiz) => ({
      url: `${baseUrl}/quiz/${quiz.id}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const quizRoutes = [...testDocRoutes, ...staticQuizRoutes];

  return [
    ...staticRoutes,
    ...chapterRoutes,
    ...quizRoutes,
    ...documentRoutes,
  ];
}
