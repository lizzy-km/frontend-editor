import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import type { NewsletterInput } from "../types";

// Signs an email address up to the newsletter.
export async function subscribe(input: NewsletterInput): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(null);
    return;
  }
  await apiClient.post("/newsletter", input);
}
