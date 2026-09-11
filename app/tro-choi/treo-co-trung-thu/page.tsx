import type { Metadata } from "next";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { getCurrentUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import SupabaseConfigNotice from "@/components/SupabaseConfigNotice";
import { getSiteUrl } from "@/lib/site";
import { treocoRowToState, type TreocoDbRow } from "@/lib/treoco-state";
import type { TreocoCauHoiClient } from "@/components/tro-choi/TreoCoQuestionPanel";

export const dynamic = "force-dynamic";

const PAGE_PATH = "/tro-choi/treo-co-trung-thu";

function TreoCoSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl animate-pulse" role="status" aria-label="Đang tải trò chơi">
      <span className="sr-only">Đang tải trò chơi...</span>
      <div className="mb-6 h-8 w-56 rounded-lg bg-slate-200 dark:bg-slate-800" />
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="h-[420px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e] lg:col-span-3" />
        <div className="h-[420px] rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e] lg:col-span-2" />
      </div>
      <div className="mt-5 h-32 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#131b2e]" />
    </div>
  );
}

// Import động: runner + Supabase SDK chỉ tải khi vào trang game.
const TreoCoRunner = dynamicImport(() => import("@/components/tro-choi/TreoCoRunner"), {
  loading: () => <TreoCoSkeleton />,
});

export async function generateMetadata(): Promise<Metadata> {
  const title = "Đố Vui Trung Thu – Chú Lân Tinh Nghịch";
  const description =
    "Trò chơi đoán chữ chủ đề Trung Thu vui nhộn: đoán từng chữ cái của từ bí mật, giải toán lấy vé múa hội, giúp Chú Lân tinh nghịch biểu diễn trọn vẹn trên cọc mai hoa thung!";
  return {
    title,
    description,
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "MathLearn",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function TreoCoTrungThuPage() {
  if (!isSupabaseConfigured()) return <SupabaseConfigNotice />;

  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-5xl">🏮</p>
        <h1 className="mt-4 text-2xl font-bold dark:text-white">Đăng nhập để chơi</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Trò chơi Đố Vui Trung Thu lưu lượt và tiến trình theo tài khoản. Hãy đăng nhập để cùng Chú Lân múa hội rước đèn nhé!
        </p>
        <Link
          href="/dang-nhap"
          className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Đọc trạng thái hiện có từ DB (nếu chưa có, Runner sẽ tự tạo từ mới phía client)
  let rowRes = await supabase
    .from("treoco_state")
    .select("word_key, revealed_letters, wrong_letters, turns, status, next_question_at, wins, losses, updated_at, active_question, spin_tickets, mooncake_fragments, completed_cakes")
    .eq("user_id", user.id)
    .maybeSingle();

  if (rowRes.error) {
    rowRes = await supabase
      .from("treoco_state")
      .select("word_key, revealed_letters, wrong_letters, turns, status, next_question_at, wins, losses, updated_at, active_question")
      .eq("user_id", user.id)
      .maybeSingle();
  }
  const data = rowRes.data;
  const initialState = data ? treocoRowToState(data as TreocoDbRow) : null;

  let initialQuestion: TreocoCauHoiClient | null = null;
  let initialDifficulty: string | null = null;

  if (data?.active_question && typeof data.active_question === "object") {
    const q = data.active_question as Record<string, unknown>;
    if (
      typeof q.id === "string" &&
      typeof q.text === "string" &&
      Array.isArray(q.options) &&
      q.options.length >= 2
    ) {
      initialQuestion = {
        id: q.id,
        text: q.text,
        options: q.options.map((opt) => String(opt)),
        imageUrl: typeof q.imageUrl === "string" ? q.imageUrl : undefined,
        imageStoragePath: typeof q.imageStoragePath === "string" ? q.imageStoragePath : undefined,
        imageCaption: typeof q.imageCaption === "string" ? q.imageCaption : undefined,
      };
      if (typeof q.difficulty === "string") {
        initialDifficulty = q.difficulty;
      }
    }
  }

  const siteUrl = getSiteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Đố Vui Trung Thu",
    url: `${siteUrl}${PAGE_PATH}`,
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    description:
      "Trò chơi đoán chữ chủ đề Trung Thu vui nhộn: giải toán để lấy vé đoán chữ bí mật và giúp Chú Lân múa lượn an toàn trên cọc mai hoa thung.",
    offers: { "@type": "Offer", price: "0", priceCurrency: "VND" },
  };

  return (
    <div className="mx-auto max-w-5xl">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-400">TRÒ CHƠI TRUNG THU</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            🏮 Đố Vui Trung Thu
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Đoán chữ mở hội — giải toán giúp Chú Lân tinh nghịch múa dẻo trên cọc mai hoa thung đón trăng rằm!
          </p>
        </div>
        <Link href="/" className="text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400">
          ← Về tổng quan
        </Link>
      </div>
      <TreoCoRunner
        initialState={initialState}
        initialQuestion={initialQuestion}
        initialDifficulty={initialDifficulty as any}
      />
    </div>
  );
}
