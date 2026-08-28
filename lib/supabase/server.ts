import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cache } from "react";
import { cookies } from "next/headers";
import { isSupabaseConfigured } from "./client";

let publicSupabaseClient: SupabaseClient | null = null;

/** Client Supabase phi trạng thái (không đọc/ghi cookies), an toàn tuyệt đối khi dùng trong
 *  `unstable_cache`, ISR hoặc các tác vụ static/public data fetching. */
export function createPublicSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!publicSupabaseClient) {
    publicSupabaseClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }
  return publicSupabaseClient;
}

export async function createServerSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot always write cookies. The middleware
            // refreshes the session on the next request.
          }
        },
      },
    },
  );
}

/** Bộ nhớ đệm profile theo user id với TTL ngắn — không cần query bảng profiles
 *  mỗi request ("auth 1 lần, lần sau lấy dữ liệu cũ").
 *  Đổi vai trò/tên hiển thị sẽ cập nhật lại trên giao diện sau tối đa PROFILE_TTL_MS;
 *  phân quyền thật vẫn do Postgres RLS (is_teacher() đọc bảng profiles) thực thi. */
const PROFILE_TTL_MS = 5 * 60 * 1000;
type CachedProfile = { id: string; display_name: string; role: "teacher" | "student" } | null;
const profileCache = new Map<string, { profile: CachedProfile; expires: number }>();

/** Đọc phiên đăng nhập cục bộ từ cookie (0 gọi mạng, khác getUser() luôn phải
 *  verify qua mạng). Token còn hạn là dùng được; hết hạn coi như chưa đăng nhập —
 *  browser sẽ refresh token phía client rồi vào lại như thường.
 *  Được cache bởi React nên mỗi request chỉ chạy đúng một lần dù nhiều nơi gọi. */
export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { supabase: null, user: null, profile: null };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;
  if (!user || (session?.expires_at && session.expires_at * 1000 < Date.now())) {
    return { supabase, user: null, profile: null };
  }

  const cached = profileCache.get(user.id);
  if (cached && cached.expires > Date.now()) {
    return { supabase, user, profile: cached.profile };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .maybeSingle();
  profileCache.set(user.id, { profile: profile as CachedProfile, expires: Date.now() + PROFILE_TTL_MS });

  return { supabase, user, profile: profile as CachedProfile };
});
