import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchLeaderboard } from "@/lib/api";
import { ironScore, getInitials, colorFromId } from "@/lib/gamification";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Skido" },
      {
        name: "description",
        content: "Training score leaderboard — ranks consistency and progression, not raw volume.",
      },
    ],
  }),
  component: () => (
    <AppShell>
      <LeaderboardPage />
    </AppShell>
  ),
});

function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { data: board } = useQuery({
    queryKey: ["leaderboard", 30],
    queryFn: () => fetchLeaderboard(30),
    enabled: !!user,
  });

  const ranked = useMemo(() => {
    return (board ?? [])
      .map((r) => ({ ...r, score: ironScore(r) }))
      .sort((a, b) => b.score - a.score);
  }, [board]);

  const meIdx = ranked.findIndex((r) => r.user_id === user?.id);
  const rankDistanceLabel =
    meIdx === -1
      ? "Complete a session to join the leaderboard."
      : meIdx === 0
        ? "You're #1 — leading the board."
        : `${ranked[meIdx - 1]!.score - ranked[meIdx]!.score} pts behind #${meIdx} · ${ranked[meIdx - 1]!.display_name}`;

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.navigate({ to: "/profile" })}
          aria-label="Back"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid oklch(0.27 0.005 250)",
            background: "transparent",
            color: "inherit",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="11,18 5,12 11,6" />
          </svg>
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Leaderboard</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
            Training score · consistency and progression, not raw volume
          </p>
        </div>
      </div>

      <p style={{ margin: 0, fontSize: 13, color: "oklch(0.63 0.006 250)" }}>{rankDistanceLabel}</p>

      <div
        style={{ borderRadius: 12, border: "1px solid oklch(0.27 0.005 250)", overflowX: "auto" }}
      >
        <table style={{ width: "100%", minWidth: 360, borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "oklch(0.22 0.005 250 / 50%)" }}>
            <tr>
              {["#", "Athlete", "Score", "Sessions"].map((h, i) => (
                <th
                  key={h}
                  style={{
                    textAlign: i <= 1 ? "left" : "right",
                    padding: "10px 12px",
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    color: "oklch(0.63 0.006 250)",
                    fontWeight: 500,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((r, i) => {
              const isMe = r.user_id === user?.id;
              return (
                <tr
                  key={r.user_id}
                  onClick={() =>
                    router.navigate({ to: "/leaderboard/$userId", params: { userId: r.user_id } })
                  }
                  style={{
                    borderTop: "1px solid oklch(0.27 0.005 250)",
                    background: isMe ? "oklch(0.92 0.25 110 / 5%)" : "transparent",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>{i + 1}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'Inter'",
                          fontSize: 10,
                          fontWeight: 600,
                          color: "oklch(0.07 0.01 110)",
                          flexShrink: 0,
                          overflow: "hidden",
                          background: r.avatar_url ? undefined : r.avatar_color || colorFromId(r.user_id),
                          backgroundImage: r.avatar_url ? `url(${r.avatar_url})` : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                      >
                        {!r.avatar_url && getInitials(r.display_name)}
                      </div>
                      <span>
                        {r.display_name}
                        {isMe && (
                          <span
                            style={{ marginLeft: 6, fontSize: 12, color: "oklch(0.92 0.25 110)" }}
                          >
                            you
                          </span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontWeight: 500,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.score}
                  </td>
                  <td
                    style={{
                      padding: "10px 12px",
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {r.sessions}
                  </td>
                </tr>
              );
            })}
            {ranked.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: 24, textAlign: "center", color: "oklch(0.45 0.006 250)" }}
                >
                  No athletes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
