import { useState, type ReactNode } from 'react'
import { Button, Modal, TextField } from '@/shared/ui'
import { setAttributes } from '../actions/nodeActions'
import { getElement } from '../model/tree/queries'
import { getDoc } from '../store/doc.store'
import styles from './ChangePictureDialog.module.css'

type Props = {
  id: string
  open: boolean
  onClose: () => void
  /** Extra way to pick a picture (the uploads feature plugs in here). */
  extra?: (choose: (url: string) => void) => ReactNode
}

const currentSrc = (id: string) => getElement(getDoc().nodes, id)?.attrs.src ?? ''

/** Swap a picture by pasting its web address. */
export function ChangePictureDialog({ id, open, onClose, extra }: Props) {
  const [url, setUrl] = useState(() => currentSrc(id))
  const [alt, setAlt] = useState(() => getElement(getDoc().nodes, id)?.attrs.alt ?? '')

  const apply = (src = url) => {
    // srcset (sharper images) would override the new src, so it is removed.
    setAttributes(id, { src: src.trim(), alt, srcset: '' })
    onClose()
  }

  return (
    <Modal
      open={open} onClose={onClose} title="Change picture"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => apply()} disabled={!url.trim()}>Use this picture</Button></>}
    >
      <div className={styles.body}>
        {url && <img className={styles.preview} src={url} alt="" />}
        {extra?.((src) => { setUrl(src); apply(src) })}
        <TextField
          label="Picture address (link)" value={url} onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…" hint="Right-click any picture on the web → “Copy image address”, then paste it here."
        />
        <TextField
          label="Short description" value={alt} onChange={(event) => setAlt(event.target.value)}
          placeholder="e.g. Fresh bread on a table" hint="Read aloud to blind visitors and shown if the picture can't load."
        />
      </div>
    </Modal>
  )
}
