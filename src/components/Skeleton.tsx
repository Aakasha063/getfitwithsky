export function SkeletonCard({ height = 80 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 12,
        background: "oklch(0.11 0.004 250)",
        border: "1px solid oklch(0.27 0.005 250)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent 0%, oklch(0.22 0.005 250 / 60%) 50%, transparent 100%)",
        animation: "shimmer 1.4s ease-in-out infinite",
        backgroundSize: "200% 100%",
      }} />
    </div>
  );
}

export function SkeletonText({ width = "60%", height = 14 }: { width?: string | number; height?: number }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 6,
        background: "oklch(0.11 0.004 250)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(90deg, transparent 0%, oklch(0.22 0.005 250 / 60%) 50%, transparent 100%)",
        animation: "shimmer 1.4s ease-in-out infinite",
        backgroundSize: "200% 100%",
      }} />
    </div>
  );
}

export function WorkoutSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 120 }}>
      {/* Header skeleton */}
      <div style={{ height: 72, borderRadius: 0, background: "oklch(0.045 0.003 250 / 97%)", borderBottom: "1px solid oklch(0.27 0.005 250)", padding: "12px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "oklch(0.11 0.004 250)" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <SkeletonText width={60} height={10} />
            <SkeletonText width={140} height={18} />
          </div>
        </div>
      </div>
      {/* Exercise skeletons */}
      {[...Array(4)].map((_, i) => (
        <SkeletonCard key={i} height={160} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <SkeletonText width={100} height={14} />
        <div style={{ marginTop: 14 }}><SkeletonText width="70%" height={32} /></div>
      </div>
      <SkeletonCard height={120} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        <SkeletonCard height={90} />
        <SkeletonCard height={90} />
        <SkeletonCard height={90} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} height={56} />)}
      </div>
    </div>
  );
}
