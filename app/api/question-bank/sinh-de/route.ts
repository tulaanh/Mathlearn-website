import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { pickRandomQuestionsByMatrix } from "@/lib/question-bank";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import { isQuestionDifficulty } from "@/lib/question-bank-types";

const DIFFICULTIES: QuestionDifficulty[] = ["nhan_biet", "thong_hieu", "van_dung", "van_dung_cao"];

/** POST /api/question-bank/sinh-de — chọn ngẫu nhiên câu hỏi theo ma trận mức độ. */
export async function POST(request: Request) {
  const { user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "teacher") {
    return NextResponse.json({ error: "Chỉ giáo viên mới được sinh đề." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }

  const matrix: Partial<Record<QuestionDifficulty, number>> = {};
  const rawMatrix = (body.matrix ?? {}) as Record<string, unknown>;
  for (const d of DIFFICULTIES) {
    const value = Number(rawMatrix[d] ?? 0);
    matrix[d] = Number.isInteger(value) && value > 0 ? Math.min(value, 100) : 0;
  }

  const result = await pickRandomQuestionsByMatrix(matrix, {
    grade: typeof body.grade === "string" ? body.grade : undefined,
    topicId: typeof body.topic === "string" ? body.topic : undefined,
    type: typeof body.type === "string" && isQuestionType(body.type) ? body.type : undefined,
  });

  return NextResponse.json(result);
}

function isQuestionType(value: string): value is "multiple_choice" | "true_false" | "short_answer" | "essay" {
  return ["multiple_choice", "true_false", "short_answer", "essay"].includes(value);
}
