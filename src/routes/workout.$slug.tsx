import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Info, Check, Timer, Flag, Pencil, Trash2, X } from "lucide-react";
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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/workout/$slug")({
  head: () => ({
    meta: [
      { title: "Live Session — LIFT" },
      {
        name: "description",
        content: "Run your workout: log every set, see last time's numbers and rest between sets.",
      },
      { property: "og:title", content: "Live Session — LIFT" },
      { property: "og:description", content: "Log sets with double-progression guidance." },
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

  if (!plan) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{plan.day.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{plan.day.focus}</p>
        </div>
        <div className="text-right">
          <p className="num text-sm text-muted-foreground">
            {completedSets}/{totalSets} sets
          </p>
          <Button size="sm" className="mt-2" onClick={finish}>
            <Flag className="mr-1.5 h-4 w-4" /> Finish
          </Button>
        </div>
      </div>

      <div className="space-y-4">
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
  const [editing, setEditing] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

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

  async function saveEdit(id: string, setNumber: number) {
    if (!props.userId || !props.exerciseSessionId) return;
    await logSet({
      userId: props.userId,
      exerciseSessionId: props.exerciseSessionId,
      exerciseId: props.exerciseId,
      setNumber,
      weight: props.isCardio ? null : editWeight ? Number(editWeight) : null,
      reps: editReps ? Number(editReps) : null,
      rir: null,
      existingId: id,
    });
    setEditing(null);
    props.onLogged();
  }

  async function removeSet(id: string) {
    await deleteSet(id);
    setEditing(null);
    props.onLogged();
  }

  return (
    <Card
      className={cn(
        "p-4 transition-colors",
        done && "border-primary/60 bg-primary/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{props.name}</h3>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                <Check className="h-3 w-3" /> Complete
              </span>
            )}
          </div>
          <p className="num mt-0.5 text-sm text-muted-foreground">
            {props.isCardio ? props.repRange : `${props.sets} × ${props.repRange}`}
            {!props.isCardio && props.rir ? ` · RIR ${props.rir}` : ""}
            {props.restNote ? ` · rest ${props.restNote}` : ""}
          </p>
          {props.notes && <p className="mt-1 text-xs text-muted-foreground">{props.notes}</p>}
        </div>
        <Button size="icon" variant="ghost" onClick={props.onInfo} aria-label="How to perform">
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {!props.isCardio && (
      <div className="mt-3 rounded-lg bg-secondary/60 p-3 text-xs">
        <p className="font-medium text-foreground">
          {suggestion.label} · target set {Math.min(nextSetNumber, props.sets)}
        </p>
        <p className="mt-1 text-muted-foreground">{suggestion.reason}</p>
        {previous && (
          <p className="num mt-2 text-muted-foreground">
            Last time ({previous.performedAt.slice(0, 10)}):{" "}
            {previous.sets.map((s) => `${s.weight_kg ?? "—"}×${s.reps ?? "—"}`).join("  ")}
          </p>
        )}
      </div>
      )}

      {props.loggedSets.length > 0 && (
        <div className="num mt-3 flex flex-wrap gap-2 text-xs">
          {props.loggedSets
            .sort((a, b) => a.set_number - b.set_number)
            .map((s) =>
              editing === s.id ? (
                <span key={s.id} className="flex items-center gap-1.5 rounded-md border border-primary/60 p-1.5">
                  {!props.isCardio && (
                    <Input
                      className="num h-8 w-20"
                      inputMode="decimal"
                      placeholder="kg"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                    />
                  )}
                  <Input
                    className="num h-8 w-20"
                    inputMode="numeric"
                    placeholder={props.isCardio ? "min" : "reps"}
                    value={editReps}
                    onChange={(e) => setEditReps(e.target.value)}
                  />
                  <Button size="sm" className="h-8" onClick={() => saveEdit(s.id, s.set_number)}>
                    Save
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Delete set" onClick={() => removeSet(s.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Cancel edit" onClick={() => setEditing(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </span>
              ) : (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Edit set ${s.set_number}`}
                  onClick={() => {
                    setEditing(s.id);
                    setEditWeight(s.weight_kg !== null ? String(s.weight_kg) : "");
                    setEditReps(s.reps !== null ? String(s.reps) : "");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 hover:border-primary"
                >
                  {props.isCardio
                    ? `${s.reps ?? "—"} min`
                    : `${s.set_number}: ${s.weight_kg ?? "—"} kg × ${s.reps ?? "—"}`}
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </button>
              ),
            )}
        </div>
      )}

      {done ? (
        <p className="mt-3 text-xs text-muted-foreground">
          All {props.sets} {props.isCardio ? "entries" : "sets"} logged. Tap a set above to edit it.
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          {!props.isCardio && (
            <Input
              className="num"
              inputMode="decimal"
              placeholder={suggestion.weight ? `${suggestion.weight} kg` : "kg"}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          )}
          <Input
            className="num"
            inputMode="numeric"
            placeholder={props.isCardio ? "minutes" : suggestion.reps ? `${suggestion.reps} reps` : "reps"}
            value={reps}
            onChange={(e) => setReps(e.target.value)}
          />
          <Button onClick={submit} disabled={!props.exerciseSessionId}>
            <Timer className="mr-1.5 h-4 w-4" />
            Log
          </Button>
        </div>
      )}
    </Card>
  );
}