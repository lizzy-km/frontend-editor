/**
 * Feature flags. Flip a flag to show/hide a whole feature.
 * Future features ship dark (false) until they are ready.
 */
const ASSETS_URL = import.meta.env.VITE_ASSETS_URL ?? ''
/** An r2.dev address is the bucket's public read link: uploads need the Worker (workers/assets) instead. */
const assetsUrlIsBucket = /\.r2\.dev\b/i.test(ASSETS_URL)
if (assetsUrlIsBucket && import.meta.env.DEV) {
  console.warn('[uploads] VITE_ASSETS_URL is an r2.dev bucket address. Set it to the deployed Worker URL '
    + '(workers/assets, e.g. https://tweak-assets.<you>.workers.dev). Until then pictures are embedded in the page.')
}

export const features = {
  /** Sign in with Google / GitHub buttons. */
  enable_oauth: true,
  /** Browse other people's public projects. */
  enable_gallery: true,
  /** Upload images to Cloudflare R2 (needs VITE_ASSETS_URL). */
  enable_uploads: Boolean(ASSETS_URL) && !assetsUrlIsBucket,
  /** Paid plans with crypto checkout. Not built yet. */
  enable_billing: false,
  /** P2P buy/sell of projects. Not built yet. */
  enable_marketplace: false,
} as const

export type FeatureName = keyof typeof features
