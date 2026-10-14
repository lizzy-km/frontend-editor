import type { ReactNode } from 'react'
import { track } from '@/features/analytics/track'
import { Button, Switch } from '@/shared/ui'
import { setAttributes } from '../../actions/nodeActions'
import { tellFrame } from '../../frame/frame.store'
import {
  ANIMATE_ATTR, DELAY_ATTR, DURATION_ATTR, EASE_ATTR, easingCss, effectOf, EFFECTS, poseCss, REPEAT_ATTR, REST, STAGGER_ATTR, TRIGGER_ATTR,
  animationOf, type Animation,
} from '../../model/animations'
import { isElement, type ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { SliderControl } from '../controls/SliderControl'
import { Section } from '../Section'

const ALL = [ANIMATE_ATTR, TRIGGER_ATTR, DURATION_ATTR, DELAY_ATTR, EASE_ATTR, STAGGER_ATTR, REPEAT_ATTR]
const WHEN = [
  { value: 'scroll', label: 'When it scrolls into view' }, { value: 'load', label: 'When the page opens' },
  { value: 'hover', label: 'When the mouse is over it' }, { value: 'loop', label: 'Over and over' },
]
const FEEL = [{ value: 'smooth', label: 'Smooth' }, { value: 'spring', label: 'Bouncy' }, { value: 'linear', label: 'Steady' }]

/** Shows one run in the editor (animations don't play while editing). */
function play(id: string, animation: Animation) {
  const effect = effectOf(animation.effect)
  const entrance = animation.trigger === 'scroll' || animation.trigger === 'load'
  const frames = entrance ? [poseCss(effect.from), poseCss(REST)] : [poseCss(REST), poseCss(effect.hover), poseCss(REST)]
  tellFrame('play', { id, frames, duration: animation.duration, delay: animation.delay, easing: easingCss(animation.ease), stagger: entrance ? animation.stagger : 0 })
}

/** Make anything glide, zoom or fade in — or move on hover, or loop. */
export function AnimationSection({ node }: { node: ElementNode }) {
  const animation = animationOf(node)
  const children = useDocStore((state) => node.children.filter((id) => isElement(state.doc.nodes[id])).length)
  const set = (change: Record<string, string>) => setAttributes(node.id, change)
  const choose = (effect: string) => {
    if (!effect) return set(Object.fromEntries(ALL.map((name) => [name, ''])))
    set({ [ANIMATE_ATTR]: effect, ...(animation ? {} : { [TRIGGER_ATTR]: 'scroll', [DURATION_ATTR]: '0.6' }) })
    track('animation_set', { effect })
  }
  const row = (label: string, control: ReactNode, hint?: string) => (
    <div className={styles.row} title={hint}><span className={styles.label}>{label}</span>{control}</div>
  )

  return (
    <Section title="Animation" icon="sparkle" defaultOpen={Boolean(animation)}>
      {row('Effect', <SelectControl label="Animation effect" value={animation?.effect ?? ''} onChange={choose}
        options={[{ value: '', label: 'None' }, ...EFFECTS.map((effect) => ({ value: effect.value, label: effect.label }))]} />)}
      {animation && (
        <>
          {row('Plays', <SelectControl label="When it plays" value={animation.trigger} options={WHEN} onChange={(value) => set({ [TRIGGER_ATTR]: value })} />)}
          {row('Duration', <SliderControl label="Animation duration in seconds" value={String(animation.duration)} min={0.1} max={3} step={0.1} unit="" onChange={(value) => set({ [DURATION_ATTR]: value })} />, 'Seconds')}
          {row('Delay', <SliderControl label="Animation delay in seconds" value={String(animation.delay)} min={0} max={3} step={0.1} unit="" onChange={(value) => set({ [DELAY_ATTR]: value })} />, 'Seconds before it starts')}
          {row('Feel', <SelectControl label="Animation feel" value={animation.ease} options={FEEL} onChange={(value) => set({ [EASE_ATTR]: value })} />)}
          {children > 1 && (animation.trigger === 'scroll' || animation.trigger === 'load') &&
            row('One by one', <SliderControl label="Time between items in seconds" value={String(animation.stagger)} min={0} max={0.5} step={0.02} unit="" onChange={(value) => set({ [STAGGER_ATTR]: value === '0' ? '' : value })} />, 'The things inside appear one after another (0 = all together)')}
          {animation.trigger === 'scroll' && (
            <Switch label="Play every time it scrolls into view" checked={animation.repeat} onChange={(on) => set({ [REPEAT_ATTR]: on ? 'true' : '' })} />
          )}
          <Button size="small" icon="eye" onClick={() => play(node.id, animation)}>Play</Button>
        </>
      )}
    </Section>
  )
}
