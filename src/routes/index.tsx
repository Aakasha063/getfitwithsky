import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchBodyMetrics, fetchDays, fetchHistory, fetchPRs } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIFT" },
      {
        name: "description",
        content:
          "Your daily training dashboard: today's session, weekly split, recent PRs and bodyweight trend for the V-taper fat-loss block.",
      },
      { property: "og:title", content: "LIFT" },
      {
        property: "og:description",
        content: "Your daily training dashboard: today's session, weekly split, recent PRs and bodyweight trend for the V-taper fat-loss block.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Dashboard() {
  const { user } = useAuth();
  const { data: days } = useQuery({ queryKey: ["days"], queryFn: fetchDays });
  const { data: history } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });
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

  const dow = new Date().getDay();
  const today = (days ?? []).find((d) => d.day_of_week === dow && !d.is_optional);
  const optional = (days ?? []).filter((d) => d.is_optional);
  const latestWeight = [...(metrics ?? [])].reverse().find((m) => m.weight_kg)?.weight_kg;
  const completed = (history ?? []).filter((s) => s.status === "completed").length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-3xl font-semibold">
          {today?.is_rest ? "Rest day" : (today?.focus ?? "Today")}
        </h1>
      </div>

      {today && !today.is_rest ? (
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">{today.name}</p>
          <h2 className="mt-1 text-xl font-semibold">{today.focus}</h2>
          {today.cardio_note && (
            <p className="mt-2 text-sm text-muted-foreground">Cardio: {today.cardio_note}</p>
          )}
          <Link to="/workout/$slug" params={{ slug: today.slug }}>
            <Button className="mt-4">
              Start workout <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-5">
          <h2 className="text-lg font-semibold">Recovery day</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Easy walking, light mobility, stretching. No hard training, no HIIT.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {optional.map((d) => (
              <Link key={d.id} to="/workout/$slug" params={{ slug: d.slug }}>
                <Button variant="outline" size="sm">
                  {d.focus?.replace("Optional Specialization: ", "")}
                </Button>
              </Link>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Sessions done</p>
          <p className="num mt-1 text-2xl font-semibold">{completed}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Bodyweight</p>
          <p className="num mt-1 text-2xl font-semibold">{latestWeight ? `${latestWeight} kg` : "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">PRs</p>
          <p className="num mt-1 text-2xl font-semibold">{prs?.length ?? 0}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-base font-medium">This week</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(days ?? [])
            .filter((d) => !d.is_optional)
            .map((d) => (
              <Card key={d.id} className="flex items-center justify-between p-3 text-sm">
                <span>
                  <span className="font-medium">{d.name}</span>
                  <span className="text-muted-foreground"> — {d.is_rest ? "Rest" : d.focus}</span>
                </span>
                {!d.is_rest && (
                  <Link
                    to="/workout/$slug"
                    params={{ slug: d.slug }}
                    className="text-xs text-primary hover:underline"
                  >
                    Open
                  </Link>
                )}
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
