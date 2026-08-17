import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/", label: "Today" },
  { to: "/plan", label: "Plan" },
  { to: "/body", label: "Body" },
  { to: "/profile", label: "Profile" },
] as const;

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

  function isActive(to: string) {
    if (to === "/") return pathname === "/";
    if (to === "/profile")
      return (
        pathname.startsWith("/profile") ||
        pathname.startsWith("/history") ||
        pathname.startsWith("/progress")
      );
    return pathname.startsWith(to);
  }

  return (
    <div style={{ minHeight: "100vh", background: "oklch(0.045 0.003 250)", color: "oklch(0.96 0.002 250)", fontFamily: "'Inter',ui-sans-serif,system-ui,sans-serif" }}>
      {/* Sticky header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        borderBottom: "1px solid oklch(0.27 0.005 250 / 60%)",
        background: "oklch(0.045 0.003 250 / 85%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", height: 76, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
          {/* Logo */}
          <Link
            to="/"
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", textDecoration: "none" }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: 6,
              background: "oklch(0.92 0.25 110)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              color: "oklch(0.07 0.01 110)",
            }}>
              <LiftIcon />
            </span>
            <span style={{ fontFamily: "'Inter'", fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "oklch(0.96 0.002 250)" }}>
              LIFT
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV.map((item) => {
              const active = isActive(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  style={{
                    padding: "8px 14px",
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: "none",
                    color: active ? "oklch(0.96 0.002 250)" : "oklch(0.63 0.006 250)",
                    background: active ? "oklch(0.22 0.005 250)" : "transparent",
                    transition: "color 0.15s, background 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Avatar button → Profile */}
          <Link
            to="/profile"
            aria-label="Profile"
            style={{
              width: 32, height: 32, borderRadius: 8,
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
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 48px 96px" }}>
        {children}
      </main>
    </div>
  );
}

// Export signOut helper for Profile page
export async function signOut() {
  await supabase.auth.signOut();
}
