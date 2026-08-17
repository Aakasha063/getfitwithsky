import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
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

  if (isLoading) return <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>Loading session…</p>;
  if (!data) return <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>Session not found.</p>;

  const { session, exSessions, sets } = data;
  const working = sets.filter((s) => !s.is_warmup);
  const totalVolume = working.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0);
  const totalReps = working.reduce((sum, s) => sum + (s.reps ?? 0), 0);

  const dateFull = new Date(session.session_date).toLocaleDateString(undefined, {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Back link */}
      <Link
        to="/history"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14, color: "oklch(0.63 0.006 250)", textDecoration: "none", width: "fit-content" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="19" y1="12" x2="5" y2="12" /><polyline points="11,18 5,12 11,6" />
        </svg>
        History
      </Link>

      {/* Title */}
      <div>
        <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{dateFull}</p>
        <h1 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 600 }}>{session.title}</h1>
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span style={{ borderRadius: 6, background: "oklch(0.22 0.005 250)", padding: "2px 10px", fontSize: 12, fontWeight: 600, textTransform: "capitalize" }}>
            {session.status.replace("_", " ")}
          </span>
          {session.mood && (
            <span style={{ borderRadius: 6, border: "1px solid oklch(0.27 0.005 250)", padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
              Mood: {session.mood}
            </span>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Duration", value: fmtDuration(session.duration_seconds) },
          { label: "Volume", value: `${Math.round(totalVolume).toLocaleString()} kg` },
          { label: "Working sets", value: String(working.length) },
          { label: "Total reps", value: String(totalReps) },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
            <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)" }}>{label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</p>
          </div>
        ))}
      </div>

      {/* PRs box */}
      {(prs ?? []).length > 0 && (
        <div style={{ background: "oklch(0.92 0.25 110 / 10%)", border: "1px solid oklch(0.92 0.25 110 / 40%)", borderRadius: 12, padding: 16 }}>
          <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="oklch(0.92 0.25 110)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
              <path d="M7 5H4a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4M17 5h3a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4" />
            </svg>
            Personal records this session
          </p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            {(prs ?? []).map((p) => (
              <li key={p.id}>
                {(p as { exercises?: { name: string } }).exercises?.name ?? "Exercise"} —{" "}
                {p.record_type === "volume"
                  ? `best volume ${Math.round(p.volume_kg ?? 0)} kg`
                  : `est. 1RM ${p.estimated_1rm} kg (${p.weight_kg} kg × ${p.reps})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exercise tables */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {exSessions.map((es) => {
          const esSets = sets
            .filter((s) => s.exercise_session_id === es.id)
            .sort((a, b) => a.set_number - b.set_number);
          if (esSets.length === 0) return null;
          const isCardio = es.exercises.category === "cardio";
          const vol = esSets.reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0);
          const best = esSets.reduce(
            (max, s) => s.weight_kg && s.reps ? Math.max(max, epley1RM(s.weight_kg, s.reps)) : max, 0,
          );
          return (
            <div key={es.id} style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>{es.exercises.name}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                    {es.exercises.primary_muscle ?? es.exercises.category ?? ""}
                    {es.target_rep_range ? ` · target ${es.target_rep_range}` : ""}
                  </p>
                </div>
                {!isCardio && (
                  <div style={{ textAlign: "right", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                    <p style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>{Math.round(vol).toLocaleString()} kg volume</p>
                    {best > 0 && <p style={{ margin: 0, fontVariantNumeric: "tabular-nums" }}>e1RM {Math.round(best * 10) / 10} kg</p>}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250 / 60%)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead style={{ background: "oklch(0.22 0.005 250 / 50%)" }}>
                    <tr>
                      <th style={{ textAlign: "left", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>Set</th>
                      {isCardio ? (
                        <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>Minutes</th>
                      ) : (
                        <>
                          <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>Weight</th>
                          <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>Reps</th>
                          <th style={{ textAlign: "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>RIR</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {esSets.map((s) => (
                      <tr key={s.id} style={{ borderTop: "1px solid oklch(0.27 0.005 250 / 60%)" }}>
                        <td style={{ padding: "8px 12px" }}>{s.is_warmup ? "Warm-up" : s.set_number}</td>
                        {isCardio ? (
                          <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.reps ?? "—"}</td>
                        ) : (
                          <>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                              {s.weight_kg != null ? `${s.weight_kg} kg` : "—"}
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.reps ?? "—"}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{s.rir ?? "—"}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cardio */}
      {(cardio ?? []).length > 0 && (
        <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>Cardio</p>
          <ul style={{ margin: "8px 0 0", paddingLeft: 0, listStyle: "none", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            {(cardio ?? []).map((c) => (
              <li key={c.id}>
                {c.cardio_type} — {c.duration_minutes ?? "—"} min
                {c.incline_percent ? `, ${c.incline_percent}% incline` : ""}
                {c.speed_kph ? `, ${c.speed_kph} km/h` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {session.notes && (
        <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 16 }}>
          <p style={{ margin: 0, fontWeight: 500, fontSize: 14 }}>Session notes</p>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{session.notes}</p>
        </div>
      )}
    </div>
  );
}
