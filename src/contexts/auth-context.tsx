"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signin: (session: Session) => void;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = "teletaxi_session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Chargement de la session depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Garde de route : redirige vers /auth si non connecté.
  // Les redirections post-auth sont gérées par use-auth-mutations.
  useEffect(() => {
    if (loading) return;
    const isAuthPage = pathname.startsWith("/auth");
    if (!session && !isAuthPage) router.replace("/auth");
  }, [session, loading, pathname, router]);

  const signin = (newSession: Session) => {
    setSession(newSession);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  };

  const signout = () => {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
    router.replace("/auth");
  };

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, signin, signout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
