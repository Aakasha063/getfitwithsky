import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  recoveryMode: boolean;
  setRecoveryMode: (v: boolean) => void;
};

const AuthContext = createContext<AuthState>({ 
  session: null, 
  user: null, 
  loading: true, 
  recoveryMode: false, 
  setRecoveryMode: () => {} 
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    // Check initial hash
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setRecoveryMode(true);
    }

    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, recoveryMode, setRecoveryMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}