import { setAttributes } from '../../actions/nodeActions'
import { cardOpensPopup } from '../../actions/popupActions'
import { OPEN_ATTR } from '../../model/popups'
import { CALL_ATTR } from '../../model/dataLists'
import { codeName, rowTypeName } from '../../model/data'
import { GO_ATTR, type PageInfo } from '../../model/pages'
import { routeParams } from '../../model/routes'
import type { DataSource, ElementNode } from '../../model/types'
import { SelectControl } from '../controls/ChoiceControls'
import styles from '../controls/Controls.module.css'
import { TextControl } from '../controls/TextControl'

type Props = { design: ElementNode; source: DataSource; pages: PageInfo[]; popups: { id: string; name: string }[] }

/**
 * What clicking a card does: nothing, open a page (a Detail page opens the card's own item), open a pop-up that
 * shows the card's item, or hand the card's data to your own code (React download).
 */
export function CardClick({ design, source, pages, popups }: Props) {
  const go = design.attrs[GO_ATTR] ?? ''
  const call = design.attrs[CALL_ATTR]
  const open = design.attrs[OPEN_ATTR] ?? ''
  const mode = call !== undefined ? 'function' : go ? 'page' : open ? 'popup' : 'none'
  const set = (values: Record<string, string>) => setAttributes(design.id, values)
  const missing = routeParams(go).filter((name) => !source.fields.some((field) => field.name === name))
  const choose = (next: string) => {
    if (next === 'none') set({ [GO_ATTR]: '', [CALL_ATTR]: '', [OPEN_ATTR]: '' })
    else if (next === 'popup') { if (popups[0]) cardOpensPopup(design.id, popups[0], source.name) }
    else if (next === 'page') set({ [CALL_ATTR]: '', [OPEN_ATTR]: '', [GO_ATTR]: pages.find((page) => routeParams(page.path).length)?.path ?? pages[0]?.path ?? '' })
    else set({ [GO_ATTR]: '', [OPEN_ATTR]: '', [CALL_ATTR]: `open${rowTypeName(source.name)}` })
  }

  return (
    <>
      <div className={styles.row} title="What happens when a visitor clicks a card">
        <span className={styles.label}>On click</span>
        <SelectControl label="What clicking a card does" value={mode} onChange={choose}
          options={[{ value: 'none', label: 'Nothing' }, { value: 'page', label: 'Open a page' }, { value: 'popup', label: popups.length ? 'Open a pop-up' : 'Open a pop-up (add one first)' }, { value: 'function', label: 'Run my code' }]} />
      </div>
      {mode === 'page' && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Page</span>
            <SelectControl label="Page a card opens" value={go} onChange={(path) => set({ [GO_ATTR]: path })}
              options={pages.length ? pages.map((page) => ({ value: page.path, label: `${page.title} (${page.path})` })) : [{ value: '', label: 'Add a page first' }]} />
          </div>
          <p className={styles.label}>
            {routeParams(go).length
              ? missing.length
                ? `This page needs every item to have a “${missing.join('”, “')}” detail in “${source.name}”.`
                : `Each card opens that page for its own item (using its ${routeParams(go).join(' and ')}).`
              : 'Tip: pick a “Detail page” to open a different item for each card. Add one under Pages → Add a page.'}
          </p>
        </>
      )}
      {mode === 'popup' && (
        <>
          <div className={styles.row}>
            <span className={styles.label}>Pop-up</span>
            <SelectControl label="Pop-up a card opens" value={open} onChange={(name) => cardOpensPopup(design.id, popups.find((popup) => popup.name === name) ?? null, source.name)}
              options={popups.map((popup) => ({ value: popup.name, label: popup.name }))} />
          </div>
          <p className={styles.label}>
            The pop-up shows the card that was clicked. Select the pop-up, open Actions → Data and choose what each part shows.
            A link or button inside it can go to a page by that item: give it an address like /product/:id.
          </p>
        </>
      )}
      {mode === 'function' && (
        <>
          <div className={styles.row} title="The name of your own code that receives the card's data (React download)">
            <span className={styles.label}>Code name</span>
            <TextControl label="Function a card calls" value={call ?? ''} placeholder={`open${rowTypeName(source.name)}`} onChange={(name) => set({ [CALL_ATTR]: codeName(name, `open${rowTypeName(source.name)}`) })} />
          </div>
          <p className={styles.label}>For developers: the React download calls <code>{call || 'yourCode'}(item)</code> with the card’s data. It is written for you in <code>src/data/handlers.ts</code>. Preview doesn’t run it.</p>
        </>
      )}
    </>
  )
}
