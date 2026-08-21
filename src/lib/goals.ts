export const GOALS = {
  cut: { label: "Fat loss", factor: 0.8 },
  recomp: { label: "Slow cut / recomp", factor: 0.9 },
  maintain: { label: "Maintain", factor: 1 },
  bulk: { label: "Lean gain", factor: 1.1 },
} as const;

export type GoalKey = keyof typeof GOALS;
