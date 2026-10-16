import { useEffect } from 'react'
import { Button, Icon } from '@/shared/ui'
import { addFromLibrary, libraryAvailable, loadLibrary, removeFromLibrary } from '../../actions/libraryActions'
import { useLibraryStore } from '../../store/library.store'
import panel from './Components.module.css'

/** "My library": components saved to your account, ready to use on this page or any other. */
export function MyLibrary() {
  const { items, status, busy } = useLibraryStore()
  const available = libraryAvailable()
  useEffect(() => { if (available && useLibraryStore.getState().status === 'idle') void loadLibrary() }, [available])
  return (
    <section className={panel.new}>
      <p className={panel.title}>My library <span>{available ? items.length : 'account'}</span></p>
      {!available && <p className={panel.muted}>Sign in to keep components in your account and use them in any of your pages or sites.</p>}
      {available && status === 'loading' && <p className={panel.muted}>Opening your library…</p>}
      {available && status === 'error' && <p className={panel.muted} role="alert">Your library could not be opened. <Button size="small" variant="ghost" onClick={() => void loadLibrary()}>Try again</Button></p>}
      {available && status === 'ready' && items.length === 0 && <p className={panel.muted}>Nothing saved yet. Press “Save to my library” on one of your components below.</p>}
      <ul className={panel.list}>
        {items.map((item) => (
          <li key={item.id} className={panel.row}>
            <div className={panel.head}><Icon name="component" size={18} /><strong className={panel.rename}>{item.name}</strong><span className={panel.count}>version {item.version}</span></div>
            <div className={panel.actions}>
              <Button size="small" variant="primary" icon="plus" disabled={busy} onClick={() => addFromLibrary(item.id)}>Add to this page</Button>
              <Button size="small" variant="ghost" disabled={busy} onClick={() => void removeFromLibrary(item.id)} title="Pages that already use it keep their copy">Remove from library</Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
