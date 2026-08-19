import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/format";

function navyBodyFat(o: {
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
      ? 495 /
          (1.0324 -
            0.19077 * Math.log10(waist - neck) +
            0.15456 * Math.log10(height)) -
        450
      : 495 /
          (1.29579 -
            0.35004 * Math.log10(waist + hip - neck) +
            0.221 * Math.log10(height)) -
        450;
  if (!Number.isFinite(value) || value <= 0 || value > 75) return null;
  return Math.round(value * 10) / 10;
}

const GOALS = {
  cut: { label: "Fat loss", factor: 0.8 },
  recomp: { label: "Slow cut / recomp", factor: 0.9 },
  maintain: { label: "Maintain", factor: 1 },
  bulk: { label: "Lean gain", factor: 1.1 },
} as const;

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "Body Metrics — LIFT" },
      {
        name: "description",
        content: "Log bodyweight, waist and other measurements to track your fat-loss phase.",
      },
      { property: "og:title", content: "Body Metrics — LIFT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <BodyPage />
    </AppShell>
  ),
});

function buildChart(
  entries: { date: string; value: number }[],
  w = 560,
  h = 140,
): string {
  if (entries.length < 2) return "";
  const vals = entries.map((e) => e.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const padX = 8, padY = 14;
  return entries
    .map((e, i) => {
      const x = padX + (i * (w - padX * 2)) / Math.max(1, entries.length - 1);
      const y = padY + (1 - (e.value - min) / range) * (h - padY * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function BodyPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Measurement modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");

  // Body fat calculator
  const [sex, setSex] = useState<"male" | "female">("male");
  const [unit, setUnit] = useState<"cm" | "inch">("cm");
  const [height, setHeight] = useState("");
  const [neck, setNeck] = useState("");
  const [bfWaist, setBfWaist] = useState("");
  const [hip, setHip] = useState("");
  
  const [isSavingMetric, setIsSavingMetric] = useState(false);
  const [isSavingBf, setIsSavingBf] = useState(false);
  const [isSavingCals, setIsSavingCals] = useState(false);

  // Calorie calculator
  const [age, setAge] = useState("");
  const [activity, setActivity] = useState("1.55");
  const [goal, setGoal] = useState<keyof typeof GOALS>("cut");
  const [calculated, setCalculated] = useState<{
    bmr: number; tdee: number; targetCals: number; protein: number; fat: number; carbs: number;
  } | null>(null);

  // Chart state
  const [chartMetric, setChartMetric] = useState<"weight" | "waist">("weight");
  const [chartPeriod, setChartPeriod] = useState<"4w" | "3m" | "6m" | "1y">("3m");

  const { data } = useQuery({
    queryKey: ["metrics", user?.id],
    queryFn: () => fetchBodyMetrics(user!.id),
    enabled: !!user,
  });

  const rows = useMemo(() => [...(data ?? [])].reverse(), [data]);
  const weightEntries = useMemo(
    () => (data ?? []).filter((m) => m.weight_kg != null),
    [data],
  );
  const waistEntries = useMemo(
    () => (data ?? []).filter((m) => m.waist_cm != null),
    [data],
  );

  const latestWeight = weightEntries[weightEntries.length - 1];
  const latestWaist = waistEntries[waistEntries.length - 1];
  const latestBf = [...(data ?? [])].reverse().find((m) => m.body_fat_percent != null);
  const latestCal = [...(data ?? [])].reverse().find((m) => m.target_calories != null);

  function weightChange() {
    if (weightEntries.length < 2) return null;
    const latest = weightEntries[weightEntries.length - 1]!;
    const old = weightEntries[0]!;
    const delta = Math.round((latest.weight_kg! - old.weight_kg!) * 10) / 10;
    return delta;
  }

  function waistChange() {
    if (waistEntries.length < 2) return null;
    const latest = waistEntries[waistEntries.length - 1]!;
    const old = waistEntries[0]!;
    const delta = Math.round((latest.waist_cm! - old.waist_cm!) * 10) / 10;
    return delta;
  }

  const wDelta = weightChange();
  const waDelta = waistChange();

  // Build chart data
  const periodDays = { "4w": 28, "3m": 90, "6m": 180, "1y": 365 }[chartPeriod];
  const sourceEntries = chartMetric === "weight" ? weightEntries : waistEntries;
  const valueKey = chartMetric === "weight" ? "weight_kg" : "waist_cm";
  const latestTime = sourceEntries.length
    ? new Date(sourceEntries[sourceEntries.length - 1]!.measured_on).getTime()
    : 0;
  const chartFiltered = sourceEntries.filter(
    (e) => latestTime - new Date(e.measured_on).getTime() <= periodDays * 86400000,
  );
  const chartData = chartFiltered.map((e) => ({
    date: e.measured_on,
    value: (e[valueKey as keyof typeof e] as number) ?? 0,
  }));
  const chartPoints = buildChart(chartData);

  const hVal = unit === "inch" ? Number(height) * 2.54 : Number(height);
  const nVal = unit === "inch" ? Number(neck) * 2.54 : Number(neck);
  const wVal = unit === "inch" ? Number(bfWaist) * 2.54 : Number(bfWaist);
  const hipVal = unit === "inch" ? Number(hip) * 2.54 : Number(hip);

  const bodyFat = navyBodyFat({
    sex, height: hVal, neck: nVal, waist: wVal, hip: hipVal,
  });

  const calcWeight = Number(weightInput) || latestWeight?.weight_kg || 0;

  async function saveMetric() {
    if (!user) return;
    setIsSavingMetric(true);
    try {
      const { error } = editingId
        ? await supabase.from("body_metrics").update({
            weight_kg: weightInput ? Number(weightInput) : null,
            waist_cm: waistInput ? Number(waistInput) : null,
          }).eq("id", editingId)
        : await supabase.from("body_metrics").insert({
            user_id: user.id,
            measured_on: todayISO(),
            weight_kg: weightInput ? Number(weightInput) : null,
            waist_cm: waistInput ? Number(waistInput) : null,
          });
      if (error) { toast.error(error.message); return; }
      setWeightInput(""); setWaistInput("");
      toast.success(editingId ? "Measurement updated" : "Measurement saved");
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
      setModalOpen(false);
    } finally {
      setIsSavingMetric(false);
    }
  }

  function openAddMeasurement() {
    setEditingId(null);
    setWeightInput("");
    setWaistInput("");
    setModalOpen(true);
  }

  async function saveBodyFat() {
    if (!user || bodyFat == null) return;
    setIsSavingBf(true);
    try {
      const { error } = await supabase.from("body_metrics").insert({
        user_id: user.id, measured_on: todayISO(), body_fat_percent: bodyFat,
        height_cm: hVal, waist_cm: wVal,
      });
      if (error) { toast.error(error.message); return; }
      toast.success(`Body fat ${bodyFat}% saved`);
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
    } finally {
      setIsSavingBf(false);
    }
  }

  function calculateCalories() {
    if (calcWeight <= 0) { toast.error("Enter your bodyweight or save a measurement"); return; }
    const calcHeight = Number(height), calcAge = Number(age);
    if (bodyFat == null && (calcHeight <= 0 || calcAge <= 0)) {
      toast.error("Enter height and age, or calculate body fat above"); return;
    }
    const bmr = bodyFat != null
      ? 370 + 21.6 * (calcWeight * (1 - bodyFat / 100))
      : 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + (sex === "male" ? 5 : -161);
    const tdee = bmr * Number(activity);
    const targetCals = Math.round((tdee * GOALS[goal].factor) / 10) * 10;
    const protein = Math.round(calcWeight * 2);
    const fat = Math.round(calcWeight * 0.9);
    const carbs = Math.max(0, Math.round((targetCals - protein * 4 - fat * 9) / 4));
    setCalculated({ bmr, tdee, targetCals, protein, fat, carbs });
  }

  async function saveCalories() {
    if (!user || calculated == null) return;
    setIsSavingCals(true);
    try {
      const { error } = await supabase.from("body_metrics").insert({
        user_id: user.id, measured_on: todayISO(),
        weight_kg: calcWeight > 0 ? calcWeight : null,
        target_calories: calculated.targetCals,
      });
      if (error) { toast.error(error.message); return; }
      toast.success(`Target ${calculated.targetCals} kcal saved`);
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
    } finally {
      setIsSavingCals(false);
    }
  }

  const INPUT_STYLE = {
    height: 34, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)",
    background: "transparent", color: "inherit", padding: "0 10px", fontSize: 13,
  };
  const LABEL_STYLE = { fontSize: 12, color: "oklch(0.63 0.006 250)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em" }}>Body</h1>
        <button
          onClick={openAddMeasurement}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            height: 40, padding: "0 16px", borderRadius: 9, border: "none",
            background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
            fontSize: 14, fontWeight: 600, cursor: "pointer",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add measurement
        </button>
      </div>

      {/* Snapshot grid */}
      <div>
        <h2 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
          Current snapshot
        </h2>
        <div className="body-snapshot-grid">
          {[
            { label: "Weight", value: latestWeight?.weight_kg != null ? `${latestWeight.weight_kg} kg` : "—", change: wDelta != null ? `${wDelta > 0 ? "+" : ""}${wDelta} kg` : "no data", changeColor: wDelta != null && wDelta < 0 ? "oklch(0.78 0.15 145)" : "oklch(0.45 0.006 250)" },
            { label: "Waist", value: latestWaist?.waist_cm != null ? `${latestWaist.waist_cm} cm` : "—", change: waDelta != null ? `${waDelta > 0 ? "+" : ""}${waDelta} cm` : "no data", changeColor: waDelta != null && waDelta < 0 ? "oklch(0.78 0.15 145)" : "oklch(0.45 0.006 250)" },
            { label: "Body fat", value: latestBf?.body_fat_percent != null ? `${latestBf.body_fat_percent}%` : "—", change: "US Navy estimate", changeColor: "oklch(0.45 0.006 250)" },
            { label: "Daily calories", value: latestCal?.target_calories != null ? `${latestCal.target_calories} kcal` : "—", change: "target", changeColor: "oklch(0.45 0.006 250)" },
          ].map(({ label, value, change, changeColor }) => (
            <div key={label} style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
              <p style={{ margin: 0, fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{label}</p>
              <p style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: changeColor }}>{change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Weight / Waist toggle */}
          <div style={{ display: "flex", borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", padding: 2 }}>
            {(["weight", "waist"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                style={{
                  borderRadius: 6, padding: "5px 14px", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                  background: chartMetric === m ? "oklch(0.22 0.005 250)" : "transparent",
                  color: chartMetric === m ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                }}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
          {/* Period buttons */}
          <div style={{ display: "flex", gap: 6 }}>
            {(["4w", "3m", "6m", "1y"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setChartPeriod(p)}
                style={{
                  height: 28, padding: "0 12px", borderRadius: 7,
                  border: `1px solid ${chartPeriod === p ? "oklch(0.96 0.002 250)" : "oklch(0.27 0.005 250)"}`,
                  background: chartPeriod === p ? "oklch(0.22 0.005 250)" : "transparent",
                  color: chartPeriod === p ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {chartData.length >= 2 ? (
          <div style={{ marginTop: 20 }}>
            <svg viewBox="0 0 560 140" width="100%" height="140">
              <polyline
                points={chartPoints}
                fill="none"
                stroke="oklch(0.92 0.25 110)"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "oklch(0.45 0.006 250)", marginTop: 6 }}>
              <span>{chartData[0]?.date}</span>
              <span>{chartData[chartData.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <p style={{ margin: "32px 0", textAlign: "center", fontSize: 13, color: "oklch(0.45 0.006 250)" }}>
            Not enough logged data for this range yet.
          </p>
        )}
      </div>

      {/* Body fat estimate */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Body fat estimate</h2>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", padding: 2 }}>
              {(["cm", "inch"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  style={{
                    borderRadius: 6, padding: "4px 12px", fontSize: 12, textTransform: "lowercase",
                    border: "none", cursor: "pointer",
                    background: unit === u ? "oklch(0.22 0.005 250)" : "transparent",
                    color: unit === u ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                  }}
                >
                  {u}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", padding: 2 }}>
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  style={{
                    borderRadius: 6, padding: "4px 12px", fontSize: 12, textTransform: "capitalize",
                    border: "none", cursor: "pointer",
                    background: sex === s ? "oklch(0.22 0.005 250)" : "transparent",
                    color: sex === s ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 24 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { label: "Height", value: height, set: setHeight },
              { label: "Neck", value: neck, set: setNeck },
              { label: "Waist", value: bfWaist, set: setBfWaist },
              ...(sex === "female" ? [{ label: "Hip", value: hip, set: setHip }] : []),
            ].map(({ label, value, set }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 6, width: 88 }}>
                <label style={LABEL_STYLE}>{label} ({unit})</label>
                <input inputMode="decimal" value={value} onChange={(e) => set(e.target.value)} style={INPUT_STYLE} />
              </div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 160, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 16 }}>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>US Navy estimate</p>
              <p style={{ margin: "2px 0 0", fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {bodyFat != null ? `${bodyFat}%` : "—"}
              </p>
            </div>
            <button
              onClick={saveBodyFat}
              disabled={isSavingBf || bodyFat == null}
              style={{
                height: 40, borderRadius: 8, border: "none", background: "oklch(0.92 0.25 110)",
                color: "oklch(0.07 0.01 110)", fontSize: 14, fontWeight: 600, cursor: isSavingBf || bodyFat == null ? "not-allowed" : "pointer",
                opacity: isSavingBf || bodyFat == null ? 0.7 : 1
              }}
            >
              {isSavingBf ? "Saving..." : bodyFat != null ? `Save ${bodyFat}% body fat to log` : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Calorie calculator */}
      <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Daily calorie target</h2>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
          {bodyFat != null ? "Katch-McArdle (using your body fat estimate above)." : "Mifflin-St Jeor — fill height above and your age below."}
        </p>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 88 }}>
            <label style={LABEL_STYLE}>Age</label>
            <input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} style={INPUT_STYLE} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LABEL_STYLE}>Activity</label>
            <select
              value={activity} onChange={(e) => setActivity(e.target.value)}
              style={{ ...INPUT_STYLE, background: "oklch(0.045 0.003 250)" }}
            >
              <option value="1.2">Sedentary</option>
              <option value="1.375">Light (1-3 days)</option>
              <option value="1.55">Moderate (3-5 days)</option>
              <option value="1.725">High (6-7 days)</option>
              <option value="1.9">Very high</option>
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={LABEL_STYLE}>Goal</label>
            <select
              value={goal} onChange={(e) => setGoal(e.target.value as keyof typeof GOALS)}
              style={{ ...INPUT_STYLE, background: "oklch(0.045 0.003 250)" }}
            >
              <option value="cut">Fat loss</option>
              <option value="recomp">Slow cut / recomp</option>
              <option value="maintain">Maintain</option>
              <option value="bulk">Lean gain</option>
            </select>
          </div>
          <button
            onClick={calculateCalories}
            style={{
              height: 34, padding: "0 16px", borderRadius: 8, border: "none",
              background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            Calculate
          </button>
        </div>

        {calculated && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid oklch(0.27 0.005 250)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24 }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>{GOALS[goal].label} target</p>
              <p style={{ margin: "2px 0 0", fontSize: 28, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{calculated.targetCals} kcal</p>
            </div>
            {[
              { label: "Protein", value: `${calculated.protein} g` },
              { label: "Fat", value: `${calculated.fat} g` },
              { label: "Carbs", value: `${calculated.carbs} g` },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 16, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</p>
              </div>
            ))}
            <div style={{ flex: 1, minWidth: 120, textAlign: "right" }}>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
                Maintenance ≈ {Math.round(calculated.tdee / 10) * 10} kcal
              </p>
              <button
                onClick={saveCalories}
                style={{
                  height: 32, padding: "0 14px", borderRadius: 8,
                  border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit",
                  fontSize: 12, fontWeight: 500, cursor: "pointer",
                }}
              >
                Save target
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Measurement history */}
      <div>
        <h2 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "oklch(0.63 0.006 250)" }}>
          Measurement history
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rows.map((m, index) => {
            const isLatest = index === 0; // Assuming rows are sorted descending by date
            const parts = [];
            if (m.weight_kg) parts.push(`${m.weight_kg} kg`);
            if (m.waist_cm) parts.push(`waist ${m.waist_cm} cm`);
            if (m.body_fat_percent) parts.push(`${m.body_fat_percent}% bf`);
            if (m.target_calories) parts.push(`${m.target_calories} kcal`);
            const summary = parts.length > 0 ? parts.join(" · ") : "—";
            
            return (
              <div key={m.id} style={{
                background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)",
                borderRadius: 10, padding: "14px 16px",
                display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 14,
              }}>
                <span style={{ color: "oklch(0.63 0.006 250)" }}>{m.measured_on}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontVariantNumeric: "tabular-nums" }}>{summary}</span>
                  {isLatest && (
                    <button
                      onClick={() => {
                        setEditingId(m.id);
                        setWeightInput(m.weight_kg ? String(m.weight_kg) : "");
                        setWaistInput(m.waist_cm ? String(m.waist_cm) : "");
                        setModalOpen(true);
                      }}
                      style={{ fontSize: 12, fontWeight: 500, color: "oklch(0.92 0.25 110)", background: "transparent", border: "none", cursor: "pointer", padding: 2 }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>No measurements yet. Add one above.</p>
          )}
        </div>
      </div>

      {/* Add measurement modal */}
      {modalOpen && typeof document !== 'undefined' && createPortal(
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: 380, background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 12, padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{editingId ? "Edit measurement" : "Add measurement"}</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: "transparent", border: "none", color: "oklch(0.63 0.006 250)", cursor: "pointer", padding: 4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13 }}>Bodyweight (kg)</label>
                <input
                  inputMode="decimal" value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                  style={{ height: 38, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", padding: "0 12px", fontSize: 14 }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label style={{ fontSize: 13 }}>Waist (cm)</label>
                <input
                  inputMode="decimal" value={waistInput} onChange={(e) => setWaistInput(e.target.value)}
                  style={{ height: 38, borderRadius: 8, border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit", padding: "0 12px", fontSize: 14 }}
                />
              </div>
            </div>
            <button
              onClick={saveMetric}
              disabled={isSavingMetric}
              style={{
                marginTop: 20, width: "100%", height: 40, borderRadius: 9, border: "none",
                background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
                fontSize: 14, fontWeight: 600, cursor: isSavingMetric ? "wait" : "pointer",
                opacity: isSavingMetric ? 0.7 : 1
              }}
            >
              {isSavingMetric ? "Saving..." : editingId ? "Save changes" : "Save measurement"}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
