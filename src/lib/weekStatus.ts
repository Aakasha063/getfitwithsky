import type { SessionRow } from "@/lib/api";

export type DayStatus = {
  isToday: boolean;
  isDone: boolean;
  isMissed: boolean;
  isUpcoming: boolean;
  session: SessionRow | undefined;
};

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Builds a `statusFor(day)` lookup for the current Mon-start week.
 * A day counts as done when any session for it was completed this week,
 * regardless of which weekday it was actually finished on.
 *
 * `joinedISO` (the user's account creation date) prevents days from before
 * they even signed up from showing as "Missed" — e.g. a user who joins on
 * Friday never had a chance to train Monday–Thursday, so those fall back to
 * "Upcoming" instead.
 */
export function buildWeekStatus(history: SessionRow[], joinedISO = "") {
  const now = new Date();
  const dow = now.getDay();
  const todayISOStr = toISO(now);

  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday
  const weekStartISO = toISO(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndISO = toISO(weekEnd);

  const dateForDow = (d: number) => {
    const idx = (d + 6) % 7; // Mon=0 ... Sun=6
    const dt = new Date(weekStart);
    dt.setDate(weekStart.getDate() + idx);
    return dt;
  };

  const sessionFor = (dayId: string) =>
    history.find(
      (s) =>
        s.day_id === dayId &&
        s.session_date >= weekStartISO &&
        s.session_date <= weekEndISO &&
        s.status === "completed",
    ) ??
    history.find(
      (s) => s.day_id === dayId && s.session_date >= weekStartISO && s.session_date <= weekEndISO,
    );

  function statusFor(day: {
    id: string;
    day_of_week: number | null;
    is_rest?: boolean | null;
  }): DayStatus {
    const isToday = day.day_of_week === dow;
    const dayDate = day.day_of_week == null ? null : dateForDow(day.day_of_week);
    const iso = dayDate ? toISO(dayDate) : null;
    const session = sessionFor(day.id);
    const isDone = session?.status === "completed";
    const isPast = !!iso && iso < todayISOStr;
    const isMissed = !day.is_rest && !isDone && isPast && iso! >= joinedISO;
    const isUpcoming = !day.is_rest && !isDone && !isMissed && !isToday;
    return { isToday, isDone, isMissed, isUpcoming, session };
  }

  return { statusFor, toISO, dateForDow, todayISOStr, weekStartISO, weekEndISO };
}
