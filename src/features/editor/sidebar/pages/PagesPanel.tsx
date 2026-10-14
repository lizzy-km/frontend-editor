import { useMemo, useState } from 'react'
import { Button, Icon } from '@/shared/ui'
import { createAuthPages, openPage, removePage, reorderPage } from '../../actions/pageActions'
import { missingAuthPages } from '../../model/authPages'
import { listPages, resolvePage, type PageInfo } from '../../model/pages'
import { useDocStore } from '../../store/doc.store'
import { useViewStore } from '../../store/view.store'
import { AddPageDialog } from './AddPageDialog'
import { LayoutPanel } from './LayoutPanel'
import { PageSettings } from './PageSettings'
import styles from './Pages.module.css'

/** The pages of the site, kept up to date with the document. */
export function usePages(): { pages: PageInfo[]; current: PageInfo | null } {
  const doc = useDocStore((state) => state.doc)
  const pageId = useViewStore((state) => state.pageId)
  return useMemo(() => ({ pages: listPages(doc), current: resolvePage(doc, pageId) }), [doc, pageId])
}

function PageRow({ page, index, count, current }: { page: PageInfo; index: number; count: number; current: boolean }) {
  const ask = () => window.confirm(`Delete the page “${page.title}” and everything on it?`) && removePage(page.id)
  return (
    <div className={`${styles.row} ${current ? styles.current : ''}`}>
      <button type="button" className={styles.open} aria-current={current ? 'page' : undefined} onClick={() => openPage(page.id)}>
        <Icon name={page.private ? 'lock' : 'layers'} size={15} />
        <span className={styles.title}>{page.title}</span>
        <span className={styles.path}>{page.path}</span>
      </button>
      <div className={styles.actions}>
        <button type="button" aria-label={`Move ${page.title} up`} title="Move up" disabled={index === 0} onClick={() => reorderPage(page.id, -1)}><Icon name="chevronUp" size={14} /></button>
        <button type="button" aria-label={`Move ${page.title} down`} title="Move down" disabled={index === count - 1} onClick={() => reorderPage(page.id, 1)}><Icon name="chevronDown" size={14} /></button>
        <button type="button" aria-label={`Delete ${page.title}`} title="Delete page" disabled={count <= 1} onClick={ask}><Icon name="trash" size={14} /></button>
      </div>
    </div>
  )
}

/** Pages of the site: open, add, reorder, delete, and set the current page's name and address. */
export function PagesPanel() {
  const { pages, current } = usePages()
  const [adding, setAdding] = useState(false)
  const missing = useDocStore((state) => missingAuthPages(state.doc).length)

  return (
    <div className={styles.panel}>
      {pages.length === 0 ? (
        <p className={styles.note}>
          This project is one page. Add more pages (About, Contact…) to make a site: your header and footer are shared by every page.
        </p>
      ) : (
        <div className={styles.list} role="list" aria-label="Pages">
          {pages.map((page, index) => (
            <div role="listitem" key={page.id}>
              <PageRow page={page} index={index} count={pages.length} current={page.id === current?.id} />
            </div>
          ))}
        </div>
      )}
      <Button size="small" icon="plus" onClick={() => setAdding(true)}>Add a page</Button>
      {pages.length > 0 && missing > 0 && (
        <Button size="small" icon="lock" onClick={createAuthPages}>Add sign-in pages</Button>
      )}
      <LayoutPanel />
      {current && <PageSettings key={current.id} page={current} />}
      {pages.length > 0 && <p className={styles.note}>The header and footer are shared: change them on any page and every page follows.</p>}
      {adding && <AddPageDialog onClose={() => setAdding(false)} currentPage={current} />}
    </div>
  )
}
