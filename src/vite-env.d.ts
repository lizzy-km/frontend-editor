/// <reference types="vite/client" />

/** The settings the app reads (`.env`, or the host's environment variables). See `.env.example`. */
interface ImportMetaEnv {
  /** Firebase web app settings (Project settings → Your apps). Identifiers, not secrets: security comes from firestore.rules. */
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  /** Google Analytics for Firebase (G-XXXXXXX). Empty means no usage stats are sent. */
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string
  /** Set to 1 to also send usage stats from `vite dev` (shows up in DebugView). */
  readonly VITE_ANALYTICS_IN_DEV?: string
  /** Address of the deployed Cloudflare Worker (workers/assets) that stores picture uploads in R2. Empty turns uploads off. */
  readonly VITE_ASSETS_URL?: string
  /** The address of the deployed site (https://…, no trailing slash). Canonical links, share pictures and sitemap.xml need it. */
  readonly VITE_SITE_URL?: string
  /** Address of the deployed billing Worker (workers/billing): starts checkouts for paid plans and purchases. Empty turns checkout off. */
  readonly VITE_BILLING_URL?: string
}
