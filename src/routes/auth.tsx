import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — LIFT" },
      {
        name: "description",
        content: "Sign in to LIFT to run your workouts, log sets and track progress.",
      },
      { property: "og:title", content: "Sign in — LIFT" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot_password" | "verify_otp" | "verify_signup_otp" | "update_password">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Only redirect to home if we are not in the middle of updating a password
    if (!loading && session && mode !== "update_password") router.navigate({ to: "/" });
  }, [loading, session, router, mode]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (error) throw error;
        toast.success("Verification code sent to your email.");
        setMode("verify_signup_otp");
      } else if (mode === "verify_signup_otp") {
        const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "signup" });
        if (error) throw error;
        toast.success("Account verified. Welcome!");
        // session will populate and auto-redirect
      } else if (mode === "forgot_password") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        toast.success("Recovery code sent to your email.");
        setMode("verify_otp");
      } else if (mode === "verify_otp") {
        const { error } = await supabase.auth.verifyOtp({ email, token: otpCode, type: "recovery" });
        if (error) throw error;
        toast.success("Code verified. Please set a new password.");
        setMode("update_password");
        setPassword(""); // clear old password input just in case
      } else if (mode === "update_password") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        toast.success("Password updated successfully.");
        // We are already logged in from verifyOtp, so just go home
        router.navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setBusy(false);
    }
  }

  const INPUT_STYLE = {
    height: 40, width: "100%", borderRadius: 9, boxSizing: "border-box" as const,
    border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit",
    padding: "0 12px", fontSize: 14, outline: "none",
  };

  return (
    <div style={{
      display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center",
      padding: "64px 20px", boxSizing: "border-box",
      background: "oklch(0.045 0.003 250)",
      color: "oklch(0.96 0.002 250)",
      fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 40 }}>
          <div style={{
            marginBottom: 16, width: 48, height: 48, borderRadius: 12,
            background: "oklch(0.92 0.25 110)", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="oklch(0.07 0.01 110)" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="5" cy="12" r="3" />
              <circle cx="19" cy="12" r="3" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <h1 style={{ margin: 0, fontFamily: "'Inter'", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>LIFT</h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
            Your fat-loss phase, tracked set by set.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "oklch(0.11 0.004 250)", border: "1px solid oklch(0.27 0.005 250)", borderRadius: 14, padding: 24 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="name" style={{ fontSize: 13 }}>Name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} style={INPUT_STYLE} />
              </div>
            )}
            
            {mode !== "update_password" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="email" style={{ fontSize: 13 }}>Email</label>
                <input
                  id="email" type="email" required disabled={mode === "verify_otp" || mode === "verify_signup_otp"}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ ...INPUT_STYLE, opacity: (mode === "verify_otp" || mode === "verify_signup_otp") ? 0.6 : 1 }}
                />
              </div>
            )}

            {(mode === "verify_otp" || mode === "verify_signup_otp") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <label htmlFor="otp" style={{ fontSize: 13 }}>
                  {mode === "verify_signup_otp" ? "Verification Code" : "Recovery Code"}
                </label>
                <input
                  id="otp" type="text" required maxLength={8}
                  value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  style={INPUT_STYLE}
                  placeholder="123456"
                />
              </div>
            )}

            {(mode === "signin" || mode === "signup" || mode === "update_password") && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <label htmlFor="password" style={{ fontSize: 13 }}>
                    {mode === "update_password" ? "New Password" : "Password"}
                  </label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot_password")}
                      style={{ background: "transparent", border: "none", color: "oklch(0.63 0.006 250)", fontSize: 12, cursor: "pointer", padding: 0 }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  id="password" type="password" required minLength={6}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={INPUT_STYLE}
                />
              </div>
            )}
            <button
            type="submit"
            disabled={busy}
            style={{
              height: 44, width: "100%", borderRadius: 9, border: "none",
              background: "oklch(0.92 0.25 110)", color: "oklch(0.07 0.01 110)",
              fontSize: 14, fontWeight: 600, cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Please wait..." : 
              mode === "signin" ? "Sign in" : 
              mode === "signup" ? "Create account" : 
              (mode === "verify_otp" || mode === "verify_signup_otp") ? "Verify code" : 
              mode === "update_password" ? "Update password" :
              "Send reset code"
            }
          </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <span style={{ flex: 1, height: 1, background: "oklch(0.27 0.005 250)" }} />
            <span style={{ fontSize: 12, color: "oklch(0.45 0.006 250)" }}>or</span>
            <span style={{ flex: 1, height: 1, background: "oklch(0.27 0.005 250)" }} />
          </div>

          <button
            onClick={google}
            disabled={busy}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              height: 44, width: "100%", borderRadius: 9,
              border: "1px solid oklch(0.27 0.005 250)", background: "transparent", color: "inherit",
              fontSize: 14, fontWeight: 500, cursor: busy ? "wait" : "pointer",
              opacity: busy ? 0.5 : 1
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Toggle */}
        <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "oklch(0.63 0.006 250)" }}>
          {(mode === "forgot_password" || mode === "verify_otp" || mode === "verify_signup_otp" || mode === "update_password") ? (
            <button
              onClick={() => {
                setMode("signin");
                setOtpCode("");
              }}
              style={{ background: "transparent", border: "none", color: "oklch(0.92 0.25 110)", fontSize: 14, cursor: "pointer", padding: 0 }}
            >
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "signin" ? "No account yet? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                style={{ background: "transparent", border: "none", color: "oklch(0.92 0.25 110)", fontSize: 14, cursor: "pointer", padding: 0 }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}