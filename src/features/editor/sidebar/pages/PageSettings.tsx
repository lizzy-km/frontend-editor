import { changePage } from '../../actions/pageActions'
import type { PageInfo } from '../../model/pages'
import { TextControl } from '../../inspector/controls/TextControl'
import { WhoControl } from '../../inspector/sections/WhoControl'
import styles from './Pages.module.css'

/** Name, address and "signed-in only" of the page being edited. */
export function PageSettings({ page }: { page: PageInfo }) {
  return (
    <div className={styles.settings}>
      <p className={styles.settingsTitle}>This page</p>
      <label className={styles.field}>
        <span>Name</span>
        <TextControl label="Page name" value={page.title} onChange={(title) => changePage(page.id, { title })} />
      </label>
      <label className={styles.field} title="The address of this page on your site, e.g. /about">
        <span>Address</span>
        <TextControl label="Page address" value={page.path} placeholder="/about" onChange={(path) => changePage(page.id, { path })} />
      </label>
      <p className={styles.settingsTitle}>Who can open this page</p>
      <WhoControl id={page.id} condition={page.access} />
      <p className={styles.hint}>Visitors who can't open a page are sent to the login page (or see “No access”) in the React project.</p>
    </div>
  )
}
