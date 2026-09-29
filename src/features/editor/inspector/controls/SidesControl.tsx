import { useState } from 'react'
import { Icon } from '@/shared/ui'
import styles from './Controls.module.css'
import { roundNumber, splitUnit } from './cssValues'
import { SliderControl } from './SliderControl'

const SIDES = ['top', 'right', 'bottom', 'left'] as const
const SIDE_LABELS = { top: 'Top', right: 'Right', bottom: 'Bottom', left: 'Left' }

type Props = {
  /** "padding" or "margin" */
  base: string
  label: string
  max: number
  /** Current value of each side, e.g. { top: '16px', ... } */
  values: Record<(typeof SIDES)[number], string>
  onChange: (styles: Record<string, string>) => void
}

const px = (value: string) => roundNumber(splitUnit(value).number ?? 0)

/** One slider for all four sides; "Each side" opens four number boxes. */
export function SidesControl({ base, label, max, values, onChange }: Props) {
  const allSame = SIDES.every((side) => px(values[side]) === px(values.top))
  const [separate, setSeparate] = useState(!allSame)

  const setAll = (value: string) => onChange(Object.fromEntries(SIDES.map((side) => [`${base}-${side}`, value])))

  return (
    <div>
      <div className={styles.sidesTop}>
        <div className={separate ? styles.dimmed : undefined}>
          <SliderControl label={label} value={`${px(values.top)}px`} min={0} max={max} unit="px" onChange={setAll} />
        </div>
        <button
          type="button" className={styles.toggle}
          title="Set each side separately" aria-pressed={separate} onClick={() => setSeparate(!separate)}
        >
          <Icon name="box" size={16} />
        </button>
      </div>
      {separate && (
        <div className={styles.sidesGrid}>
          {SIDES.map((side) => (
            <label key={side} className={styles.sideLabel}>
              {SIDE_LABELS[side]}
              <input
                type="number" className={styles.input} value={px(values[side])} min={0}
                onChange={(event) => onChange({ [`${base}-${side}`]: `${event.target.value || 0}px` })}
              />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
