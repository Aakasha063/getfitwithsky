import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
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
  uploadAvatar,
} from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

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

/** Iron Score calculation */
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
  LEVELS.forEach((l, i) => { if (score >= l.min) idx = i; });
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  const pct = next
    ? Math.round(((score - current.min) / (next.min - current.min)) * 100)
    : 100;
  return { current, next, idx, pct };
}

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

const AVATAR_SWATCHES = [
  { name: "lime", color: "oklch(0.92 0.25 110)" },
  { name: "blue", color: "oklch(0.75 0.15 230)" },
  { name: "coral", color: "oklch(0.75 0.15 30)" },
  { name: "violet", color: "oklch(0.75 0.15 300)" },
  { name: "teal", color: "oklch(0.75 0.15 180)" },
];

function getInitials(name: string): string {
  return name.split(/[\s._-]+/).slice(0, 2).map((p) => (p[0] ?? "").toUpperCase()).join("");
}

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const router = useRouter();
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameField, setNameField] = useState("");
  const [goalField, setGoalField] = useState("Fat loss");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });
  const { data: board } = useQuery({
    queryKey: ["leaderboard", 30],
    queryFn: () => fetchLeaderboard(30),
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
    if (profile) {
      setNameField(profile.name ?? "");
      setGoalField(profile.primary_goal ?? "Fat loss");
    }
  }, [profile]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveProfile(user!.id, {
        name: nameField.trim() || null,
        primary_goal: goalField || null,
        training_experience: null,
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      setEditingProfile(false);
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ranked = useMemo(() => {
    return (board ?? []).map((r) => ({ ...r, score: ironScore(r) })).sort((a, b) => b.score - a.score);
  }, [board]);

  const me = ranked.find((r) => r.user_id === user?.id);
  const level = levelFor(me?.score ?? 0);
  const completed = (history ?? []).filter((s) => s.status === "completed");
  const streak = useMemo(() => currentStreak(completed.map((s) => s.session_date)), [history]);
  const lifetimeVolume = (allSets ?? []).reduce((sum, s) => sum + (s.weight_kg ?? 0) * (s.reps ?? 0), 0);

  const displayName = profile?.name?.trim() || user?.email?.split("@")[0] || "Athlete";
  const initials = getInitials(displayName);
  const xpValue = me?.score ?? 0;
  const toNext = level.next ? `${level.next.min - xpValue} pts to ${level.next.name}` : "Max level — Iron Legend.";

  const thisWeekStart = (() => { const d = new Date(); d.setDate(d.getDate() - 6); return d.toISOString().slice(0, 10); })();
  const thisWeekSessions = completed.filter((s) => s.session_date >= thisWeekStart).length;

  // Badge definitions matching design reference
  const badges = [
    { label: "First rep", hint: "Complete 1 session", earned: completed.length >= 1, pct: Math.min(100, completed.length * 100), progressLabel: `${Math.min(completed.length, 1)}/1`, rewardXp: 50 },
    { label: "Ten sessions", hint: "Complete 10 sessions", earned: completed.length >= 10, pct: Math.min(100, Math.round(completed.length / 10 * 100)), progressLabel: `${Math.min(completed.length, 10)}/10`, rewardXp: 200 },
    { label: "Consistency", hint: "3-day training streak", earned: streak >= 3, pct: Math.min(100, Math.round(streak / 3 * 100)), progressLabel: `${Math.min(streak, 3)}/3 days`, rewardXp: 100 },
    { label: "Record breaker", hint: "Set a personal record", earned: (prs?.length ?? 0) >= 1, pct: Math.min(100, (prs?.length ?? 0) * 100), progressLabel: `${Math.min(prs?.length ?? 0, 1)}/1 PR`, rewardXp: 150 },
    { label: "100 tonnes", hint: "Lift 100,000 kg total", earned: lifetimeVolume >= 100000, pct: Math.min(100, Math.round(lifetimeVolume / 1000)), progressLabel: `${Math.round(lifetimeVolume / 1000)}t`, rewardXp: 500 },
    { label: "Iron addict", hint: "Log 500 working sets", earned: (allSets?.length ?? 0) >= 500, pct: Math.min(100, Math.round((allSets?.length ?? 0) / 5)), progressLabel: `${Math.min(allSets?.length ?? 0, 500)}/500`, rewardXp: 400 },
  ];

  const challenges = [
    { label: "Weekly warrior", hint: "Complete 5 sessions this week", pct: Math.min(100, Math.round(thisWeekSessions / 5 * 100)), progressLabel: `${thisWeekSessions}/5 this week`, rewardXp: 100 },
    { label: "PR machine", hint: "Set 5 PRs in 30 days", pct: Math.min(100, Math.round(((prs?.length ?? 0) / 5) * 100)), progressLabel: `${Math.min(prs?.length ?? 0, 5)}/5 PRs`, rewardXp: 250 },
    { label: "Volume king", hint: "Lift 50,000 kg in a month", pct: Math.min(100, Math.round(lifetimeVolume / 500)), progressLabel: `${Math.round(lifetimeVolume / 1000)}t`, rewardXp: 300 },
  ];

  const milestonePct = level.pct;
  const milestoneLabel = level.next ? `Reach ${level.next.name}` : "Iron Legend — Max level";
  const milestoneHint = level.next ? `${level.next.min - xpValue} XP needed` : "You've reached the top.";
  const milestoneReward = level.next ? Math.round((level.next.min - level.current.min) * 0.1) : 0;

  const CARD = { background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12 };
  const BTN_OUTLINE = { height: 32, padding: "0 12px", borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" } as const;

  const avatarImage = profile?.avatar_url || null;
  const avatarColor = profile?.avatar_color || "oklch(0.92 0.25 110)";

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsUploading(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      await saveProfile(user.id, { avatar_url: publicUrl, avatar_color: null });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile photo updated");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  }

  async function updateAvatarColor(color: string) {
    if (!user) return;
    try {
      await saveProfile(user.id, { avatar_color: color, avatar_url: null });
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err: any) {
      toast.error("Failed to update avatar color");
    }
  }

  async function removePhoto() {
    if (!user) return;
    try {
      await saveProfile(user.id, { avatar_url: null });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile photo removed");
    } catch (err: any) {
      toast.error("Failed to remove photo");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth" });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

      {/* Profile card */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        {/* Banner */}
        <div style={{ height: 96, background: "oklch(0.92 0.25 110 / 8%)" }} />
        {/* Avatar + info */}
        <div style={{ marginTop: -40, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 16, padding: "0 20px 20px" }}>
          <div style={{ position: "relative", flexShrink: 0 }}>
            {/* Avatar */}
            <button
              onClick={() => setAvatarEditorOpen(true)}
              aria-label="Edit avatar"
              style={{
                width: 80, height: 80, borderRadius: 16,
                background: avatarImage ? undefined : avatarColor,
                backgroundImage: avatarImage ? `url(${avatarImage})` : undefined,
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Inter'", fontSize: 24, fontWeight: 600,
                color: "oklch(0.07 0.01 110)", border: "none", cursor: "pointer",
                overflow: "hidden",
              }}
            >
              {!avatarImage && initials}
            </button>
            {/* Edit badge */}
            <button
              onClick={() => setAvatarEditorOpen(true)}
              aria-label="Edit avatar"
              style={{
                position: "absolute", bottom: -4, right: -4,
                width: 26, height: 26, borderRadius: 999,
                border: "2px solid oklch(0.11 0.004 250)",
                background: "oklch(0.22 0.005 250)", color: "oklch(0.96 0.002 250)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", padding: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 24, fontWeight: 600 }}>{displayName}</h1>
            <p style={{ margin: "2px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>{user?.email}</p>
            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span style={{ borderRadius: 6, background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)", padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {level.current.name}
              </span>
              <span style={{ borderRadius: 6, border: "1px solid oklch(0.27 0.005 250)", padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                {goalField}
              </span>
            </div>
          </div>

          <button onClick={() => setEditingProfile((v) => !v)} style={BTN_OUTLINE}>
            ✎ Edit profile
          </button>
        </div>

        {/* Edit form */}
        {editingProfile && (
          <div style={{ borderTop: "1px solid oklch(0.27 0.005 250)", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13 }}>Display name</label>
              <input
                value={nameField}
                onChange={(e) => setNameField(e.target.value)}
                style={{ height: 36, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", padding: "0 10px", fontSize: 14 }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13 }}>Primary goal</label>
              <select
                value={goalField}
                onChange={(e) => setGoalField(e.target.value)}
                style={{ height: 36, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "oklch(0.045 0.003 250)", color: "inherit", padding: "0 10px", fontSize: 14 }}
              >
                <option value="Fat loss">Fat loss</option>
                <option value="Recomp">Recomp</option>
                <option value="Muscle gain">Muscle gain</option>
                <option value="Strength">Strength</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setEditingProfile(false)} style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "none", background: "transparent", color: "oklch(0.63 0.006 250)", fontSize: 13, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                style={{ height: 32, padding: "0 14px", borderRadius: 8, border: "none", background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Save changes
              </button>
            </div>
          </div>
        )}

        {/* XP Bar */}
        <div style={{ borderTop: "1px solid oklch(0.27 0.005 250)", padding: "16px 20px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)" }}>
                Level {level.idx + 1} · {level.current.name}
              </p>
              <p style={{ margin: "2px 0 0", fontFamily: "'Inter'", fontSize: 32, fontWeight: 600, color: "oklch(0.92 0.25 110)", fontVariantNumeric: "tabular-nums" }}>
                {xpValue} XP
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{toNext}</p>
          </div>
          <div style={{ marginTop: 12, height: 8, borderRadius: 999, background: "oklch(0.92 0.25 110 / 20%)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${level.pct}%`, transition: "width 0.3s" }} />
          </div>
        </div>
      </div>

      {/* Avatar editor modal */}
      {avatarEditorOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setAvatarEditorOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 360, background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Profile picture</h2>
              <button onClick={() => setAvatarEditorOpen(false)} style={{ background: "transparent", border: "none", color: "oklch(0.63 0.006 250)", cursor: "pointer", padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ marginTop: 20, display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 16,
                background: avatarImage ? undefined : avatarColor,
                backgroundImage: avatarImage ? `url(${avatarImage})` : undefined,
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 600, color: "oklch(0.07 0.01 110)",
              }}>
                {!avatarImage && initials}
              </div>
            </div>
            <label style={{
              marginTop: 20, display: "flex", height: 38, borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)", background: "transparent",
              color: isUploading ? "oklch(0.45 0.006 250)" : "inherit", 
              fontSize: 13, fontWeight: 500, cursor: isUploading ? "not-allowed" : "pointer",
              alignItems: "center", justifyContent: "center",
            }}>
              {isUploading ? "Uploading..." : "Upload photo"}
              <input type="file" accept="image/*" onChange={handleAvatarFile} disabled={isUploading} style={{ display: "none" }} />
            </label>
            {avatarImage && (
              <button
                onClick={removePhoto}
                style={{ marginTop: 10, width: "100%", height: 36, borderRadius: 8, border: "none", background: "transparent", color: "oklch(0.63 0.006 250)", fontSize: 13, cursor: "pointer" }}
              >
                Remove photo
              </button>
            )}
            <p style={{ margin: "20px 0 10px", fontSize: 12, color: "oklch(0.45 0.006 250)", textAlign: "center" }}>or choose a color</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              {AVATAR_SWATCHES.map((sw) => (
                <button
                  key={sw.name}
                  onClick={() => updateAvatarColor(sw.color)}
                  aria-label={sw.name}
                  style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: sw.color,
                    border: `2px solid ${avatarColor === sw.color && !avatarImage ? "oklch(0.96 0.002 250)" : "transparent"}`,
                    cursor: "pointer", padding: 0,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next milestone */}
      <div style={{ ...CARD, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
            Next milestone
          </p>
          <span style={{ fontSize: 13, fontWeight: 600, color: "oklch(0.92 0.25 110)" }}>+{milestoneReward} XP</span>
        </div>
        <p style={{ margin: "8px 0 0", fontSize: 17, fontWeight: 600 }}>{milestoneLabel}</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>{milestoneHint}</p>
        <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${milestonePct}%` }} />
        </div>
      </div>

      {/* 2-col stats: this week / PRs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        <div style={{ ...CARD, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>This week</p>
          <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {thisWeekSessions}/5
          </p>
          <div style={{ marginTop: 12, height: 6, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
            <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${Math.min(100, Math.round(thisWeekSessions / 5 * 100))}%` }} />
          </div>
        </div>
        <div style={{ ...CARD, padding: 20 }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>Personal records</p>
          <p style={{ margin: "8px 0 0", fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {prs?.length ?? 0}
          </p>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
            {prs?.[0] ? `Latest: ${prs[0].exercises?.name ?? "Exercise"}` : "No PRs yet"}
          </p>
        </div>
      </div>

      {/* Navigation tiles: Progress + History */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {[
          { to: "/progress", title: "Progress", desc: "Charts for volume, strength and bodyweight", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="3,17 9,11 13,15 21,7" />
            </svg>
          )},
          { to: "/history", title: "History", desc: "Every session, filterable by date", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><polyline points="12,7 12,12 16,14" />
            </svg>
          )},
        ].map(({ to, title, desc, icon }) => (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <div style={{ ...CARD, padding: 16, display: "flex", alignItems: "center", gap: 12, color: "inherit", transition: "border-color 0.15s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.92 0.25 110 / 50%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "oklch(0.27 0.005 250)")}
            >
              <span style={{ width: 40, height: 40, borderRadius: 10, background: "oklch(0.92 0.25 110 / 15%)", color: "oklch(0.92 0.25 110)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {icon}
              </span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>{title}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 15, fontWeight: 600 }}>Achievements</h2>
          <span style={{ fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
            {badges.filter((b) => b.earned).length}/{badges.length} unlocked
          </span>
        </div>
        <div className="badges-grid" style={{ marginTop: 16 }}>
          {badges.map((b) => (
            <div
              key={b.label}
              style={{
                ...CARD,
                padding: 16,
                border: `1px solid ${b.earned ? "oklch(0.92 0.25 110 / 60%)" : "oklch(0.27 0.005 250)"}`,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{b.label}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{b.hint}</p>
                </div>
                {b.earned && (
                  <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="oklch(0.92 0.25 110)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20,6 9,17 4,12" />
                  </svg>
                )}
              </div>
              <div style={{ marginTop: 12, height: 5, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: b.earned ? "oklch(0.92 0.25 110)" : "oklch(0.45 0.006 250)", width: `${b.pct}%` }} />
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "oklch(0.45 0.006 250)" }}>{b.progressLabel}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "oklch(0.45 0.006 250)" }}>+{b.rewardXp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <h2 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 15, fontWeight: 600 }}>Challenges</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
          Reward consistency and progression — not extra volume.
        </p>
        <div className="badges-grid" style={{ marginTop: 16 }}>
          {challenges.map((c) => (
            <div key={c.label} style={{ ...CARD, padding: 16 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{c.label}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{c.hint}</p>
              <div style={{ marginTop: 12, height: 5, borderRadius: 999, background: "oklch(0.22 0.005 250)", overflow: "hidden" }}>
                <div style={{ height: "100%", background: "oklch(0.92 0.25 110)", width: `${c.pct}%` }} />
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: "oklch(0.45 0.006 250)" }}>{c.progressLabel}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "oklch(0.92 0.25 110)" }}>+{c.rewardXp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 14, fontWeight: 600, color: "oklch(0.63 0.006 250)" }}>
              Training score leaderboard
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "oklch(0.45 0.006 250)" }}>
              Optional · ranks consistency and progression, not raw volume
            </p>
          </div>
          <button
            onClick={() => setShowLeaderboard((v) => !v)}
            style={{ height: 30, padding: "0 14px", borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", fontSize: 12, fontWeight: 500, cursor: "pointer" }}
          >
            {showLeaderboard ? "Hide" : "Show leaderboard"}
          </button>
        </div>

        {showLeaderboard && (
          <div style={{ marginTop: 16 }}>
            {me && (
              <p style={{ margin: "0 0 12px", fontSize: 13, color: "oklch(0.63 0.006 250)" }}>
                Your rank: #{ranked.indexOf(me) + 1} of {ranked.length}
              </p>
            )}
            <div style={{ borderRadius: 12, border: "1px solid oklch(0.27 0.005 250)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead style={{ background: "oklch(0.22 0.005 250 / 50%)" }}>
                  <tr>
                    {["#", "Athlete", "Training score", "Sessions"].map((h, i) => (
                      <th key={h} style={{ textAlign: i <= 1 ? "left" : "right", padding: "8px 12px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)", fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((r, i) => {
                    const isMe = r.user_id === user?.id;
                    return (
                      <tr key={r.user_id} style={{ borderTop: "1px solid oklch(0.27 0.005 250)", background: isMe ? "oklch(0.92 0.25 110 / 5%)" : "transparent" }}>
                        <td style={{ padding: "8px 12px" }}>{i + 1}</td>
                        <td style={{ padding: "8px 12px" }}>
                          {r.display_name}
                          {isMe && <span style={{ marginLeft: 6, fontSize: 12, color: "oklch(0.92 0.25 110)" }}>you</span>}
                        </td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{r.score}</td>
                        <td style={{ padding: "8px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{r.sessions}</td>
                      </tr>
                    );
                  })}
                  {ranked.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "oklch(0.45 0.006 250)" }}>
                        No athletes yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        style={{
          alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 6,
          background: "transparent", border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 8, color: "oklch(0.63 0.006 250)", fontSize: 13, cursor: "pointer",
          padding: "10px 14px",
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="8" height="16" rx="1" /><line x1="21" y1="12" x2="9" y2="12" />
          <polyline points="17,7 21,12 17,17" />
        </svg>
        Sign out
      </button>
    </div>
  );
}
