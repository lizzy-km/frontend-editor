/**
 * Feature flags. Flip a flag to show/hide a whole feature.
 * Future features ship dark (false) until they are ready.
 */
export const features = {
  /** Sign in with Google / GitHub buttons. */
  enable_oauth: true,
  /** Browse other people's public projects. */
  enable_gallery: true,
  /** Upload images to Cloudflare R2 (needs VITE_ASSETS_URL). */
  enable_uploads: Boolean(import.meta.env.VITE_ASSETS_URL),
  /** Paid plans with crypto checkout. Not built yet. */
  enable_billing: false,
  /** P2P buy/sell of projects. Not built yet. */
  enable_marketplace: false,
} as const

export type FeatureName = keyof typeof features
