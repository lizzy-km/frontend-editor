import { useState } from 'react'
import { Button, Modal, Switch, toast } from '@/shared/ui'
import { setProjectPublic } from '../api/projectMutations'
import styles from './Workspace.module.css'

type Props = { projectId: string; isPublic: boolean; onChange: (isPublic: boolean) => void; onClose: () => void }

export const publicLink = (projectId: string) => `${window.location.origin}/p/${projectId}`

/** Make a page public (anyone with the link can view and copy it) or private again. */
export function ShareDialog({ projectId, isPublic, onChange, onClose }: Props) {
  const [busy, setBusy] = useState(false)

  const toggle = async (next: boolean) => {
    setBusy(true)
    try {
      await setProjectPublic(projectId, next)
      onChange(next)
    } catch {
      toast('Couldn’t change sharing. Try again.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    await navigator.clipboard.writeText(publicLink(projectId))
    toast('Link copied', 'success')
  }

  return (
    <Modal open title="Share this page" onClose={onClose} width={480}>
      <div className={styles.share}>
        <Switch label="Anyone with the link can see it" checked={isPublic} onChange={(next) => !busy && toggle(next)} />
        <p className={styles.shareNote}>
          {isPublic
            ? 'It also shows in Explore, and others can make their own copy to edit. Your original stays yours.'
            : 'Only you can see this page right now.'}
        </p>
        {isPublic && (
          <div className={styles.shareLink}>
            <input readOnly value={publicLink(projectId)} aria-label="Public link" onFocus={(event) => event.target.select()} />
            <Button icon="copy" onClick={copy}>Copy link</Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
