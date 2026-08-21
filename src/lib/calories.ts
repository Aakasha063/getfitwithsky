import { GOALS, type GoalKey } from "./goals";

/**
 * Daily calorie target + macros. Uses Katch-McArdle (needs body fat %) when available,
 * otherwise falls back to Mifflin-St Jeor (needs height + age).
 */
export function calculateCalorieTarget(o: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: "male" | "female";
  activityFactor: number;
  goal: GoalKey;
  bodyFatPercent?: number | null;
}) {
  const { weightKg, heightCm, age, sex, activityFactor, goal, bodyFatPercent } = o;
  const bmr =
    bodyFatPercent != null
      ? 370 + 21.6 * (weightKg * (1 - bodyFatPercent / 100))
      : 10 * weightKg + 6.25 * heightCm - 5 * age + (sex === "male" ? 5 : -161);
  const tdee = bmr * activityFactor;
  const targetCals = Math.round((tdee * GOALS[goal].factor) / 10) * 10;
  const protein = Math.round(weightKg * 2);
  const fat = Math.round(weightKg * 0.9);
  const carbs = Math.max(0, Math.round((targetCals - protein * 4 - fat * 9) / 4));
  return { bmr, tdee, targetCals, protein, fat, carbs };
}
