import { Button, Switch } from '@/shared/ui'
import { setStyles } from '../../actions/styleActions'
import { SegmentedControl } from '../controls/ChoiceControls'
import { SliderControl } from '../controls/SliderControl'
import styles from './Background.module.css'
import type { BackgroundLayers } from './backgroundLayers'
import { gradientCss, type Gradient, type GradientKind } from './gradient'
import { GRADIENT_PRESETS, STARTER_GRADIENT } from './gradientPresets'
import { GradientStops } from './GradientStops'
import { PositionGrid } from './PositionGrid'
import { Row } from './Row'

type Props = {
  id: string
  layers: BackgroundLayers
  write: (layers: Pick<BackgroundLayers, 'gradient' | 'picture'>) => void
  read: (prop: string) => string
  hasText: boolean
}

const KINDS = [{ value: 'linear', label: 'Straight' }, { value: 'radial', label: 'Round' }, { value: 'conic', label: 'Sweep' }]
const ARROWS = ['↑', '↗', '→', '↘', '↓', '↙', '←', '↖']
const TEXT_FILL = { 'background-clip': 'text', '-webkit-background-clip': 'text', '-webkit-text-fill-color': 'transparent' }

function Presets({ onPick }: { onPick: (gradient: Gradient) => void }) {
  return (
    <div className={styles.presets} role="list" aria-label="Ready-made gradients">
      {GRADIENT_PRESETS.map((preset) => (
        <button key={preset.name} type="button" role="listitem" className={styles.preset} title={preset.name} aria-label={preset.name}
          style={{ backgroundImage: gradientCss(preset.gradient) }} onClick={() => onPick(preset.gradient)} />
      ))}
    </div>
  )
}

/** Direction for straight and sweep gradients: 8 quick arrows plus an exact angle. */
function Direction({ angle, onChange }: { angle: number; onChange: (angle: number) => void }) {
  return (
    <>
      <div className={styles.arrows} role="group" aria-label="Direction">
        {ARROWS.map((arrow, index) => (
          <button key={arrow} type="button" className={styles.arrow} aria-pressed={angle === index * 45}
            aria-label={`Towards ${arrow}`} onClick={() => onChange(index * 45)}>{arrow}</button>
        ))}
      </div>
      <Row label="Angle"><SliderControl label="Gradient angle" min={0} max={359} unit="deg" value={`${angle}deg`} onChange={(value) => onChange(Number.parseFloat(value) % 360)} /></Row>
    </>
  )
}

/** Gradient: pick a ready-made one or build your own (type, direction, colors), optionally on the text itself. */
export function GradientTab({ id, layers, write, read, hasText }: Props) {
  const gradient = layers.gradient
  const pick = (next: Gradient) => write({ gradient: next, picture: layers.picture })
  const change = (patch: Partial<Gradient>) => gradient && pick({ ...gradient, ...patch })
  const onText = read('background-clip') === 'text'

  if (!gradient) {
    return (
      <div className={styles.pane}>
        <p className={styles.hint}>Pick a ready-made gradient, or make your own.</p>
        <Presets onPick={pick} />
        <Button size="small" icon="plus" onClick={() => pick(STARTER_GRADIENT)}>Make my own</Button>
      </div>
    )
  }

  return (
    <div className={styles.pane}>
      <div className={styles.checker}><div className={styles.strip} style={{ backgroundImage: gradientCss(gradient) }} /></div>
      <Presets onPick={pick} />
      <Row label="Type"><SegmentedControl label="Gradient type" value={gradient.kind} options={KINDS} onChange={(kind) => change({ kind: kind as GradientKind })} /></Row>
      {gradient.kind !== 'radial' && <Direction angle={gradient.angle} onChange={(angle) => change({ angle })} />}
      {gradient.kind !== 'linear' && (
        <Row label="Middle"><PositionGrid label="Gradient middle" value={gradient.center} onChange={(center) => change({ center })} /></Row>
      )}
      {gradient.kind === 'radial' && (
        <Row label="Shape">
          <SegmentedControl label="Gradient shape" value={gradient.shape} options={[{ value: 'circle', label: 'Circle' }, { value: 'ellipse', label: 'Oval' }]}
            onChange={(shape) => change({ shape: shape as Gradient['shape'] })} />
        </Row>
      )}
      <GradientStops stops={gradient.stops} onChange={(stops) => change({ stops })} />
      {layers.picture && <p className={styles.hint}>Drawn over your background picture. Make colors less solid to let it show.</p>}
      {hasText && (
        <Switch label="Use on the text instead" checked={onText}
          onChange={(on) => setStyles(id, on ? TEXT_FILL : { 'background-clip': '', '-webkit-background-clip': '', '-webkit-text-fill-color': '' })} />
      )}
      <Button size="small" variant="ghost" icon="trash" onClick={() => write({ gradient: null, picture: layers.picture })}>Remove gradient</Button>
    </div>
  )
}
