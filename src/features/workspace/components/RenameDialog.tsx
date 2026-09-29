import { useState, type FormEvent } from 'react'
import { Button, Modal, TextField } from '@/shared/ui'
import styles from './Workspace.module.css'

type Props = { name: string; onSave: (name: string) => Promise<void>; onClose: () => void }

/** Give a saved page a new name. */
export function RenameDialog({ name, onSave, onClose }: Props) {
  const [value, setValue] = useState(name)
  const [busy, setBusy] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      await onSave(value)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open title="Rename page" onClose={onClose} width={440}>
      <form onSubmit={submit} className={styles.form}>
        <TextField label="Page name" value={value} autoFocus maxLength={120} onChange={(event) => setValue(event.target.value)} />
        <Button type="submit" variant="primary" loading={busy} disabled={!value.trim()}>Save name</Button>
      </form>
    </Modal>
  )
}
