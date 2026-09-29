import { useState } from 'react'
import { Button } from '@/shared/ui'
import { setAttribute } from '../../actions/nodeActions'
import type { ElementNode } from '../../model/types'
import { ChangePictureDialog } from '../../quick/ChangePictureDialog'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

/** Swap a picture and describe it. */
export function PictureSection({ node }: { node: ElementNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Section title="Picture file" icon="image">
      <Button icon="image" full onClick={() => setOpen(true)}>Change picture</Button>
      <div className={styles.row} title="Read aloud to blind visitors and shown if the picture can't load">
        <span className={styles.label}>Description</span>
        <TextControl label="Picture description" value={node.attrs.alt ?? ''} placeholder="What's in the picture?" onChange={(value) => setAttribute(node.id, 'alt', value)} />
      </div>
      {open && <ChangePictureDialog id={node.id} open onClose={() => setOpen(false)} />}
    </Section>
  )
}
