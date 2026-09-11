import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ensureTreocoRow,
  readActiveQuestion,
  readJarDifficulties,
  pickTreocoQuestion,
  saveTreocoActiveState,
} from "@/lib/treoco-game";

export const dynamic = "force-dynamic";

/**
 * POST /api/tro-choi/treo-co/chon-hu — chọn 1 trong 3 hũ để mở câu toán.
 * Body: { jarId: 1 | 2 | 3 }
 * - Đang trong hồi chiếu → 429 kèm nextQuestionAt.
 * - Đang có câu hỏi mở → trả lại câu đó (resume sau reload, không tốn gì thêm).
 * - Đáp án đúng không bao giờ đi xuống client ở bước này.
 */
export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 20 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) {
    return NextResponse.json({ error: "Cần đăng nhập để chơi Đố Vui Trung Thu." }, { status: 401 });
  }

  let body: { jarId?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const jarId = Number(body.jarId);
  if (!Number.isInteger(jarId) || jarId < 1 || jarId > 3) {
    return NextResponse.json({ error: "Hũ không hợp lệ." }, { status: 400 });
  }

  const row = await ensureTreocoRow(supabase, user.id);

  // Đang có câu hỏi mở → trả lại để chơi tiếp (không tốn lượt/cooldown)
  const active = readActiveQuestion(row);
  if (active) {
    return NextResponse.json({
      question: {
        id: active.id,
        text: active.text,
        options: active.options,
        imageStoragePath: active.imageStoragePath,
        imageUrl: active.imageUrl,
        imageCaption: active.imageCaption,
      },
      difficulty: active.difficulty,
      resumed: true,
      nextQuestionAt: row.next_question_at,
    });
  }

  // Còn trong hồi chiếu → chặn
  const nextAtMs = new Date(row.next_question_at).getTime();
  if (Number.isFinite(nextAtMs) && Date.now() < nextAtMs) {
    return NextResponse.json(
      { error: "Bạn vừa giải một câu toán rồi, hãy đợi thêm chút nữa!", nextQuestionAt: row.next_question_at },
      { status: 429 },
    );
  }

  // Lấy độ khó theo hũ đã xáo (xáo mới nếu dòng DB chưa có)
  const jars = readJarDifficulties(row);
  const difficulty = jars[jarId - 1];
  const question = await pickTreocoQuestion(supabase, difficulty);
  if (!question) {
    return NextResponse.json(
      { error: "Hiện chưa có câu hỏi cho hũ này, bạn thử lại sau nhé." },
      { status: 503 },
    );
  }

  // Lưu câu đang mở + xáo hũ hiện tại (đồng bộ memory và DB)
  await saveTreocoActiveState(supabase, user.id, {
    active_question: question,
    jar_difficulties: jars,
  });

  return NextResponse.json({
    question: {
      id: question.id,
      text: question.text,
      options: question.options,
      imageStoragePath: question.imageStoragePath,
      imageUrl: question.imageUrl,
      imageCaption: question.imageCaption,
    },
    difficulty,
    resumed: false,
    nextQuestionAt: row.next_question_at,
  });
}
