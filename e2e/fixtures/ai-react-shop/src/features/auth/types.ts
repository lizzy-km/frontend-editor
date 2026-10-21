import { z } from "zod";
import type { SessionUser } from "@/shared/lib/session";

export type { Role, Session, SessionUser } from "@/shared/lib/session";

export const MIN_PASSWORD_LENGTH = 8;
const EMAIL_MESSAGE = "Enter a valid email address, like name@example.com.";
const PASSWORD_MESSAGE = `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;

export const loginSchema = z.object({
  email: z.email(EMAIL_MESSAGE),
  password: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_MESSAGE),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Tell us your name, at least 2 letters."),
    email: z.email(EMAIL_MESSAGE),
    password: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_MESSAGE),
    confirmPassword: z.string().min(1, "Type your password a second time."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "The two passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email(EMAIL_MESSAGE),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type StoredUser = SessionUser & { password: string };
export type AuthStatus = "signedIn" | "signedOut";
