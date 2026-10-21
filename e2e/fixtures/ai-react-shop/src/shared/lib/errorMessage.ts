import { isAxiosError } from "axios";

// Turns any error into a short sentence a visitor can understand.
export function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
