import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { fetchHistory } from "@/lib/api";
import { fmtDuration } from "@/lib/format";
import { Card } from "@/components/ui/card";

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

function HistoryPage() {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ["history", user?.id],
    queryFn: () => fetchHistory(user!.id),
    enabled: !!user,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">History</h1>
      <div className="mt-6 space-y-2">
        {(data ?? []).map((s) => (
          <Card key={s.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{s.title}</p>
              <p className="text-sm text-muted-foreground">{s.session_date}</p>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p className="num">{fmtDuration(s.duration_seconds)}</p>
              <p className="text-xs capitalize">{s.status.replace("_", " ")}</p>
            </div>
          </Card>
        ))}
        {data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No sessions logged yet.</p>
        )}
      </div>
    </div>
  );
}