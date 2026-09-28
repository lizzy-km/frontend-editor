import type { Breakpoint } from './types'

type BreakpointInfo = {
  label: string
  /** Width of the preview frame in the editor. */
  frameWidth: number
  /** Media query the styles are wrapped in (desktop = no query, it's the base). */
  media: string | null
  icon: 'desktop' | 'tablet' | 'phone'
}

/** Desktop first: tablet overrides desktop, phone overrides both. */
export const BREAKPOINTS: Record<Breakpoint, BreakpointInfo> = {
  desktop: { label: 'Computer', frameWidth: 1280, media: null, icon: 'desktop' },
  tablet: { label: 'Tablet', frameWidth: 768, media: '(max-width: 1024px)', icon: 'tablet' },
  mobile: { label: 'Phone', frameWidth: 390, media: '(max-width: 640px)', icon: 'phone' },
}

export const BREAKPOINT_ORDER: Breakpoint[] = ['desktop', 'tablet', 'mobile']
