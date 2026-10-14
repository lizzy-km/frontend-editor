import type { ElementNode } from './types'

/**
 * Animations on any element (data-fe-animate…), shared by the editor's Play
 * button, Preview/downloads (Web Animations) and the React export (Motion).
 * One definition of every effect keeps all three looking the same.
 */
export const ANIMATE_ATTR = 'data-fe-animate'
export const TRIGGER_ATTR = 'data-fe-trigger'
export const DURATION_ATTR = 'data-fe-duration'
export const DELAY_ATTR = 'data-fe-delay'
export const EASE_ATTR = 'data-fe-ease'
export const STAGGER_ATTR = 'data-fe-stagger'
export const REPEAT_ATTR = 'data-fe-repeat'

export type Effect = 'fade' | 'fade-up' | 'fade-down' | 'slide-left' | 'slide-right' | 'zoom-in' | 'zoom-out' | 'flip' | 'blur'
export type Trigger = 'scroll' | 'load' | 'hover' | 'loop'
export type Ease = 'smooth' | 'spring' | 'linear'
/** One pose of an element: how far it is moved, scaled, turned, blurred. */
export type Pose = { opacity?: number; x?: number; y?: number; scale?: number; rotateX?: number; blur?: number }

export const EFFECTS: { value: Effect; label: string; from: Pose; hover: Pose }[] = [
  { value: 'fade', label: 'Fade in', from: { opacity: 0 }, hover: { opacity: 0.8 } },
  { value: 'fade-up', label: 'Fade up', from: { opacity: 0, y: 40 }, hover: { y: -8 } },
  { value: 'fade-down', label: 'Fade down', from: { opacity: 0, y: -40 }, hover: { y: 8 } },
  { value: 'slide-left', label: 'Slide in from the right', from: { opacity: 0, x: 60 }, hover: { x: -8 } },
  { value: 'slide-right', label: 'Slide in from the left', from: { opacity: 0, x: -60 }, hover: { x: 8 } },
  { value: 'zoom-in', label: 'Zoom in', from: { opacity: 0, scale: 0.85 }, hover: { scale: 1.05 } },
  { value: 'zoom-out', label: 'Zoom out', from: { opacity: 0, scale: 1.15 }, hover: { scale: 0.96 } },
  { value: 'flip', label: 'Flip up', from: { opacity: 0, rotateX: 70 }, hover: { rotateX: 10 } },
  { value: 'blur', label: 'Unblur', from: { opacity: 0, blur: 12 }, hover: { blur: 2 } },
]

/** The resting pose every effect ends in. */
export const REST: Required<Pose> = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, blur: 0 }

export type Animation = { effect: Effect; trigger: Trigger; duration: number; delay: number; ease: Ease; stagger: number; repeat: boolean }

const number = (value: string | undefined, fallback: number, max: number) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.min(parsed, max) : fallback
}

/** The element's animation, or null when it has none. */
export function animationOf(node: ElementNode): Animation | null {
  const effect = node.attrs[ANIMATE_ATTR] as Effect | undefined
  if (!effect || !EFFECTS.some((item) => item.value === effect)) return null
  const trigger = node.attrs[TRIGGER_ATTR] as Trigger | undefined
  const ease = node.attrs[EASE_ATTR] as Ease | undefined
  return {
    effect,
    trigger: trigger && ['scroll', 'load', 'hover', 'loop'].includes(trigger) ? trigger : 'scroll',
    duration: number(node.attrs[DURATION_ATTR], 0.6, 10),
    delay: number(node.attrs[DELAY_ATTR], 0, 10),
    ease: ease && ['smooth', 'spring', 'linear'].includes(ease) ? ease : 'smooth',
    stagger: number(node.attrs[STAGGER_ATTR], 0, 2),
    repeat: REPEAT_ATTR in node.attrs,
  }
}

export const effectOf = (effect: Effect) => EFFECTS.find((item) => item.value === effect) ?? EFFECTS[0]!

/** CSS keyframe values for a pose (Web Animations). */
export function poseCss(pose: Pose): { opacity: string; transform: string; filter: string } {
  const p = { ...REST, ...pose }
  return {
    opacity: String(p.opacity),
    transform: `translate(${p.x}px, ${p.y}px) scale(${p.scale}) rotateX(${p.rotateX}deg)`,
    filter: `blur(${p.blur}px)`,
  }
}

/** The CSS easing for a feel ("spring" is approximated with an overshoot curve). */
export const easingCss = (ease: Ease) => (ease === 'linear' ? 'linear' : ease === 'spring' ? 'cubic-bezier(0.34, 1.56, 0.64, 1)' : 'cubic-bezier(0.22, 1, 0.36, 1)')

/** The ready-made "Animation box" block. */
export const ANIMATION_BOX_HTML = `<div ${ANIMATE_ATTR}="fade-up" ${TRIGGER_ATTR}="scroll" ${DURATION_ATTR}="0.7" ${STAGGER_ATTR}="0.12" style="padding: 56px 24px; max-width: 960px; margin: 0 auto; text-align: center"><h2>Something worth noticing</h2><p>Everything in this box glides in, one after another, when visitors scroll to it.</p></div>`
