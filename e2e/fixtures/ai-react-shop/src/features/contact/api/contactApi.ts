import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import type { ContactInput } from "../types";

// Sends a message from the contact form to the shop team.
export async function sendMessage(input: ContactInput): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(null);
    return;
  }
  await apiClient.post("/contact", input);
}
