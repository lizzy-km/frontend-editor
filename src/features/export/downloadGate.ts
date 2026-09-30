/**
 * Who may download, and how it's counted. The page decides (Try-it, account
 * editor...), the Download dialog just follows it — so export stays free of
 * Firestore and plan logic.
 */
export type DownloadGate =
  /** Try-it: downloading needs a free account. */
  | { kind: 'signin'; signupHref: string; signinHref: string }
  /** Saved page: each download uses one of the month's allowance. */
  | {
      kind: 'counted'
      /** loading = still asking the server; unknown = couldn't ask (the server decides on click). */
      status: 'loading' | 'ready' | 'unknown'
      used: number
      /** null = unlimited (Pro) */
      max: number | null
      resetsOn: Date
      /** Records one download on the server; throws when the limit is reached. */
      consume: () => Promise<void>
    }
  /** No limit (development/testing only). */
  | { kind: 'open' }

/** Downloads left this month, or null when unlimited / not known. */
export const remainingDownloads = (gate: DownloadGate): number | null =>
  gate.kind === 'counted' && gate.status === 'ready' && gate.max !== null ? Math.max(0, gate.max - gate.used) : null

/** Should the download buttons be disabled right now? */
export const downloadsBlocked = (gate: DownloadGate): boolean =>
  gate.kind === 'signin' || (gate.kind === 'counted' && (gate.status === 'loading' || remainingDownloads(gate) === 0))
