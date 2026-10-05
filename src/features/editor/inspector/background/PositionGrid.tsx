import styles from './Background.module.css'

const STEPS = ['0%', '50%', '100%']
const NAMES = [['Top left', 'Top', 'Top right'], ['Left', 'Middle', 'Right'], ['Bottom left', 'Bottom', 'Bottom right']]

/** "left top" / "center" / "50% 50%" -> "x% y%" (only the first layer counts). */
export function normalizePosition(value: string): string {
  const first = value.split(',')[0]!.trim()
  const words = first.split(/\s+/)
  const map: Record<string, string> = { left: '0%', top: '0%', center: '50%', right: '100%', bottom: '100%' }
  if (words.length === 1) return words[0] === 'center' ? '50% 50%' : `${map[words[0]!] ?? words[0]} 50%`
  const [a, b] = words.map((word) => map[word] ?? word)
  return ['top', 'bottom'].includes(words[0]!) ? `${b} ${a}` : `${a} ${b}`
}

type Props = { value: string; onChange: (value: string) => void; label: string }

/** Nine dots: which part stays in view (pictures) or where the middle is (round gradients). */
export function PositionGrid({ value, onChange, label }: Props) {
  const current = normalizePosition(value)
  return (
    <div className={styles.grid} role="radiogroup" aria-label={label}>
      {STEPS.map((y, row) => STEPS.map((x, col) => {
        const position = `${x} ${y}`
        return (
          <button key={position} type="button" role="radio" aria-checked={current === position}
            aria-label={NAMES[row]![col]} title={NAMES[row]![col]} className={styles.dot} onClick={() => onChange(position)} />
        )
      }))}
    </div>
  )
}
