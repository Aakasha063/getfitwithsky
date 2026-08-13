import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchExerciseHistory, fetchExercises, fetchPRs } from "@/lib/api";
import { epley1RM } from "@/lib/format";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress & PRs — V-Taper Log" },
      {
        name: "description",
        content: "Strength trends, estimated 1RM charts, bodyweight trend and personal records.",
      },
      { property: "og:title", content: "Progress & PRs — V-Taper Log" },
      { property: "og:description", content: "Strength trends and personal records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <ProgressPage />
    </AppShell>
  ),
});

function ProgressPage() {
  const { user } = useAuth();
  const [exerciseId, setExerciseId] = useState<string>("");

  const { data: exercises } = useQuery({ queryKey: ["exercises"], queryFn: fetchExercises });
  const { data: prs } = useQuery({
    queryKey: ["prs", user?.id],
    queryFn: () => fetchPRs(user!.id),
    enabled: !!user,
  });
  const { data: metrics } = useQuery({
    queryKey: ["metrics", user?.id],
    queryFn: () => fetchBodyMetrics(user!.id),
    enabled: !!user,
  });
  const { data: sets } = useQuery({
    queryKey: ["ex-history", user?.id, exerciseId],
    queryFn: () => fetchExerciseHistory(user!.id, exerciseId),
    enabled: !!user && !!exerciseId,
  });

  const strength = Object.values(
    (sets ?? []).reduce<Record<string, { date: string; e1rm: number }>>((acc, s) => {
      if (!s.weight_kg || !s.reps) return acc;
      const date = s.performed_at.slice(0, 10);
      const value = Math.round(epley1RM(s.weight_kg, s.reps) * 10) / 10;
      if (!acc[date] || acc[date]!.e1rm < value) acc[date] = { date, e1rm: value };
      return acc;
    }, {}),
  );

  const weightSeries = (metrics ?? [])
    .filter((m) => m.weight_kg)
    .map((m) => ({ date: m.measured_on, weight: m.weight_kg }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Progress</h1>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-medium">Strength trend (est. 1RM)</h2>
          <Select value={exerciseId} onValueChange={setExerciseId}>
            <SelectTrigger className="w-60">
              <SelectValue placeholder="Choose an exercise" />
            </SelectTrigger>
            <SelectContent>
              {(exercises ?? []).map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-4 h-56">
          {strength.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strength}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="e1rm" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-16 text-center text-sm text-muted-foreground">
              Log this exercise a couple of times to see the trend.
            </p>
          )}
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-base font-medium">Bodyweight</h2>
        <div className="mt-4 h-56">
          {weightSeries.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="pt-16 text-center text-sm text-muted-foreground">
              Add a couple of bodyweight entries to see the trend.
            </p>
          )}
        </div>
      </Card>

      <div>
        <h2 className="text-base font-medium">Personal records</h2>
        <div className="mt-3 space-y-2">
          {(prs ?? []).map((pr) => (
            <Card key={pr.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium">{pr.exercises?.name ?? "Exercise"}</p>
                <p className="text-xs text-muted-foreground">
                  {pr.achieved_on} · {pr.record_type === "volume" ? "Volume PR" : "Strength PR"}
                </p>
              </div>
              <span className="num">
                {pr.record_type === "volume"
                  ? `${Math.round(pr.volume_kg ?? 0)} kg`
                  : `${pr.weight_kg} kg × ${pr.reps}`}
              </span>
            </Card>
          ))}
          {prs?.length === 0 && (
            <p className="text-sm text-muted-foreground">No PRs yet — finish a session to set some.</p>
          )}
        </div>
      </div>
    </div>
  );
}