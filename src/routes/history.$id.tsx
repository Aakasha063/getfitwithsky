import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  fetchSessionCardio,
  fetchSessionDetail,
  fetchSessionPRs,
} from "@/lib/api";
import { epley1RM, fmtDuration } from "@/lib/format";

export const Route = createFileRoute("/history/$id")({
  head: () => ({
    meta: [
      { title: "Session Detail — LIFT" },
      {
        name: "description",
        content:
          "Full breakdown of a logged training session: every set, weight, reps, RIR, volume, cardio and PRs.",
      },
      { property: "og:title", content: "Session Detail — LIFT" },
      {
        property: "og:description",
        content: "Every set, weight, rep and PR from this training session.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <SessionDetail />
    </AppShell>
  ),
});

function SessionDetail() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["session-detail", id],
    queryFn: () => fetchSessionDetail(id),
  });
  const { data: cardio } = useQuery({
    queryKey: ["session-cardio", id],
    queryFn: () => fetchSessionCardio(id),
  });
  const { data: prs } = useQuery({
    queryKey: ["session-prs", id],
    queryFn: () => fetchSessionPRs(id),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading session…</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Session not found.</p>;

  const { session, exSessions, sets } = data;
  const working = sets.filter((s) => !s.is_warmup);
  const totalVolume = working.reduce(
    (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
    0,
  );
  const totalReps = working.reduce((sum, s) => sum + (s.reps ?? 0), 0);
  const heaviest = working.reduce(
    (max, s) => Math.max(max, s.weight_kg ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <Link
        to="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> History
      </Link>

      <div>
        <p className="text-sm text-muted-foreground">
          {new Date(session.session_date).toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{session.title}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary" className="capitalize">
            {session.status.replace("_", " ")}
          </Badge>
          {session.is_deload && <Badge variant="outline">Deload</Badge>}
          {session.mood && <Badge variant="outline">Mood: {session.mood}</Badge>}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Duration" value={fmtDuration(session.duration_seconds)} />
        <Stat label="Volume" value={`${Math.round(totalVolume).toLocaleString()} kg`} />
        <Stat label="Working sets" value={String(working.length)} />
        <Stat label="Total reps" value={String(totalReps)} />
      </div>

      {(session.energy || session.difficulty) && (
        <Card className="p-4 text-sm">
          <div className="flex flex-wrap gap-6">
            {session.energy != null && (
              <span className="text-muted-foreground">
                Energy: <span className="text-foreground num">{session.energy}/5</span>
              </span>
            )}
            {session.difficulty != null && (
              <span className="text-muted-foreground">
                Difficulty: <span className="text-foreground num">{session.difficulty}/5</span>
              </span>
            )}
            {heaviest > 0 && (
              <span className="text-muted-foreground">
                Heaviest load: <span className="text-foreground num">{heaviest} kg</span>
              </span>
            )}
          </div>
        </Card>
      )}

      {(prs ?? []).length > 0 && (
        <Card className="border-primary/40 bg-primary/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-primary" /> Personal records this session
          </p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {(prs ?? []).map((p) => (
              <li key={p.id}>
                {(p as { exercises?: { name: string } }).exercises?.name ?? "Exercise"} —{" "}
                {p.record_type === "volume"
                  ? `best volume ${Math.round(p.volume_kg ?? 0)} kg`
                  : `est. 1RM ${p.estimated_1rm} kg (${p.weight_kg} kg × ${p.reps})`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="space-y-3">
        {exSessions.map((es) => {
          const esSets = sets
            .filter((s) => s.exercise_session_id === es.id)
            .sort((a, b) => a.set_number - b.set_number);
          if (esSets.length === 0) return null;
          const isCardio = es.exercises.category === "cardio";
          const vol = esSets.reduce(
            (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
            0,
          );
          const best = esSets.reduce(
            (max, s) =>
              s.weight_kg && s.reps ? Math.max(max, epley1RM(s.weight_kg, s.reps)) : max,
            0,
          );
          return (
            <Card key={es.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{es.exercises.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {es.exercises.primary_muscle ?? es.exercises.category ?? ""}
                    {es.target_rep_range ? ` · target ${es.target_rep_range}` : ""}
                  </p>
                </div>
                {!isCardio && (
                  <div className="text-right text-xs text-muted-foreground">
                    <p className="num">{Math.round(vol).toLocaleString()} kg volume</p>
                    {best > 0 && <p className="num">e1RM {Math.round(best * 10) / 10} kg</p>}
                  </div>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-md border border-border/60">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Set</th>
                      {isCardio ? (
                        <th className="px-3 py-2 text-right font-medium">Minutes</th>
                      ) : (
                        <>
                          <th className="px-3 py-2 text-right font-medium">Weight</th>
                          <th className="px-3 py-2 text-right font-medium">Reps</th>
                          <th className="px-3 py-2 text-right font-medium">RIR</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {esSets.map((s) => (
                      <tr key={s.id} className="border-t border-border/60">
                        <td className="px-3 py-2">
                          {s.is_warmup ? "Warm-up" : s.set_number}
                        </td>
                        {isCardio ? (
                          <td className="num px-3 py-2 text-right">{s.reps ?? "—"}</td>
                        ) : (
                          <>
                            <td className="num px-3 py-2 text-right">
                              {s.weight_kg != null ? `${s.weight_kg} kg` : "—"}
                            </td>
                            <td className="num px-3 py-2 text-right">{s.reps ?? "—"}</td>
                            <td className="num px-3 py-2 text-right">{s.rir ?? "—"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {es.notes && (
                <p className="mt-2 text-xs text-muted-foreground">Note: {es.notes}</p>
              )}
            </Card>
          );
        })}
      </div>

      {(cardio ?? []).length > 0 && (
        <Card className="p-4">
          <p className="font-medium">Cardio</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {(cardio ?? []).map((c) => (
              <li key={c.id}>
                {c.cardio_type} — {c.duration_minutes ?? "—"} min
                {c.incline_percent ? `, ${c.incline_percent}% incline` : ""}
                {c.speed_kph ? `, ${c.speed_kph} km/h` : ""}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {session.notes && (
        <Card className="p-4">
          <p className="font-medium">Session notes</p>
          <p className="mt-1 text-sm text-muted-foreground">{session.notes}</p>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="num mt-1 text-xl font-semibold">{value}</p>
    </Card>
  );
}
