import { useState } from 'react'
import { addAccessName, setCondition } from '../../actions/accessActions'
import { accessOf, type Audience, type Condition } from '../../model/conditions'
import { useDocStore } from '../../store/doc.store'
import { SegmentedControl } from '../controls/ChoiceControls'
import styles from './Who.module.css'

const AUDIENCE = [{ value: 'everyone', label: 'Everyone' }, { value: 'signed-in', label: 'Signed in' }, { value: 'signed-out', label: 'Signed out' }]

/** Tick boxes for the site's roles or flags, plus a box to add a new one. */
function Picks({ kind, title, picked, onChange }: { kind: 'roles' | 'flags'; title: string; picked: string[]; onChange: (next: string[]) => void }) {
  const names = useDocStore((state) => accessOf(state.doc)[kind])
  const [adding, setAdding] = useState('')
  const toggle = (name: string, on: boolean) => onChange(on ? [...picked, name] : picked.filter((item) => item !== name))
  const add = () => {
    addAccessName(kind, adding)
    setAdding('')
  }
  return (
    <fieldset className={styles.picks}>
      <legend>{title}</legend>
      {names.map((name) => (
        <label key={name} className={styles.pick}>
          <input type="checkbox" checked={picked.includes(name)} onChange={(event) => toggle(name, event.target.checked)} /> {name}
        </label>
      ))}
      <input className={styles.add} aria-label={`New ${kind === 'roles' ? 'role' : 'flag'}`} placeholder={kind === 'roles' ? 'Add a role…' : 'Add a flag…'}
        value={adding} onChange={(event) => setAdding(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && add()} onBlur={() => adding && add()} />
    </fieldset>
  )
}

/** Who can see this page or element: everyone / signed in (optionally some roles) / signed out, plus flags. */
export function WhoControl({ id, condition }: { id: string; condition: Condition }) {
  const set = (change: Partial<Condition>) => {
    const next = { ...condition, ...change }
    setCondition(id, next.audience === 'signed-in' ? next : { ...next, roles: [] })
  }
  return (
    <div className={styles.who}>
      <SegmentedControl label="Who can see this" value={condition.audience} options={AUDIENCE} onChange={(audience) => set({ audience: audience as Audience })} />
      {condition.audience === 'signed-in' && (
        <Picks kind="roles" title="Only these roles (none ticked = any signed-in visitor)" picked={condition.roles} onChange={(roles) => set({ roles })} />
      )}
      <Picks kind="flags" title="Only when these flags are on" picked={condition.flags} onChange={(flags) => set({ flags })} />
    </div>
  )
}
