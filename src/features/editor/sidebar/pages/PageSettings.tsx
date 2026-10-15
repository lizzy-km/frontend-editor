import { Button, Switch } from '@/shared/ui'
import { changePage, createLayout } from '../../actions/pageActions'
import { canBeInMenu, layoutOf } from '../../model/layouts'
import { useDocStore } from '../../store/doc.store'
import type { PageInfo } from '../../model/pages'
import { isDynamicPath, routeParams } from '../../model/routes'
import { TextControl } from '../../inspector/controls/TextControl'
import { WhoControl } from '../../inspector/sections/WhoControl'
import styles from './Pages.module.css'

/** Name, address and "signed-in only" of the page being edited. */
export function PageSettings({ page }: { page: PageInfo }) {
  const layout = useDocStore((state) => layoutOf(state.doc))
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
      {isDynamicPath(page.path)
        ? <p className={styles.hint}>A changing page: one page for every item. In <code>{page.path}</code> the part {routeParams(page.path).map((name) => `:${name}`).join(' ')} stands for any value, like <code>{page.path.replace(/:\w+/g, '3')}</code>. Boxes set to “The one in the link” show the matching item.</p>
        : <p className={styles.hint}>Tip: for one page that shows a different item each time, add a “Detail page” instead of writing an address yourself.</p>}
      <p className={styles.settingsTitle}>In the menu</p>
      {canBeInMenu(page) ? (
        <>
          <Switch label="Show in the top bar / side menu" checked={page.inMenu} onChange={(on) => changePage(page.id, { inMenu: on })} />
          <p className={styles.hint}>
            {layout
              ? 'Turn it on for the pages visitors should find in the menu. The menu is rebuilt when you press “Update the menu”.'
              : 'Off by default. Pick a layout under Design → Layout and it lists the pages you turn on.'}
          </p>
          {layout && <Button size="small" icon="layers" onClick={() => createLayout(layout, false)}>Update the menu</Button>}
        </>
      ) : (
        <p className={styles.hint}>{isDynamicPath(page.path) ? 'A page that changes for each item is opened from links, so it isn’t a menu item.' : 'Log in, Sign up and the other sign-in pages appear as buttons in the layout, not as menu items.'}</p>
      )}
      <p className={styles.settingsTitle}>Who can open this page</p>
      <WhoControl id={page.id} condition={page.access} />
      <p className={styles.hint}>Visitors who can't open a page are sent to the login page (or see “No access”) in the React project.</p>
    </div>
  )
}
