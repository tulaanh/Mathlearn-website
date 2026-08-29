import type { QuestionDifficulty } from "@/lib/question-bank-types";
import type { QuizQuestion } from "@/lib/document-types";

export type EventStatus = "draft" | "published" | "ended";
export type EventAttemptStatus = "in_progress" | "submitted" | "expired";
export type EventType = "boss_battle" | "tree_growth" | "race";
export type EventMetric = "damage" | "growth" | "points" | "time";
export type EventAggregation = "sum" | "max" | "min";

export type EventScoringConfig = {
  metric: EventMetric;
  aggregation: EventAggregation;
  higherIsBetter: boolean;
  pointsPerCorrectAnswer?: number;
  timeBonus?: { enabled: boolean; maxBonus: number };
};

export type DamageConfig = Record<QuestionDifficulty, number>;

export const DEFAULT_EVENT_SCORING: EventScoringConfig = {
  metric: "damage",
  aggregation: "sum",
  higherIsBetter: true,
};

export const EVENT_TYPE_META: Record<EventType, {
  label: string;
  icon: string;
  scoreLabel: string;
  description: string;
  supported: boolean;
}> = {
  boss_battle: {
    label: "Đánh boss",
    icon: "⚔️",
    scoreLabel: "sát thương",
    description: "Cùng giải toán để đánh bại boss chung.",
    supported: true,
  },
  tree_growth: {
    label: "Trồng cây",
    icon: "🌱",
    scoreLabel: "điểm phát triển",
    description: "Mỗi câu trả lời đúng giúp cây phát triển.",
    supported: false,
  },
  race: {
    label: "Đua race",
    icon: "🏁",
    scoreLabel: "điểm đua",
    description: "Giải nhanh và chính xác để tiến lên trên đường đua.",
    supported: false,
  },
};

export function isEventType(value: unknown): value is EventType {
  return value === "boss_battle" || value === "tree_growth" || value === "race";
}

export function getEventTypeMeta(type: EventType): (typeof EVENT_TYPE_META)[EventType] {
  return EVENT_TYPE_META[type];
} 

export type EventBoss = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  emoji: string;
  maxHp: number;
  currentHp: number;
  position: number;
  isDefeated: boolean;
  defeatedAt: string | null;
};

export type EventActivity = {
  id: string;
  eventId: string;
  bossId: string | null;
  targetId: string | null;
  title: string;
  description: string | null;
  position: number;
  timeLimitSeconds: number;
  maxAttempts: number;
  questionCount: number;
  questionPoolCount: number;
  shuffleQuestions: boolean;
  damageConfig: DamageConfig;
  scoringConfig: Record<string, unknown>;
  myAttempts: number;
  myBestDamage: number;
  myTotalDamage: number;
  myBestScore: number;
  myTotalScore: number;
};

export type MathEvent = {
  id: string;
  title: string;
  description: string | null;
  grade: string;
  status: EventStatus;
  eventType: EventType;
  startAt: string;
  endAt: string;
  createdBy: string;
  scoringConfig: EventScoringConfig;
  displayConfig: Record<string, unknown>;
  bosses: EventBoss[];
  activities: EventActivity[];
};

/** Câu hỏi do RPC start_event_attempt trả về; tuyệt đối không chứa đáp án đúng. */
export type PublicEventQuestion = Omit<QuizQuestion, "correctOptionId" | "correctAnswer" | "explanation"> & {
  id: string;
  difficulty: QuestionDifficulty;
  damage: number;
};

export type EventAttempt = {
  attemptId: string;
  activityId: string;
  eventId: string;
  startedAt: string;
  expiresAt: string;
  timeLimitSeconds: number;
  questions: PublicEventQuestion[];
};

export type EventSubmitResult = {
  attemptId: string;
  expired: boolean;
  correctCount: number;
  totalQuestions: number;
  damage: number;
  score?: number;
  metric?: EventMetric;
  eventType?: EventType;
  rawDamage: number;
  bossId: string | null;
  bossName: string | null;
  bossCurrentHp: number | null;
  bossMaxHp: number | null;
  bossDefeated: boolean;
};

export type EventLeaderboardRow = {
  userId: string;
  userName: string;
  totalDamage: number;
  totalScore: number;
  metric: EventMetric;
  attempts: number;
};

export const DEFAULT_DAMAGE_CONFIG: DamageConfig = {
  nhan_biet: 10,
  thong_hieu: 20,
  van_dung: 35,
  van_dung_cao: 50,
};

export function eventStatus(event: Pick<MathEvent, "status" | "startAt" | "endAt">): EventStatus {
  if (event.status === "ended" || new Date(event.endAt).getTime() <= Date.now()) return "ended";
  if (event.status === "published" && new Date(event.startAt).getTime() <= Date.now()) return "published";
  return event.status;
}

export function formatEventDate(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} giờ ${rest} phút` : `${hours} giờ`;
}
