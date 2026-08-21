import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchLeaderboard } from "@/lib/api";
import { ironScore, levelFor, getInitials, colorFromId } from "@/lib/gamification";

export const Route = createFileRoute("/leaderboard_/$userId")({
  head: () => ({
    meta: [{ title: "Athlete Profile — Skido" }],
  }),
  component: () => (
    <AppShell>
      <PublicProfilePage />
    </AppShell>
  ),
});

function PublicProfilePage() {
  const { userId } = Route.useParams();
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

  const rank = ranked.findIndex((r) => r.user_id === userId) + 1;
  const athlete = ranked.find((r) => r.user_id === userId);

  const CARD = {
    background: "oklch(0.11 0.004 250)",
    border: "1px solid oklch(0.27 0.005 250)",
    borderRadius: 12,
  };

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.navigate({ to: "/leaderboard" })}
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
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Profile</h1>
      </div>

      {!athlete ? (
        <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
          Athlete not found.
        </p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 16,
                background: athlete.avatar_url ? undefined : athlete.avatar_color || colorFromId(athlete.user_id),
                backgroundImage: athlete.avatar_url ? `url(${athlete.avatar_url})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter'",
                fontSize: 22,
                fontWeight: 600,
                color: "oklch(0.07 0.01 110)",
                overflow: "hidden",
              }}
            >
              {!athlete.avatar_url && getInitials(athlete.display_name)}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>
                {athlete.display_name}
                {athlete.user_id === user?.id && (
                  <span style={{ marginLeft: 8, fontSize: 13, color: "oklch(0.92 0.25 110)" }}>
                    you
                  </span>
                )}
              </h2>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>
                {levelFor(athlete.score).current.name} · Rank #{rank}
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ ...CARD, padding: 16, textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "oklch(0.63 0.006 250)",
                }}
              >
                Sessions
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 22,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {athlete.sessions}
              </p>
            </div>
            <div style={{ ...CARD, padding: 16, textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "oklch(0.63 0.006 250)",
                }}
              >
                Sets logged
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 22,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {athlete.sets_count}
              </p>
            </div>
            <div style={{ ...CARD, padding: 16, textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  color: "oklch(0.63 0.006 250)",
                }}
              >
                Volume
              </p>
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: 22,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(athlete.total_volume).toLocaleString()} kg
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
