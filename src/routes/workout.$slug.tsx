import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RestTimer } from "@/components/RestTimer";
import { ExerciseInstructions } from "@/components/ExerciseInstructions";
import { HIITInstructions } from "@/components/HIITInstructions";
import { WorkoutSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/lib/auth";
import {
  fetchDayWithExercises,
  fetchPreviousPerformance,
  fetchSessionDetail,
  finishSession,
  logSet,
  startSession,
  deleteSet,
  type Exercise,
} from "@/lib/api";
import { suggestNextSet } from "@/lib/progression";
import { mmss } from "@/lib/format";

export const Route = createFileRoute("/workout/$slug")({
  validateSearch: (search: Record<string, unknown>): { start?: boolean } => {
    return {
      start: search['start'] === true || search['start'] === "true",
    };
  },
  head: () => ({
    meta: [
      { title: "Live Session — LIFT" },
      {
        name: "description",
        content: "Run your workout: log every set, see last time's numbers and rest between sets.",
      },
      { property: "og:title", content: "Live Session — LIFT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <WorkoutPage />
    </AppShell>
  ),
});

function WorkoutPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<{
    title: string;
    duration: string;
    sets: number;
    volume: number;
    prs: number;
  } | null>(null);
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null);
  const [info, setInfo] = useState<Exercise | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [nowMs, setNowMs] = useState(() => Date.now());
  const search = Route.useSearch();
  const autoStart = search.start;
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: plan } = useQuery({
    queryKey: ["day", slug],
    queryFn: () => fetchDayWithExercises(slug),
  });

  useEffect(() => {
    if (!user || !plan?.day || sessionId || sessionStarted) return;
    if (!autoStart) return;
    
    setSessionStarted(true);
    startSession({ userId: user.id, day: plan.day, exercises: plan.exercises })
      .then((s) => setSessionId(s.id))
      .catch((e) => toast.error(e.message));
  }, [user, plan, sessionId, autoStart, sessionStarted]);

  function handleManualStart() {
    if (!user || !plan?.day || sessionId || sessionStarted) return;
    setSessionStarted(true);
    setNowMs(Date.now());
    startSession({ userId: user.id, day: plan.day, exercises: plan.exercises })
      .then((s) => setSessionId(s.id))
      .catch((e) => toast.error(e.message));
  }

  const { data: detail } = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => fetchSessionDetail(sessionId!),
    enabled: !!sessionId,
  });

  const completedSets = detail?.sets.length ?? 0;
  const totalSets = useMemo(
    () => (plan?.exercises ?? []).reduce((n, e) => n + e.sets, 0),
    [plan],
  );

  const finish = useCallback(async () => {
    if (!user || !sessionId || finishing) return;
    setFinishing(true);
    const duration = Math.round((Date.now() - startedAt) / 1000);
    const prs = await finishSession({ userId: user.id, sessionId, durationSeconds: duration });
    
    // Calculate final volume
    const finalVolume = (detail?.sets ?? []).reduce((acc, s) => acc + ((s.weight_kg ?? 0) * (s.reps ?? 0)), 0);
    
    setCompletedSummary({
      title: plan?.day?.name ?? "Workout",
      duration: mmss(duration),
      sets: completedSets,
      volume: finalVolume,
      prs: prs.length,
    });
    
    qc.invalidateQueries();
  }, [user, sessionId, finishing, startedAt, qc, detail, plan, completedSets]);

  const requestFinish = useCallback(() => {
    if (completedSets >= totalSets) {
      finish();
    } else {
      const ok = window.confirm(`You still have ${totalSets - completedSets} sets remaining. Finish anyway?`);
      if (ok) finish();
    }
  }, [completedSets, totalSets, finish]);

  useEffect(() => {
    if (completedSets > 0 && totalSets > 0 && completedSets >= totalSets) {
      finish();
    }
  }, [completedSets, totalSets, finish]);

  const elapsedSeconds = Math.round((nowMs - startedAt) / 1000);
  const workoutElapsedLabel = mmss(elapsedSeconds);
  const workoutPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  
  // Calculate total volume for this session
  const sessionVolume = (detail?.sets ?? []).reduce((acc, s) => acc + ((s.weight_kg ?? 0) * (s.reps ?? 0)), 0);

  if (!plan) return <WorkoutSkeleton />;

  if (completedSummary) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 60, background: "oklch(0.045 0.003 250)", overflowY: "auto", display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <p style={{ margin: 0, textAlign: "center", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(0.92 0.25 110)" }}>Workout Complete</p>
          <h1 style={{ margin: "8px 0 0", textAlign: "center", fontSize: 22, fontWeight: 600 }}>{completedSummary.title}</h1>
          <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 48, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{completedSummary.duration}</p>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 18, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total sets</p>
              <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{completedSummary.sets}</p>
            </div>
            <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 18, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Volume</p>
              <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{Number.isInteger(completedSummary.volume) ? completedSummary.volume : completedSummary.volume.toFixed(1)} kg</p>
            </div>
            <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 18, textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 11, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>PRs</p>
              <p style={{ margin: "6px 0 0", fontSize: 24, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "oklch(0.92 0.25 110)" }}>{completedSummary.prs}</p>
            </div>
          </div>

          <button onClick={() => router.navigate({ to: "/history" })} style={{ marginTop: 28, width: "100%", height: 48, borderRadius: 10, border: "none", background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 120 }}>
      {/* Sticky Header */}
      <div style={{ position: "sticky", top: 0, zIndex: 30, margin: "0 -16px", padding: "12px 16px", background: "oklch(0.045 0.003 250 / 97%)", backdropFilter: "blur(8px)", borderBottom: "1px solid oklch(0.27 0.005 250)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <button onClick={() => router.history.back()} aria-label="Back" style={{ flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="11,18 5,12 11,6"></polyline></svg>
            </button>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>{plan.day.name}</p>
              <h1 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan.day.focus}</h1>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            {sessionId ? (
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{workoutElapsedLabel}</p>
                <p style={{ margin: 0, fontSize: 11, color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>{completedSets}/{totalSets} · {workoutPct}%</p>
              </div>
            ) : (
              <button 
                onClick={handleManualStart} 
                disabled={sessionStarted}
                style={{ 
                  height: 36, padding: "0 18px", borderRadius: 8, border: "none", 
                  background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)", 
                  fontSize: 13, fontWeight: 600, cursor: sessionStarted ? "wait" : "pointer", 
                  whiteSpace: "nowrap", opacity: sessionStarted ? 0.7 : 1 
                }}
              >
                {sessionStarted ? "Starting..." : "Start workout"}
              </button>
            )}
          </div>
        </div>
        <div style={{ marginTop: 10, height: 3, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${workoutPct}%` }}></div>
        </div>
      </div>

      {/* Stats Grid — only shown when workout is active */}
      {sessionId && (
        <div className="workout-stats-grid" style={{ background: "oklch(0.27 0.005 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ background: "oklch(0.11 0.004 250)", padding: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "oklch(0.63 0.006 250)" }}>Time</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{workoutElapsedLabel}</p>
          </div>
          <div style={{ background: "oklch(0.11 0.004 250)", padding: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "oklch(0.63 0.006 250)" }}>Volume</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{Number.isInteger(sessionVolume) ? sessionVolume : sessionVolume.toFixed(1)}</p>
          </div>
          <div style={{ background: "oklch(0.11 0.004 250)", padding: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "oklch(0.63 0.006 250)" }}>PRs</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>—</p>
          </div>
          <div style={{ background: "oklch(0.11 0.004 250)", padding: 14, textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "oklch(0.63 0.006 250)" }}>Sets</p>
            <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{completedSets}/{totalSets}</p>
          </div>
        </div>
      )}

      {/* Exercises */}
      {plan.day.slug === "saturday-hiit" ? (
        <div style={{ marginTop: 8 }}>
          <HIITInstructions />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {plan.exercises.map((we) => {
            const es = detail?.exSessions.find((e) => e.workout_exercise_id === we.id);
            return (
              <ExerciseCard
                key={we.id}
                name={we.exercises.name}
                sets={we.sets}
                repRange={we.rep_range}
                repMin={we.rep_min}
                repMax={we.rep_max}
                rir={we.rir_target}
                restNote={we.rest_note}
                notes={we.notes}
                isCompound={we.exercises.is_compound}
                isCardio={we.exercises.category === "cardio"}
                exerciseId={we.exercise_id}
                exerciseSessionId={es?.id ?? null}
                loggedSets={(detail?.sets ?? []).filter((s) => s.exercise_session_id === es?.id)}
                userId={user?.id ?? null}
                onInfo={() => setInfo(we.exercises)}
                onLogged={() => {
                  qc.invalidateQueries({ queryKey: ["session", sessionId] });
                  setRest({ seconds: we.rest_seconds ?? 90, key: Date.now() });
                }}
              />
            );
          })}
        </div>
      )}

      <ExerciseInstructions exercise={info} open={!!info} onOpenChange={(v) => !v && setInfo(null)} />
      {rest && rest.seconds > 0 && (
        <RestTimer key={rest.key} seconds={rest.seconds} onDismiss={() => setRest(null)} />
      )}

      {/* Fixed bottom bar — active workout only (design lines 481-491) */}
      {sessionId && (
        <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 35, background: "oklch(0.08 0.004 250 / 97%)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderTop: "1px solid oklch(0.27 0.005 250)", padding: "10px 16px" }}>
          <div style={{ maxWidth: 480, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Sets</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{completedSets}/{totalSets}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Time</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{workoutElapsedLabel}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 10, color: "oklch(0.63 0.006 250)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Volume</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "oklch(0.92 0.25 110)" }}>{Number.isInteger(sessionVolume) ? sessionVolume : sessionVolume.toFixed(1)} kg</p>
              </div>
            </div>
            {completedSets >= totalSets && (
              <button
                onClick={requestFinish}
                disabled={finishing}
                style={{ 
                  height: 40, padding: "0 20px", borderRadius: 8, border: "none", 
                  background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)", 
                  fontSize: 14, fontWeight: 600, cursor: finishing ? "wait" : "pointer", 
                  whiteSpace: "nowrap", opacity: finishing ? 0.7 : 1 
                }}
              >
                {finishing ? "Finishing..." : "Finish Workout"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard(props: {
  name: string;
  sets: number;
  repRange: string;
  repMin: number | null;
  repMax: number | null;
  rir: string | null;
  restNote: string | null;
  notes: string | null;
  isCompound: boolean;
  isCardio: boolean;
  exerciseId: string;
  exerciseSessionId: string | null;
  loggedSets: { id: string; set_number: number; weight_kg: number | null; reps: number | null }[];
  userId: string | null;
  onInfo: () => void;
  onLogged: () => void;
}) {
  const qc = useQueryClient();
  const { data: previous } = useQuery({
    queryKey: ["prev", props.userId, props.exerciseId, props.exerciseSessionId],
    queryFn: () =>
      fetchPreviousPerformance({
        userId: props.userId!,
        exerciseId: props.exerciseId,
        excludeExerciseSessionId: props.exerciseSessionId ?? undefined,
      }),
    enabled: !!props.userId && !props.isCardio,
  });

  const nextSetNumber = props.loggedSets.length + 1;
  const suggestion = suggestNextSet({
    prevSets: previous?.sets ?? [],
    setNumber: nextSetNumber,
    repMin: props.repMin,
    repMax: props.repMax,
    isCompound: props.isCompound,
  });

  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const done = props.loggedSets.length >= props.sets;

  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse when exercise becomes done
  useEffect(() => {
    if (done) setCollapsed(true);
  }, [done]);

  async function submit() {
    if (!props.userId || !props.exerciseSessionId) return;
    if (done) return;
    
    const finalWeight = props.isCardio ? null : weight ? Number(weight) : (suggestion.weight ?? null);
    const finalReps = reps ? Number(reps) : (suggestion.reps ?? null);
    
    if (finalReps === null || (!props.isCardio && finalWeight === null)) {
      toast.error("Please enter weight and reps");
      return;
    }

    setIsSubmitting(true);
    try {
      const sessionId = props.exerciseSessionId;
      qc.setQueryData(["session", sessionId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          sets: [...old.sets, { id: "temp-" + Date.now(), exercise_id: props.exerciseId, set_number: nextSetNumber, weight_kg: finalWeight, reps: finalReps }]
        };
      });
      setWeight("");
      setReps("");

      await logSet({
        userId: props.userId,
        exerciseSessionId: props.exerciseSessionId,
        exerciseId: props.exerciseId,
        setNumber: nextSetNumber,
        weight: finalWeight,
        reps: finalReps,
        rir: null,
      });

      // Haptic feedback on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(10);

      props.onLogged();
    } catch (e: any) {
      toast.error("Failed to log set");
      qc.invalidateQueries({ queryKey: ["session", props.exerciseSessionId] });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeSet(id: string) {
    await deleteSet(id);
    props.onLogged();
  }

  function editSet(set: any) {
    if (set.weight_kg) setWeight(String(set.weight_kg));
    if (set.reps) setReps(String(set.reps));
    removeSet(set.id);
  }

  const cardBg = done ? "oklch(0.92 0.25 110 / 10%)" : "oklch(0.11 0.004 250)";
  const cardBorder = done ? "oklch(0.92 0.25 110 / 60%)" : "oklch(0.27 0.005 250)";

  const subtitle = props.isCardio
    ? props.repRange
    : `${props.sets} × ${props.repRange}${props.rir ? ` · RIR ${props.rir}` : ""}${props.restNote ? ` · rest ${props.restNote}` : ""}`;

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", gap: 10, minWidth: 0, flex: 1 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{props.name}</h3>
              {done && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  borderRadius: 999, background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                  padding: "2px 8px", fontSize: 11, fontWeight: 600,
                }}>✓ Done</span>
              )}
            </div>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>
              {subtitle}
            </p>
            {props.notes && (
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{props.notes}</p>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {done && (
            <button
              onClick={() => setCollapsed(v => !v)}
              aria-label={collapsed ? "Expand" : "Collapse"}
              style={{
                width: 28, height: 28, borderRadius: 7, border: "none",
                background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, transition: "transform 0.2s",
                transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
              }}
            >
              ▾
            </button>
          )}
          <button
            onClick={props.onInfo}
            aria-label="How to perform"
            style={{
              width: 28, height: 28, borderRadius: 7, border: "none",
              background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" />
              <line x1="12" y1="11" x2="12" y2="16" />
              <circle cx="12" cy="8" r="0.5" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsed summary for done exercises */}
      {done && collapsed && (
        <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
          {props.loggedSets.map((s, i) => (
            <span key={s.id} style={{ fontSize: 12, color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>
              S{i + 1}: {s.weight_kg ?? "—"}kg × {s.reps ?? "—"}
            </span>
          ))}
        </div>
      )}

      {/* Suggestion box */}
      {!props.isCardio && !collapsed && (
        <div style={{ marginTop: 12, borderRadius: 8, background: "oklch(0.22 0.005 250 / 50%)", padding: "10px 12px", fontSize: 12.5 }}>
          <p style={{ margin: 0, fontWeight: 600, color: "oklch(0.63 0.006 250)" }}>
            {previous ? `Last session · ${previous.performedAt.slice(0, 10)}` : "No previous data"}
          </p>
          {previous && (
            <p style={{ margin: "4px 0 0", color: "oklch(0.96 0.002 250)", fontVariantNumeric: "tabular-nums" }}>
              {previous.sets.map((s, i) => `Set ${i + 1} · ${s.weight_kg ?? "—"}kg × ${s.reps ?? "—"}`).join(", ")}
            </p>
          )}
        </div>
      )}

      {/* Cardio / Input area */}
      {!collapsed && props.isCardio ? (
        done ? (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ margin: 0, fontSize: 13, color: "oklch(0.63 0.006 250)" }}>
              Logged: {props.loggedSets[0]?.reps} minutes
            </p>
            <button onClick={() => removeSet(props.loggedSets[0]!.id)} style={{ background: "transparent", border: "none", color: "oklch(0.92 0.25 110)", fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Undo</button>
          </div>
        ) : (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <input
              inputMode="numeric"
              placeholder="minutes"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              style={{
                height: 36, flex: 1, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
                background: "transparent", color: "inherit", padding: "0 10px",
                fontSize: 13, fontVariantNumeric: "tabular-nums"
              }}
            />
            <button
              onClick={submit}
              disabled={!props.exerciseSessionId || isSubmitting}
              style={{
                height: 36, padding: "0 14px", borderRadius: 8, border: "none",
                background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                fontSize: 13, fontWeight: 600, cursor: isSubmitting ? "wait" : "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? "..." : "Log"}
            </button>
          </div>
        )
      ) : !collapsed ? (
        <div style={{ marginTop: 12, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250 / 70%)", overflow: "hidden", userSelect: "none" }}>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 82px", background: "oklch(0.22 0.005 250 / 40%)", padding: "6px 10px", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)" }}>
            <span>Set</span><span>Kg</span><span>Reps</span><span style={{ textAlign: "right" }}>Status</span>
          </div>
          {Array.from({ length: props.sets }).map((_, i) => {
            const setNum = i + 1;
            const logged = props.loggedSets.find(s => s.set_number === setNum);
            const isCurrent = !logged && setNum === nextSetNumber;
            const isUpcoming = !logged && setNum > nextSetNumber;
            const rowBg = isCurrent ? "oklch(0.22 0.005 250 / 20%)" : "transparent";

            return (
              <div key={setNum} style={{ display: "grid", gridTemplateColumns: "36px 1fr 1fr 82px", alignItems: "center", padding: "8px 10px", borderTop: "1px solid oklch(0.27 0.005 250 / 50%)", background: rowBg }}>
                <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "oklch(0.63 0.006 250)" }}>{setNum}</span>
                
                {logged ? (
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "oklch(0.63 0.006 250)" }}>{logged.weight_kg ?? "—"}</span>
                ) : isCurrent ? (
                  <input
                    inputMode="decimal"
                    placeholder={suggestion.weight ? String(suggestion.weight) : ""}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{ height: 30, width: 64, borderRadius: 6, border: "1px solid oklch(0.4 0.006 250)", background: "oklch(0.045 0.003 250)", color: "inherit", padding: "0 8px", fontSize: 13, fontVariantNumeric: "tabular-nums" }}
                  />
                ) : (
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "oklch(0.4 0.006 250)" }}>—</span>
                )}

                {logged ? (
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "oklch(0.63 0.006 250)" }}>{logged.reps ?? "—"}</span>
                ) : isCurrent ? (
                  <input
                    inputMode="numeric"
                    placeholder={suggestion.reps ? String(suggestion.reps) : ""}
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    style={{ height: 30, width: 56, borderRadius: 6, border: "1px solid oklch(0.4 0.006 250)", background: "oklch(0.045 0.003 250)", color: "inherit", padding: "0 8px", fontSize: 13, fontVariantNumeric: "tabular-nums" }}
                  />
                ) : (
                  <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums", color: "oklch(0.4 0.006 250)" }}>—</span>
                )}

                {logged ? (
                  <div style={{ justifySelf: "end", display: "flex", gap: 8, alignItems: "center" }}>
                    <button onClick={() => editSet(logged)} style={{ background: "transparent", border: "none", padding: 0, fontSize: 12, color: "oklch(0.63 0.006 250)", cursor: "pointer" }} title="Edit">✎</button>
                    <button onClick={() => removeSet(logged.id)} style={{ background: "transparent", border: "none", padding: 0, fontSize: 11, color: "oklch(0.92 0.25 110)", fontWeight: 600, cursor: "pointer" }} title="Undo">✓ Done</button>
                  </div>
                ) : isCurrent ? (
                  <button
                    onClick={submit}
                    disabled={!props.exerciseSessionId || isSubmitting}
                    style={{
                      justifySelf: "end", height: 28, padding: "0 12px", borderRadius: 6, border: "none",
                      background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                      fontSize: 12, fontWeight: 600, cursor: isSubmitting ? "wait" : "pointer",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting ? "..." : "Log"}
                  </button>
                ) : (
                  <span style={{ justifySelf: "end", fontSize: 11, color: "oklch(0.4 0.006 250)" }}>—</span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}