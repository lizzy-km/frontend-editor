import type { DownloadGate } from '@/features/export/downloadGate'

// Signing up brings the Try-it page along (/projects/new offers "Save the page from Try it").
const NEXT = encodeURIComponent('/projects/new')

/** Browser tests set this to reach the real files. Only honoured in `vite dev`. */
const E2E_KEY = 'tweak:e2e-open-downloads'

function e2eOpen(): boolean {
  if (!import.meta.env.DEV) return false
  try { return localStorage.getItem(E2E_KEY) === '1' } catch { return false }
}

/** Try-it: downloading needs a free account. */
export function playgroundGate(): DownloadGate {
  if (e2eOpen()) return { kind: 'open' }
  return { kind: 'signin', signupHref: `/signup?next=${NEXT}`, signinHref: `/login?next=${NEXT}` }
}
