import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { todayISO } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

export const Route = createFileRoute("/body")({
  head: () => ({
    meta: [
      { title: "Body Metrics — LIFT" },
      {
        name: "description",
        content: "Log bodyweight, waist and other measurements to track your fat-loss phase.",
      },
      { property: "og:title", content: "Body Metrics — LIFT" },
      { property: "og:description", content: "Track bodyweight and measurements over time." },
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
  const [weight, setWeight] = useState("");
  const [waist, setWaist] = useState("");

  const { data } = useQuery({
    queryKey: ["metrics", user?.id],
    queryFn: () => fetchBodyMetrics(user!.id),
    enabled: !!user,
  });

  async function save() {
    if (!user) return;
    const { error } = await supabase.from("body_metrics").insert({
      user_id: user.id,
      measured_on: todayISO(),
      weight_kg: weight ? Number(weight) : null,
      waist_cm: waist ? Number(waist) : null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setWeight("");
    setWaist("");
    toast.success("Measurement saved");
    qc.invalidateQueries({ queryKey: ["metrics", user.id] });
  }

  const rows = [...(data ?? [])].reverse();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Body metrics</h1>
      <Card className="mt-6 p-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="w">Bodyweight (kg)</Label>
            <Input id="w" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">Waist (cm)</Label>
            <Input id="wa" inputMode="decimal" value={waist} onChange={(e) => setWaist(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button className="w-full" onClick={save}>
              Save
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-6 space-y-2">
        {rows.map((m) => (
          <Card key={m.id} className="flex items-center justify-between p-4 text-sm">
            <span className="text-muted-foreground">{m.measured_on}</span>
            <span className="num">
              {m.weight_kg ? `${m.weight_kg} kg` : "—"}
              {m.waist_cm ? ` · waist ${m.waist_cm} cm` : ""}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}