import { useMemo } from 'react'
import { track } from '@/features/analytics/track'
import { Switch } from '@/shared/ui'
import { setAttribute, setAttributes } from '../../actions/nodeActions'
import { DEFAULT_SUCCESS, fieldsOf, formSettings, SUBMIT_ATTR, SUCCESS_ATTR, type SubmitKind } from '../../model/forms'
import type { ElementNode } from '../../model/types'
import { useDocStore } from '../../store/doc.store'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import panel from '../Inspector.module.css'
import { TextControl } from '../controls/TextControl'
import { Section } from '../Section'

const KINDS: { value: SubmitKind; label: string }[] = [
  { value: 'send', label: 'Send the answers' }, { value: 'sign-in', label: 'Log people in' }, { value: 'register', label: 'Create an account' },
  { value: 'forgot', label: 'Email a reset link' }, { value: 'reset', label: 'Set a new password' }, { value: 'confirm', label: 'Confirm email / resend link' },
]
const KIND_HINT: Partial<Record<SubmitKind, string>> = {
  'sign-in': 'Needs boxes named email and password.', register: 'Needs boxes named name, email and password.',
  forgot: 'Needs a box named email.', reset: 'Needs a box named password. People arrive from the emailed link.', confirm: 'Needs a box named email (to send the link again).',
}

/** A form: check the answers and send them somewhere, then say thank you. */
export function FormSection({ node }: { node: ElementNode }) {
  const nodes = useDocStore((state) => state.doc.nodes)
  const fields = useMemo(() => fieldsOf(nodes, node.id), [nodes, node.id])
  const on = Boolean(node.attrs[SUBMIT_ATTR])
  const settings = formSettings(node)
  const turn = (value: boolean) => {
    setAttributes(node.id, { [SUBMIT_ATTR]: value ? 'send' : '', [SUCCESS_ATTR]: '' })
    if (value) track('form_set', { fields: fields.length })
  }

  return (
    <Section title="Form" icon="pencil">
      <p className={panel.note}>
        {fields.length ? `Answers: ${fields.map((field) => field.label).join(', ')}.` : 'No input boxes yet.'} Click a box to set its rules.
      </p>
      <Switch label="Check the answers and send them" checked={on} onChange={turn} />
      {on && (
        <>
          <div className={styles.row} title="What happens when the form is sent. Log in, create account… use the site's sign-in in the React download.">
            <span className={styles.label}>It will</span>
            <SelectControl label="What the form does" value={settings.submit} options={KINDS} onChange={(value) => setAttribute(node.id, SUBMIT_ATTR, value)} />
          </div>
          {settings.submit !== 'send' && <p className={panel.note}>{KIND_HINT[settings.submit]} Preview only shows the message below; the React download really signs people in (demo accounts until you connect your API).</p>}
          {settings.submit === 'send' && (
            <div className={styles.row} title="Where the answers go (as JSON). Empty: visitors only see the thank-you message.">
              <span className={styles.label}>Send to</span>
              <TextControl label="Send answers to address" value={settings.address} placeholder="https://… (optional)" onChange={(value) => setAttribute(node.id, 'action', value.trim())} />
            </div>
          )}
          <div className={styles.row} title="Shown after sending">
            <span className={styles.label}>Thank-you text</span>
            <TextControl label="Thank-you message" value={node.attrs[SUCCESS_ATTR] ?? ''} placeholder={DEFAULT_SUCCESS} onChange={(value) => setAttribute(node.id, SUCCESS_ATTR, value)} />
          </div>
          <p className={panel.note}>Works in Preview and downloads. The React download checks answers with Zod.</p>
        </>
      )}
    </Section>
  )
}
