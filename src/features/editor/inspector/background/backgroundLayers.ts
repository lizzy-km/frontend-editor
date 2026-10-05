import { gradientCss, parseGradient, splitTopLevel, type Gradient } from './gradient'

/**
 * `background-image` as the panel sees it: at most one gradient (drawn on
 * top, e.g. to darken a photo) and one picture. Anything else (two
 * pictures, a gradient we can't edit exactly) is "custom": shown as is and
 * only replaced when the person starts over.
 */
export type BackgroundLayers = {
  gradient: Gradient | null
  picture: string | null
  custom: boolean
}

const NONE: BackgroundLayers = { gradient: null, picture: null, custom: false }

/** url("a.jpg") / url(a.jpg) -> a.jpg */
function readUrl(layer: string): string | null {
  const match = layer.match(/^url\(\s*(['"]?)([\s\S]*?)\1\s*\)$/i)
  return match ? match[2]! : null
}

/** Reads a background-image value (from the edits or the browser). */
export function parseBackground(value: string | undefined): BackgroundLayers {
  const text = (value ?? '').trim()
  if (!text || text === 'none' || text === 'initial') return NONE
  const layers = splitTopLevel(text)
  const result: BackgroundLayers = { gradient: null, picture: null, custom: false }
  for (const layer of layers) {
    const url = readUrl(layer)
    const gradient = url === null ? parseGradient(layer) : null
    if (url !== null && result.picture === null && !result.custom) result.picture = url
    else if (gradient && result.gradient === null && result.picture === null) result.gradient = gradient
    else return { ...result, custom: true }
  }
  return result
}

/** A picture address as CSS, quoted so spaces and brackets are safe. */
export const pictureCss = (url: string) => `url("${url.replace(/["\\\n]/g, (char) => encodeURIComponent(char))}")`

/** Back to CSS. "none" when empty, so the page's own background picture is switched off too. */
export function backgroundCss(layers: Pick<BackgroundLayers, 'gradient' | 'picture'>): string {
  const parts = [layers.gradient && gradientCss(layers.gradient), layers.picture !== null && pictureCss(layers.picture)].filter(Boolean)
  return parts.length ? parts.join(', ') : 'none'
}
