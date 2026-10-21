import { z } from "zod";

export const SESSION_KEY = "tweak:session";

const sessionSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.enum(["member", "admin"]),
  }),
});

export type Session = z.infer<typeof sessionSchema>;
export type SessionUser = Session["user"];
export type Role = SessionUser["role"];

// Reads the saved sign-in from the browser, or null when there is none.
export function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = sessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

// Saves the sign-in in the browser so a reload keeps the person signed in.
export function writeSession(session: Session): void {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Storage can be full or blocked; the person simply has to sign in again later.
  }
}

// Removes the saved sign-in from the browser.
export function clearSession(): void {
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clean up when storage is blocked.
  }
}
