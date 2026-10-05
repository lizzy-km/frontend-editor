import { alphaOf, toHexColor, withAlpha } from '@/lib/color'
import { Button, Icon } from '@/shared/ui'
import { ColorControl } from '../controls/ColorControl'
import { SliderControl } from '../controls/SliderControl'
import styles from './Background.module.css'
import { MAX_STOPS, type GradientStop } from './gradient'

type Props = { stops: GradientStop[]; onChange: (stops: GradientStop[]) => void }

/** Named colors ("red") -> "#ff0000", using the browser itself; anything else is kept. */
function solid(color: string): string {
  if (/^(#|rgb|hsl)/i.test(color.trim())) return color
  const context = document.createElement('canvas').getContext('2d')
  if (!context) return color
  context.fillStyle = color
  return context.fillStyle
}

/** Halfway between two colors (and their solidness). */
function blend(a: string, b: string): string {
  const [x, y] = [toHexColor(solid(a)), toHexColor(solid(b))]
  const channel = (hex: string, start: number) => parseInt(hex.slice(start, start + 2), 16)
  const mixed = [1, 3, 5].map((start) => Math.round((channel(x, start) + channel(y, start)) / 2).toString(16).padStart(2, '0')).join('')
  return withAlpha(`#${mixed}`, (alphaOf(a) + alphaOf(b)) / 2)
}

/** A new color halfway along the widest gap, blended from its neighbours. */
function addStop(stops: GradientStop[]): GradientStop[] {
  const sorted = [...stops].sort((a, b) => a.at - b.at)
  let best = 0
  for (let i = 1; i < sorted.length - 1; i++) if (sorted[i + 1]!.at - sorted[i]!.at > sorted[best + 1]!.at - sorted[best]!.at) best = i
  const [left, right] = [sorted[best]!, sorted[best + 1]!]
  return [...sorted.slice(0, best + 1), { color: blend(left.color, right.color), at: Math.round((left.at + right.at) / 2) }, ...sorted.slice(best + 1)]
}

/** The colors of a gradient: each with where it sits (0–100%) and how see-through it is. */
export function GradientStops({ stops, onChange }: Props) {
  const update = (index: number, patch: Partial<GradientStop>) => onChange(stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)))
  const reverse = () => onChange([...stops].reverse().map((stop) => ({ ...stop, at: 100 - stop.at })))

  return (
    <div className={styles.stops}>
      {stops.map((stop, index) => (
        <div key={index} className={styles.stop}>
          <div className={styles.stopTop}>
            <ColorControl label={`Color ${index + 1}`} value={stop.color}
              onChange={(color) => update(index, { color: withAlpha(solid(color), alphaOf(stop.color)) })} />
            <button type="button" className={styles.iconButton} aria-label={`Remove color ${index + 1}`} title="Remove this color"
              disabled={stops.length <= 2} onClick={() => onChange(stops.filter((_, i) => i !== index))}>
              <Icon name="trash" size={15} />
            </button>
          </div>
          <label className={styles.mini}>
            Where
            <SliderControl label={`Color ${index + 1} position`} min={0} max={100} unit="%" value={`${stop.at}%`}
              onChange={(value) => update(index, { at: Number.parseFloat(value) })} />
          </label>
          <label className={styles.mini}>
            Solid
            <SliderControl label={`Color ${index + 1} solidness`} min={0} max={100} unit="%" value={`${Math.round(alphaOf(stop.color) * 100)}%`}
              onChange={(value) => update(index, { color: withAlpha(solid(stop.color), Number.parseFloat(value) / 100) })} />
          </label>
        </div>
      ))}
      <div className={styles.buttons}>
        <Button size="small" icon="plus" disabled={stops.length >= MAX_STOPS} onClick={() => onChange(addStop(stops))}>Add color</Button>
        <Button size="small" variant="ghost" icon="redo" onClick={reverse}>Flip</Button>
      </div>
    </div>
  )
}
