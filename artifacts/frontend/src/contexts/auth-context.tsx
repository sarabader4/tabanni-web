import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  avatarUrl: string | null;
  role: "user" | "admin" | "volunteer";
  isOnboardingCompleted: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; phone?: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  onboardingVisible: boolean;
  pendingOnboardingAction: (() => void) | null;
  requireOnboarding: (onComplete: () => void) => void;
  markOnboardingComplete: () => void;
  skipOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data as { message?: string } | null)?.message ?? res.statusText;
    throw new Error(message);
  }
  return data as T;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [pendingOnboardingAction, setPendingOnboardingAction] = useState<(() => void) | null>(null);
  const [hasSkipped, setHasSkipped] = useState(false);
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async () => {
    try {
      const me = await apiFetch<AuthUser>("/api/users/me");
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const me = await apiFetch<AuthUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(me);
    setHasSkipped(false);
    if (!me.isOnboardingCompleted) {
      setOnboardingVisible(true);
    }
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const register = useCallback(async (data: { fullName: string; email: string; phone?: string; password: string }) => {
    const me = await apiFetch<AuthUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setUser(me);
    setHasSkipped(false);
    if (!me.isOnboardingCompleted) {
      setOnboardingVisible(true);
    }
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const logout = useCallback(async () => {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    setHasSkipped(false);
    setOnboardingVisible(false);
    setPendingOnboardingAction(null);
    await queryClient.invalidateQueries();
  }, [queryClient]);

  const requireOnboarding = useCallback((onComplete: () => void) => {
    if (user?.isOnboardingCompleted) {
      onComplete();
      return;
    }
    setPendingOnboardingAction(() => onComplete);
    setOnboardingVisible(true);
  }, [user]);

  const markOnboardingComplete = useCallback(() => {
    setUser(prev => prev ? { ...prev, isOnboardingCompleted: true } : prev);
    setOnboardingVisible(false);
    const action = pendingOnboardingAction;
    setPendingOnboardingAction(null);
    if (action) {
      setTimeout(action, 100);
    }
  }, [pendingOnboardingAction]);

  const skipOnboarding = useCallback(() => {
    setHasSkipped(true);
    setOnboardingVisible(false);
    setPendingOnboardingAction(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, register, logout, refreshUser,
      onboardingVisible, pendingOnboardingAction,
      requireOnboarding, markOnboardingComplete, skipOnboarding,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
