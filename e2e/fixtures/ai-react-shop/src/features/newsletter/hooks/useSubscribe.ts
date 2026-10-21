import { useMutation, type UseMutationResult } from "@tanstack/react-query";
import { subscribe } from "../api/newsletterApi";
import type { NewsletterInput } from "../types";

// Gives the action that signs an email address up to the newsletter.
export function useSubscribe(): UseMutationResult<void, Error, NewsletterInput> {
  return useMutation({ mutationFn: subscribe });
}
