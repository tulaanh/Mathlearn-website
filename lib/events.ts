import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  DamageConfig,
  EventActivity,
  EventBoss,
  EventLeaderboardRow,
  MathEvent,
} from "@/lib/event-types";
import { DEFAULT_DAMAGE_CONFIG, DEFAULT_EVENT_SCORING, isEventType } from "@/lib/event-types";

function mapBoss(row: any): EventBoss {
  return {
    id: row.id,
    eventId: row.event_id,
    name: row.name,
    description: row.description,
    emoji: row.emoji || "👾",
    maxHp: Number(row.max_hp),
    currentHp: Number(row.current_hp),
    position: Number(row.position),
    isDefeated: Boolean(row.is_defeated),
    defeatedAt: row.defeated_at,
  };
}

function mapActivity(row: any, stats: any = {}): EventActivity {
  const rawConfig = row.damage_config && typeof row.damage_config === "object" ? row.damage_config : {};
  const rawScoring = row.scoring_config && typeof row.scoring_config === "object" ? row.scoring_config : {};
  return {
    id: row.id,
    eventId: row.event_id,
    bossId: row.boss_id,
    targetId: row.target_id ?? null,
    title: row.title,
    description: row.description,
    position: Number(row.position),
    timeLimitSeconds: Number(row.time_limit_seconds),
    maxAttempts: Number(row.max_attempts),
    questionCount: Number(row.question_count),
    questionPoolCount: Number(stats.pool_count ?? row.question_pool_count ?? 0),
    shuffleQuestions: Boolean(row.shuffle_questions),
    damageConfig: {
      ...DEFAULT_DAMAGE_CONFIG,
      ...Object.fromEntries(
        Object.entries(rawConfig).map(([key, value]) => [key, Math.max(0, Number(value) || 0)]),
      ),
    } as DamageConfig,
    scoringConfig: rawScoring,
    myAttempts: Number(stats.my_attempts ?? 0),
    myBestDamage: Number(stats.my_best_damage ?? 0),
    myTotalDamage: Number(stats.my_total_damage ?? 0),
    myBestScore: Number(stats.my_best_score ?? stats.my_best_damage ?? 0),
    myTotalScore: Number(stats.my_total_score ?? stats.my_total_damage ?? 0),
  };
}

export const getEvents = cache(async function getEvents(includeDrafts = false): Promise<MathEvent[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];

  let query = supabase.from("events").select("*").order("start_at", { ascending: false });
  if (!includeDrafts) query = query.in("status", ["published", "ended"]);
  const { data: eventRows, error } = await query;
  if (error || !eventRows?.length) return [];

  const ids = eventRows.map((row: any) => row.id);
  const [{ data: bossRows }, { data: activityRows }] = await Promise.all([
    supabase.from("event_bosses").select("*").in("event_id", ids).order("position"),
    supabase.from("event_activities").select("*").in("event_id", ids).order("position"),
  ]);
  const statsResults = await Promise.all(
    eventRows.map((row: any) => supabase.rpc("event_activity_stats", { p_event_id: row.id })),
  );
  const statsById = new Map<string, any>();
  statsResults.forEach((result: any) => {
    for (const stat of result.data ?? []) statsById.set(stat.activity_id, stat);
  });
  const bossesByEvent = new Map<string, EventBoss[]>();
  for (const row of bossRows ?? []) {
    const boss = mapBoss(row);
    bossesByEvent.set(boss.eventId, [...(bossesByEvent.get(boss.eventId) ?? []), boss]);
  }
  const activitiesByEvent = new Map<string, EventActivity[]>();
  for (const row of activityRows ?? []) {
    const activity = mapActivity(row, statsById.get(row.id));
    activitiesByEvent.set(activity.eventId, [...(activitiesByEvent.get(activity.eventId) ?? []), activity]);
  }
  return eventRows.map((row: any): MathEvent => ({
    id: row.id,
    title: row.title,
    description: row.description,
    grade: row.grade,
    status: row.status,
    eventType: isEventType(row.event_type) ? row.event_type : "boss_battle",
    startAt: row.start_at,
    endAt: row.end_at,
    createdBy: row.created_by,
    scoringConfig: { ...DEFAULT_EVENT_SCORING, ...(row.scoring_config ?? {}) },
    displayConfig: row.display_config && typeof row.display_config === "object" ? row.display_config : {},
    bosses: bossesByEvent.get(row.id) ?? [],
    activities: activitiesByEvent.get(row.id) ?? [],
  }));
});

export const getEventById = cache(async function getEventById(id: string, includeDrafts = false): Promise<MathEvent | null> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;
  let eventQuery = supabase.from("events").select("*").eq("id", id);
  if (!includeDrafts) eventQuery = eventQuery.in("status", ["published", "ended"]);
  const [{ data: row }, { data: bosses }, { data: activities }] = await Promise.all([
    eventQuery.maybeSingle(),
    supabase.from("event_bosses").select("*").eq("event_id", id).order("position"),
    supabase.from("event_activities").select("*").eq("event_id", id).order("position"),
  ]);
  if (!row) return null;
  const { data: stats } = await supabase.rpc("event_activity_stats", { p_event_id: id });
  const statsById = new Map((stats ?? []).map((item: any) => [item.activity_id, item]));
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    grade: row.grade,
    status: row.status,
    eventType: isEventType(row.event_type) ? row.event_type : "boss_battle",
    startAt: row.start_at,
    endAt: row.end_at,
    createdBy: row.created_by,
    scoringConfig: { ...DEFAULT_EVENT_SCORING, ...(row.scoring_config ?? {}) },
    displayConfig: row.display_config && typeof row.display_config === "object" ? row.display_config : {},
    bosses: (bosses ?? []).map(mapBoss),
    activities: (activities ?? []).map((item: any) => mapActivity(item, statsById.get(item.id))),
  };
});

export async function getEventLeaderboard(eventId: string): Promise<EventLeaderboardRow[]> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return [];
  let { data, error } = await supabase.rpc("event_score_leaderboard", { p_event_id: eventId, p_limit: 20 });
  if (error) {
    const legacy = await supabase.rpc("event_leaderboard", { p_event_id: eventId, p_limit: 20 });
    data = (legacy.data ?? []).map((row: any) => ({ ...row, total_score: row.total_damage, metric: "damage" }));
    error = legacy.error;
  }
  if (error) return [];
  return (data ?? []).map((row: any) => ({
    userId: row.user_id,
    userName: row.user_name,
    totalDamage: Number(row.total_score ?? row.total_damage ?? 0),
    totalScore: Number(row.total_score ?? row.total_damage ?? 0),
    metric: row.metric ?? "damage",
    attempts: Number(row.attempts),
  }));
}

export function supabaseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return message.replace(/^[\s\S]*?\[[^\]]*\]\s*/, "") || "Đã xảy ra lỗi khi xử lý sự kiện.";
}
