import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { bankQuestionToTreocoCauHoi } from "@/lib/treoco-game";
import { NGAN_HANG_CAU_HOI_GAME } from "@/lib/treoco-bank-questions";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";

export const dynamic = "force-dynamic";

/**
 * GET /api/tro-choi/treo-co/cau-hoi-60s
 * Lấy ngẫu nhiên 1 câu hỏi toán 60s TRỰC TIẾP từ bảng `question_bank` trên cơ sở dữ liệu Supabase.
 * - Mức độ: Nhận biết (Dễ) và Thông hiểu (Trung bình).
 * - Dạng câu: Trắc nghiệm khách quan 4 phương án (multiple_choice).
 * - Đã loại trừ câu Tích phân/Nguyên hàm để phù hợp với học kỳ 1.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(ip, { interval: 60_000, limit: 60 });
  if (!success) {
    return NextResponse.json(
      { error: "Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  const { user, supabase } = await getCurrentUser();
  if (!user || !supabase) {
    return NextResponse.json(
      { error: "Cần đăng nhập để tham gia Thử thách Giải Toán 60s." },
      { status: 401 },
    );
  }

  // 1. Ưu tiên lấy trực tiếp từ CSDL question_bank trên Supabase
  try {
    const { data: rows, error } = await supabase
      .from("question_bank")
      .select("id, text, content, difficulty, type")
      .in("difficulty", ["nhan_biet", "thong_hieu"])
      .eq("type", "multiple_choice");

    if (error) {
      console.warn("Lưu ý: Không truy vấn được bảng question_bank từ CSDL:", error.message);
    } else if (rows && rows.length > 0) {
      const validQuestions: TreocoCauHoi[] = [];
      for (const r of rows) {
        const q = bankQuestionToTreocoCauHoi(
          { id: r.id, text: r.text, content: r.content, difficulty: r.difficulty },
          r.difficulty as QuestionDifficulty,
        );
        if (q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === "number") {
          // Bỏ qua các câu tích phân/nguyên hàm (kỳ 2)
          const allText = (q.text + " " + (q.explanation || "")).toLowerCase();
          if (!allText.includes("tích phân") && !allText.includes("nguyên hàm") && !allText.includes("\\int")) {
            validQuestions.push(q);
          }
        }
      }

      if (validQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * validQuestions.length);
        const selected = validQuestions[randomIndex];
        return NextResponse.json({
          success: true,
          question: selected,
          source: "database",
          totalInBank: validQuestions.length,
        });
      }
    }
  } catch (err) {
    console.warn("Lỗi khi kết nối CSDL question_bank:", err);
  }

  // 2. Dự phòng an toàn từ ngân hàng câu hỏi đề thi chuẩn (140 câu từ NganHang_HamSo_De01..04.json)
  const fallbackPool = NGAN_HANG_CAU_HOI_GAME.filter(
    (q) => q.difficulty === "nhan_biet" || q.difficulty === "thong_hieu",
  );
  const selected = fallbackPool.length
    ? fallbackPool[Math.floor(Math.random() * fallbackPool.length)]
    : NGAN_HANG_CAU_HOI_GAME[0];

  return NextResponse.json({
    success: true,
    question: selected,
    source: "exam_bank_fallback",
    totalInBank: fallbackPool.length,
  });
}
