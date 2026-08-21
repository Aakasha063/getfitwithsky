import { Link } from "@tanstack/react-router";

const CARD = {
  border: "1px solid oklch(0.27 0.005 250)",
  borderRadius: 12,
  padding: 16,
  background: "oklch(0.11 0.004 250)",
} as const;

const EYEBROW = {
  margin: 0,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "oklch(0.45 0.006 250)",
};

const SECTION = { maxWidth: 480, margin: "0 auto", padding: "56px 20px 0" };

function ComingSoonBadge() {
  return (
    <span
      style={{
        marginLeft: 8,
        display: "inline-block",
        verticalAlign: "middle",
        borderRadius: 999,
        border: "1px solid oklch(0.92 0.25 110 / 45%)",
        color: "oklch(0.92 0.25 110)",
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
      }}
    >
      Coming soon
    </span>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div style={CARD}>
      {icon}
      <p style={{ margin: "12px 0 0", fontSize: 14.5, fontWeight: 600 }}>{title}</p>
      <p
        style={{ margin: "4px 0 0", fontSize: 13, lineHeight: 1.5, color: "oklch(0.63 0.006 250)" }}
      >
        {description}
      </p>
    </div>
  );
}

export function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.045 0.003 250)" }}>
      {/* Sticky mini header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "oklch(0.045 0.003 250 / 92%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid oklch(0.27 0.005 250 / 60%)",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: "0 auto",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "oklch(0.92 0.25 110)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.07 0.01 110)"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <circle cx="5" cy="12" r="3" />
                <circle cx="19" cy="12" r="3" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </span>
            <span
              style={{
                fontFamily: "'Inter'",
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Skido
            </span>
          </div>
          <Link
            to="/auth"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: 32,
              padding: "0 14px",
              borderRadius: 8,
              border: "1px solid oklch(0.27 0.005 250)",
              background: "transparent",
              color: "inherit",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "40px 20px 0",
          background:
            "radial-gradient(circle at 50% 0%, oklch(0.92 0.25 110 / 8%), transparent 60%)",
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "oklch(0.92 0.25 110)",
          }}
        >
          Training, quantified
        </span>
        <h1
          style={{
            margin: "14px 0 0",
            fontFamily: "'Inter'",
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
          }}
        >
          Log sets. See progress. Keep the streak.
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: 15,
            lineHeight: 1.55,
            color: "oklch(0.63 0.006 250)",
          }}
        >
          One app for lifters who train alone, coaches who manage clients, and friends who push each
          other. Honest data, no filler stats.
        </p>
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              borderRadius: 10,
              border: "none",
              background: "oklch(0.92 0.25 110)",
              color: "oklch(0.07 0.01 110)",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Get started free
          </Link>
          <Link
            to="/auth"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              borderRadius: 10,
              border: "1px solid oklch(0.27 0.005 250)",
              background: "transparent",
              color: "inherit",
              fontSize: 15,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Log in
          </Link>
        </div>
      </div>

      {/* For individuals */}
      <div style={SECTION}>
        <p style={EYEBROW}>For individuals</p>
        <h2 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Everything to track and grow
        </h2>
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <FeatureCard
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.92 0.25 110)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20v-6M6 20v-10M18 20v-3" />
              </svg>
            }
            title="Frictionless set logging"
            description="Previous weights and reps prefilled, one-tap set completion, an automatic rest timer."
          />
          <FeatureCard
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.92 0.25 110)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 4h10v4a5 5 0 0 1-10 0V4z" />
                <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            }
            title="PRs and progression, tracked automatically"
            description="Every set is checked against your history. No manual math, no spreadsheets."
          />
          <FeatureCard
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="oklch(0.92 0.25 110)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h4l2 6 4-14 2 8h6" />
              </svg>
            }
            title="Body metrics and calorie targets"
            description="Weight, waist, and body fat in one snapshot — with a calorie target calculated from your goal."
          />
        </div>
      </div>

      {/* AI coaching — not built yet */}
      <div style={SECTION}>
        <p style={EYEBROW}>AI coaching</p>
        <h2 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          A personalized AI coach
          <ComingSoonBadge />
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Coming soon: next-session progression suggestions and plan adjustments based on your own
          logged history — not a generic template.
        </p>
      </div>

      {/* Community */}
      <div style={SECTION}>
        <p style={EYEBROW}>Community</p>
        <h2 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Compete with your friends
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "oklch(0.63 0.006 250)",
          }}
        >
          A training-score leaderboard ranks consistency and progression, not just raw volume.
          Optional — join when you want to.
        </p>
        <div
          style={{
            marginTop: 16,
            border: "1px solid oklch(0.27 0.005 250)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderBottom: "1px solid oklch(0.27 0.005 250)",
            }}
          >
            <span
              style={{ width: 20, fontSize: 12, fontWeight: 600, color: "oklch(0.92 0.25 110)" }}
            >
              1
            </span>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "oklch(0.7 0.16 200)",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>Jordan M.</span>
            <span style={{ fontSize: 12, color: "oklch(0.63 0.006 250)" }}>2,140 pts</span>
          </div>
          <div style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{ width: 20, fontSize: 12, fontWeight: 600, color: "oklch(0.63 0.006 250)" }}
            >
              2
            </span>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "oklch(0.75 0.17 60)",
                flexShrink: 0,
              }}
            />
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>You</span>
            <span style={{ fontSize: 12, color: "oklch(0.63 0.006 250)" }}>1,960 pts</span>
          </div>
        </div>
      </div>

      {/* For coaches — not built yet */}
      <div style={SECTION}>
        <p style={EYEBROW}>For coaches</p>
        <h2 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Manage every client's progress
          <ComingSoonBadge />
        </h2>
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            color: "oklch(0.63 0.006 250)",
          }}
        >
          Coming soon: trainers will see each client's plan adherence, PRs, and body-metric trends
          in one place — and adjust a plan without waiting for the next check-in.
        </p>
      </div>

      {/* Final CTA */}
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "56px 20px 64px" }}>
        <div
          style={{
            border: "1px solid oklch(0.92 0.25 110 / 40%)",
            borderRadius: 16,
            padding: "28px 20px",
            textAlign: "center",
            background: "oklch(0.92 0.25 110 / 6%)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Start your next session logged.
          </h2>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            style={{
              marginTop: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: 48,
              borderRadius: 10,
              border: "none",
              background: "oklch(0.92 0.25 110)",
              color: "oklch(0.07 0.01 110)",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            Get started free
          </Link>
        </div>
        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            fontSize: 12.5,
            color: "oklch(0.45 0.006 250)",
          }}
        >
          © {new Date().getFullYear()} Skido
        </p>
      </div>
    </div>
  );
}
