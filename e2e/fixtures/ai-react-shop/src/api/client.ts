import axios from "axios";
import { readSession } from "@/shared/lib/session";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";
export const MOCK_DELAY_MS = 400;

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "",
});

apiClient.interceptors.request.use((config) => {
  const session = readSession();
  if (session) {
    config.headers.set("Authorization", `Bearer ${session.token}`);
  }
  return config;
});

// Resolves with the given value after a short pause, like a real network call.
export function mockDelay<T>(value: T, ms: number = MOCK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}
