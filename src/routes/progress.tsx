import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { LineChart } from "@/components/LineChart";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchExerciseHistory, fetchExercises, fetchPRs } from "@/lib/api";
import { epley1RM } from "@/lib/format";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & PRs — Skido" },
      {
        name: "description",
        content: "Strength trends, estimated 1RM charts, bodyweight trend and personal records.",
      },
      { property: "og:title", content: "Progress & PRs — Skido" },
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

const VISIBLE_SESSIONS = 5;

function ProgressPage() {
  const { user } = useAuth();
  const [exerciseId, setExerciseId] = useState<string>("");
  const [sessionsExpanded, setSessionsExpanded] = useState(false);

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
      (sets ?? []).reduce<
        Record<string, { date: string; e1rm: number; weight: number; reps: number }>
      >((acc, s) => {
        if (!s.weight_kg || !s.reps) return acc;
        const date = s.performed_at.slice(0, 10);
        const value = Math.round(epley1RM(s.weight_kg, s.reps) * 10) / 10;
        if (!acc[date] || acc[date]!.e1rm < value) {
          acc[date] = { date, e1rm: value, weight: s.weight_kg, reps: s.reps };
        }
        return acc;
      }, {}),
    );
  }, [sets]);

  // Most recent first — the underlying weight/reps behind each day's best e1RM.
  const loggedSessions = useMemo(() => [...strength].reverse(), [strength]);
  const visibleSessions = sessionsExpanded
    ? loggedSessions
    : loggedSessions.slice(0, VISIBLE_SESSIONS);
  const hasMoreSessions = loggedSessions.length > VISIBLE_SESSIONS;

  const weightSeries = useMemo(
    () =>
      (metrics ?? [])
        .filter((m) => m.weight_kg)
        .map((m) => ({ date: m.measured_on, value: m.weight_kg! })),
    [metrics],
  );

  const strengthBest = strength.length ? Math.max(...strength.map((s) => s.e1rm)) : 0;

  // fetchPRs already orders by achieved_on descending, so the first row is the latest.
  const prList = (prs ?? []).map((pr) => ({
    id: pr.id,
    exercise: pr.exercises?.name ?? "Exercise",
    date: pr.achieved_on,
    typeLabel: pr.record_type === "volume" ? "Volume PR" : "Strength PR",
    value:
      pr.record_type === "volume"
        ? `${Math.round(pr.volume_kg ?? 0)} kg`
        : `${pr.weight_kg} kg × ${pr.reps}`,
  }));
  const prLatest = prList[0];
  const prRest = prList.slice(1);

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Inter'",
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Progress
      </h1>

      {/* Strength chart */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Strength trend (est. 1RM)</h2>
          <select
            value={exerciseId}
            onChange={(e) => setExerciseId(e.target.value)}
            style={{
              height: 36,
              borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)",
              background: "oklch(0.045 0.003 250)",
              color: "inherit",
              padding: "0 10px",
              fontSize: 13,
            }}
          >
            <option value="">Choose an exercise</option>
            {(exercises ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <LineChart
            data={strength.map((s) => ({ date: s.date, value: s.e1rm }))}
            unit="kg"
            emptyMessage={
              strength.length === 1
                ? "One session logged — that's your current best until you log it again."
                : exerciseId
                  ? "Log this exercise to see the trend."
                  : "Select an exercise above."
            }
          />
        </div>

        {strength.length >= 1 && (
          <div
            style={{
              marginTop: 12,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              fontSize: 12,
            }}
          >
            <div>
              <p style={{ margin: 0, color: "oklch(0.63 0.006 250)" }}>Best e1RM</p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 16,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {strengthBest} kg
              </p>
            </div>
            <div>
              <p style={{ margin: 0, color: "oklch(0.63 0.006 250)" }}>Sessions</p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 16,
                  fontWeight: 600,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
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

        {loggedSessions.length > 0 && (
          <div
            style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid oklch(0.27 0.005 250)" }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                color: "oklch(0.63 0.006 250)",
              }}
            >
              Logged sessions
            </p>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column" }}>
              {visibleSessions.map((s, i) => (
                <div
                  key={s.date}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderTop: i === 0 ? "none" : "1px solid oklch(0.27 0.005 250 / 50%)",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "oklch(0.63 0.006 250)" }}>{s.date}</span>
                  <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                    {s.weight} kg × {s.reps}
                  </span>
                  <span
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      fontSize: 12,
                      color: "oklch(0.45 0.006 250)",
                    }}
                  >
                    e1RM {s.e1rm} kg
                  </span>
                </div>
              ))}
            </div>
            {hasMoreSessions && (
              <button
                onClick={() => setSessionsExpanded((v) => !v)}
                style={{
                  marginTop: 12,
                  width: "100%",
                  height: 34,
                  borderRadius: 8,
                  border: "1px solid oklch(0.27 0.005 250)",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {sessionsExpanded ? "Show less" : `Show all ${loggedSessions.length} sessions`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bodyweight chart */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Bodyweight</h2>
        <div style={{ marginTop: 16 }}>
          <LineChart
            data={weightSeries}
            unit="kg"
            color="oklch(0.75 0.1 220)"
            emptyMessage="Add a couple of bodyweight entries to see the trend."
          />
        </div>
      </div>

      {/* Personal records */}
      <div>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 500 }}>Personal records</h2>

        {prLatest && (
          <div
            style={{
              marginTop: 12,
              background: "oklch(0.92 0.25 110 / 8%)",
              border: "1px solid oklch(0.92 0.25 110 / 45%)",
              borderRadius: 14,
              padding: 18,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "oklch(0.92 0.25 110)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.07 0.01 110)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
                <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "oklch(0.92 0.25 110)",
                }}
              >
                Latest PR
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 15, fontWeight: 600 }}>
                {prLatest.exercise}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                {prLatest.date} · {prLatest.typeLabel}
              </p>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}
            >
              {prLatest.value}
            </span>
          </div>
        )}

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 10,
          }}
        >
          {prRest.map((pr) => (
            <div
              key={pr.id}
              style={{
                background: "oklch(0.11 0.004 250)",
                border: "1px solid oklch(0.27 0.005 250)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.92 0.25 110)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
                <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {pr.exercise}
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 17,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {pr.value}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 11, color: "oklch(0.45 0.006 250)" }}>
                {pr.date} · {pr.typeLabel}
              </p>
            </div>
          ))}
        </div>

        {(prs ?? []).length === 0 && (
          <p style={{ marginTop: 12, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            No PRs yet — finish a session to set some.
          </p>
        )}
      </div>
    </div>
  );
}
