import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { fetchDays, fetchHistory } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Training Plan — V-Taper Block" },
      {
        name: "description",
        content:
          "The full weekly V-taper and fat-loss training block: Monday to Friday sessions plus optional Saturday specialization.",
      },
      { property: "og:title", content: "Training Plan — V-Taper Block" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <PlanPage />
    </AppShell>
  ),
});

function PlanPage() {
  const { user } = useAuth();
  const { data: days } = useQuery({ queryKey: ["days"], queryFn: fetchDays });
  const { data: history } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });

  const mandatory = (days ?? []).filter((d) => !d.is_optional && d.day_of_week !== 0);
  const optional = (days ?? []).filter((d) => d.is_optional);
  const sunday = (days ?? []).find((d) => d.day_of_week === 0);
  const [selectedOptSlug, setSelectedOptSlug] = useState<string | null>(null);

  const dow = new Date().getDay();
  const now = new Date();
  // Make Sunday=0 the start of the week to naturally absorb timezone offsets
  const day = now.getDay(); 
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - day);
  const y = startOfWeek.getFullYear();
  const m = String(startOfWeek.getMonth() + 1).padStart(2, "0");
  const dt = String(startOfWeek.getDate()).padStart(2, "0");
  const startStr = `${y}-${m}-${dt}`; // robust YYYY-MM-DD local time

  const completedThisWeek = Math.min(5, (history ?? []).filter(
    (s) => s.status === "completed" && s.session_date >= startStr
  ).length);
  const weekPct = Math.round((completedThisWeek / 5) * 100);

  const selectedOpt =
    optional.find((d) => d.slug === selectedOptSlug) ?? optional[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Training plan
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
          V-Taper + Fat-Loss phase · 5 mandatory sessions · Saturday optional · Sunday recovery
        </p>
      </div>

      {/* Week progress */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
            This week
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
            {completedThisWeek}/5 completed
          </p>
        </div>
        <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${weekPct}%`, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Mandatory days */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
          Mandatory
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {mandatory.map((d) => {
            const isToday = d.day_of_week === dow;
            const accentColor = isToday ? "oklch(0.92 0.25 110)" : "transparent";
            return (
              <div
                key={d.id}
                style={{
                  background: "oklch(0.11 0.004 250)",
                  border: "1px solid oklch(0.27 0.005 250)",
                  borderLeft: `3px solid ${accentColor}`,
                  borderRadius: 12,
                  padding: "18px 20px",
                  minHeight: 128,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 13, color: "oklch(0.63 0.006 250)" }}>{d.name}</p>
                  <p style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 600 }}>
                    {d.is_rest ? "Rest day" : d.focus}
                  </p>
                  {d.cardio_note && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>{d.cardio_note}</p>
                  )}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                  {!d.is_rest && (
                    <Link to="/workout/$slug" params={{ slug: d.slug }} style={{ textDecoration: "none" }}>
                      <button style={{
                        height: 32, padding: "0 14px", borderRadius: 8,
                        border: "none",
                        background: isToday ? "oklch(0.92 0.25 110)" : "oklch(0.22 0.005 250)",
                        color: isToday ? "oklch(0.07 0.01 110)" : "inherit",
                        fontSize: 13, fontWeight: isToday ? 600 : 500, cursor: "pointer",
                      }}>
                        {isToday ? "Start" : "Open"}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Saturday optional */}
      {optional.length > 0 && (
        <div>
          <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
            Saturday · Optional specialization
          </h2>
          <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {optional.map((o) => {
                const active = selectedOptSlug === o.slug || (!selectedOptSlug && o.id === optional[0]?.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOptSlug(o.slug)}
                    style={{
                      height: 32, padding: "0 14px", borderRadius: 8, border: "none",
                      background: active ? "oklch(0.22 0.005 250)" : "transparent",
                      color: active ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                      fontSize: 13, fontWeight: 500, cursor: "pointer",
                    }}
                  >
                    {o.focus?.replace("Optional Specialization: ", "")}
                  </button>
                );
              })}
            </div>
            {selectedOpt && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid oklch(0.27 0.005 250)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                    Optional Specialization: {selectedOpt.focus?.replace("Optional Specialization: ", "")}
                  </p>
                  {selectedOpt.cardio_note && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>{selectedOpt.cardio_note}</p>
                  )}
                </div>
                <Link to="/workout/$slug" params={{ slug: selectedOpt.slug }} style={{ textDecoration: "none", flexShrink: 0 }}>
                  <button style={{
                    height: 36, padding: "0 16px", borderRadius: 8,
                    border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit",
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>
                    Open
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sunday */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
          Sunday
        </h2>
        <div style={{ background: "oklch(0.08 0.003 250)", border: "1px dashed oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "oklch(0.63 0.006 250)" }}>Complete rest</p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "oklch(0.45 0.006 250)" }}>
            {sunday?.cardio_note ?? "Easy walking, light mobility, stretching if desired. Sleep and recover fully."}
          </p>
        </div>
      </div>
    </div>
  );
}