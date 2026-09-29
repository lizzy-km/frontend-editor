import { useState } from 'react'
import { Button, Modal } from '@/shared/ui'

type Props = {
  open: boolean
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

/** "Are you sure?" with a red confirm button that shows progress. */
export function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onClose }: Props) {
  const [busy, setBusy] = useState(false)
  const confirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title} width={440}
      footer={<><Button variant="ghost" onClick={onClose}>Keep it</Button><Button variant="danger" loading={busy} onClick={confirm}>{confirmLabel}</Button></>}>
      <p>{message}</p>
    </Modal>
  )
}
