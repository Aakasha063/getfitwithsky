import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchLeaderboard } from "@/lib/api";
import { ironScore, levelFor, getInitials, colorFromId } from "@/lib/gamification";
import { BadgeTile, ChallengeRow, BottomSheet } from "@/components/Achievements";

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

const VISIBLE_BADGES = 4;
const VISIBLE_CHALLENGES = 2;

function PublicProfilePage() {
  const { userId } = Route.useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [badgesExpanded, setBadgesExpanded] = useState(false);
  const [challengesExpanded, setChallengesExpanded] = useState(false);
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

  // Badge/challenge definitions matching the public-profile section of the design
  // reference — computed only from stats already exposed via get_leaderboard, so
  // no private per-exercise data ever needs to be shared between athletes.
  const badges = athlete
    ? [
        {
          label: "First rep",
          hint: "Complete 1 session",
          value: athlete.sessions,
          target: 1,
          rewardXp: 50,
        },
        {
          label: "Ten sessions",
          hint: "Complete 10 sessions",
          value: athlete.sessions,
          target: 10,
          rewardXp: 150,
        },
        {
          label: "Consistency",
          hint: "Train 3+ active weeks",
          value: athlete.active_weeks,
          target: 3,
          rewardXp: 75,
        },
        {
          label: "Record breaker",
          hint: "Set a personal record",
          value: athlete.pr_count,
          target: 1,
          rewardXp: 100,
        },
        {
          label: "Volume built",
          hint: "Log 100,000 kg of volume",
          value: athlete.total_volume,
          target: 100000,
          rewardXp: 200,
        },
        {
          label: "Iron addict",
          hint: "Log 400 working sets",
          value: athlete.sets_count,
          target: 400,
          rewardXp: 250,
        },
      ].map((b) => ({
        ...b,
        earned: b.value >= b.target,
        pct: Math.min(100, Math.round((b.value / b.target) * 100)),
      }))
    : [];

  const challenges = athlete
    ? [
        {
          label: "Session streaker",
          hint: "Log 20 sessions",
          value: athlete.sessions,
          target: 20,
          rewardXp: 100,
        },
        {
          label: "Weeks active",
          hint: "Train 8 active weeks",
          value: athlete.active_weeks,
          target: 8,
          rewardXp: 75,
        },
        {
          label: "Set collector",
          hint: "Log 450 working sets",
          value: athlete.sets_count,
          target: 450,
          rewardXp: 150,
        },
      ].map((c) => ({
        ...c,
        pct: Math.min(100, Math.round((c.value / c.target) * 100)),
        progressLabel: `${Math.min(c.value, c.target)} / ${c.target}`,
      }))
    : [];

  const visibleBadges = badges.slice(0, VISIBLE_BADGES);
  const hasMoreBadges = badges.length > VISIBLE_BADGES;
  const visibleChallenges = challenges.slice(0, VISIBLE_CHALLENGES);
  const hasMoreChallenges = challenges.length > VISIBLE_CHALLENGES;

  const CARD = {
    background: "oklch(0.11 0.004 250)",
    border: "1px solid oklch(0.27 0.005 250)",
    borderRadius: 12,
  };
  const BTN_OUTLINE = {
    height: 32,
    padding: "0 12px",
    borderRadius: 8,
    border: "1px solid oklch(0.27 0.005 250)",
    background: "transparent",
    color: "inherit",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
  } as const;

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
                background: athlete.avatar_url
                  ? undefined
                  : athlete.avatar_color || colorFromId(athlete.user_id),
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

          {/* Achievements */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 15, fontWeight: 600 }}>
                Achievements
              </h2>
              <span style={{ fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                {badges.filter((b) => b.earned).length}/{badges.length}
              </span>
            </div>
            <div
              style={{
                marginTop: 16,
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px 4px",
              }}
            >
              {visibleBadges.map((b) => (
                <BadgeTile
                  key={b.label}
                  label={b.label}
                  rewardXp={b.rewardXp}
                  pct={b.pct}
                  earned={b.earned}
                />
              ))}
            </div>
            {hasMoreBadges && (
              <button
                onClick={() => setBadgesExpanded(true)}
                style={{ ...BTN_OUTLINE, marginTop: 12, width: "100%" }}
              >
                Show all {badges.length} achievements
              </button>
            )}
          </div>

          {badgesExpanded && (
            <BottomSheet title="All achievements" onClose={() => setBadgesExpanded(false)}>
              <div
                style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px 4px" }}
              >
                {badges.map((b) => (
                  <BadgeTile
                    key={b.label}
                    label={b.label}
                    hint={b.hint}
                    rewardXp={b.rewardXp}
                    pct={b.pct}
                    earned={b.earned}
                  />
                ))}
              </div>
            </BottomSheet>
          )}

          {/* Challenges */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 15, fontWeight: 600 }}>
                Challenges
              </h2>
              <span style={{ fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
                {challenges.length} active
              </span>
            </div>
            <div style={{ ...CARD, marginTop: 10, overflow: "hidden" }}>
              {visibleChallenges.map((c) => (
                <ChallengeRow
                  key={c.label}
                  label={c.label}
                  progressLabel={c.progressLabel}
                  rewardXp={c.rewardXp}
                  pct={c.pct}
                />
              ))}
            </div>
            {hasMoreChallenges && (
              <button
                onClick={() => setChallengesExpanded(true)}
                style={{ ...BTN_OUTLINE, marginTop: 12, width: "100%" }}
              >
                Show all {challenges.length} challenges
              </button>
            )}
          </div>

          {challengesExpanded && (
            <BottomSheet title="All challenges" onClose={() => setChallengesExpanded(false)}>
              <div
                style={{
                  border: "1px solid oklch(0.27 0.005 250)",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                {challenges.map((c) => (
                  <ChallengeRow
                    key={c.label}
                    label={c.label}
                    hint={c.hint}
                    progressLabel={c.progressLabel}
                    rewardXp={c.rewardXp}
                    pct={c.pct}
                  />
                ))}
              </div>
            </BottomSheet>
          )}
        </>
      )}
    </div>
  );
}
