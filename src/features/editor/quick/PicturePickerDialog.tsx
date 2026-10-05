import { useState } from 'react'
import { PictureFileButton } from '@/features/assets/PictureFileButton'
import { Button, Modal, TextField } from '@/shared/ui'
import styles from './ChangePictureDialog.module.css'

type Props = {
  open: boolean
  onClose: () => void
  title: string
  initialUrl: string
  /** Ask for a short description too (pictures in the page; not backgrounds). */
  initialDescription?: string
  onUse: (url: string, description: string) => void
}

const isEmbedded = (src: string) => src.startsWith('data:')

/** Pick a picture: from the computer, or by pasting its web address. Used for pictures and backgrounds. */
export function PicturePickerDialog({ open, onClose, title, initialUrl, initialDescription, onUse }: Props) {
  const [url, setUrl] = useState(initialUrl)
  const [description, setDescription] = useState(initialDescription ?? '')

  const use = () => {
    onUse(url.trim(), description)
    onClose()
  }

  return (
    <Modal
      open={open} onClose={onClose} title={title}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={use} disabled={!url.trim()}>Use this picture</Button></>}
    >
      <div className={styles.body}>
        {url && <img className={styles.preview} src={url} alt="" />}
        <PictureFileButton onPicked={setUrl} />
        <TextField
          label="…or paste a picture address (link)" value={isEmbedded(url) ? '' : url} onChange={(event) => setUrl(event.target.value)}
          placeholder={isEmbedded(url) ? 'Using the picture from your computer' : 'https://…'}
          hint="Right-click any picture on the web → “Copy image address”, then paste it here."
        />
        {initialDescription !== undefined && (
          <TextField
            label="Short description" value={description} onChange={(event) => setDescription(event.target.value)}
            placeholder="e.g. Fresh bread on a table" hint="Read aloud to blind visitors and shown if the picture can't load."
          />
        )}
      </div>
    </Modal>
  )
}
