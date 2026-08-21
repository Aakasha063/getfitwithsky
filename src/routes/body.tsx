import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { LineChart } from "@/components/LineChart";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchProfile } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/format";
import { navyBodyFat } from "@/lib/bodyFat";
import { GOALS } from "@/lib/goals";
import { calculateCalorieTarget } from "@/lib/calories";

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "Body Metrics — Skido" },
      {
        name: "description",
        content: "Log bodyweight, waist and other measurements to track your fat-loss phase.",
      },
      { property: "og:title", content: "Body Metrics — Skido" },
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

function BodyPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  // Measurement modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState("");
  const [waistInput, setWaistInput] = useState("");
  const [metricRowsExpanded, setMetricRowsExpanded] = useState(false);

  // Body fat + calorie calculators — shared inputs, each surfaced in its own modal
  const [bodyFatModalOpen, setBodyFatModalOpen] = useState(false);
  const [calorieModalOpen, setCalorieModalOpen] = useState(false);
  const [sex, setSex] = useState<"male" | "female">("male");
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
    bmr: number;
    tdee: number;
    targetCals: number;
    protein: number;
    fat: number;
    carbs: number;
  } | null>(null);

  // Chart state
  const [chartMetric, setChartMetric] = useState<"weight" | "waist">("weight");
  const [chartPeriod, setChartPeriod] = useState<"4w" | "3m" | "6m" | "1y">("3m");

  const { data } = useQuery({
    queryKey: ["metrics", user?.id],
    queryFn: () => fetchBodyMetrics(user!.id),
    enabled: !!user,
  });
  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchProfile(user!.id),
    enabled: !!user,
  });

  const rows = useMemo(() => [...(data ?? [])].reverse(), [data]);
  const VISIBLE_METRIC_ROWS = 3;
  const visibleRows = metricRowsExpanded ? rows : rows.slice(0, VISIBLE_METRIC_ROWS);
  const hasMoreRows = rows.length > VISIBLE_METRIC_ROWS;
  const weightEntries = useMemo(() => (data ?? []).filter((m) => m.weight_kg != null), [data]);
  const waistEntries = useMemo(() => (data ?? []).filter((m) => m.waist_cm != null), [data]);

  const latestWeight = weightEntries[weightEntries.length - 1];
  const latestWaist = waistEntries[waistEntries.length - 1];
  const latestBf = [...(data ?? [])].reverse().find((m) => m.body_fat_percent != null);
  const latestCal = [...(data ?? [])].reverse().find((m) => m.target_calories != null);
  const latestNeck = [...(data ?? [])].reverse().find((m) => m.neck_cm != null);
  const latestHip = [...(data ?? [])].reverse().find((m) => m.hip_cm != null);

  // Pre-fill the calculators once from whatever onboarding/previous measurements already
  // saved, so returning users don't have to retype everything. Only runs once per data
  // load so it doesn't clobber values the user is actively editing.
  const prefilled = useRef(false);
  useEffect(() => {
    if (prefilled.current || !profile) return;
    prefilled.current = true;
    if (profile.sex === "male" || profile.sex === "female") setSex(profile.sex);
    if (profile.height_cm) setHeight(String(profile.height_cm));
    if (profile.activity_level) setActivity(String(profile.activity_level));
    if (profile.primary_goal && profile.primary_goal in GOALS) {
      setGoal(profile.primary_goal as keyof typeof GOALS);
    }
    if (profile.date_of_birth) {
      const ageNow = Math.floor(
        (Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 86400000),
      );
      setAge(String(ageNow));
    }
    if (latestWaist?.waist_cm) setBfWaist(String(latestWaist.waist_cm));
    if (latestNeck?.neck_cm) setNeck(String(latestNeck.neck_cm));
    if (latestHip?.hip_cm) setHip(String(latestHip.hip_cm));
  }, [profile, latestWaist, latestNeck, latestHip]);

  function weightChange() {
    if (weightEntries.length < 2) return null;
    const latest = weightEntries[weightEntries.length - 1]!;
    const old = weightEntries[0]!;
    return Math.round((latest.weight_kg! - old.weight_kg!) * 10) / 10;
  }

  function waistChange() {
    if (waistEntries.length < 2) return null;
    const latest = waistEntries[waistEntries.length - 1]!;
    const old = waistEntries[0]!;
    return Math.round((latest.waist_cm! - old.waist_cm!) * 10) / 10;
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

  const hVal = Number(height);
  const nVal = Number(neck);
  const wVal = Number(bfWaist);
  const hipVal = Number(hip);

  const bodyFat = navyBodyFat({ sex, height: hVal, neck: nVal, waist: wVal, hip: hipVal });

  const calcWeight = Number(weightInput) || latestWeight?.weight_kg || 0;

  const bodyFatSummary =
    latestBf?.body_fat_percent != null ? `${latestBf.body_fat_percent}%` : "Not calculated yet";
  const calorieSummary =
    latestCal?.target_calories != null
      ? `Target: ${latestCal.target_calories} kcal`
      : "Not calculated yet";

  async function saveMetric() {
    if (!user) return;
    setIsSavingMetric(true);
    try {
      const { error } = editingId
        ? await supabase
            .from("body_metrics")
            .update({
              weight_kg: weightInput ? Number(weightInput) : null,
              waist_cm: waistInput ? Number(waistInput) : null,
            })
            .eq("id", editingId)
        : await supabase.from("body_metrics").insert({
            user_id: user.id,
            measured_on: todayISO(),
            weight_kg: weightInput ? Number(weightInput) : null,
            waist_cm: waistInput ? Number(waistInput) : null,
          });
      if (error) {
        toast.error(error.message);
        return;
      }
      setWeightInput("");
      setWaistInput("");
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
        user_id: user.id,
        measured_on: todayISO(),
        body_fat_percent: bodyFat,
        height_cm: hVal,
        waist_cm: wVal,
        neck_cm: nVal || null,
        hip_cm: sex === "female" ? hipVal || null : null,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Body fat ${bodyFat}% saved`);
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
      setBodyFatModalOpen(false);
    } finally {
      setIsSavingBf(false);
    }
  }

  function calculateCalories() {
    if (calcWeight <= 0) {
      toast.error("Enter your bodyweight or save a measurement");
      return;
    }
    const calcHeight = Number(height),
      calcAge = Number(age);
    if (bodyFat == null && (calcHeight <= 0 || calcAge <= 0)) {
      toast.error("Enter height and age, or calculate body fat first");
      return;
    }
    setCalculated(
      calculateCalorieTarget({
        weightKg: calcWeight,
        heightCm: calcHeight,
        age: calcAge,
        sex,
        activityFactor: Number(activity),
        goal,
        bodyFatPercent: bodyFat,
      }),
    );
  }

  async function saveCalories() {
    if (!user || calculated == null) return;
    setIsSavingCals(true);
    try {
      const { error } = await supabase.from("body_metrics").insert({
        user_id: user.id,
        measured_on: todayISO(),
        weight_kg: calcWeight > 0 ? calcWeight : null,
        target_calories: calculated.targetCals,
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(`Target ${calculated.targetCals} kcal saved`);
      qc.invalidateQueries({ queryKey: ["metrics", user.id] });
      setCalorieModalOpen(false);
    } finally {
      setIsSavingCals(false);
    }
  }

  const INPUT_STYLE = {
    height: 34,
    borderRadius: 8,
    border: "1px solid oklch(0.27 0.005 250)",
    background: "transparent",
    color: "inherit",
    padding: "0 10px",
    fontSize: 13,
  };
  const LABEL_STYLE = { fontSize: 12, color: "oklch(0.63 0.006 250)" };

  const calorieMethodLabel =
    bodyFat != null
      ? "Katch-McArdle (using your body fat estimate)."
      : "Mifflin-St Jeor — fill height and age below.";

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Inter'",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Body
        </h1>
        <button
          onClick={openAddMeasurement}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 16px",
            borderRadius: 9,
            border: "none",
            background: "oklch(0.92 0.25 110)",
            color: "oklch(0.07 0.01 110)",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add measurement
        </button>
      </div>

      {/* Snapshot grid */}
      <div>
        <h2
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Current snapshot
        </h2>
        <div className="body-snapshot-grid">
          {[
            {
              label: "Weight",
              value: latestWeight?.weight_kg != null ? `${latestWeight.weight_kg} kg` : "—",
              change: wDelta != null ? `${wDelta > 0 ? "+" : ""}${wDelta} kg` : "no data",
              changeColor:
                wDelta != null && wDelta < 0 ? "oklch(0.78 0.15 145)" : "oklch(0.45 0.006 250)",
            },
            {
              label: "Waist",
              value: latestWaist?.waist_cm != null ? `${latestWaist.waist_cm} cm` : "—",
              change: waDelta != null ? `${waDelta > 0 ? "+" : ""}${waDelta} cm` : "no data",
              changeColor:
                waDelta != null && waDelta < 0 ? "oklch(0.78 0.15 145)" : "oklch(0.45 0.006 250)",
            },
            {
              label: "Body fat",
              value: latestBf?.body_fat_percent != null ? `${latestBf.body_fat_percent}%` : "—",
              change: "US Navy estimate",
              changeColor: "oklch(0.45 0.006 250)",
            },
            {
              label: "Daily calories",
              value: latestCal?.target_calories != null ? `${latestCal.target_calories} kcal` : "—",
              change: "target",
              changeColor: "oklch(0.45 0.006 250)",
            },
          ].map(({ label, value, change, changeColor }) => (
            <div
              key={label}
              style={{
                background: "oklch(0.11 0.004 250)",
                border: "1px solid oklch(0.27 0.005 250)",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "oklch(0.63 0.006 250)" }}>{label}</p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 28,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value}
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: changeColor }}>{change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          {/* Weight / Waist toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)",
              padding: 2,
            }}
          >
            {(["weight", "waist"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                style={{
                  borderRadius: 6,
                  padding: "5px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  border: "none",
                  cursor: "pointer",
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
                  height: 28,
                  padding: "0 12px",
                  borderRadius: 7,
                  border: `1px solid ${chartPeriod === p ? "oklch(0.96 0.002 250)" : "oklch(0.27 0.005 250)"}`,
                  background: chartPeriod === p ? "oklch(0.22 0.005 250)" : "transparent",
                  color: chartPeriod === p ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <LineChart
            data={chartData}
            unit={chartMetric === "weight" ? "kg" : "cm"}
            height={140}
            emptyMessage="Not enough logged data for this range yet."
          />
        </div>
      </div>

      {/* Body fat estimate — compact row, opens calculator modal */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Body fat estimate</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
            US Navy method · {bodyFatSummary}
          </p>
        </div>
        <button
          onClick={() => setBodyFatModalOpen(true)}
          style={{
            flexShrink: 0,
            height: 34,
            padding: "0 14px",
            borderRadius: 8,
            border: "1px solid oklch(0.27 0.005 250)",
            background: "transparent",
            color: "inherit",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Check body fat
        </button>
      </div>

      {/* Daily calorie target — compact row, opens calculator modal */}
      <div
        style={{
          background: "oklch(0.11 0.004 250)",
          border: "1px solid oklch(0.27 0.005 250)",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>Daily calorie target</h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
            {calorieSummary}
          </p>
        </div>
        <button
          onClick={() => setCalorieModalOpen(true)}
          style={{
            flexShrink: 0,
            height: 34,
            padding: "0 14px",
            borderRadius: 8,
            border: "1px solid oklch(0.27 0.005 250)",
            background: "transparent",
            color: "inherit",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Calculate
        </button>
      </div>

      {/* Body fat modal */}
      {bodyFatModalOpen && (
        <BottomSheet title="Body fat estimate" onClose={() => setBodyFatModalOpen(false)}>
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)",
              padding: 2,
              width: "fit-content",
            }}
          >
            {(["male", "female"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSex(s)}
                style={{
                  borderRadius: 6,
                  padding: "4px 12px",
                  fontSize: 12,
                  textTransform: "capitalize",
                  border: "none",
                  cursor: "pointer",
                  background: sex === s ? "oklch(0.22 0.005 250)" : "transparent",
                  color: sex === s ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { label: "Height", value: height, set: setHeight },
                { label: "Neck", value: neck, set: setNeck },
                { label: "Waist", value: bfWaist, set: setBfWaist },
                ...(sex === "female" ? [{ label: "Hip", value: hip, set: setHip }] : []),
              ].map(({ label, value, set }) => (
                <div
                  key={label}
                  style={{ display: "flex", flexDirection: "column", gap: 6, width: 88 }}
                >
                  <label style={LABEL_STYLE}>{label}</label>
                  <input
                    inputMode="decimal"
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingTop: 12,
                borderTop: "1px solid oklch(0.27 0.005 250)",
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>
                  US Navy estimate
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 30,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {bodyFat != null ? `${bodyFat}%` : "—"}
                </p>
              </div>
              <button
                onClick={saveBodyFat}
                disabled={isSavingBf || bodyFat == null}
                style={{
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 8,
                  border: "1px solid oklch(0.27 0.005 250)",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: isSavingBf || bodyFat == null ? "not-allowed" : "pointer",
                  opacity: isSavingBf || bodyFat == null ? 0.7 : 1,
                  whiteSpace: "nowrap",
                }}
              >
                {isSavingBf ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </BottomSheet>
      )}

      {/* Calorie modal */}
      {calorieModalOpen && (
        <BottomSheet title="Daily calorie target" onClose={() => setCalorieModalOpen(false)}>
          <p style={{ margin: "0 0 16px", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
            {calorieMethodLabel}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 88 }}>
              <label style={LABEL_STYLE}>Height (cm)</label>
              <input
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, width: 88 }}>
              <label style={LABEL_STYLE}>Age</label>
              <input
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={INPUT_STYLE}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={LABEL_STYLE}>Activity</label>
              <select
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
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
                value={goal}
                onChange={(e) => setGoal(e.target.value as keyof typeof GOALS)}
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
                height: 34,
                padding: "0 16px",
                borderRadius: 8,
                border: "none",
                background: "oklch(0.92 0.25 110)",
                color: "oklch(0.07 0.01 110)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Calculate
            </button>
          </div>

          {calculated && (
            <div
              style={{
                marginTop: 20,
                paddingTop: 20,
                borderTop: "1px solid oklch(0.27 0.005 250)",
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 24,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>
                  {GOALS[goal].label} target
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 28,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {calculated.targetCals} kcal
                </p>
              </div>
              {[
                { label: "Protein", value: `${calculated.protein} g` },
                { label: "Fat", value: `${calculated.fat} g` },
                { label: "Carbs", value: `${calculated.carbs} g` },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ margin: 0, fontSize: 11, color: "oklch(0.45 0.006 250)" }}>{label}</p>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 16,
                      fontWeight: 600,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
              <div style={{ flex: 1, minWidth: 120, textAlign: "right" }}>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "oklch(0.45 0.006 250)" }}>
                  Maintenance ≈ {Math.round(calculated.tdee / 10) * 10} kcal
                </p>
                <button
                  onClick={saveCalories}
                  disabled={isSavingCals}
                  style={{
                    height: 32,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: "1px solid oklch(0.27 0.005 250)",
                    background: "transparent",
                    color: "inherit",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: isSavingCals ? "wait" : "pointer",
                    opacity: isSavingCals ? 0.7 : 1,
                  }}
                >
                  {isSavingCals ? "Saving..." : "Save target"}
                </button>
              </div>
            </div>
          )}
        </BottomSheet>
      )}

      {/* Measurement history */}
      <div>
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: 13,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Measurement history
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {visibleRows.map((m, index) => {
            const isLatest = index === 0; // Assuming rows are sorted descending by date
            const parts = [];
            if (m.weight_kg) parts.push(`${m.weight_kg} kg`);
            if (m.waist_cm) parts.push(`waist ${m.waist_cm} cm`);
            if (m.body_fat_percent) parts.push(`${m.body_fat_percent}% bf`);
            if (m.target_calories) parts.push(`${m.target_calories} kcal`);
            const summary = parts.length > 0 ? parts.join(" · ") : "—";

            return (
              <div
                key={m.id}
                style={{
                  background: "oklch(0.11 0.004 250)",
                  border: "1px solid oklch(0.27 0.005 250)",
                  borderRadius: 10,
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 14,
                }}
              >
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
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: "oklch(0.92 0.25 110)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        padding: 2,
                      }}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {rows.length === 0 && (
            <p style={{ fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
              No measurements yet. Add one above.
            </p>
          )}
        </div>
        {hasMoreRows && (
          <button
            onClick={() => setMetricRowsExpanded((v) => !v)}
            style={{
              marginTop: 12,
              width: "100%",
              height: 36,
              borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)",
              background: "transparent",
              color: "inherit",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {metricRowsExpanded ? "Show less" : `Show all ${rows.length} measurements`}
          </button>
        )}
      </div>

      {/* Add measurement modal */}
      {modalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 50,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
              overflowY: "auto",
            }}
            onClick={() => setModalOpen(false)}
          >
            <div
              style={{
                width: "100%",
                maxWidth: 380,
                maxHeight: "calc(100dvh - 40px)",
                overflowY: "auto",
                background: "oklch(0.11 0.004 250)",
                border: "1px solid oklch(0.27 0.005 250)",
                borderRadius: 12,
                padding: 24,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
              >
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>
                  {editingId ? "Edit measurement" : "Add measurement"}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "oklch(0.63 0.006 250)",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13 }}>Bodyweight (kg)</label>
                  <input
                    inputMode="decimal"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    style={{
                      height: 38,
                      borderRadius: 8,
                      border: "1px solid oklch(0.27 0.005 250)",
                      background: "transparent",
                      color: "inherit",
                      padding: "0 12px",
                      fontSize: 14,
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13 }}>Waist (cm)</label>
                  <input
                    inputMode="decimal"
                    value={waistInput}
                    onChange={(e) => setWaistInput(e.target.value)}
                    style={{
                      height: 38,
                      borderRadius: 8,
                      border: "1px solid oklch(0.27 0.005 250)",
                      background: "transparent",
                      color: "inherit",
                      padding: "0 12px",
                      fontSize: 14,
                    }}
                  />
                </div>
              </div>
              <button
                onClick={saveMetric}
                disabled={isSavingMetric}
                style={{
                  marginTop: 20,
                  width: "100%",
                  height: 40,
                  borderRadius: 9,
                  border: "none",
                  background: "oklch(0.92 0.25 110)",
                  color: "oklch(0.07 0.01 110)",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSavingMetric ? "wait" : "pointer",
                  opacity: isSavingMetric ? 0.7 : 1,
                }}
              >
                {isSavingMetric ? "Saving..." : editingId ? "Save changes" : "Save measurement"}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

function BottomSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          background: "oklch(0.08 0.004 250)",
          borderTop: "1px solid oklch(0.27 0.005 250)",
          borderRadius: "16px 16px 0 0",
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "oklch(0.63 0.006 250)",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
