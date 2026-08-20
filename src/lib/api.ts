import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { epley1RM, todayISO } from "./format";

export type Exercise = Tables<"exercises">;
export type WorkoutDay = Tables<"workout_days">;
export type WorkoutExercise = Tables<"workout_exercises"> & { exercises: Exercise };
export type SessionRow = Tables<"workout_sessions">;
export type SetRow = Tables<"sets">;
export type ExerciseSession = Tables<"exercise_sessions">;

export async function fetchDays() {
  const { data, error } = await supabase
    .from("workout_days")
    .select("*, workout_exercises(id)")
    .order("sort_order");
  if (error) throw error;
  return data.map((d: any) => ({
    ...d,
    exercise_count: d.workout_exercises?.length ?? 0,
  }));
}

export async function fetchDayWithExercises(slug: string) {
  const { data: day, error } = await supabase
    .from("workout_days")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!day) return null;
  const { data: exercises, error: exErr } = await supabase
    .from("workout_exercises")
    .select("*, exercises(*)")
    .eq("day_id", day.id)
    .order("position");
  if (exErr) throw exErr;
  return { day, exercises: (exercises ?? []) as WorkoutExercise[] };
}

export async function fetchActiveSession(userId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Any live session (in_progress or completed — never abandoned) already logged today for this day. */
export async function fetchTodaySessionForDay(userId: string, dayId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("day_id", dayId)
    .eq("session_date", todayISO())
    .in("status", ["in_progress", "completed"])
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function startSession(params: {
  userId: string;
  day: WorkoutDay;
  exercises: WorkoutExercise[];
}) {
  const { userId, day, exercises } = params;

  // Use order+limit instead of maybeSingle(): if more than one in_progress session
  // ever accumulated for this day (e.g. an abandoned session followed by a restart),
  // maybeSingle() would error and silently fall through to creating yet another
  // duplicate session, orphaning whatever was already logged.
  const { data: existingRows, error: existingErr } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .eq("day_id", day.id)
    .eq("status", "in_progress")
    .order("started_at", { ascending: false })
    .limit(1);
  if (existingErr) throw existingErr;
  const existing = existingRows?.[0];
  if (existing) {
    // Only treat this as a genuine continuation (e.g. a session spanning midnight)
    // if it started recently. A session left in_progress from days/weeks ago — most
    // likely abandoned, possibly against a since-edited exercise plan — should not be
    // silently inherited: that carries its old logged sets into what looks like a
    // fresh workout, corrupting the set count and can trigger a premature auto-finish.
    const STALE_HOURS = 18;
    const hoursSinceStart = (Date.now() - new Date(existing.started_at).getTime()) / 3_600_000;
    if (hoursSinceStart <= STALE_HOURS) {
      await ensureExerciseSessions(userId, existing.id, exercises);
      // Resuming a session started on an earlier day: re-date it to today so it
      // counts toward the current week once finished.
      const today = todayISO();
      if (existing.session_date !== today) {
        await supabase
          .from("workout_sessions")
          .update({ session_date: today, started_at: new Date().toISOString() })
          .eq("id", existing.id);
        return { ...existing, session_date: today };
      }
      return existing;
    }
    await supabase.from("workout_sessions").update({ status: "abandoned" }).eq("id", existing.id);
  }

  const { data: session, error } = await supabase
    .from("workout_sessions")
    .insert({
      user_id: userId,
      day_id: day.id,
      title: `${day.name} — ${day.focus ?? ""}`.trim(),
      status: "in_progress",
      session_date: todayISO(),
    })
    .select()
    .single();
  if (error) throw error;

  await ensureExerciseSessions(userId, session.id, exercises);
  return session;
}

/** Make sure every planned exercise has a row for this session (handles plan updates). */
export async function ensureExerciseSessions(
  userId: string,
  sessionId: string,
  exercises: WorkoutExercise[],
) {
  const { data: current, error } = await supabase
    .from("exercise_sessions")
    .select("workout_exercise_id")
    .eq("session_id", sessionId);
  if (error) throw error;
  const have = new Set((current ?? []).map((r) => r.workout_exercise_id));
  const missing = exercises.filter((we) => !have.has(we.id));
  if (missing.length === 0) return;
  const { error: esErr } = await supabase.from("exercise_sessions").insert(
    missing.map((we) => ({
      user_id: userId,
      session_id: sessionId,
      exercise_id: we.exercise_id,
      workout_exercise_id: we.id,
      position: we.position,
      target_sets: we.sets,
      target_rep_range: we.rep_range,
    })),
  );
  if (esErr) throw esErr;
}

export async function fetchSessionDetail(sessionId: string) {
  const [{ data: session, error }, { data: exSessions, error: esErr }] = await Promise.all([
    supabase.from("workout_sessions").select("*").eq("id", sessionId).maybeSingle(),
    supabase
      .from("exercise_sessions")
      .select("*, exercises(*)")
      .eq("session_id", sessionId)
      .order("position"),
  ]);
  if (error) throw error;
  if (esErr) throw esErr;
  if (!session) return null;

  const [{ data: sets, error: sErr }, { data: pl }] = await Promise.all([
    supabase
      .from("sets")
      .select("*")
      .in("exercise_session_id", (exSessions ?? []).map((e) => e.id))
      .order("set_number"),
    session.day_id
      ? supabase.from("workout_exercises").select("*, exercises(*)").eq("day_id", session.day_id).order("position")
      : Promise.resolve({ data: [] as WorkoutExercise[] }),
  ]);
  if (sErr) throw sErr;

  return {
    session,
    exSessions: (exSessions ?? []) as (ExerciseSession & { exercises: Exercise })[],
    sets: sets ?? [],
    planned: (pl ?? []) as WorkoutExercise[],
  };
}

/** Most recent completed performance for an exercise, excluding the current session. */
export async function fetchPreviousPerformance(params: {
  userId: string;
  exerciseId: string;
  excludeExerciseSessionId?: string | undefined;
}) {
  const { userId, exerciseId, excludeExerciseSessionId } = params;
  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .eq("is_warmup", false)
    .order("performed_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  const rows = (data ?? []).filter((s) => s.exercise_session_id !== excludeExerciseSessionId);
  if (rows.length === 0) return null;
  const groupId = rows[0]!.exercise_session_id;
  const group = rows
    .filter((s) => s.exercise_session_id === groupId)
    .sort((a, b) => a.set_number - b.set_number);
  return { performedAt: group[0]!.performed_at, sets: group };
}

export async function logSet(params: {
  userId: string;
  exerciseSessionId: string;
  exerciseId: string;
  setNumber: number;
  weight: number | null;
  reps: number | null;
  rir: number | null;
  isWarmup?: boolean;
  note?: string | null;
  existingId?: string | null;
}) {
  const payload = {
    user_id: params.userId,
    exercise_session_id: params.exerciseSessionId,
    exercise_id: params.exerciseId,
    set_number: params.setNumber,
    weight_kg: params.weight,
    reps: params.reps,
    rir: params.rir,
    is_warmup: params.isWarmup ?? false,
    note: params.note ?? null,
    completed: true,
  };
  if (params.existingId) {
    const { data, error } = await supabase
      .from("sets")
      .update(payload)
      .eq("id", params.existingId)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
  const { data, error } = await supabase.from("sets").insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function deleteSet(id: string) {
  const { error } = await supabase.from("sets").delete().eq("id", id);
  if (error) throw error;
}

/** Detects and stores new personal records for a finished session. */
export async function evaluatePRs(params: { userId: string; sessionId: string }) {
  const { userId, sessionId } = params;
  const detail = await fetchSessionDetail(sessionId);
  if (!detail) return [];

  const { data: existing } = await supabase
    .from("personal_records")
    .select("*")
    .eq("user_id", userId);

  const newPRs: {
    user_id: string;
    session_id: string;
    exercise_id: string;
    record_type: string;
    weight_kg: number | null;
    reps: number | null;
    estimated_1rm: number | null;
    volume_kg: number | null;
    achieved_on: string;
  }[] = [];
  const labels: string[] = [];

  for (const es of detail.exSessions) {
    const sets = detail.sets.filter((s) => s.exercise_session_id === es.id && !s.is_warmup);
    const scored = sets.filter((s) => (s.weight_kg ?? 0) > 0 && (s.reps ?? 0) > 0);
    if (scored.length === 0) continue;

    const best1rm = Math.max(...scored.map((s) => epley1RM(s.weight_kg!, s.reps!)));
    const bestSet = scored.reduce((a, b) =>
      epley1RM(b.weight_kg!, b.reps!) > epley1RM(a.weight_kg!, a.reps!) ? b : a,
    );
    const volume = scored.reduce((sum, s) => sum + s.weight_kg! * s.reps!, 0);

    const prior = (existing ?? []).filter((p) => p.exercise_id === es.exercise_id);
    const prior1rm = Math.max(0, ...prior.map((p) => p.estimated_1rm ?? 0));
    const priorVol = Math.max(0, ...prior.map((p) => p.volume_kg ?? 0));

    if (best1rm > prior1rm + 0.01) {
      newPRs.push({
        user_id: userId,
        session_id: sessionId,
        exercise_id: es.exercise_id,
        record_type: "estimated_1rm",
        weight_kg: bestSet.weight_kg,
        reps: bestSet.reps,
        estimated_1rm: Math.round(best1rm * 10) / 10,
        volume_kg: Math.round(volume * 10) / 10,
        achieved_on: detail.session.session_date,
      });
      labels.push(`${es.exercises.name} — ${bestSet.weight_kg} kg × ${bestSet.reps}`);
    } else if (volume > priorVol + 0.01) {
      newPRs.push({
        user_id: userId,
        session_id: sessionId,
        exercise_id: es.exercise_id,
        record_type: "volume",
        weight_kg: bestSet.weight_kg,
        reps: bestSet.reps,
        estimated_1rm: Math.round(best1rm * 10) / 10,
        volume_kg: Math.round(volume * 10) / 10,
        achieved_on: detail.session.session_date,
      });
      labels.push(`${es.exercises.name} — best volume ${Math.round(volume)} kg`);
    }
  }

  if (newPRs.length > 0) {
    const { error } = await supabase.from("personal_records").insert(newPRs);
    if (error) throw error;
  }
  return labels;
}

export async function finishSession(params: {
  userId: string;
  sessionId: string;
  durationSeconds: number;
  difficulty?: number | null;
  energy?: number | null;
  notes?: string | null;
}) {
  const { error } = await supabase
    .from("workout_sessions")
    .update({
      status: "completed",
      session_date: todayISO(),
      finished_at: new Date().toISOString(),
      duration_seconds: params.durationSeconds,
      difficulty: params.difficulty ?? null,
      energy: params.energy ?? null,
      notes: params.notes ?? null,
    })
    .eq("id", params.sessionId);
  if (error) throw error;
  return evaluatePRs({ userId: params.userId, sessionId: params.sessionId });
}

export async function fetchHistory(userId: string) {
  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("session_date", { ascending: false })
    .limit(60);
  if (error) throw error;
  return data ?? [];
}

export async function fetchBodyMetrics(userId: string) {
  const { data, error } = await supabase
    .from("body_metrics")
    .select("*")
    .eq("user_id", userId)
    .order("measured_on", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchPRs(userId: string) {
  const { data, error } = await supabase
    .from("personal_records")
    .select("*, exercises(name, slug)")
    .eq("user_id", userId)
    .order("achieved_on", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function fetchExerciseHistory(userId: string, exerciseId: string) {
  const { data, error } = await supabase
    .from("sets")
    .select("*")
    .eq("user_id", userId)
    .eq("exercise_id", exerciseId)
    .eq("is_warmup", false)
    .order("performed_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchExercises() {
  const { data, error } = await supabase.from("exercises").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function logCardio(params: {
  userId: string;
  sessionId?: string | null;
  type: string;
  minutes: number | null;
  incline: number | null;
  speed: number | null;
  notes?: string | null;
}) {
  const { error } = await supabase.from("cardio_sessions").insert({
    user_id: params.userId,
    session_id: params.sessionId ?? null,
    cardio_type: params.type,
    duration_minutes: params.minutes,
    incline_percent: params.incline,
    speed_kph: params.speed,
    notes: params.notes ?? null,
    performed_on: todayISO(),
  });
  if (error) throw error;
}

export async function fetchCardio(userId: string) {
  const { data, error } = await supabase
    .from("cardio_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("performed_on", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionCardio(sessionId: string) {
  const { data, error } = await supabase
    .from("cardio_sessions")
    .select("*")
    .eq("session_id", sessionId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchSessionPRs(sessionId: string) {
  const { data, error } = await supabase
    .from("personal_records")
    .select("*, exercises(name)")
    .eq("session_id", sessionId);
  if (error) throw error;
  return data ?? [];
}

export async function fetchLeaderboard(periodDays = 30) {
  const { data, error } = await supabase.rpc("get_leaderboard", {
    period_days: periodDays,
  });
  if (error) throw error;
  return data ?? [];
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/profile_picture_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('user-profile-picture')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('user-profile-picture')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

export async function saveProfile(userId: string, patch: Partial<Tables<"profiles">>) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() });
  if (error) throw error;
}

/** All sets for a user, used for lifetime gamification stats. */
export async function fetchAllSets(userId: string) {
  const { data, error } = await supabase
    .from("sets")
    .select("weight_kg, reps, is_warmup, performed_at")
    .eq("user_id", userId)
    .eq("is_warmup", false)
    .order("performed_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}