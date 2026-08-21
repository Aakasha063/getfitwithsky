export function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        marginLeft: 8,
        fontSize: 10,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color,
        background: `color-mix(in oklch, ${color} 14%, transparent)`,
        border: `1px solid color-mix(in oklch, ${color} 35%, transparent)`,
        borderRadius: 999,
        padding: "2px 6px",
      }}
    >
      {label}
    </span>
  );
}
