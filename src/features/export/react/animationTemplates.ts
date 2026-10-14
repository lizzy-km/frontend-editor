import { ANIMATE_ATTR, EFFECTS, type Pose } from '@/features/editor/model/animations'
import { isElement, type NodeMap } from '@/features/editor/model/types'

export const MOTION_DEPS = { motion: '^12.23.0' }

/** A pose as Motion values ({ opacity, x, y, scale, rotateX, filter }). */
function motionPose(pose: Pose): string {
  const parts = Object.entries(pose).map(([key, value]) => (key === 'blur' ? `filter: 'blur(${value}px)'` : `${key}: ${value}`))
  return `{ ${parts.join(', ')} }`
}

const table = (pick: (effect: (typeof EFFECTS)[number]) => Pose) =>
  EFFECTS.map((effect) => `  '${effect.value}': ${motionPose(pick(effect))},`).join('\n')

/** src/components/ui/animation.ts — the same effects as in the editor, as Motion props. */
const ANIMATION_TS = `import type { MotionProps, TargetAndTransition, Transition, Variants } from 'motion/react'

export type Effect = ${EFFECTS.map((effect) => `'${effect.value}'`).join(' | ')}
export type Trigger = 'scroll' | 'load' | 'hover' | 'loop'
export type Ease = 'smooth' | 'spring' | 'linear'
export type AnimationOptions = {
  effect: Effect
  /** scroll = when it comes into view (default), load = when the page opens, hover, loop = over and over */
  trigger?: Trigger
  /** Seconds. */
  duration?: number
  delay?: number
  ease?: Ease
  /** Seconds between children: they appear one by one (give them animationItem()). */
  stagger?: number
  /** Scroll trigger: play only the first time (default) or every time. */
  once?: boolean
}

/** Where each effect starts. */
const FROM: Record<Effect, TargetAndTransition> = {
${table((effect) => effect.from)}
}

/** How each effect moves on hover and in a loop. */
const MOVE: Record<Effect, TargetAndTransition> = {
${table((effect) => effect.hover)}
}

const REST: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, filter: 'blur(0px)' }

function transition({ duration = 0.6, delay = 0, ease = 'smooth' }: Partial<AnimationOptions>): Transition {
  if (ease === 'spring') return { type: 'spring', bounce: 0.35, duration, delay }
  return { duration, delay, ease: ease === 'linear' ? 'linear' : [0.22, 1, 0.36, 1] }
}

/** Motion props for an animated element: <motion.div {...animation({ effect: 'fade-up' })}>. */
export function animation(options: AnimationOptions): MotionProps {
  const { effect, trigger = 'scroll', once = true, stagger } = options
  const timing = transition(options)
  if (trigger === 'hover') return { whileHover: MOVE[effect], transition: timing }
  if (trigger === 'loop') return { animate: MOVE[effect], transition: { ...timing, repeat: Infinity, repeatType: 'reverse' } }
  const variants: Variants = stagger
    ? { hidden: {}, shown: { transition: { staggerChildren: stagger, delayChildren: options.delay ?? 0 } } }
    : { hidden: FROM[effect], shown: { ...REST, transition: timing } }
  return trigger === 'load'
    ? { variants, initial: 'hidden', animate: 'shown' }
    : { variants, initial: 'hidden', whileInView: 'shown', viewport: { once, amount: 0.15 } }
}

/** For each child of a "one by one" element: <motion.li {...animationItem('fade-up')}>. */
export function animationItem(effect: Effect, options: Partial<AnimationOptions> = {}): MotionProps {
  return { variants: { hidden: FROM[effect], shown: { ...REST, transition: transition(options) } } }
}
`

/** src/components/ui/AnimateBox.tsx — wrap anything to animate it. */
const ANIMATE_BOX = `import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { animation, type AnimationOptions } from './animation'

type Props = AnimationOptions & { children: ReactNode; className?: string }

/**
 * Ready-made: <AnimateBox effect="fade-up">…</AnimateBox>. Same effects as the
 * editor. For "one by one", wrap the children in <motion.div {...animationItem(effect)}>.
 */
export default function AnimateBox({ children, className, ...options }: Props) {
  return (
    <motion.div className={className} {...animation(options)}>
      {children}
    </motion.div>
  )
}
`

/** The animation helpers, when something on the page is animated. */
export function animationFiles(nodes: NodeMap): Record<string, string> {
  const animated = Object.values(nodes).some((node) => isElement(node) && node.attrs[ANIMATE_ATTR])
  return animated ? { 'src/components/ui/animation.ts': ANIMATION_TS, 'src/components/ui/AnimateBox.tsx': ANIMATE_BOX } : {}
}

/** Motion in package.json when animations are used. */
export const animationDeps = (nodes: NodeMap) => (Object.keys(animationFiles(nodes)).length ? MOTION_DEPS : {})
