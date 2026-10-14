import { useMemo, useState } from 'react'
import { changeColor, changeThemeColor } from '../../actions/paletteActions'
import { paletteOf } from '../../model/palette'
import { useDocStore } from '../../store/doc.store'
import { ColorRow } from './ColorRow'
import styles from './Colors.module.css'

const SHOWN = 14

const times = (uses: number) => (uses === 1 ? 'used once' : `used ${uses} times`)

/** Every color of the project in one place: change one and it changes everywhere it is used. */
export function ColorsPanel() {
  const doc = useDocStore((state) => state.doc)
  const { theme, colors } = useMemo(() => paletteOf(doc), [doc])
  const [all, setAll] = useState(false)
  const shown = all ? colors : colors.slice(0, SHOWN)

  return (
    <div className={styles.panel}>
      <p className={styles.note}>Change a color here and it changes everywhere it is used: text, backgrounds, borders and buttons, on every page and screen size.</p>
      {theme.length > 0 && (
        <>
          <p className={styles.title}>Theme colors</p>
          <div className={styles.list} role="list" aria-label="Theme colors">
            {theme.map((color) => (
              <div role="listitem" key={`${color.name}-${color.key}`}>
                <ColorRow
                  value={color.key} title={color.name} detail={color.uses ? times(color.uses) : 'set in your code'}
                  onChange={(hex, from) => changeThemeColor(color.name, color.key, hex, `theme:${color.name}:${from}`)}
                />
              </div>
            ))}
          </div>
        </>
      )}
      <p className={styles.title}>Colors on your page</p>
      {colors.length === 0 && <p className={styles.note}>No colors found yet. Add some text, a button or a background.</p>}
      <div className={styles.list} role="list" aria-label="Colors on your page">
        {shown.map((color) => (
          <div role="listitem" key={color.key}>
            <ColorRow value={color.key} title={color.key.toUpperCase()} detail={times(color.uses)} onChange={(hex, from) => changeColor(color.key, hex, `color:${from}`)} />
          </div>
        ))}
      </div>
      {colors.length > SHOWN && <button type="button" className={styles.more} onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${colors.length} colors`}</button>}
    </div>
  )
}
