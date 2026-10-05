import { useState } from 'react'
import { Button, Switch } from '@/shared/ui'
import { setStyle, setStyles } from '../../actions/styleActions'
import { PicturePickerDialog } from '../../quick/PicturePickerDialog'
import { SelectControl } from '../controls/ChoiceControls'
import styles from './Background.module.css'
import { backgroundCss, pictureCss, type BackgroundLayers } from './backgroundLayers'
import { PositionGrid } from './PositionGrid'
import { Row } from './Row'

type Props = { id: string; layers: BackgroundLayers; read: (prop: string) => string }

const FIT = [
  { value: 'cover', label: 'Fill the box (may crop)' }, { value: 'contain', label: 'Show all of it' },
  { value: 'auto', label: 'Original size' }, { value: '100% 100%', label: 'Stretch to fit' },
]
const REPEAT = [
  { value: 'no-repeat', label: 'Once' }, { value: 'repeat', label: 'Tile (repeat)' },
  { value: 'repeat-x', label: 'Tile across' }, { value: 'repeat-y', label: 'Tile down' },
]

/** Only the first layer's value matters here ("cover, cover" -> "cover"). */
const firstLayer = (value: string) => value.split(',')[0]!.trim()

/** Background picture: choose, see it, decide how it fills the box. */
export function PictureTab({ id, layers, read }: Props) {
  const [picking, setPicking] = useState(false)
  const picture = layers.picture

  const use = (url: string) => {
    const image = backgroundCss({ gradient: layers.gradient, picture: url })
    // A first picture fills the box, centred, shown once (the browser default would tile it).
    if (picture === null) {
      setStyles(id, { 'background-image': image, 'background-size': 'cover', 'background-position': '50% 50%', 'background-repeat': 'no-repeat' })
    } else setStyle(id, 'background-image', image)
  }
  const remove = () => setStyle(id, 'background-image', backgroundCss({ gradient: layers.gradient, picture: null }))

  return (
    <div className={styles.pane}>
      <div className={styles.preview} style={picture ? { backgroundImage: pictureCss(picture), backgroundSize: firstLayer(read('background-size')) || 'cover' } : undefined}>
        {!picture && 'No background picture yet'}
      </div>
      <div className={styles.buttons}>
        <Button size="small" icon="image" onClick={() => setPicking(true)}>{picture ? 'Change picture' : 'Choose picture'}</Button>
        {picture && <Button size="small" variant="ghost" icon="trash" onClick={remove}>Remove</Button>}
      </div>
      {picture && (
        <>
          <Row label="Fit">
            <SelectControl label="Picture fit" value={firstLayer(read('background-size'))} options={FIT} onChange={(value) => setStyle(id, 'background-size', value)} />
          </Row>
          <Row label="Keep in view" hint="Which part of the picture stays visible when it's cropped">
            <PositionGrid label="Picture position" value={read('background-position')} onChange={(value) => setStyle(id, 'background-position', value)} />
          </Row>
          <Row label="Repeat">
            <SelectControl label="Picture repeat" value={firstLayer(read('background-repeat'))} options={REPEAT} onChange={(value) => setStyle(id, 'background-repeat', value)} />
          </Row>
          <Switch label="Stays still when the page scrolls" checked={firstLayer(read('background-attachment')) === 'fixed'}
            onChange={(on) => setStyle(id, 'background-attachment', on ? 'fixed' : 'scroll')} />
          {layers.gradient && <p className={styles.hint}>Your gradient is drawn over this picture.</p>}
        </>
      )}
      {picking && (
        <PicturePickerDialog open onClose={() => setPicking(false)} title={picture ? 'Change background picture' : 'Background picture'}
          initialUrl={picture ?? ''} onUse={use} />
      )}
    </div>
  )
}
