import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getBankQuestions, pickRandomQuestionsByMatrix } from "@/lib/question-bank";
import { bankQuestionToTreocoCauHoi, questionHasRequiredImage } from "@/lib/treoco-game";
import { NGAN_HANG_CAU_HOI_GAME } from "@/lib/treoco-bank-questions";
import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { TreocoCauHoi } from "@/lib/treoco-cau-hoi-mac-dinh";

export const dynamic = "force-dynamic";

/**
 * GET /api/tro-choi/treo-co/cau-hoi-60s
 * Lấy ngẫu nhiên 1 câu hỏi toán 60s từ CSDL Ngân hàng đề thi (question_bank):
 * - Tái sử dụng cách gọi getBankQuestions / pickRandomQuestionsByMatrix từ lib/question-bank.
 * - Mức độ: Nhận biết (Dễ) và Thông hiểu (Trung bình).
 * - Đã loại trừ câu Tích phân/Nguyên hàm để phù hợp với học kỳ 1.
 * - Kiểm tra nghiêm ngặt hình ảnh (questionHasRequiredImage): không bao giờ hiển thị câu thiếu hình vẽ.
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

  const { user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Cần đăng nhập để tham gia Thử thách Giải Toán 60s." },
      { status: 401 },
    );
  }

  // 1. Lấy câu hỏi từ Ngân hàng đề thi trên CSDL Supabase
  const primaryDiff: QuestionDifficulty = Math.random() < 0.5 ? "nhan_biet" : "thong_hieu";
  const difficultiesToTry: QuestionDifficulty[] = [
    primaryDiff,
    primaryDiff === "nhan_biet" ? "thong_hieu" : "nhan_biet",
  ];

  for (const diff of difficultiesToTry) {
    // 1a. Tải qua getBankQuestions (chính xác như trang /ngan-hang-cau-hoi)
    try {
      const { items } = await getBankQuestions({ difficulty: diff }, 1, 50);
      if (items && items.length > 0) {
        const validQuestions: TreocoCauHoi[] = [];
        for (const bq of items) {
          const q = bankQuestionToTreocoCauHoi(bq, bq.difficulty);
          if (q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === "number") {
            const allText = (q.text + " " + (q.explanation || "")).toLowerCase();
            if (!allText.includes("tích phân") && !allText.includes("nguyên hàm") && !allText.includes("\\int")) {
              if (questionHasRequiredImage(q)) {
                validQuestions.push(q);
              }
            }
          }
        }

        if (validQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * validQuestions.length);
          const selected = validQuestions[randomIndex];
          return NextResponse.json({
            success: true,
            question: selected,
            source: "question_bank",
            totalInBank: validQuestions.length,
          });
        }
      }
    } catch (err) {
      console.warn("Lưu ý: Không lấy được câu hỏi qua getBankQuestions:", err);
    }

    // 1b. Thử tiếp qua pickRandomQuestionsByMatrix
    try {
      const { picked } = await pickRandomQuestionsByMatrix(
        { [diff]: 15 },
        { type: "multiple_choice" },
      );
      if (picked && picked.length > 0) {
        const validQuestions: TreocoCauHoi[] = [];
        for (const bq of picked) {
          const q = bankQuestionToTreocoCauHoi(bq, bq.difficulty);
          if (q && Array.isArray(q.options) && q.options.length >= 2 && typeof q.correctIndex === "number") {
            const allText = (q.text + " " + (q.explanation || "")).toLowerCase();
            if (!allText.includes("tích phân") && !allText.includes("nguyên hàm") && !allText.includes("\\int")) {
              if (questionHasRequiredImage(q)) {
                validQuestions.push(q);
              }
            }
          }
        }

        if (validQuestions.length > 0) {
          const randomIndex = Math.floor(Math.random() * validQuestions.length);
          const selected = validQuestions[randomIndex];
          return NextResponse.json({
            success: true,
            question: selected,
            source: "question_bank",
            totalInBank: validQuestions.length,
          });
        }
      }
    } catch (err) {
      console.warn("Lưu ý: Không kết nối được Ngân hàng câu hỏi qua pickRandomQuestionsByMatrix:", err);
    }
  }

  // 2. Dự phòng an toàn từ ngân hàng câu hỏi đề thi chuẩn (140 câu Nhận biết + Thông hiểu kèm ảnh)
  const fallbackPool = NGAN_HANG_CAU_HOI_GAME.filter(
    (q) =>
      (q.difficulty === "nhan_biet" || q.difficulty === "thong_hieu") &&
      questionHasRequiredImage(q),
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
