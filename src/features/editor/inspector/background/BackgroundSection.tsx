import { useState } from 'react'
import { Button } from '@/shared/ui'
import { setStyle } from '../../actions/styleActions'
import type { StyleMap } from '../../model/types'
import { FieldRow } from '../FieldRow'
import type { StyleField } from '../fieldTypes'
import { Section } from '../Section'
import type { ComputedStyles } from '../useComputedStyle'
import styles from './Background.module.css'
import { backgroundCss, parseBackground, type BackgroundLayers } from './backgroundLayers'
import { GradientTab } from './GradientTab'
import { PictureTab } from './PictureTab'

type Props = { id: string; computed: ComputedStyles; overrides: StyleMap; hasText: boolean }
type Tab = 'picture' | 'gradient'

const COLOR: StyleField = { prop: 'background-color', label: 'Color', control: { type: 'color' } }

/** Background: a color, plus a picture and/or a gradient in their own tabs. */
export function BackgroundSection({ id, computed, overrides, hasText }: Props) {
  const read = (prop: string) => overrides[prop] ?? computed[prop] ?? ''
  const layers = parseBackground(read('background-image'))
  const [tab, setTab] = useState<Tab>(layers.gradient && !layers.picture ? 'gradient' : 'picture')
  const write = (next: Pick<BackgroundLayers, 'gradient' | 'picture'>) => setStyle(id, 'background-image', backgroundCss(next))
  const inUse: Record<Tab, boolean> = { picture: layers.picture !== null, gradient: layers.gradient !== null }

  return (
    <Section title="Background" icon="image">
      <FieldRow id={id} field={COLOR} computed={computed} overrides={overrides} />
      {layers.custom ? (
        <div className={styles.pane}>
          <p className={styles.custom}>
            This background is more detailed than these controls can show, so it's left as it is.
            <code>{read('background-image').slice(0, 160)}</code>
          </p>
          <Button size="small" variant="ghost" onClick={() => write({ gradient: null, picture: null })}>Start over with a plain background</Button>
        </div>
      ) : (
        <>
          <div className={styles.tabs} role="tablist" aria-label="Background picture or gradient">
            {(['picture', 'gradient'] as const).map((name) => (
              <button key={name} type="button" role="tab" aria-selected={tab === name} className={styles.tab} onClick={() => setTab(name)}>
                {name === 'picture' ? 'Picture' : 'Gradient'}
                {inUse[name] && <span className={styles.inUse} aria-label="in use" />}
              </button>
            ))}
          </div>
          {tab === 'picture'
            ? <PictureTab id={id} layers={layers} read={read} />
            : <GradientTab id={id} layers={layers} write={write} read={read} hasText={hasText} />}
        </>
      )}
    </Section>
  )
}
