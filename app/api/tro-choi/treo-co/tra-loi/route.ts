import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ensureTreocoRow,
  readActiveQuestion,
  shuffleJarDifficulties,
  saveTreocoActiveState,
  findTreocoQuestionById,
} from "@/lib/treoco-game";
import { TREOCO_COOLDOWN_DUNG_MS, TREOCO_COOLDOWN_SAI_MS } from "@/lib/treoco-state";

export const dynamic = "force-dynamic";

/**
 * POST /api/tro-choi/treo-co/tra-loi — chấm câu toán đang mở.
 * Body: { answerIndex: number, questionId?: string }
 * - Đúng → +1 lượt, hồi chiếu 3 phút; Sai → giữ lượt, hồi chiếu 10 phút.
 * - Chấm điểm ở server (client không bao giờ nhận đáp án trước).
 * - Sau khi trả lời: xáo lại 3 hũ cho vòng tiếp theo, xoá câu đang mở.
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

  let body: { answerIndex?: unknown; questionId?: unknown };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const answerIndex = Number(body.answerIndex);
  if (!Number.isInteger(answerIndex) || answerIndex < 0) {
    return NextResponse.json({ error: "Câu trả lời không hợp lệ." }, { status: 400 });
  }

  const row = await ensureTreocoRow(supabase, user.id);

  // 1. Thử lấy từ trạng thái đang mở trong DB hoặc bộ nhớ memory
  let active = readActiveQuestion(row);

  // 2. Nếu DB/memory chưa kịp đồng bộ, tìm câu hỏi trực tiếp theo questionId
  if (!active && typeof body.questionId === "string" && body.questionId.trim()) {
    active = await findTreocoQuestionById(supabase, body.questionId.trim());
  }

  if (!active) {
    return NextResponse.json(
      { error: "Bạn chưa chọn hũ nào. Hãy chọn một hũ để nhận câu hỏi." },
      { status: 400 },
    );
  }
  if (answerIndex >= active.options.length) {
    return NextResponse.json({ error: "Câu trả lời không hợp lệ." }, { status: 400 });
  }

  const correct = answerIndex === active.correctIndex;
  const cooldownMs = correct ? TREOCO_COOLDOWN_DUNG_MS : TREOCO_COOLDOWN_SAI_MS;
  const nextQuestionAt = new Date(Date.now() + cooldownMs).toISOString();
  const currentTurns = Number.isFinite(row.turns) ? Math.max(0, Math.floor(row.turns)) : 0;
  const newTurns = correct ? currentTurns + 1 : currentTurns;

  // Cập nhật lượt, hồi chiêu và xáo hũ (đồng bộ memory và DB)
  await saveTreocoActiveState(supabase, user.id, {
    turns: newTurns,
    next_question_at: nextQuestionAt,
    jar_difficulties: shuffleJarDifficulties(),
    active_question: null,
  });

  return NextResponse.json({
    correct,
    correctIndex: active.correctIndex,
    explanation: active.explanation,
    explanationImageUrl: active.explanationImageUrl,
    explanationImageStoragePath: active.explanationImageStoragePath,
    explanationImages: active.explanationImages,
    turns: newTurns,
    nextQuestionAt,
  });
}
