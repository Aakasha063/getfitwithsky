export function fmtWeight(kg: number | null | undefined) {
  if (kg === null || kg === undefined) return "—";
  return `${Number.isInteger(kg) ? kg : kg.toFixed(1)} kg`;
}

export function fmtDuration(seconds: number | null | undefined) {
  if (!seconds) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function mmss(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function epley1RM(weight: number, reps: number) {
  return weight * (1 + reps / 30);
}

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];