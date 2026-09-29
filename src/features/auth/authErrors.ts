/** Firebase error codes -> messages a normal person understands. */
const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'That email or password isn’t right.',
  'auth/wrong-password': 'That password isn’t right.',
  'auth/user-not-found': 'We couldn’t find an account with that email.',
  'auth/invalid-email': 'That email address doesn’t look right.',
  'auth/email-already-in-use': 'There’s already an account with that email. Try signing in instead.',
  'auth/weak-password': 'Please use a password with at least 6 characters.',
  'auth/too-many-requests': 'Too many tries. Please wait a minute and try again.',
  'auth/network-request-failed': 'No internet connection. Check your connection and try again.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before finishing.',
  'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
  'auth/account-exists-with-different-credential': 'You already signed up with this email another way (e.g. Google). Use that instead.',
}

export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  return MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

/** The popup closing on purpose is not worth an error message. */
export const isCancelled = (error: unknown) =>
  ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'].includes((error as { code?: string })?.code ?? '')
