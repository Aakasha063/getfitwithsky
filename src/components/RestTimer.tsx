import { useEffect, useRef, useState } from "react";
import { mmss } from "@/lib/format";

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
  const dashOffset = 100.5 * (1 - pct);

  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 16, zIndex: 40, padding: "0 16px" }}>
      <div style={{
        margin: "0 auto",
        maxWidth: 420,
        display: "flex",
        alignItems: "center",
        gap: 16,
        borderRadius: 12,
        border: "1px solid oklch(0.27 0.005 250)",
        background: "oklch(0.205 0.009 260 / 95%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        padding: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}>
        {/* SVG progress ring */}
        <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
          <svg width="48" height="48" viewBox="0 0 36 36" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="18" cy="18" r="16" fill="none" stroke="oklch(0.27 0.005 250)" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="16"
              fill="none"
              stroke="oklch(0.92 0.25 110)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="100.5"
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
        </div>

        {/* Label */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 600, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {mmss(remaining)}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "oklch(0.63 0.006 250)" }}>
            {done ? "Rest complete — next set" : "Resting"}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => setRemaining((r) => r + 30)}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
          >
            +30
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer", fontSize: 14 }}
          >
            {running ? "❚❚" : "▶"}
          </button>
          <button
            onClick={onDismiss}
            style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent", color: "oklch(0.63 0.006 250)", cursor: "pointer", fontSize: 14 }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}