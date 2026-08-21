/** U.S. Navy method body-fat % estimate. Returns null when inputs are incomplete or the result is out of a plausible range. */
export function navyBodyFat(o: {
  sex: "male" | "female";
  height: number;
  neck: number;
  waist: number;
  hip: number;
}) {
  const { sex, height, neck, waist, hip } = o;
  if (!height || !neck || !waist) return null;
  if (sex === "female" && !hip) return null;
  const value =
    sex === "male"
      ? 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450
      : 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.221 * Math.log10(height)) -
        450;
  if (!Number.isFinite(value) || value <= 0 || value > 75) return null;
  return Math.round(value * 10) / 10;
}
