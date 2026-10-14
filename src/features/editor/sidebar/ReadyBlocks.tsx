import { track } from '@/features/analytics/track'
import { Icon } from '@/shared/ui'
import { insertHtml } from '../actions/contentActions'
import { createSource } from '../actions/dataActions'
import { DATA_PRESETS } from '../model/dataPresets'
import { ANIMATION_BOX_HTML } from '../model/animations'
import { listBoxHtml } from '../model/dataLists'
import { askButtonHtml, popupBlockHtml, uniquePopupName } from '../model/popups'
import { CONTACT_FORM_HTML, SIGN_UP_FORM_HTML } from '../model/formBlocks'
import { getDoc } from '../store/doc.store'
import styles from './Sidebar.module.css'

/** A list of cards from the first data source (sample products are added when there is no data yet). */
function addDataList() {
  if (!getDoc().data?.length) createSource(DATA_PRESETS[0]!.source, 'Products (for a list)')
  const source = getDoc().data![0]!
  insertHtml(listBoxHtml(source))
  track('add_block', { block: 'data-list' })
}

const READY = [
  { id: 'data-list', label: 'List from data', hint: 'Cards filled from your data; loads more as visitors scroll', icon: 'layers' as const, add: addDataList },
  {
    id: 'animation-box', label: 'Animation box', hint: 'Everything inside glides in when visitors scroll to it', icon: 'sparkle' as const,
    add: () => { insertHtml(ANIMATION_BOX_HTML); track('add_block', { block: 'animation-box' }) },
  },
  {
    id: 'popup', label: 'Pop-up', hint: 'A button that opens a box over the page (closes with a button, Esc or a click outside)', icon: 'box' as const,
    add: () => { insertHtml(popupBlockHtml(uniquePopupName(getDoc().nodes, 'welcome'))); track('add_block', { block: 'popup' }) },
  },
  {
    id: 'ask-button', label: 'Ask-first button', hint: 'A button that asks “Are you sure?” before it does anything', icon: 'lock' as const,
    add: () => { insertHtml(askButtonHtml); track('add_block', { block: 'ask-button' }) },
  },
  {
    id: 'contact-form', label: 'Contact form', hint: 'Name, email, topic and message, checked before sending', icon: 'pencil' as const,
    add: () => { insertHtml(CONTACT_FORM_HTML); track('add_block', { block: 'contact-form' }) },
  },
  {
    id: 'sign-up-form', label: 'Sign-up form', hint: 'Name, email, password twice and the terms', icon: 'lock' as const,
    add: () => { insertHtml(SIGN_UP_FORM_HTML); track('add_block', { block: 'sign-up-form' }) },
  },
]

/** Ready-made components that do more than show content. */
export function ReadyBlocks() {
  return (
    <>
      <p className={styles.addLabel}>Ready-made</p>
      <div className={styles.blocks}>
        {READY.map((block) => (
          <button key={block.id} type="button" className={styles.block} title={block.hint} onClick={block.add}>
            <Icon name={block.icon} size={20} />
            <span>{block.label}</span>
          </button>
        ))}
      </div>
    </>
  )
}
