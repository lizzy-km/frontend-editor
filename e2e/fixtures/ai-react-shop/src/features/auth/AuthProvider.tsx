import { useCallback, useEffect, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { USE_MOCK } from "@/api/client";
import { clearSession, readSession, writeSession, type Session } from "@/shared/lib/session";
import { fetchCurrentUser, login as loginRequest, register as registerRequest } from "./api/authApi";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { LoginInput, RegisterInput } from "./types";

type AuthProviderProps = {
  children: ReactNode;
};

// Keeps the signed-in person in memory and in the browser, and shares it with the whole app.
export function AuthProvider({ children }: AuthProviderProps): ReactElement {
  const [session, setSession] = useState<Session | null>(readSession);

  const startSession = useCallback((next: Session) => {
    writeSession(next);
    setSession(next);
  }, []);

  const login = useCallback(
    async (input: LoginInput) => startSession(await loginRequest(input)),
    [startSession],
  );

  const register = useCallback(
    async (input: RegisterInput) => startSession(await registerRequest(input)),
    [startSession],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => {
    if (USE_MOCK || !readSession()) return;
    let isCurrent = true;
    fetchCurrentUser().catch(() => {
      if (isCurrent) logout();
    });
    return () => {
      isCurrent = false;
    };
  }, [logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      status: session ? "signedIn" : "signedOut",
      login,
      register,
      logout,
    }),
    [session, login, register, logout],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
