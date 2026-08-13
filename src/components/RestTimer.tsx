import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, X, Plus } from "lucide-react";
import { mmss } from "@/lib/format";
import { Button } from "@/components/ui/button";

export function RestTimer({
  seconds,
  onDismiss,
}: {
  seconds: number;
  onDismiss: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const [running, setRunning] = useState(true);
  const total = useRef(seconds);

  useEffect(() => {
    setRemaining(seconds);
    total.current = seconds;
    setRunning(true);
  }, [seconds]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => (r > 0 ? r - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const done = remaining === 0;
  const pct = total.current > 0 ? 1 - remaining / total.current : 1;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4 md:bottom-6">
      <div className="mx-auto flex max-w-md items-center gap-4 rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
            <circle cx="18" cy="18" r="16" className="fill-none stroke-border" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={100.5}
              strokeDashoffset={100.5 * (1 - pct)}
            />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="num text-xl font-semibold leading-none">{mmss(remaining)}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {done ? "Rest complete — next set" : "Resting"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" onClick={() => setRemaining((r) => r + 30)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setRunning((r) => !r)}>
            {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => setRemaining(total.current)}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}