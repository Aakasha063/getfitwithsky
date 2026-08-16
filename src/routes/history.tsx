import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchHistory } from "@/lib/api";
import { fmtDuration } from "@/lib/format";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Workout History — LIFT" },
      { name: "description", content: "Every logged training session with duration and status." },
      { property: "og:title", content: "Workout History — LIFT" },
      { property: "og:description", content: "Every logged training session." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <HistoryPage />
    </AppShell>
  ),
});

const PRESETS = [
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "All", days: 0 },
] as const;

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function HistoryPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return (data ?? []).filter((s) => {
      if (from && s.session_date < from) return false;
      if (to && s.session_date > to) return false;
      return true;
    });
  }, [data, from, to]);

  const totalMinutes = Math.round(
    filtered.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60,
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold">History</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {filtered.length} session{filtered.length === 1 ? "" : "s"} · {totalMinutes} min trained
      </p>

      <Card className="mt-5 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="from" className="text-xs">From</Label>
            <Input
              id="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="to" className="text-xs">To</Label>
            <Input
              id="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-[150px]"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                size="sm"
                variant="outline"
                onClick={() => {
                  setTo("");
                  setFrom(p.days ? isoDaysAgo(p.days) : "");
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-2">
        {filtered.map((s) => (
          <Link key={s.id} to="/history/$id" params={{ id: s.id }} className="block">
            <Card className="flex items-center justify-between p-4 transition-colors hover:border-primary/50">
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.session_date}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-muted-foreground">
                  <p className="num">{fmtDuration(s.duration_seconds)}</p>
                  <p className="text-xs capitalize">{s.status.replace("_", " ")}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">No sessions in this range.</p>
        )}
      </div>
    </div>
  );
}
