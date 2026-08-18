import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

// Dumbbell icon matching design reference
function LiftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="5" cy="12" r="3" />
      <circle cx="19" cy="12" r="3" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function getInitials(email: string | undefined): string {
  if (!email) return "?";
  const parts = email.split("@")[0]!.split(/[._-]/);
  return parts
    .slice(0, 2)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("");
}

export function AppShell({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !session) router.navigate({ to: "/auth" });
  }, [loading, session, router]);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          border: "2px solid oklch(0.92 0.25 110)",
          borderTopColor: "transparent",
          animation: "spin 0.8s linear infinite",
        }} />
      </div>
    );
  }
  if (!session) return null;

  const initials = getInitials(session.user?.email);

  // Determine if we're on a workout page (no tab bar, different layout)
  const isWorkoutPage = pathname.startsWith("/workout/");
  const isHistoryDetailPage = pathname.startsWith("/history/") && pathname !== "/history";

  // Tab bar active states
  const tabToday = pathname === "/";
  const tabPlan = pathname.startsWith("/plan");
  const tabBody = pathname.startsWith("/body");
  const tabProfile = pathname.startsWith("/profile") || pathname.startsWith("/history") || pathname.startsWith("/progress");

  const tabColor = (active: boolean) =>
    active ? "oklch(0.92 0.25 110)" : "oklch(0.63 0.006 250)";

  // Show tab bar on all pages except workout logging pages
  const showTabBar = !isWorkoutPage;

  return (
    <div style={{
      minHeight: "100vh",
      background: "oklch(0.045 0.003 250)",
      color: "oklch(0.96 0.002 250)",
      fontFamily: "'Inter',ui-sans-serif,system-ui,sans-serif",
    }}>

      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        borderBottom: "1px solid oklch(0.27 0.005 250 / 60%)",
        background: "oklch(0.045 0.003 250 / 85%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}>
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          gap: 8,
        }}>
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textDecoration: "none", flexShrink: 0 }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: "oklch(0.92 0.25 110)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: "oklch(0.07 0.01 110)",
            }}>
              <LiftIcon />
            </span>
            <span style={{ fontFamily: "'Inter'", fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", color: "oklch(0.96 0.002 250)" }}>
              LIFT
            </span>
          </Link>

          {/* Avatar button → Profile */}
          <Link
            to="/profile"
            aria-label="Profile"
            style={{
              width: 34, height: 34, borderRadius: 9,
              background: "oklch(0.92 0.25 110)",
              color: "oklch(0.07 0.01 110)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Inter'", fontSize: 12, fontWeight: 600,
              textDecoration: "none", flexShrink: 0, overflow: "hidden",
            }}
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: showTabBar
          ? (isHistoryDetailPage ? "16px 16px 96px" : "16px 16px 96px")
          : "16px 16px 0",
      }}>
        {children}
      </main>

      {/* Bottom Tab Bar — mobile navigation */}
      {showTabBar && (
        <nav style={{
          position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 40,
          background: "oklch(0.045 0.003 250 / 97%)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderTop: "1px solid oklch(0.27 0.005 250 / 60%)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          <div style={{
            maxWidth: 480,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            height: 64,
          }}>
            {/* Today */}
            <Link to="/" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3,
              color: tabColor(tabToday), textDecoration: "none",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l9-7 9 7" /><path d="M5 10v9h14v-9" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>Today</span>
            </Link>

            {/* Plan */}
            <Link to="/plan" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3,
              color: tabColor(tabPlan), textDecoration: "none",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="5" width="16" height="15" rx="2" />
                <line x1="4" y1="10" x2="20" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>Plan</span>
            </Link>

            {/* Body */}
            <Link to="/body" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3,
              color: tabColor(tabBody), textDecoration: "none",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h4l2 6 4-14 2 8h6" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>Body</span>
            </Link>

            {/* Profile */}
            <Link to="/profile" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: 3,
              color: tabColor(tabProfile), textDecoration: "none",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5 20c1.5-4 5-5.5 7-5.5s5.5 1.5 7 5.5" />
              </svg>
              <span style={{ fontSize: 10.5, fontWeight: 600 }}>Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}

// Export signOut helper for Profile page
export async function signOut() {
  await supabase.auth.signOut();
}
