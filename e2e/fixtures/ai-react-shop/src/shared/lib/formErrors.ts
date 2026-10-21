import type { FieldErrors } from "react-hook-form";

// Lists every form problem, plus an optional message from the server, as plain sentences.
export function collectErrors(errors: FieldErrors, serverError: string | null = null): string[] {
  const messages: string[] = [];
  for (const error of Object.values(errors)) {
    const message = error?.message;
    if (typeof message === "string" && message) messages.push(message);
  }
  if (serverError) messages.push(serverError);
  return messages;
}
