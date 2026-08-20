import { createPortal } from "react-dom";
import type { Exercise } from "@/lib/api";

const DOT = (
  <span style={{ marginTop: 8, width: 4, height: 4, flexShrink: 0, borderRadius: 999, background: "oklch(0.92 0.25 110)", display: "inline-block" }} />
);

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)" }}>
        {title}
      </h4>
      <ul style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
        {items.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 8 }}>
            {DOT}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TextSection({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div>
      <h4 style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.63 0.006 250)" }}>
        {title}
      </h4>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>{text}</p>
    </div>
  );
}

export function ExerciseInstructions({
  exercise,
  open,
  onOpenChange,
}: {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  if (!open || !exercise || typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.5)" }}
        onClick={() => onOpenChange(false)}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(420px, 100%)",
        background: "oklch(0.11 0.004 250)",
        borderLeft: "1px solid oklch(0.27 0.005 250)",
        overflowY: "auto",
        padding: 24,
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
        zIndex: 51,
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600 }}>{exercise.name}</h2>
          <button
            onClick={() => onOpenChange(false)}
            style={{ background: "transparent", border: "none", color: "oklch(0.63 0.006 250)", cursor: "pointer", padding: 4 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <p style={{ margin: 0, fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
          {[exercise.primary_muscle, exercise.equipment, exercise.is_compound ? "Compound" : "Isolation"]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <Section title="Setup" items={exercise.setup} />
        <Section title="Execution" items={exercise.execution} />
        <Section title="Cues" items={exercise.cues} />
        <Section title="Common mistakes" items={exercise.common_mistakes} />
        <TextSection title="What it should feel like" text={exercise.should_feel ?? ""} />
        <TextSection title="Breathing" text={exercise.breathing ?? ""} />

        {exercise.lower_back_notes && (
          <div style={{
            borderRadius: 8,
            border: "1px solid oklch(0.62 0.18 25 / 40%)",
            background: "oklch(0.62 0.18 25 / 10%)",
            padding: 12,
          }}>
            <h4 style={{ margin: 0, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "oklch(0.62 0.18 25)" }}>
              Lower-back safety
            </h4>
            <p style={{ margin: "6px 0 0", fontSize: 14 }}>{exercise.lower_back_notes}</p>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}