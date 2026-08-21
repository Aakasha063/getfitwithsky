import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createPortal } from "react-dom";
import { AppShell } from "@/components/AppShell";
import { fetchDays, fetchHistory, fetchProfile } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { todayISO, DAY_LABELS } from "@/lib/format";
import { buildWeekStatus } from "@/lib/weekStatus";

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

/** Single-plan roster for now — becomes a real table once multiple plans ship. */
const PLAN_INFO = {
  name: "V-Taper + Fat-Loss",
  subtitle: "5 mandatory sessions",
  meta: "Saturday optional · Sunday recovery",
};

function PlanPage() {
  const { user } = useAuth();
  const { data: days } = useQuery({ queryKey: ["days"], queryFn: fetchDays });
  const { data: history } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
  const [selectedOptSlug, setSelectedOptSlug] = useState<string | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);

  const mandatory = (days ?? []).filter((d) => !d.is_optional && d.day_of_week !== 0);
  const optional = (days ?? []).filter((d) => d.is_optional);
  const sunday = (days ?? []).find((d) => d.day_of_week === 0);

  const { statusFor, weekStartISO, weekEndISO } = buildWeekStatus(
    history ?? [],
    profile?.created_at?.slice(0, 10) ?? "",
  );

  const completedThisWeek = Math.min(
    5,
    (history ?? []).filter(
      (s) =>
        s.status === "completed" && s.session_date >= weekStartISO && s.session_date <= weekEndISO,
    ).length,
  );
  const weekPct = Math.round((completedThisWeek / 5) * 100);

  const selectedOpt = optional.find((d) => d.slug === selectedOptSlug) ?? optional[0];

  const todayStr = todayISO();
  function todaySessionFor(dayId: string) {
    return (history ?? []).find(
      (s) => s.day_id === dayId && s.session_date === todayStr && s.status !== "abandoned",
    );
  }
  function buttonLabel(todaySession: ReturnType<typeof todaySessionFor>, fallback: string) {
    if (todaySession?.status === "completed") return "✓ Completed";
    if (todaySession?.status === "in_progress") return "Resume";
    return fallback;
  }

  const BTN_OUTLINE = {
    height: 34,
    borderRadius: 8,
    border: "1px solid oklch(0.27 0.005 250)",
    background: "transparent",
    color: "inherit",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  } as const;
  const BTN_FILLED = {
    height: 34,
    borderRadius: 8,
    border: "none",
    background: "oklch(0.92 0.25 110)",
    color: "oklch(0.07 0.01 110)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  } as const;
  const BTN_LOG = {
    height: 34,
    borderRadius: 8,
    border: "1px solid oklch(0.78 0.19 145 / 50%)",
    background: "transparent",
    color: "oklch(0.78 0.19 145)",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  } as const;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "oklch(0.92 0.25 110)",
            }}
          >
            Your plan
          </p>
          <h1
            style={{
              margin: "4px 0 0",
              fontFamily: "'Inter'",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            {PLAN_INFO.name}
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            {PLAN_INFO.subtitle} · {PLAN_INFO.meta}
          </p>
        </div>
        <button
          onClick={() => setPlanModalOpen(true)}
          style={{
            flexShrink: 0,
            height: 32,
            padding: "0 12px",
            borderRadius: 8,
            border: "1px solid oklch(0.27 0.005 250)",
            background: "transparent",
            color: "inherit",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Change plan
        </button>
      </div>

      {/* Change plan modal */}
      {planModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setPlanModalOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 480,
                maxHeight: "80vh",
                overflowY: "auto",
                background: "oklch(0.08 0.004 250)",
                borderTop: "1px solid oklch(0.27 0.005 250)",
                borderRadius: "16px 16px 0 0",
                padding: 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Training plans</h2>
                <button
                  onClick={() => setPlanModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "oklch(0.63 0.006 250)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  border: "1px solid oklch(0.92 0.25 110 / 50%)",
                  borderRadius: 12,
                  padding: 14,
                  background: "oklch(0.92 0.25 110 / 8%)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{PLAN_INFO.name}</p>
                  <span
                    style={{
                      borderRadius: 6,
                      background: "oklch(0.92 0.25 110)",
                      color: "oklch(0.07 0.01 110)",
                      padding: "2px 8px",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    Enrolled
                  </span>
                </div>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "oklch(0.63 0.006 250)" }}>
                  {PLAN_INFO.subtitle} · {PLAN_INFO.meta}
                </p>
              </div>
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 12.5,
                  color: "oklch(0.45 0.006 250)",
                  textAlign: "center",
                }}
              >
                More plans — you'll be able to enroll and switch here as they launch.
              </p>
            </div>
          </div>,
          document.body,
        )}

      {/* Week progress */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "oklch(0.63 0.006 250)",
            }}
          >
            This week
          </p>
          <p
            style={{ margin: 0, fontSize: 14, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
          >
            {completedThisWeek}/5 completed
          </p>
        </div>
        <div
          style={{
            marginTop: 12,
            height: 6,
            borderRadius: 999,
            background: "oklch(0.22 0.005 250)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "oklch(0.92 0.25 110)",
              width: `${weekPct}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Mandatory days */}
      <div>
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Mandatory
        </h2>
        <div className="plan-grid">
          {mandatory.map((d) => {
            const { isToday, isDone, isMissed, session } = statusFor(d);
            const accentColor = isToday ? "oklch(0.92 0.25 110)" : "transparent";
            const dayAbbr = d.day_of_week == null ? "" : DAY_LABELS[d.day_of_week]!.toUpperCase();
            const chipBg = isToday ? "oklch(0.92 0.25 110)" : "oklch(0.22 0.005 250)";
            const chipColor = isToday ? "oklch(0.07 0.01 110)" : "oklch(0.96 0.002 250)";
            const statusLabel = isToday
              ? "Today"
              : isDone
                ? "Completed"
                : isMissed
                  ? "Missed"
                  : "Upcoming";
            const statusColor = isToday
              ? "oklch(0.92 0.25 110)"
              : isDone
                ? "oklch(0.78 0.19 145)"
                : isMissed
                  ? "oklch(0.68 0.2 25)"
                  : "oklch(0.45 0.006 250)";
            const exerciseCount = (d as { exercise_count?: number }).exercise_count ?? 0;

            return (
              <div
                key={d.id}
                style={{
                  background: "oklch(0.11 0.004 250)",
                  border: "1px solid oklch(0.27 0.005 250)",
                  borderLeft: `3px solid ${accentColor}`,
                  borderRadius: 12,
                  padding: 16,
                  minHeight: 128,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        borderRadius: 7,
                        background: chipBg,
                        color: chipColor,
                        padding: "3px 8px",
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {dayAbbr}
                    </span>
                    {!d.is_rest && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: statusColor }}>
                        {statusLabel}
                      </span>
                    )}
                  </div>
                  <p
                    style={{ margin: "12px 0 0", fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}
                  >
                    {d.is_rest ? "Rest day" : d.focus}
                  </p>
                  {!d.is_rest && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: "oklch(0.45 0.006 250)",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M6.5 6.5h11v11h-11z" />
                        <path d="M6.5 9.5h11M9.5 6.5v11" />
                      </svg>
                      <span>{exerciseCount} exercises</span>
                    </div>
                  )}
                  {d.cardio_note && (
                    <p
                      style={{ margin: "6px 0 0", fontSize: 11.5, color: "oklch(0.45 0.006 250)" }}
                    >
                      {d.cardio_note}
                    </p>
                  )}
                </div>
                {!d.is_rest && (
                  <div style={{ marginTop: 14 }}>
                    {isToday ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          to="/workout/$slug"
                          params={{ slug: d.slug }}
                          style={{ flex: 1, textDecoration: "none" }}
                        >
                          <button style={{ ...BTN_OUTLINE, width: "100%" }}>Open</button>
                        </Link>
                        <Link
                          to="/workout/$slug"
                          params={{ slug: d.slug }}
                          search={{ start: true }}
                          style={{ flex: 1, textDecoration: "none" }}
                        >
                          <button style={{ ...BTN_FILLED, width: "100%" }}>
                            {session?.status === "in_progress" ? "Resume" : "Start"}
                          </button>
                        </Link>
                      </div>
                    ) : isDone && session ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link
                          to="/workout/$slug"
                          params={{ slug: d.slug }}
                          style={{ flex: 1, textDecoration: "none" }}
                        >
                          <button style={{ ...BTN_OUTLINE, width: "100%" }}>Open</button>
                        </Link>
                        <Link
                          to="/history/$id"
                          params={{ id: session.id }}
                          style={{ flex: 1, textDecoration: "none" }}
                        >
                          <button style={{ ...BTN_LOG, width: "100%" }}>View log</button>
                        </Link>
                      </div>
                    ) : (
                      <Link
                        to="/workout/$slug"
                        params={{ slug: d.slug }}
                        style={{ textDecoration: "none" }}
                      >
                        <button style={{ ...BTN_OUTLINE, width: "100%" }}>Open</button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Saturday optional */}
      {optional.length > 0 && (
        <div>
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: 13,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "oklch(0.63 0.006 250)",
            }}
          >
            Saturday · Optional specialization
          </h2>
          <div
            style={{
              background: "oklch(0.11 0.004 250)",
              border: "1px solid oklch(0.27 0.005 250)",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {optional.map((o) => {
                const active =
                  selectedOptSlug === o.slug || (!selectedOptSlug && o.id === optional[0]?.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOptSlug(o.slug)}
                    style={{
                      height: 32,
                      padding: "0 14px",
                      borderRadius: 8,
                      border: "none",
                      background: active ? "oklch(0.22 0.005 250)" : "transparent",
                      color: active ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {o.focus?.replace("Optional Specialization: ", "")}
                  </button>
                );
              })}
            </div>
            {selectedOpt && (
              <div
                style={{
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "1px solid oklch(0.27 0.005 250)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                    Optional Specialization:{" "}
                    {selectedOpt.focus?.replace("Optional Specialization: ", "")}
                  </p>
                  {selectedOpt.cardio_note && (
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>
                      {selectedOpt.cardio_note}
                    </p>
                  )}
                </div>
                <Link
                  to="/workout/$slug"
                  params={{ slug: selectedOpt.slug }}
                  style={{ textDecoration: "none", flexShrink: 0 }}
                >
                  <button
                    style={{
                      height: 36,
                      padding: "0 16px",
                      borderRadius: 8,
                      border:
                        todaySessionFor(selectedOpt.id)?.status === "completed"
                          ? "1px solid oklch(0.92 0.25 110 / 40%)"
                          : "1px solid oklch(0.27 0.005 250)",
                      background: "transparent",
                      color:
                        todaySessionFor(selectedOpt.id)?.status === "completed"
                          ? "oklch(0.92 0.25 110)"
                          : "inherit",
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {buttonLabel(todaySessionFor(selectedOpt.id), "Open")}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sunday */}
      <div>
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Sunday
        </h2>
        <div
          style={{
            background: "oklch(0.08 0.003 250)",
            border: "1px dashed oklch(0.27 0.005 250)",
            borderRadius: 12,
            padding: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "oklch(0.63 0.006 250)" }}>
            Complete rest
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "oklch(0.45 0.006 250)" }}>
            {sunday?.cardio_note ??
              "Easy walking, light mobility, stretching if desired. Sleep and recover fully."}
          </p>
        </div>
      </div>
    </div>
  );
}
