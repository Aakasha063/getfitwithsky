export function ironScore(row: {
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

export const LEVELS = [
  { name: "Rookie", min: 0 },
  { name: "Grinder", min: 250 },
  { name: "Contender", min: 600 },
  { name: "Beast", min: 1200 },
  { name: "Titan", min: 2200 },
  { name: "Iron Legend", min: 3600 },
];

export function levelFor(score: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (score >= l.min) idx = i;
  });
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  const pct = next ? Math.round(((score - current.min) / (next.min - current.min)) * 100) : 100;
  return { current, next, idx, pct };
}

export function getInitials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");
}

export const AVATAR_SWATCHES = [
  { name: "lime", color: "oklch(0.92 0.25 110)" },
  { name: "blue", color: "oklch(0.75 0.15 230)" },
  { name: "coral", color: "oklch(0.75 0.15 30)" },
  { name: "violet", color: "oklch(0.75 0.15 300)" },
  { name: "teal", color: "oklch(0.75 0.15 180)" },
];

/** Deterministic color pick for users whose own avatar_color isn't visible to us (e.g. other athletes on the leaderboard). */
export function colorFromId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_SWATCHES[hash % AVATAR_SWATCHES.length]!.color;
}
