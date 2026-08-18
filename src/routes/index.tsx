import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchDays, fetchHistory, fetchPRs } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIFT — Today's Training" },
      {
        name: "description",
        content:
          "Your daily training dashboard: today's session, weekly split, recent PRs and bodyweight trend for the V-taper fat-loss block.",
      },
      { property: "og:title", content: "LIFT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});


function Dashboard() {
  const { user } = useAuth();
  const { data: days } = useQuery({ queryKey: ["days"], queryFn: fetchDays });
  const { data: history } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });
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

  const dow = new Date().getDay();
  const today = (days ?? []).find((d) => d.day_of_week === dow && !d.is_optional);
  const optional = (days ?? []).filter((d) => d.is_optional);
  const weekDays = (days ?? []).filter((d) => !d.is_optional);
  const latestWeight = [...(metrics ?? [])].reverse().find((m) => m.weight_kg)?.weight_kg;
  const completed = (history ?? []).filter((s) => s.status === "completed").length;
  const prCount = prs?.length ?? 0;

  const todayISOStr = new Date().toISOString().slice(0, 10);
  const isTodayCompleted = today && (history ?? []).some(
    (s) => s.day_id === today.id && s.session_date === todayISOStr && s.status === "completed"
  );

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const heading = today?.is_rest
    ? "Recovery day"
    : (today?.focus ?? new Date().toLocaleDateString(undefined, { weekday: "long" }));

  // Exercise count / duration estimate for hero
  const exerciseCount = (today as { exercise_count?: number })?.exercise_count ?? "—";
  const estDuration = today?.estimated_minutes_min
    ? `${today.estimated_minutes_min}–${today.estimated_minutes_max ?? ""} min`
    : "~60 min";


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Heading */}
      <div>
        <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{todayLabel}</p>
        <h1 style={{ margin: "14px 0 0", fontFamily: "'Inter'", fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {heading}
        </h1>
      </div>

      {/* Hero card */}
      {today && !today.is_rest ? (
        <div className="hero-row" style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 24 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{today.name}</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 600 }}>{today.focus}</h2>
            {today.cardio_note && (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>Cardio: {today.cardio_note}</p>
            )}
            {isTodayCompleted ? (
              <div style={{ marginTop: 20, display: "inline-flex", alignItems: "center", gap: 6, height: 46, padding: "0 20px", borderRadius: 9, background: "oklch(0.92 0.25 110 / 10%)", color: "oklch(0.92 0.25 110)", fontSize: 14, fontWeight: 600 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Well done, workout completed for today
              </div>
            ) : (
              <Link
                to="/workout/$slug"
                params={{ slug: today.slug }}
                style={{ textDecoration: "none" }}
              >
                <button style={{
                  marginTop: 20,
                  display: "inline-flex", alignItems: "center", gap: 6,
                  height: 46, padding: "0 20px",
                  borderRadius: 9, border: "none",
                  background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}>
                  Start workout
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transition: "transform 0.15s" }}>
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12,5 19,12 12,19" />
                  </svg>
                </button>
              </Link>
            )}
          </div>
          <div className="hero-right">
            <div style={{ display: "flex", gap: 40 }}>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{exerciseCount}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>exercises</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{estDuration}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>estimated</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Recovery day</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            Easy walking, light mobility, stretching. No hard training, no HIIT.
          </p>
          {optional.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {optional.map((d) => (
                <Link key={d.id} to="/workout/$slug" params={{ slug: d.slug }} style={{ textDecoration: "none" }}>
                  <button style={{
                    height: 36, padding: "0 14px", borderRadius: 8,
                    border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit",
                    fontSize: 13, cursor: "pointer",
                  }}>
                    {d.focus?.replace("Optional Specialization: ", "")}
                  </button>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <StatCard label="Sessions" value={String(completed)} sub="total completed" />
        <StatCard label="Bodyweight" value={latestWeight ? `${latestWeight} kg` : "—"} sub="latest logged" />
        <StatCard label="PRs" value={String(prCount)} sub="personal records" />
      </div>

      {/* This week */}
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>This week</h2>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {weekDays.map((d) => {
            const isToday = d.day_of_week === dow;
            return (
              <div
                key={d.id}
                style={{
                  background: "oklch(0.11 0.004 250)",
                  border: "1px solid oklch(0.27 0.005 250)",
                  borderLeft: `3px solid ${isToday ? "oklch(0.92 0.25 110)" : "transparent"}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
                <span>
                  <span style={{ fontWeight: 600 }}>{d.name}</span>
                  <span style={{ color: "oklch(0.63 0.006 250)" }}> — {d.is_rest ? "Rest" : d.focus}</span>
                  {d.is_rest && (
                    <span style={{ marginLeft: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "oklch(0.45 0.006 250)" }}>
                      Recovery
                    </span>
                  )}
                </span>
                {!d.is_rest && (
                  <Link
                    to="/workout/$slug"
                    params={{ slug: d.slug }}
                    style={{ fontSize: 13, fontWeight: 500, color: "oklch(0.92 0.25 110)", textDecoration: "none" }}
                  >
                    Open →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 24 }}>
      <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
        {label}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 32, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.45 0.006 250)" }}>{sub}</p>
    </div>
  );
}
