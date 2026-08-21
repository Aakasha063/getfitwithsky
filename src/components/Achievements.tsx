import { createPortal } from "react-dom";

const RING_SPECS: Record<number, { r: number; c: number }> = {
  56: { r: 24, c: 150.8 },
  32: { r: 13, c: 81.7 },
};

export function ProgressRing({
  size,
  pct,
  children,
}: {
  size: 56 | 32;
  pct: number;
  children?: React.ReactNode;
}) {
  const { r, c } = RING_SPECS[size]!;
  const offset = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.22 0.005 250)"
          strokeWidth={3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(0.92 0.25 110)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      {children && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function TrophyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="oklch(0.92 0.25 110)"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z" />
      <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="oklch(0.45 0.006 250)"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function BadgeTile({
  label,
  hint,
  rewardXp,
  pct,
  earned,
}: {
  label: string;
  hint?: string;
  rewardXp: number;
  pct: number;
  earned: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        textAlign: "center",
      }}
    >
      <ProgressRing size={56} pct={pct}>
        {earned ? <TrophyIcon /> : <LockIcon />}
      </ProgressRing>
      <p
        style={{
          margin: 0,
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.25,
          color: earned ? "inherit" : "oklch(0.63 0.006 250)",
        }}
      >
        {label}
      </p>
      {hint && <p style={{ margin: 0, fontSize: 9.5, color: "oklch(0.45 0.006 250)" }}>{hint}</p>}
      <p style={{ margin: 0, fontSize: 9.5, color: "oklch(0.45 0.006 250)" }}>+{rewardXp} XP</p>
    </div>
  );
}

export function ChallengeRow({
  label,
  hint,
  progressLabel,
  rewardXp,
  pct,
}: {
  label: string;
  hint?: string;
  progressLabel: string;
  rewardXp: number;
  pct: number;
}) {
  return (
    <div
      style={{
        padding: "12px 14px",
        borderTop: "1px solid oklch(0.27 0.005 250)",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <ProgressRing size={32} pct={pct} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </p>
        {hint && (
          <p style={{ margin: "1px 0 0", fontSize: 11, color: "oklch(0.63 0.006 250)" }}>{hint}</p>
        )}
        <p style={{ margin: "1px 0 0", fontSize: 11, color: "oklch(0.45 0.006 250)" }}>
          {progressLabel}
        </p>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "oklch(0.92 0.25 110)", flexShrink: 0 }}>
        +{rewardXp}
      </span>
    </div>
  );
}

export function BottomSheet({
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
          maxHeight: "80vh",
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
