import { useState } from 'react'
import { embeddedPictures } from '@/features/editor/model/embedded'
import { movePicturesOut } from '@/features/assets/movePictures'
import { Button, Icon, Spinner, toast } from '@/shared/ui'
import { useDocStore } from '../store/doc.store'
import { useSaveStore } from '../persistence/save.store'
import styles from './Toolbar.module.css'

/** "Saved in this browser" / "Saving…" / "Couldn't save". A page too big to save says why and, for pasted pictures, offers the fix. */
export function SaveIndicator() {
  const status = useSaveStore((state) => state.status)
  const where = useSaveStore((state) => state.where)
  const problem = useSaveStore((state) => state.problem)
  const pictures = useDocStore((state) => (status === 'error' && problem ? embeddedPictures(state.doc).length : 0))
  const [moving, setMoving] = useState(false)

  const move = async () => {
    setMoving(true)
    try {
      const { moved, skipped } = await movePicturesOut()
      toast(skipped ? `Moved ${moved} pictures out of the code. ${skipped} were too big (over 5 MB): make them smaller or use a link.` : `Moved ${moved} ${moved === 1 ? 'picture' : 'pictures'} out of the code. Saving again…`, skipped ? 'info' : 'success')
    } catch (error) {
      toast((error as Error).message, 'error')
    } finally {
      setMoving(false)
    }
  }

  const content = {
    idle: <><Icon name="check" size={15} /> All changes saved {where}</>,
    saved: <><Icon name="check" size={15} /> Saved {where}</>,
    unsaved: <>Unsaved changes…</>,
    saving: <><Spinner size={13} /> Saving…</>,
    error: problem
      ? <><Icon name="help" size={15} /> Too big to save to your account</>
      : <><Icon name="help" size={15} /> Couldn't save — check your connection</>,
  }[status]

  return (
    <>
      <span className={`${styles.saveStatus} ${status === 'error' ? styles.saveError : ''}`} role="status" aria-live="polite" title={status === 'error' && problem ? problem : undefined}>
        {content}
      </span>
      {status === 'error' && problem && pictures > 0 && (
        <Button size="small" icon="image" loading={moving} disabled={moving} onClick={() => void move()} title="Uploads the pictures pasted inside your code and puts their links in their place">Move pictures out of the code</Button>
      )}
    </>
  )
}
