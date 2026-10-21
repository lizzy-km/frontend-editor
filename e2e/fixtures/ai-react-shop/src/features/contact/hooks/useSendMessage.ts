import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { sendMessage } from "../api/contactApi";
import type { ContactInput } from "../types";

// Gives the action that sends a contact message.
export function useSendMessage(): UseMutationResult<void, Error, ContactInput> {
  return useMutation({ mutationFn: sendMessage });
}
