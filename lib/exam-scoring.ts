import type {
  DocumentBlock,
  DocumentTestAnswers,
  QuizQuestion,
} from "@/lib/document-types";

/**
 * Quy ước chấm điểm dùng chung cho bài kiểm tra (document_type = 'test'):
 * - Mỗi câu tự chấm có điểm tối đa tùy chỉnh, mặc định 1 điểm.
 * - true_false có thể dùng bảng điểm theo số mệnh đề đúng.
 * - short_answer so sánh sau khi trim + lowercase.
 * - essay không chấm tự động và không tính vào tổng điểm.
 */

/** Các mệnh đề Đúng/Sai của câu hỏi (fallback từ options cho dữ liệu cũ). */
export function statementsOf(q: QuizQuestion) {
  return (
    q.statements ??
    (q.options ?? []).map((o) => ({
      id: o.id,
      text: o.text,
      correctVal: o.correctVal === "false" ? ("false" as const) : ("true" as const),
    }))
  );
}

/** Khóa lưu đáp án của một mệnh đề Đúng/Sai trong bảng answers. */
export function statementKey(questionId: string, statementId: string): string {
  return `${questionId}:${statementId}`;
}

/** Loại câu hỏi hiệu lực (mặc định trắc nghiệm). */
export function questionType(q: QuizQuestion) {
  return q.type || "multiple_choice";
}

/** Điểm tối đa của câu hỏi (essay = 0, dữ liệu cũ mặc định 1 điểm). */
export function questionPoints(q: QuizQuestion): number {
  if (questionType(q) === "essay") return 0;
  return typeof q.points === "number" && Number.isFinite(q.points) && q.points > 0 ? q.points : 1;
}

/** Bảng điểm Đúng/Sai theo số mệnh đề đúng. Với 4 mệnh đề dùng thang mặc định 0; 0,1; 0,25; 0,5; 1. */
export function trueFalsePointTable(q: QuizQuestion): number[] {
  const count = statementsOf(q).length;
  if (Array.isArray(q.trueFalsePoints) && q.trueFalsePoints.length >= count + 1) {
    return q.trueFalsePoints.slice(0, count + 1).map((value, index) => {
      const point = Number.isFinite(value) && value >= 0 ? value : 0;
      return index === count ? questionPoints(q) : point;
    });
  }
  const max = questionPoints(q);
  const ratios = count === 4 ? [0, 0.1, 0.25, 0.5, 1] : Array.from({ length: count + 1 }, (_, i) => i / Math.max(count, 1));
  return ratios.map((ratio) => Math.round(max * ratio * 100) / 100);
}

/** Số ý tự chấm của một câu hỏi (essay = 0). */
export function autoGradedUnits(q: QuizQuestion): number {
  if (questionType(q) === "essay") return 0;
  return questionType(q) === "true_false" ? statementsOf(q).length : 1;
}

/** Một ý được coi là đã trả lời khi có giá trị không rỗng. */
function unitAnswered(key: string, answers: DocumentTestAnswers): boolean {
  const value = answers[key];
  return typeof value === "string" && value.trim().length > 0;
}

/** Tổng số ý tự chấm của danh sách câu hỏi. */
export function totalUnits(questions: QuizQuestion[]): number {
  return questions.reduce((sum, q) => sum + autoGradedUnits(q), 0);
}

/** Một câu được coi là "đã làm" khi mọi ý tự chấm đều có giá trị
 *  (essay không có ý tự chấm nên luôn trả về true — bảng câu hỏi hiển thị kiểu riêng). */
export function questionFullyAnswered(q: QuizQuestion, answers: DocumentTestAnswers): boolean {
  if (questionType(q) === "essay") return true;
  if (questionType(q) === "true_false") {
    return statementsOf(q).every((s) => unitAnswered(statementKey(q.id, s.id), answers));
  }
  return unitAnswered(q.id, answers);
}

/** Số ý đã trả lời của danh sách câu hỏi. */
export function answeredUnits(questions: QuizQuestion[], answers: DocumentTestAnswers): number {
  return questions.reduce((sum, q) => {
    if (questionType(q) === "essay") return sum;
    if (questionType(q) === "true_false") {
      return (
        sum +
        statementsOf(q).filter((s) => unitAnswered(statementKey(q.id, s.id), answers)).length
      );
    }
    return sum + (unitAnswered(q.id, answers) ? 1 : 0);
  }, 0);
}

/** Kiểm tra một ý trả lời có đúng không (key = question.id hoặc questionId:statementId). */
export function isUnitCorrect(q: QuizQuestion, key: string, answers: DocumentTestAnswers): boolean {
  const value = answers[key];
  if (typeof value !== "string") return false;
  if (questionType(q) === "true_false") {
    const statementId = key.slice(key.indexOf(":") + 1);
    const statement = statementsOf(q).find((s) => s.id === statementId);
    return !!statement && value === statement.correctVal;
  }
  if (questionType(q) === "short_answer") {
    return value.trim().toLowerCase() === (q.correctAnswer ?? "").trim().toLowerCase();
  }
  return value === q.correctOptionId;
}

/** Chấm điểm toàn bộ câu hỏi theo điểm tùy chỉnh của từng câu. */
export function gradeQuestions(questions: QuizQuestion[], answers: DocumentTestAnswers) {
  let correctCount = 0;
  let totalAutoGraded = 0;
  let earnedPoints = 0;
  let totalPoints = 0;

  for (const q of questions) {
    const type = questionType(q);
    if (type === "essay") continue;
    const maxPoints = questionPoints(q);
    totalPoints += maxPoints;

    if (type === "true_false") {
      const statements = statementsOf(q);
      const correctStatements = statements.filter((s) => isUnitCorrect(q, statementKey(q.id, s.id), answers)).length;
      correctCount += correctStatements;
      totalAutoGraded += statements.length;
      earnedPoints += trueFalsePointTable(q)[correctStatements] ?? 0;
      continue;
    }

    totalAutoGraded += 1;
    if (isUnitCorrect(q, q.id, answers)) {
      correctCount += 1;
      earnedPoints += maxPoints;
    }
  }

  return { correctCount, totalAutoGraded, earnedPoints, totalPoints };
}

/** Phần trăm theo tổng điểm đạt được / tổng điểm tối đa (0–100, làm tròn nguyên). */
export function percentCorrect(earnedPoints: number, totalPoints: number): number {
  if (totalPoints <= 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100);
}

/** Điểm thang 10 theo tổng điểm đạt được / tổng điểm tối đa. */
export function scoreOutOf10(earnedPoints: number, totalPoints: number): number {
  if (totalPoints <= 0) return 0;
  return Math.round((earnedPoints / totalPoints) * 100) / 10;
}

/** Các khối câu hỏi của tài liệu (giữ thứ tự position). */
export function testQuizBlocks(blocks: DocumentBlock[]) {
  return blocks.filter((b): b is Extract<DocumentBlock, { type: "quiz" }> => b.type === "quiz");
}

/** Toàn bộ câu hỏi của tài liệu (gộp từ các khối câu hỏi). */
export function testQuestions(blocks: DocumentBlock[]): QuizQuestion[] {
  return testQuizBlocks(blocks).flatMap((b) => b.questions);
}
