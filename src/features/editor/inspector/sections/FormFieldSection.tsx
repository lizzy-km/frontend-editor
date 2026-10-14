import { useMemo, type ReactNode } from 'react'
import { Switch } from '@/shared/ui'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { codeName } from '../../model/data'
import { fieldKind, fieldName, fieldsOf, formAround, MATCH_ATTR, MESSAGE_ATTR } from '../../model/forms'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

/** Tags that take an answer: they get hint text and rules. */
export const HAS_PLACEHOLDER = new Set(['input', 'textarea', 'select'])

const KINDS = [
  { value: 'text', label: 'Text' }, { value: 'email', label: 'Email' }, { value: 'password', label: 'Password' },
  { value: 'tel', label: 'Phone number' }, { value: 'url', label: 'Web address' }, { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' }, { value: 'checkbox', label: 'Tick box' }, { value: 'radio', label: 'One of several (radio)' },
]
const WITH_HINT = new Set(['text', 'email', 'password', 'tel', 'url', 'number', 'longText'])
const WITH_LENGTH = new Set(['text', 'email', 'password', 'tel', 'url', 'longText'])

const row = (label: string, control: ReactNode, hint?: string) => (
  <div className={styles.row} title={hint}><span className={styles.label}>{label}</span>{control}</div>
)
const whole = (value: string) => value.replace(/[^\d]/g, '')

/** What goes in a box (hint text, name, kind) and the rules an answer must follow. */
export function FormFieldSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const form = formAround(nodes, node.id)
  const others = useMemo(() => (form ? fieldsOf(nodes, form.id).filter((field) => !field.ids.includes(node.id)) : []), [nodes, form, node.id])
  const kind = fieldKind(node)
  const set = (name: string, value: string) => setAttribute(node.id, name, value)

  return (
    <Section title="Input box" icon="box">
      {kind && WITH_HINT.has(kind) && row('Hint text', (
        <TextControl label="Hint text" value={node.attrs.placeholder ?? ''} placeholder="e.g. Your email" onChange={(value) => set('placeholder', value)} />
      ), 'The grey example text shown before someone types')}
      {node.tag === 'input' && row('Kind', (
        <SelectControl label="Kind of answer" value={(node.attrs.type ?? 'text').toLowerCase()} options={KINDS} onChange={(value) => set('type', value === 'text' ? '' : value)} />
      ))}
      {kind && row('Name', (
        <TextControl label="Field name" value={fieldName(nodes, node)} onChange={(value) => set('name', codeName(value, ''))} />
      ), 'The name the answer is sent under (and used in code)')}
      {kind && form && (
        <>
          <Switch label="Must be filled in" checked={'required' in node.attrs} onChange={(on) => setAttributes(node.id, { required: on ? 'required' : '' })} />
          {WITH_LENGTH.has(kind) && (
            <>
              {row('Fewest letters', <TextControl label="Fewest letters" value={node.attrs.minlength ?? ''} placeholder="0" onChange={(value) => set('minlength', whole(value))} />)}
              {row('Most letters', <TextControl label="Most letters" value={node.attrs.maxlength ?? ''} placeholder="any" onChange={(value) => set('maxlength', whole(value))} />)}
            </>
          )}
          {kind === 'number' && (
            <>
              {row('Smallest', <TextControl label="Smallest number" value={node.attrs.min ?? ''} placeholder="any" onChange={(value) => set('min', value.trim())} />)}
              {row('Largest', <TextControl label="Largest number" value={node.attrs.max ?? ''} placeholder="any" onChange={(value) => set('max', value.trim())} />)}
            </>
          )}
          {others.length > 0 && kind !== 'checkbox' && kind !== 'radio' && row('Same as', (
            <SelectControl label="Must be the same as" value={node.attrs[MATCH_ATTR] ?? ''} onChange={(value) => set(MATCH_ATTR, value)}
              options={[{ value: '', label: 'No other box' }, ...others.map((field) => ({ value: field.name, label: field.label }))]} />
          ), 'For "Repeat password": the answer must equal this other box')}
          {row('Error message', (
            <TextControl label="Error message" value={node.attrs[MESSAGE_ATTR] ?? ''} placeholder="Automatic" onChange={(value) => set(MESSAGE_ATTR, value)} />
          ), 'Shown when the answer breaks a rule (empty = a message made for each rule)')}
        </>
      )}
    </Section>
  )
}
