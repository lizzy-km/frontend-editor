export const DEFAULT_REDIRECT = "/";

// Finds the page a signed-out visitor wanted, saved in the navigation state, or the home page.
export function readRedirectPath(state: unknown): string {
  if (typeof state === "object" && state !== null && "from" in state) {
    const { from } = state;
    if (typeof from === "string" && from.startsWith("/")) return from;
  }
  return DEFAULT_REDIRECT;
}
