import { useState } from 'react'
import { PictureFileButton } from '@/features/assets/PictureFileButton'
import { Button, Modal, TextField } from '@/shared/ui'
import { setAttributes } from '../actions/nodeActions'
import { getElement } from '../model/tree/queries'
import { getDoc } from '../store/doc.store'
import styles from './ChangePictureDialog.module.css'

type Props = { id: string; open: boolean; onClose: () => void }

const currentSrc = (id: string) => getElement(getDoc().nodes, id)?.attrs.src ?? ''
const isEmbedded = (src: string) => src.startsWith('data:')

/** Swap a picture: from the computer, or by pasting its web address. */
export function ChangePictureDialog({ id, open, onClose }: Props) {
  const [url, setUrl] = useState(() => currentSrc(id))
  const [alt, setAlt] = useState(() => getElement(getDoc().nodes, id)?.attrs.alt ?? '')

  const apply = () => {
    // srcset (sharper images) would override the new src, so it is removed.
    setAttributes(id, { src: url.trim(), alt, srcset: '' })
    onClose()
  }

  return (
    <Modal
      open={open} onClose={onClose} title="Change picture"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={apply} disabled={!url.trim()}>Use this picture</Button></>}
    >
      <div className={styles.body}>
        {url && <img className={styles.preview} src={url} alt="" />}
        <PictureFileButton onPicked={setUrl} />
        <TextField
          label="…or paste a picture address (link)" value={isEmbedded(url) ? '' : url} onChange={(event) => setUrl(event.target.value)}
          placeholder={isEmbedded(url) ? 'Using the picture from your computer' : 'https://…'}
          hint="Right-click any picture on the web → “Copy image address”, then paste it here."
        />
        <TextField
          label="Short description" value={alt} onChange={(event) => setAlt(event.target.value)}
          placeholder="e.g. Fresh bread on a table" hint="Read aloud to blind visitors and shown if the picture can't load."
        />
      </div>
    </Modal>
  )
}
