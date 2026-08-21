import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { saveProfile } from "@/lib/api";
import { navyBodyFat } from "@/lib/bodyFat";
import { calculateCalorieTarget } from "@/lib/calories";
import { GOALS, type GoalKey } from "@/lib/goals";
import { todayISO } from "@/lib/format";

const TOTAL_STEPS = 5;

const LABEL_STYLE = { fontSize: 13, fontWeight: 500 };
const INPUT_STYLE = {
  height: 40,
  borderRadius: 8,
  border: "1px solid oklch(0.27 0.005 250)",
  background: "transparent",
  color: "inherit",
  padding: "0 12px",
  fontSize: 14,
  boxSizing: "border-box" as const,
  width: "100%",
};

function segButtonStyle(selected: boolean) {
  return {
    flex: 1,
    height: 40,
    borderRadius: 8,
    border: "1px solid oklch(0.27 0.005 250)",
    background: selected ? "oklch(0.92 0.25 110)" : "transparent",
    color: selected ? "oklch(0.07 0.01 110)" : "inherit",
    fontSize: 14,
    cursor: "pointer",
  };
}

function goalButtonStyle(selected: boolean) {
  return {
    textAlign: "left" as const,
    padding: "14px 16px",
    borderRadius: 10,
    border: `1px solid ${selected ? "oklch(0.92 0.25 110)" : "oklch(0.27 0.005 250)"}`,
    background: selected ? "oklch(0.92 0.25 110 / 10%)" : "transparent",
    color: "inherit",
    fontSize: 14,
    fontWeight: 500,
    cursor: "pointer",
  };
}

export function Onboarding() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<GoalKey>("cut");
  const [waist, setWaist] = useState("");
  const [neck, setNeck] = useState("");
  const [hip, setHip] = useState("");
  const [saving, setSaving] = useState(false);

  async function finish(skip: boolean) {
    if (!user) return;
    setSaving(true);
    try {
      const patch: Partial<Tables<"profiles">> = { onboarding_completed: true };
      if (!skip) {
        if (sex) patch.sex = sex;
        if (height) patch.height_cm = Number(height);
        if (weight) {
          patch.current_weight_kg = Number(weight);
          patch.starting_weight_kg = Number(weight);
        }
        if (age) {
          const birthYear = new Date().getFullYear() - Number(age);
          patch.date_of_birth = `${birthYear}-01-01`;
        }
        if (activity) patch.activity_level = Number(activity);
        if (goal) patch.primary_goal = goal;
      }

      await saveProfile(user.id, patch);

      if (!skip) {
        const weightNum = weight ? Number(weight) : null;
        const heightNum = height ? Number(height) : null;
        const ageNum = age ? Number(age) : null;
        const bf = navyBodyFat({
          sex,
          height: Number(height),
          neck: Number(neck),
          waist: Number(waist),
          hip: Number(hip),
        });

        // Auto-calculate a starting calorie target too, whenever there's enough data —
        // same rule the Body page's own calculator uses (body fat, or height + age).
        let targetCals: number | null = null;
        if (weightNum && (bf != null || (heightNum && ageNum))) {
          targetCals = calculateCalorieTarget({
            weightKg: weightNum,
            heightCm: heightNum ?? 0,
            age: ageNum ?? 0,
            sex,
            activityFactor: Number(activity),
            goal,
            bodyFatPercent: bf,
          }).targetCals;
        }

        if (weightNum != null || waist || bf != null || targetCals != null) {
          const { error: metricErr } = await supabase.from("body_metrics").insert({
            user_id: user.id,
            measured_on: todayISO(),
            weight_kg: weightNum,
            waist_cm: waist ? Number(waist) : null,
            neck_cm: neck ? Number(neck) : null,
            hip_cm: sex === "female" && hip ? Number(hip) : null,
            height_cm: heightNum,
            body_fat_percent: bf,
            target_calories: targetCals,
          });
          if (metricErr) throw metricErr;
        }
      }

      qc.invalidateQueries({ queryKey: ["profile", user.id] });
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save — please try again");
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 20px",
        background: "oklch(0.045 0.003 250)",
        color: "oklch(0.96 0.002 250)",
        fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "oklch(0.63 0.006 250)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Step {step + 1} of {TOTAL_STEPS}
          </span>
          <button
            onClick={() => finish(true)}
            disabled={saving}
            style={{
              fontSize: 13,
              color: "oklch(0.63 0.006 250)",
              background: "transparent",
              border: "none",
              cursor: saving ? "wait" : "pointer",
              padding: 0,
            }}
          >
            Skip for now
          </button>
        </div>
        <div
          style={{
            height: 3,
            borderRadius: 999,
            background: "oklch(0.22 0.005 250)",
            overflow: "hidden",
            marginBottom: 32,
          }}
        >
          <div
            style={{
              height: "100%",
              background: "oklch(0.92 0.25 110)",
              width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
              transition: "width 0.3s",
            }}
          />
        </div>

        {step === 0 && (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Tell us about yourself
            </h1>
            <p style={{ margin: "8px 0 28px", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              Used for accurate calorie and body-fat calculations. You can skip and fill this in
              later.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={LABEL_STYLE}>Sex</label>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setSex("male")} style={segButtonStyle(sex === "male")}>
                  Male
                </button>
                <button onClick={() => setSex("female")} style={segButtonStyle(sex === "female")}>
                  Female
                </button>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Height & weight
            </h1>
            <p style={{ margin: "8px 0 28px", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              This sets your starting point on the Body page.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Height (cm)</label>
                <input
                  inputMode="numeric"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="178"
                  style={INPUT_STYLE}
                />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Weight (kg)</label>
                <input
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="82"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Age & activity
            </h1>
            <p style={{ margin: "8px 0 28px", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              Used to estimate your daily calorie needs.
            </p>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={LABEL_STYLE}>Age</label>
                <input
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="28"
                  style={INPUT_STYLE}
                />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={LABEL_STYLE}>Activity level</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                style={{ ...INPUT_STYLE, background: "oklch(0.045 0.003 250)" }}
              >
                <option value="1.2">Sedentary — little exercise</option>
                <option value="1.375">Light — 1-3 sessions/week</option>
                <option value="1.55">Moderate — 3-5 sessions/week</option>
                <option value="1.725">High — 6-7 sessions/week</option>
                <option value="1.9">Very high — physical job + training</option>
              </select>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
              What's your goal
            </h1>
            <p style={{ margin: "8px 0 28px", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              Sets your calorie target's direction.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(Object.keys(GOALS) as GoalKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setGoal(key)}
                  style={goalButtonStyle(goal === key)}
                >
                  {GOALS[key].label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em" }}>
              Body-fat measurements
            </h1>
            <p style={{ margin: "8px 0 28px", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              Optional. Adds a starting body-fat estimate using the U.S. Navy method.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div
                style={{ flex: 1, minWidth: 100, display: "flex", flexDirection: "column", gap: 8 }}
              >
                <label style={LABEL_STYLE}>Waist (cm)</label>
                <input
                  inputMode="decimal"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="86"
                  style={INPUT_STYLE}
                />
              </div>
              <div
                style={{ flex: 1, minWidth: 100, display: "flex", flexDirection: "column", gap: 8 }}
              >
                <label style={LABEL_STYLE}>Neck (cm)</label>
                <input
                  inputMode="decimal"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  placeholder="38"
                  style={INPUT_STYLE}
                />
              </div>
              {sex === "female" && (
                <div
                  style={{
                    flex: 1,
                    minWidth: 100,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <label style={LABEL_STYLE}>Hip (cm)</label>
                  <input
                    inputMode="decimal"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                    placeholder="98"
                    style={INPUT_STYLE}
                  />
                </div>
              )}
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12, color: "oklch(0.4 0.006 250)" }}>
              Hip is only used for female body-fat estimates.
            </p>
          </>
        )}

        <div style={{ marginTop: 36, display: "flex", gap: 8 }}>
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={saving}
              style={{
                flexShrink: 0,
                height: 44,
                padding: "0 18px",
                borderRadius: 8,
                border: "1px solid oklch(0.27 0.005 250)",
                background: "transparent",
                color: "inherit",
                fontSize: 14,
                cursor: saving ? "wait" : "pointer",
              }}
            >
              Back
            </button>
          )}
          {step === TOTAL_STEPS - 1 ? (
            <button
              onClick={() => finish(false)}
              disabled={saving}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                border: "none",
                background: "oklch(0.92 0.25 110)",
                color: "oklch(0.07 0.01 110)",
                fontSize: 14,
                fontWeight: 600,
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving..." : "Finish"}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                border: "none",
                background: "oklch(0.92 0.25 110)",
                color: "oklch(0.07 0.01 110)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
