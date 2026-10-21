import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "../AuthContext";

// Gives a component the signed-in person and the login, register and logout actions.
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
