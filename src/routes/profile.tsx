import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Crown,
  Dumbbell,
  Flame,
  Gem,
  History as HistoryIcon,
  LineChart,
  Medal,
  Pencil,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
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

function initials(nameOrEmail: string) {
  const base = nameOrEmail.trim();
  if (!base) return "AT";
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

const AVATAR_TONES = [
  "from-primary/80 to-primary/30",
  "from-sky-400/70 to-sky-500/20",
  "from-orange-400/70 to-orange-500/20",
  "from-fuchsia-400/70 to-fuchsia-500/20",
  "from-emerald-400/70 to-emerald-500/20",
];

function hashOf(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const SKINS = ["#f2c8a0", "#e0a878", "#c58b5c", "#8d5a37", "#5f3a24"];
const HAIRS = ["#1c1917", "#3f2b1d", "#6b4423", "#a1662f", "#d8c39b", "#57534e"];

/** Deterministic little lifter character built from the seed. */
function CharacterFace({ seed }: { seed: string }) {
  const h = hashOf(seed);
  const skin = SKINS[h % SKINS.length]!;
  const hair = HAIRS[(h >> 3) % HAIRS.length]!;
  const style = (h >> 7) % 4; // hair style
  const brow = (h >> 11) % 3;
  const beard = (h >> 13) % 3 === 0;
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full">
      {/* shoulders */}
      <path d="M10 64c0-11 10-17 22-17s22 6 22 17z" fill={skin} opacity="0.95" />
      <path d="M10 64c0-8 6-13 13-15l9 6 9-6c7 2 13 7 13 15z" fill="currentColor" opacity="0.35" />
      {/* neck */}
      <rect x="27" y="38" width="10" height="10" rx="4" fill={skin} />
      {/* head */}
      <ellipse cx="32" cy="28" rx="14" ry="15" fill={skin} />
      {/* ears */}
      <circle cx="18" cy="29" r="3" fill={skin} />
      <circle cx="46" cy="29" r="3" fill={skin} />
      {/* hair */}
      {style === 0 && <path d="M18 26c0-9 6-14 14-14s14 5 14 14c-3-5-8-7-14-7s-11 2-14 7z" fill={hair} />}
      {style === 1 && <path d="M18 27c-1-11 6-16 14-16s15 5 14 16c-2-3-3-6-6-7-4 2-14 2-17-1-2 2-3 5-5 8z" fill={hair} />}
      {style === 2 && (
        <>
          <path d="M19 24c2-8 7-12 13-12s11 4 13 12c-4-3-8-4-13-4s-9 1-13 4z" fill={hair} />
          <path d="M17 24c-2 5-1 9 0 12 0-6 1-9 2-11zM47 24c2 5 1 9 0 12 0-6-1-9-2-11z" fill={hair} />
        </>
      )}
      {style === 3 && <path d="M20 22c3-7 20-8 24 0 1 2 1 4 0 6-2-6-22-6-24 0-1-2-1-4 0-6z" fill={hair} />}
      {/* brows */}
      <g fill="#2b2118">
        {brow === 0 && (
          <>
            <rect x="22" y="25" width="7" height="2" rx="1" />
            <rect x="35" y="25" width="7" height="2" rx="1" />
          </>
        )}
        {brow === 1 && (
          <>
            <path d="M22 26l7-2v2l-7 2z" />
            <path d="M42 26l-7-2v2l7 2z" />
          </>
        )}
        {brow === 2 && (
          <>
            <path d="M22 25l7 2v1l-7-1z" />
            <path d="M42 25l-7 2v1l7-1z" />
          </>
        )}
      </g>
      {/* eyes */}
      <circle cx="26" cy="31" r="2" fill="#221c17" />
      <circle cx="38" cy="31" r="2" fill="#221c17" />
      {/* mouth */}
      <path d="M28 37c2 2 6 2 8 0" stroke="#221c17" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {beard && (
        <path d="M20 31c1 8 6 12 12 12s11-4 12-12c1 6-2 15-12 15s-13-9-12-15z" fill={hair} opacity="0.9" />
      )}
    </svg>
  );
}

function Avatar({
  seed,
  label,
  className,
}: {
  seed: string;
  label: string;
  className?: string;
}) {
  const tone = AVATAR_TONES[hashOf(seed || label) % AVATAR_TONES.length]!;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-background ring-1 ring-border/60",
        tone,
        className,
      )}
      title={label}
      aria-hidden
    >
      <CharacterFace seed={seed || label} />
    </div>
  );
}

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [days, setDays] = useState<number>(30);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", experience: "" });

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

  useEffect(() => {
    if (profile)
      setForm({
        name: profile.name ?? "",
        goal: profile.primary_goal ?? "",
        experience: profile.training_experience ?? "",
      });
  }, [profile]);

  const save = useMutation({
    mutationFn: () =>
      saveProfile(user!.id, {
        name: form.name.trim() || null,
        primary_goal: form.goal || null,
        training_experience: form.experience || null,
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      setOpen(false);
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

  const displayName = profile?.name?.trim() || user?.email?.split("@")[0] || "Athlete";

  const badges = [
    {
      label: "First rep",
      icon: Sparkles,
      earned: completed.length >= 1,
      hint: "Complete 1 session",
      tone: "text-emerald-300",
    },
    {
      label: "Ten sessions",
      icon: Dumbbell,
      earned: completed.length >= 10,
      hint: "Complete 10 sessions",
      tone: "text-sky-300",
    },
    {
      label: "Consistency",
      icon: Flame,
      earned: streak >= 3,
      hint: "3-day training streak",
      tone: "text-orange-300",
    },
    {
      label: "Record breaker",
      icon: Trophy,
      earned: (prs?.length ?? 0) >= 1,
      hint: "Set a personal record",
      tone: "text-amber-300",
    },
    {
      label: "100 tonnes",
      icon: Award,
      earned: lifetimeVolume >= 100000,
      hint: "Lift 100,000 kg total",
      tone: "text-fuchsia-300",
    },
    {
      label: "Iron addict",
      icon: Crown,
      earned: (allSets?.length ?? 0) >= 500,
      hint: "Log 500 working sets",
      tone: "text-primary",
    },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-8">
      {/* Identity card */}
      <Card className="relative overflow-hidden p-0">
        <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent" />
        <div className="-mt-10 flex flex-wrap items-end gap-4 px-5 pb-5">
          <Avatar
            seed={user?.id ?? "me"}
            label={displayName}
            className="h-20 w-20 text-2xl shadow-lg"
          />
          <div className="min-w-0 flex-1">
            <h1 className="font-display truncate text-2xl font-semibold">{displayName}</h1>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge className="gap-1">
                <Zap className="h-3.5 w-3.5" /> {level.current.name}
              </Badge>
              {myRank && <Badge variant="secondary">Rank #{myRank}</Badge>}
              {profile?.primary_goal && (
                <Badge variant="outline">{profile.primary_goal}</Badge>
              )}
            </div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" /> Edit profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    placeholder="Your athlete name"
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Shown on the leaderboard.</p>
                </div>
                <div className="grid gap-1.5">
                  <Label>Primary goal</Label>
                  <Select
                    value={form.goal}
                    onValueChange={(v) => setForm((f) => ({ ...f, goal: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a goal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fat loss">Fat loss</SelectItem>
                      <SelectItem value="Recomp">Recomp</SelectItem>
                      <SelectItem value="Muscle gain">Muscle gain</SelectItem>
                      <SelectItem value="Strength">Strength</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Training experience</Label>
                  <Select
                    value={form.experience}
                    onValueChange={(v) => setForm((f) => ({ ...f, experience: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => save.mutate()} disabled={save.isPending}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border-t border-border/60 px-5 py-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Iron Score</p>
              <p className="num font-display text-4xl font-semibold text-primary">
                {me?.score ?? 0}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {level.next
                ? `${level.next.min - (me?.score ?? 0)} pts to ${level.next.name}`
                : "Max level — Iron Legend."}
            </p>
          </div>
          <Progress value={level.pct} className="mt-3" />
        </div>
      </Card>

      {/* Quick links */}
      <div className="grid gap-3 sm:grid-cols-2">
        <NavCard
          to="/progress"
          icon={LineChart}
          title="Progress"
          desc="Charts for volume, strength and bodyweight"
        />
        <NavCard
          to="/history"
          icon={HistoryIcon}
          title="History"
          desc="Every session, filterable by date"
        />
      </div>

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

      {/* Badges */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-medium">Badges</h2>
          <span className="text-xs text-muted-foreground">
            {earnedCount}/{badges.length} unlocked
          </span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.label} className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "relative grid h-16 w-16 place-items-center rounded-full border-2 transition-all",
                    b.earned
                      ? "border-primary/60 bg-gradient-to-br from-primary/25 to-primary/5 shadow-[0_0_20px_-6px_hsl(var(--primary))]"
                      : "border-dashed border-border bg-secondary/40 grayscale",
                  )}
                  title={b.earned ? "Unlocked" : b.hint}
                >
                  <Icon
                    className={cn("h-7 w-7", b.earned ? b.tone : "text-muted-foreground/60")}
                  />
                  {b.earned && (
                    <span className="absolute -bottom-1 rounded-full bg-primary px-1.5 text-[9px] font-semibold uppercase text-primary-foreground">
                      got it
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[11px] font-medium leading-tight">{b.label}</p>
                {!b.earned && (
                  <p className="text-[10px] leading-tight text-muted-foreground">{b.hint}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-base font-medium">Leaderboard</h2>
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

        {/* Podium */}
        {ranked.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {ranked.slice(0, 3).map((r, i) => (
              <Card
                key={r.user_id}
                className={cn(
                  "flex items-center gap-3 p-4",
                  i === 0 && "border-primary/50 bg-primary/5",
                  r.user_id === user?.id && "ring-1 ring-primary/60",
                )}
              >
                <div className="relative">
                  <Avatar seed={r.user_id} label={r.display_name} className="h-12 w-12" />
                  <span
                    className={cn(
                      "absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border border-background",
                      PODIUM[i]!.bg,
                    )}
                  >
                    {i === 0 ? (
                      <Gem className="h-3.5 w-3.5 text-background" />
                    ) : (
                      <Medal className="h-3.5 w-3.5 text-background" />
                    )}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{r.display_name}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className={PODIUM[i]!.text}>{PODIUM[i]!.label}</span> ·{" "}
                    <span className="num">{r.score}</span> pts
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

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
                  <td className="px-3 py-2">
                    {i < 3 ? (
                      <span
                        className={cn(
                          "grid h-6 w-6 place-items-center rounded-full",
                          PODIUM[i]!.bg,
                        )}
                      >
                        {i === 0 ? (
                          <Gem className="h-3.5 w-3.5 text-background" />
                        ) : (
                          <Medal className="h-3.5 w-3.5 text-background" />
                        )}
                      </span>
                    ) : (
                      i + 1
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Avatar
                        seed={r.user_id}
                        label={r.display_name}
                        className="h-8 w-8 rounded-xl text-[11px]"
                      />
                      <span className="truncate">
                        {r.display_name}
                        {r.user_id === user?.id && (
                          <span className="ml-1.5 text-xs text-primary">you</span>
                        )}
                      </span>
                    </div>
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

const PODIUM = [
  { label: "Diamond", bg: "bg-sky-300", text: "text-sky-300" },
  { label: "Gold", bg: "bg-amber-300", text: "text-amber-300" },
  { label: "Silver", bg: "bg-zinc-300", text: "text-zinc-300" },
];

function NavCard({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Flame;
  title: string;
  desc: string;
}) {
  return (
    <Link to={to}>
      <Card className="flex items-center gap-3 p-4 transition-colors hover:border-primary/50 hover:bg-secondary/40">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </Card>
    </Link>
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
      <p className="num font-display mt-1 text-2xl font-semibold">{value}</p>
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
