export type PrevSet = { set_number: number; weight_kg: number | null; reps: number | null };

export type Suggestion = {
  weight: number | null;
  reps: number | null;
  label: string;
  reason: string;
  progressWeight: boolean;
};

function increment(isCompound: boolean, weight: number) {
  if (!isCompound) return weight >= 40 ? 5 : 2.5;
  return weight >= 100 ? 5 : 2.5;
}

/**
 * Double progression: work every set to the top of the rep range,
 * then add weight and restart near the bottom of the range.
 */
export function suggestNextSet(opts: {
  prevSets: PrevSet[];
  setNumber: number;
  repMin: number | null;
  repMax: number | null;
  isCompound: boolean;
}): Suggestion {
  const { prevSets, setNumber, repMin, repMax, isCompound } = opts;
  const working = prevSets.filter((s) => (s.reps ?? 0) > 0);

  if (working.length === 0) {
    return {
      weight: null,
      reps: repMin,
      label: "First time",
      reason: "No history yet — pick a load you can control for the bottom of the range.",
      progressWeight: false,
    };
  }

  const match = working.find((s) => s.set_number === setNumber) ?? working[working.length - 1];
  const prevWeight = match.weight_kg ?? null;
  const prevReps = match.reps ?? null;

  if (repMax !== null && prevWeight !== null) {
    const allTopped = working.every((s) => (s.reps ?? 0) >= repMax);
    if (allTopped) {
      const next = prevWeight + increment(isCompound, prevWeight);
      return {
        weight: next,
        reps: repMin,
        label: "Add weight",
        reason: `You hit ${repMax} reps on every set last time. Move up to ${next} kg and restart near ${repMin} reps.`,
        progressWeight: true,
      };
    }
  }

  const target = repMax !== null && prevReps !== null ? Math.min(prevReps + 1, repMax) : repMin;
  return {
    weight: prevWeight,
    reps: target,
    label: "Beat reps",
    reason:
      prevReps !== null
        ? `Last time: ${prevReps} reps @ ${prevWeight ?? "—"} kg. Aim for ${target}.`
        : "Match the load and add a rep where you can.",
    progressWeight: false,
  };
}