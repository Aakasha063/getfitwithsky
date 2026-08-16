import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Award, Flame, Medal, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import {
  fetchAllSets,
  fetchHistory,
  fetchLeaderboard,
  fetchPRs,
  fetchProfile,
  saveProfile,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Leaderboard — LIFT" },
      {
        name: "description",
        content:
          "Your lifting identity: Iron Score, level, streaks, badges and how you rank against other LIFT athletes.",
      },
      { property: "og:title", content: "Profile & Leaderboard — LIFT" },
      {
        property: "og:description",
        content: "Iron Score, levels, badges and the LIFT athlete leaderboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProfilePage />
    </AppShell>
  ),
});

const PERIODS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
] as const;

/** Iron Score: 1 pt per 1,000 kg lifted + 2 pts per working set + 25 pts per session + 40 pts per active week. */
function ironScore(row: {
  total_volume: number;
  sets_count: number;
  sessions: number;
  active_weeks: number;
}) {
  return Math.round(
    Number(row.total_volume) / 1000 +
      row.sets_count * 2 +
      row.sessions * 25 +
      row.active_weeks * 40,
  );
}

const LEVELS = [
  { name: "Rookie", min: 0 },
  { name: "Grinder", min: 250 },
  { name: "Contender", min: 600 },
  { name: "Beast", min: 1200 },
  { name: "Titan", min: 2200 },
  { name: "Iron Legend", min: 3600 },
];

function levelFor(score: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (score >= l.min) idx = i;
  });
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  const pct = next
    ? Math.round(((score - current.min) / (next.min - current.min)) * 100)
    : 100;
  return { current, next, pct };
}

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [days, setDays] = useState<number>(30);
  const [name, setName] = useState<string | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
  const { data: board } = useQuery({
    queryKey: ["leaderboard", days],
    queryFn: () => fetchLeaderboard(days),
    enabled: !!user,
  });
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
  const { data: allSets } = useQuery({
    queryKey: ["all-sets", user?.id],
    queryFn: () => fetchAllSets(user!.id),
    enabled: !!user,
  });

  const save = useMutation({
    mutationFn: () => saveProfile(user!.id, { name: (name ?? "").trim() || null }),
    onSuccess: () => {
      toast.success("Profile saved");
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ranked = useMemo(() => {
    return (board ?? [])
      .map((r) => ({ ...r, score: ironScore(r) }))
      .sort((a, b) => b.score - a.score);
  }, [board]);

  const me = ranked.find((r) => r.user_id === user?.id);
  const myRank = me ? ranked.indexOf(me) + 1 : null;
  const leader = ranked[0];
  const level = levelFor(me?.score ?? 0);

  const lifetimeVolume = (allSets ?? []).reduce(
    (sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0),
    0,
  );
  const completed = (history ?? []).filter((s) => s.status === "completed");
  const streak = useMemo(() => currentStreak(completed.map((s) => s.session_date)), [history]);

  const badges = [
    { label: "First rep", earned: completed.length >= 1, hint: "Complete 1 session" },
    { label: "Ten sessions", earned: completed.length >= 10, hint: "Complete 10 sessions" },
    { label: "Consistency", earned: streak >= 3, hint: "3-day training streak" },
    { label: "Record breaker", earned: (prs?.length ?? 0) >= 1, hint: "Set a personal record" },
    { label: "100 tonnes", earned: lifetimeVolume >= 100000, hint: "Lift 100,000 kg total" },
    { label: "Iron addict", earned: (allSets?.length ?? 0) >= 500, hint: "Log 500 working sets" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid flex-1 gap-1.5">
            <Label htmlFor="name">Display name (shown on the leaderboard)</Label>
            <Input
              id="name"
              value={name ?? profile?.name ?? ""}
              placeholder="Your athlete name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Iron Score</p>
            <p className="num text-4xl font-semibold text-primary">{me?.score ?? 0}</p>
          </div>
          <div className="text-right">
            <Badge className="gap-1">
              <Zap className="h-3.5 w-3.5" /> {level.current.name}
            </Badge>
            {myRank && (
              <p className="mt-2 text-sm text-muted-foreground">
                Rank #{myRank} of {ranked.length}
              </p>
            )}
          </div>
        </div>
        <Progress value={level.pct} className="mt-4" />
        <p className="mt-2 text-xs text-muted-foreground">
          {level.next
            ? `${level.next.min - (me?.score ?? 0)} pts to ${level.next.name}`
            : "Max level reached — you're an Iron Legend."}
        </p>
      </Card>

      <div className="grid gap-3 sm:grid-cols-4">
        <Stat icon={Flame} label="Streak" value={`${streak} d`} />
        <Stat icon={Trophy} label="PRs" value={String(prs?.length ?? 0)} />
        <Stat icon={Medal} label="Sessions" value={String(completed.length)} />
        <Stat
          icon={Award}
          label="Lifetime volume"
          value={`${Math.round(lifetimeVolume / 1000).toLocaleString()} t`}
        />
      </div>

      <div>
        <h2 className="text-base font-medium">Badges</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {badges.map((b) => (
            <Card
              key={b.label}
              className={cn(
                "p-3",
                b.earned ? "border-primary/50 bg-primary/10" : "opacity-60",
              )}
            >
              <p className="text-sm font-medium">{b.label}</p>
              <p className="text-xs text-muted-foreground">{b.earned ? "Unlocked" : b.hint}</p>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-medium">Leaderboard</h2>
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <Button
                key={p.days}
                size="sm"
                variant={days === p.days ? "default" : "outline"}
                onClick={() => setDays(p.days)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {me && leader && leader.user_id !== me.user_id && (
          <Card className="mt-3 p-4 text-sm">
            <p className="font-medium">You vs {leader.display_name}</p>
            <div className="mt-3 space-y-2">
              <Compare label="Volume" mine={Number(me.total_volume)} theirs={Number(leader.total_volume)} unit="kg" />
              <Compare label="Working sets" mine={me.sets_count} theirs={leader.sets_count} />
              <Compare label="Sessions" mine={me.sessions} theirs={leader.sessions} />
              <Compare label="Active weeks" mine={me.active_weeks} theirs={leader.active_weeks} />
            </div>
          </Card>
        )}

        <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">#</th>
                <th className="px-3 py-2 text-left font-medium">Athlete</th>
                <th className="px-3 py-2 text-right font-medium">Score</th>
                <th className="px-3 py-2 text-right font-medium">Sessions</th>
                <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Sets</th>
                <th className="hidden px-3 py-2 text-right font-medium sm:table-cell">Volume</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((r, i) => (
                <tr
                  key={r.user_id}
                  className={cn(
                    "border-t border-border/60",
                    r.user_id === user?.id && "bg-primary/10",
                  )}
                >
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2">
                    {r.display_name}
                    {r.user_id === user?.id && (
                      <span className="ml-1.5 text-xs text-primary">you</span>
                    )}
                  </td>
                  <td className="num px-3 py-2 text-right font-medium">{r.score}</td>
                  <td className="num px-3 py-2 text-right">{r.sessions}</td>
                  <td className="num hidden px-3 py-2 text-right sm:table-cell">{r.sets_count}</td>
                  <td className="num hidden px-3 py-2 text-right sm:table-cell">
                    {Math.round(Number(r.total_volume)).toLocaleString()} kg
                  </td>
                </tr>
              ))}
              {ranked.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                    No athletes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Compare({
  label,
  mine,
  theirs,
  unit,
}: {
  label: string;
  mine: number;
  theirs: number;
  unit?: string;
}) {
  const max = Math.max(mine, theirs, 1);
  const fmt = (n: number) => `${Math.round(n).toLocaleString()}${unit ? ` ${unit}` : ""}`;
  return (
    <div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="num">
          {fmt(mine)} vs {fmt(theirs)}
        </span>
      </div>
      <div className="mt-1 flex gap-1">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-primary" style={{ width: `${(mine / max) * 100}%` }} />
        </div>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-muted-foreground" style={{ width: `${(theirs / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <p className="num mt-1 text-2xl font-semibold">{value}</p>
    </Card>
  );
}

/** Consecutive days (ending today or yesterday) with a completed session. */
function currentStreak(dates: string[]) {
  const set = new Set(dates);
  let streak = 0;
  const cursor = new Date();
  if (!set.has(cursor.toISOString().slice(0, 10))) cursor.setDate(cursor.getDate() - 1);
  while (set.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
