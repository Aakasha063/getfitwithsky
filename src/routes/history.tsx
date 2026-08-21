import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchHistory } from "@/lib/api";
import { fmtDuration } from "@/lib/format";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Workout History — Skido" },
      { name: "description", content: "Every logged training session with duration and status." },
      { property: "og:title", content: "Workout History — Skido" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <HistoryPage />
    </AppShell>
  ),
});

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0 },
] as const;

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });

  const [activePreset, setActivePreset] = useState<string>("All");
  const [from, setFrom] = useState("");

  function selectPreset(preset: { label: string; days: number }) {
    setActivePreset(preset.label);
    setFrom(preset.days ? isoDaysAgo(preset.days) : "");
  }

  const filtered = useMemo(() => {
    return (data ?? []).filter((s) => {
      if (s.status !== "completed") return false;
      if (from && s.session_date < from) return false;
      return true;
    });
  }, [data, from]);

  const totalMinutes = Math.round(
    filtered.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60,
  );

  return (
    <div>
      <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
        History
      </h1>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
        {filtered.length} session{filtered.length === 1 ? "" : "s"} · {totalMinutes} min trained
      </p>

      {/* Filter chips */}
      <div style={{ marginTop: 20, background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
        {PRESETS.map((p) => {
          const active = activePreset === p.label;
          return (
            <button
              key={p.label}
              onClick={() => selectPreset(p)}
              style={{
                height: 32, padding: "0 14px", borderRadius: 8,
                border: `1px solid ${active ? "oklch(0.96 0.002 250)" : "oklch(0.27 0.005 250)"}`,
                background: active ? "oklch(0.22 0.005 250)" : "transparent",
                color: "inherit", fontSize: 13, cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Session list */}
      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((s) => (
          <div
            key={s.id}
            onClick={() => router.navigate({ to: "/history/$id", params: { id: s.id } })}
            style={{
              cursor: "pointer",
              background: "oklch(0.11 0.004 250)",
              border: "1px solid oklch(0.27 0.005 250)",
              borderRadius: 12, padding: 16,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "border-color 0.15s",
            }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.92 0.25 110 / 50%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.27 0.005 250)")}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{s.title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{s.session_date}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
                  <p style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>{fmtDuration(s.duration_seconds)}</p>
                  <p style={{ margin: 0, fontSize: 12, textTransform: "capitalize" }}>{s.status.replace("_", " ")}</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(0.63 0.006 250)" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9,6 15,12 9,18" />
                </svg>
              </div>
            </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>No sessions in this range.</p>
        )}
      </div>
    </div>
  );
}
