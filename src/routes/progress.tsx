import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchExerciseHistory, fetchExercises, fetchPRs } from "@/lib/api";
import { epley1RM } from "@/lib/format";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & PRs — LIFT" },
      {
        name: "description",
        content: "Strength trends, estimated 1RM charts, bodyweight trend and personal records.",
      },
      { property: "og:title", content: "Progress & PRs — LIFT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProgressPage />
    </AppShell>
  ),
});

function buildPolyline(
  entries: { value: number }[],
  w = 560,
  h = 156,
): string {
  if (entries.length < 2) return "";
  const vals = entries.map((e) => e.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const padX = 8, padY = 14;
  return entries
    .map((e, i) => {
      const x = padX + (i * (w - padX * 2)) / Math.max(1, entries.length - 1);
      const y = padY + (1 - (e.value - min) / range) * (h - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function ProgressPage() {
  const { user } = useAuth();
  const [exerciseId, setExerciseId] = useState<string>("");

  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: fetchExercises });
  const { data: prs } = useQuery({
    queryKey: ["prs", user?.id],
    queryFn: () => fetchPRs(user!.id),
    enabled: !!user,
  });
  const { data: metrics } = useQuery({
    queryKey: ["metrics", user?.id],
    queryFn: () => fetchBodyMetrics(user!.id),
    enabled: !!user,
  });
  const { data: sets } = useQuery({
    queryKey: ["ex-history", user?.id, exerciseId],
    queryFn: () => fetchExerciseHistory(user!.id, exerciseId),
    enabled: !!user && !!exerciseId,
  });

  const strength = useMemo(() => {
    return Object.values(
      (sets ?? []).reduce<Record<string, { date: string; e1rm: number }>>((acc, s) => {
        if (!s.weight_kg || !s.reps) return acc;
        const date = s.performed_at.slice(0, 10);
        const value = Math.round(epley1RM(s.weight_kg, s.reps) * 10) / 10;
        if (!acc[date] || acc[date]!.e1rm < value) acc[date] = { date, e1rm: value };
        return acc;
      }, {}),
    );
  }, [sets]);

  const weightSeries = useMemo(
    () =>
      (metrics ?? [])
        .filter((m) => m.weight_kg)
        .map((m) => ({ date: m.measured_on, value: m.weight_kg! })),
    [metrics],
  );

  const strengthPoints = buildPolyline(strength.map((s) => ({ value: s.e1rm })));
  const weightPoints = buildPolyline(weightSeries);
  const strengthBest = strength.length ? Math.max(...strength.map((s) => s.e1rm)) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
        Progress
      </h1>

      {/* Strength chart */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Strength trend (est. 1RM)</h2>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            style={{
              height: 36, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
              background: "oklch(0.045 0.003 250)", color: "inherit", padding: "0 10px", fontSize: 13,
            }}
          >
            <option value="">Choose an exercise</option>
            {(exercises ?? []).map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          {strength.length >= 2 ? (
            <>
              <svg viewBox="0 0 560 156" width="100%" height="156">
                <polyline
                  points={strengthPoints}
                  fill="none"
                  stroke="oklch(0.92 0.25 110)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "oklch(0.63 0.006 250)", marginTop: 4 }}>
                <span>{strength[0]?.date}</span>
                <span>{strength[strength.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <p style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "oklch(0.45 0.006 250)", margin: 0 }}>
              {exerciseId ? "Log this exercise a couple of times to see the trend." : "Select an exercise above."}
            </p>
          )}
        </div>

        {strength.length >= 2 && (
          <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, fontSize: 12 }}>
            <div>
              <p style={{ margin: 0, color: "oklch(0.63 0.006 250)" }}>Best e1RM</p>
              <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {strengthBest} kg
              </p>
            </div>
            <div>
              <p style={{ margin: 0, color: "oklch(0.63 0.006 250)" }}>Sessions</p>
              <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                {strength.length}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, color: "oklch(0.63 0.006 250)" }}>Last performed</p>
              <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600 }}>
                {strength[strength.length - 1]?.date ?? "—"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bodyweight chart */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Bodyweight</h2>
        <div style={{ marginTop: 16 }}>
          {weightSeries.length >= 2 ? (
            <>
              <svg viewBox="0 0 560 156" width="100%" height="156">
                <polyline
                  points={weightPoints}
                  fill="none"
                  stroke="oklch(0.75 0.1 220)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "oklch(0.63 0.006 250)", marginTop: 4 }}>
                <span>{weightSeries[0]?.date}</span>
                <span>{weightSeries[weightSeries.length - 1]?.date}</span>
              </div>
            </>
          ) : (
            <p style={{ padding: "48px 0", textAlign: "center", fontSize: 13, color: "oklch(0.45 0.006 250)", margin: 0 }}>
              Add a couple of bodyweight entries to see the trend.
            </p>
          )}
        </div>
      </div>

      {/* Personal records */}
      <div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Personal records</h2>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {(prs ?? []).map((pr) => (
            <div
              key={pr.id}
              style={{
                background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)",
                borderRadius: 12, padding: 16,
                display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500 }}>{pr.exercises?.name ?? "Exercise"}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                  {pr.achieved_on} · {pr.record_type === "volume" ? "Volume PR" : "Strength PR"}
                </p>
              </div>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>
                {pr.record_type === "volume"
                  ? `${Math.round(pr.volume_kg ?? 0)} kg`
                  : `${pr.weight_kg} kg × ${pr.reps}`}
              </span>
            </div>
          ))}
          {prs?.length === 0 && (
            <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              No PRs yet — finish a session to set some.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}