import { useState } from 'react'
import { Button } from '@/shared/ui'
import { addLookTo, removeLook, renameLookOf } from '../../actions/lookActions'
import type { ComponentInfo } from '../../model/reuse/library'
import panel from './Components.module.css'

/** The looks (variants) of one component: pick one to work with, add another, rename or remove the chosen one. */
export function LooksBar({ info, lookId, onPick }: { info: ComponentInfo; lookId: string; onPick: (id: string) => void }) {
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const current = info.looks.find((look) => look.id === lookId) ?? info.looks[0]!
  const add = () => {
    const id = addLookTo(lookId, name.trim() || 'New look')
    if (id) onPick(id)
    setAdding(false); setName('')
  }
  return (
    <div className={panel.looks}>
      <span className={panel.looksLabel}>Looks</span>
      <div className={panel.chips} role="group" aria-label="Looks">
        {info.looks.map((look) => (
          <button key={look.id} type="button" className={panel.chip} aria-pressed={look.id === current.id} onClick={() => onPick(look.id)} title={`${look.copies.length} copies use this look`}>
            {look.label}<small>{look.copies.length}</small>
          </button>
        ))}
        <button type="button" className={panel.chip} onClick={() => setAdding(!adding)} aria-expanded={adding}>+ Add a look</button>
      </div>
      {adding && (
        <div className={panel.addLook}>
          <input className={panel.input} aria-label="Name of the new look" placeholder="e.g. Outline, Dark, Large" value={name} autoFocus onChange={(event) => setName(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && add()} />
          <Button size="small" variant="primary" onClick={add}>Add</Button>
        </div>
      )}
      {info.looks.length > 1 && (
        <div className={panel.addLook}>
          <input className={panel.input} aria-label="Name of this look" key={current.label} defaultValue={current.label}
            onBlur={(event) => event.target.value.trim() && event.target.value !== current.label && renameLookOf(current.id, event.target.value)} onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()} />
          <Button size="small" variant="ghost" onClick={() => { removeLook(current.id); onPick(info.id) }}>Remove this look</Button>
        </div>
      )}
    </div>
  )
}
