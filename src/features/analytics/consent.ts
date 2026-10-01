/**
 * Whether usage stats may be sent. Off when the browser asks not to be
 * tracked (Do Not Track / Global Privacy Control) or the person switched
 * "Share usage stats" off. Remembered in this browser only.
 */
const KEY = 'tweak:analytics'

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string }

/** The browser itself asks sites not to track (we always respect that). */
export function browserSaysNoTracking(): boolean {
  if (typeof navigator === 'undefined') return true
  const nav = navigator as PrivacyNavigator
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1' || nav.msDoNotTrack === '1'
}

/** True when the person turned usage stats off. */
export function optedOut(): boolean {
  try {
    return localStorage.getItem(KEY) === 'off'
  } catch {
    return false
  }
}

/** May we send usage stats right now? */
export function analyticsAllowed(): boolean {
  return !browserSaysNoTracking() && !optedOut()
}

/** Saves the "Share usage stats" choice. */
export function saveOptOut(off: boolean): void {
  try {
    if (off) localStorage.setItem(KEY, 'off')
    else localStorage.removeItem(KEY)
  } catch {
    // Storage blocked (private mode): the choice lasts for this visit only.
  }
}
