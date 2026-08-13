import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { fetchDays } from "@/lib/api";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/plan")({
  head: () => ({
    meta: [
      { title: "Training Plan — V-Taper Block" },
      {
        name: "description",
        content:
          "The full weekly V-taper and fat-loss training block: Monday to Friday sessions plus optional Saturday specialization.",
      },
      { property: "og:title", content: "Training Plan — V-Taper Block" },
      { property: "og:description", content: "Your full weekly training split, day by day." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AppShell>
      <PlanPage />
    </AppShell>
  ),
});

function PlanPage() {
  const { data: days } = useQuery({ queryKey: ["days"], queryFn: fetchDays });
  return (
    <div>
      <h1 className="text-2xl font-semibold">Training plan</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        V-Taper + Fat-Loss phase · Monday–Friday mandatory, Saturday optional
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(days ?? []).map((d) => (
          <Card key={d.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium">{d.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {d.is_rest ? "Rest day" : d.focus}
                </p>
                {d.cardio_note && (
                  <p className="mt-2 text-xs text-muted-foreground">{d.cardio_note}</p>
                )}
              </div>
              {!d.is_rest && (
                <Link
                  to="/workout/$slug"
                  params={{ slug: d.slug }}
                  className="shrink-0 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent"
                >
                  Open
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}