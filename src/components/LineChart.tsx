const WIDTH = 560;
const PAD_X = 8;
const PAD_Y = 14;

export function LineChart({
  data,
  unit,
  color = "oklch(0.92 0.25 110)",
  height = 156,
  emptyMessage = "Not enough data yet.",
}: {
  data: { date: string; value: number }[];
  unit: string;
  color?: string;
  height?: number;
  emptyMessage?: string;
}) {
  if (data.length < 2) {
    return (
      <p
        style={{
          margin: "32px 0",
          textAlign: "center",
          fontSize: 13,
          color: "oklch(0.45 0.006 250)",
        }}
      >
        {emptyMessage}
      </p>
    );
  }

  const vals = data.map((d) => d.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = PAD_X + (i * (WIDTH - PAD_X * 2)) / Math.max(1, data.length - 1);
      const y = PAD_Y + (1 - (d.value - min) / range) * (height - PAD_Y * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            fontSize: 10,
            color: "oklch(0.45 0.006 250)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {max} {unit}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: PAD_Y - 6,
            left: 0,
            fontSize: 10,
            color: "oklch(0.45 0.006 250)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {min} {unit}
        </div>
        <svg viewBox={`0 0 ${WIDTH} ${height}`} width="100%" height={height}>
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: "oklch(0.63 0.006 250)",
          marginTop: 6,
        }}
      >
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}
