import { Icon } from '@/shared/ui'
import { setStyle, setStyles } from '../actions/styleActions'
import type { StyleMap } from '../model/types'
import { companionStyles } from './companionStyles'
import { SegmentedControl, SelectControl } from './controls/ChoiceControls'
import { ColorControl } from './controls/ColorControl'
import styles from './controls/Controls.module.css'
import { SidesControl } from './controls/SidesControl'
import { SizeControl } from './controls/SizeControl'
import { SliderControl } from './controls/SliderControl'
import { TextControl } from './controls/TextControl'
import type { StyleField } from './fieldTypes'
import type { ComputedStyles } from './useComputedStyle'

type Props = { id: string; field: StyleField; computed: ComputedStyles; overrides: StyleMap }

const sidesOf = (base: string, overrides: StyleMap, computed: ComputedStyles) => ({
  top: overrides[`${base}-top`] ?? computed[`${base}-top`] ?? '0px',
  right: overrides[`${base}-right`] ?? computed[`${base}-right`] ?? '0px',
  bottom: overrides[`${base}-bottom`] ?? computed[`${base}-bottom`] ?? '0px',
  left: overrides[`${base}-left`] ?? computed[`${base}-left`] ?? '0px',
})

/** Picks the right control for a field. */
function Control({ id, field, computed, overrides }: Props) {
  const value = overrides[field.prop] ?? field.read?.(computed) ?? computed[field.prop] ?? ''
  const change = (next: string) => {
    const extra = companionStyles(field.prop, next, computed)
    if (Object.keys(extra).length) setStyles(id, { [field.prop]: next, ...extra })
    else setStyle(id, field.prop, next)
  }
  const common = { value, onChange: change, label: field.label }
  const control = field.control

  switch (control.type) {
    case 'color': return <ColorControl {...common} />
    case 'slider': return <SliderControl {...common} {...control} />
    case 'select': return <SelectControl {...common} options={control.options} />
    case 'segmented': return <SegmentedControl {...common} options={control.options} />
    case 'size': return <SizeControl {...common} />
    case 'text': return <TextControl {...common} placeholder={control.placeholder} />
    case 'sides':
      return <SidesControl base={field.prop} label={field.label} max={control.max} values={sidesOf(field.prop, overrides, computed)} onChange={(values) => setStyles(id, values)} />
  }
}

/** Label + control + "reset" button (shown when the user changed this). */
export function FieldRow(props: Props) {
  const { id, field, overrides } = props
  const changedProps = field.control.type === 'sides'
    ? ['top', 'right', 'bottom', 'left'].map((side) => `${field.prop}-${side}`)
    : [field.prop]
  const changed = changedProps.some((prop) => overrides[prop] !== undefined)
  const reset = () => setStyles(id, Object.fromEntries(changedProps.map((prop) => [prop, ''])))

  return (
    <div className={`${styles.row} ${field.control.type === 'sides' ? styles.stacked : ''}`} title={field.hint}>
      <span className={styles.label}>
        {changed && <span className={styles.changed} aria-label="Changed" />}
        {field.label}
      </span>
      <Control {...props} />
      <button type="button" className={`${styles.reset} ${changed ? styles.visible : ''}`} onClick={reset} aria-label={`Reset ${field.label}`} title="Back to original">
        <Icon name="undo" size={14} />
      </button>
    </div>
  )
}
