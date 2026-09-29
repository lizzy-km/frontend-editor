import { useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { setStyle } from '../../actions/styleActions'
import { isValidCssProperty } from '../../model/serialize/escape'
import type { StyleMap } from '../../model/types'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'

type Props = { id: string; overrides: StyleMap }

/** Every change on this screen size as raw CSS, editable, plus "add your own". */
export function CustomCssList({ id, overrides }: Props) {
  const [property, setProperty] = useState('')
  const [value, setValue] = useState('')
  const valid = isValidCssProperty(property.trim()) && value.trim() !== ''

  const add = () => {
    if (!valid) return
    setStyle(id, property.trim().toLowerCase(), value)
    setProperty('')
    setValue('')
  }

  return (
    <div>
      {Object.entries(overrides).map(([name, current]) => (
        <div key={name} className={styles.row}>
          <code className={styles.label}>{name}</code>
          <TextControl label={name} value={current} onChange={(next) => setStyle(id, name, next)} />
          <button type="button" className={`${styles.reset} ${styles.visible}`} style={{ visibility: 'visible' }} onClick={() => setStyle(id, name, '')} aria-label={`Remove ${name}`}>
            <Icon name="close" size={14} />
          </button>
        </div>
      ))}
      <div className={styles.row}>
        <input className={styles.input} placeholder="property" aria-label="New CSS property" value={property} onChange={(event) => setProperty(event.target.value)} />
        <input
          className={styles.input} placeholder="value" aria-label="New CSS value" value={value}
          onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && add()}
        />
        <Button size="small" variant="ghost" icon="plus" aria-label="Add CSS" disabled={!valid} onClick={add} />
      </div>
    </div>
  )
}
