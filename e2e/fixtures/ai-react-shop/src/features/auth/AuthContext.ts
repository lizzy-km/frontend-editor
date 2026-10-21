import { createContext } from "react";
import type { AuthStatus, LoginInput, RegisterInput, SessionUser } from "./types";

export type AuthContextValue = {
  user: SessionUser | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
