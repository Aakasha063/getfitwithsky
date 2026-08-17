import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RestTimer } from "@/components/RestTimer";
import { ExerciseInstructions } from "@/components/ExerciseInstructions";
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

export const Route = createFileRoute("/workout/$slug")({
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
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null);
  const [info, setInfo] = useState<Exercise | null>(null);
  const [startedAt] = useState(() => Date.now());

  const { data: plan } = useQuery({
    queryKey: ["day", slug],
    queryFn: () => fetchDayWithExercises(slug),
  });

  useEffect(() => {
    if (!user || !plan?.day || sessionId) return;
    startSession({ userId: user.id, day: plan.day, exercises: plan.exercises })
      .then((s) => setSessionId(s.id))
      .catch((e) => toast.error(e.message));
  }, [user, plan, sessionId]);

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

  async function finish() {
    if (!user || !sessionId) return;
    const duration = Math.round((Date.now() - startedAt) / 1000);
    const prs = await finishSession({ userId: user.id, sessionId, durationSeconds: duration });
    toast.success(
      prs.length ? `Session complete — ${prs.length} new PR(s)!` : "Session complete. Well done.",
    );
    qc.invalidateQueries();
    router.navigate({ to: "/history" });
  }

  if (!plan) return (
    <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>Loading…</p>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{plan.day.name}</h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{plan.day.focus}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>
            {completedSets}/{totalSets} sets
          </p>
          <button
            onClick={finish}
            style={{
              marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
              height: 32, padding: "0 12px", borderRadius: 8, border: "none",
              background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 15V4l14 5.5L4 15z" /><line x1="4" y1="20" x2="4" y2="4" />
            </svg>
            Finish
          </button>
        </div>
      </div>

      {/* Exercises */}
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

      <ExerciseInstructions exercise={info} open={!!info} onOpenChange={(v) => !v && setInfo(null)} />
      {rest && rest.seconds > 0 && (
        <RestTimer key={rest.key} seconds={rest.seconds} onDismiss={() => setRest(null)} />
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

  const done = props.loggedSets.length >= props.sets;

  async function submit() {
    if (!props.userId || !props.exerciseSessionId) return;
    if (done) return;
    await logSet({
      userId: props.userId,
      exerciseSessionId: props.exerciseSessionId,
      exerciseId: props.exerciseId,
      setNumber: nextSetNumber,
      weight: props.isCardio ? null : weight ? Number(weight) : (suggestion.weight ?? null),
      reps: reps ? Number(reps) : (suggestion.reps ?? null),
      rir: null,
    });
    setWeight("");
    setReps("");
    props.onLogged();
  }

  async function removeSet(id: string) {
    await deleteSet(id);
    props.onLogged();
  }

  const cardBg = done ? "oklch(0.92 0.25 110 / 10%)" : "oklch(0.11 0.004 250)";
  const cardBorder = done ? "oklch(0.92 0.25 110 / 60%)" : "oklch(0.27 0.005 250)";

  const subtitle = props.isCardio
    ? props.repRange
    : `${props.sets} × ${props.repRange}${props.rir ? ` · RIR ${props.rir}` : ""}${props.restNote ? ` · rest ${props.restNote}` : ""}`;

  return (
    <div style={{ background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 12, padding: 16 }}>
      {/* Title row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>{props.name}</h3>
            {done && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                borderRadius: 999, background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                padding: "2px 8px", fontSize: 11, fontWeight: 600,
              }}>✓ Complete</span>
            )}
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>
            {subtitle}
          </p>
          {props.notes && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{props.notes}</p>
          )}
        </div>
        <button
          onClick={props.onInfo}
          aria-label="How to perform"
          style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 8, border: "none",
            background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16" />
            <circle cx="12" cy="8" r="0.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Suggestion box */}
      {!props.isCardio && (
        <div style={{ marginTop: 12, borderRadius: 8, background: "oklch(0.22 0.005 250 / 60%)", padding: 12, fontSize: 12 }}>
          <p style={{ margin: 0, fontWeight: 500 }}>
            {suggestion.label} · target set {Math.min(nextSetNumber, props.sets)}
          </p>
          <p style={{ margin: "4px 0 0", color: "oklch(0.63 0.006 250)" }}>{suggestion.reason}</p>
          {previous && (
            <p style={{ margin: "8px 0 0", color: "oklch(0.63 0.006 250)", fontVariantNumeric: "tabular-nums" }}>
              Last time ({previous.performedAt.slice(0, 10)}):{" "}
              {previous.sets.map((s) => `${s.weight_kg ?? "—"}×${s.reps ?? "—"}`).join("  ")}
            </p>
          )}
        </div>
      )}

      {/* Logged chips */}
      {props.loggedSets.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
          {props.loggedSets
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) => (
              <button
                key={s.id}
                onClick={() => removeSet(s.id)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
                  padding: "4px 8px", background: "transparent", color: "inherit", cursor: "pointer",
                }}
              >
                {props.isCardio
                  ? `${s.reps ?? "—"} min`
                  : `${s.set_number}: ${s.weight_kg ?? "—"} kg × ${s.reps ?? "—"}`}
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            ))}
        </div>
      )}

      {/* Done message or input row */}
      {done ? (
        <p style={{ marginTop: 12, fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
          All {props.sets} {props.isCardio ? "entries" : "sets"} logged. Tap a set above to remove it.
        </p>
      ) : (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
          {!props.isCardio && (
            <input
              inputMode="decimal"
              placeholder={suggestion.weight ? `${suggestion.weight} kg` : "kg"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{
                height: 36, flex: 1, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
                background: "transparent", color: "inherit", padding: "0 10px",
                fontSize: 13, fontVariantNumeric: "tabular-nums",
              }}
            />
          )}
          <input
            inputMode="numeric"
            placeholder={props.isCardio ? "minutes" : suggestion.reps ? `${suggestion.reps} reps` : "reps"}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            style={{
              height: 36, flex: 1, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
              background: "transparent", color: "inherit", padding: "0 10px",
              fontSize: 13, fontVariantNumeric: "tabular-nums",
            }}
          />
          <button
            onClick={submit}
            disabled={!props.exerciseSessionId}
            style={{
              height: 36, padding: "0 14px", borderRadius: 8, border: "none",
              background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
              fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
            }}
          >
            Log
          </button>
        </div>
      )}
    </div>
  );
}