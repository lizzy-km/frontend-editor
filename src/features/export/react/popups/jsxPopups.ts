import { NAV_ATTR, SIGNOUT_ATTR, TOGGLE_ATTR } from '@/features/editor/model/layouts'
import { ASK_ATTR, CLOSE_ATTR, MODAL_ATTR, OPEN_ATTR } from '@/features/editor/model/popups'
import type { ElementNode } from '@/features/editor/model/types'
import type { JsxContext } from '../jsxWriter'

/** Pop-ups and "ask first" in JSX: Modal wrapper, onClick handlers, and the imports they need. */

/** What a file used from src/components/ui: Modal, openModal, closeModal, askFirst. */
export type UiUse = Set<string>

/** The pop-up box becomes <Modal name="…"> (its look stays in its class). */
export function modalNode(ctx: JsxContext, node: ElementNode): ElementNode {
  if (!ctx.show || !(MODAL_ATTR in node.attrs)) return node
  ctx.show.ui.add('Modal')
  const attrs: Record<string, string> = { ...node.attrs, name: node.attrs[MODAL_ATTR]! }
  delete attrs[MODAL_ATTR]
  return { ...node, tag: 'Modal', attrs }
}

/** What the click does when nobody is asked: follow the link, or send the form. */
function nativeStep(ctx: JsxContext, node: ElementNode, href: string | undefined): string | null {
  if (node.tag === 'a' && href) return `window.location.assign(${href})`
  if ((node.tag === 'Link' || node.tag === 'NavLink') && ctx.links) { ctx.links.navigate = true; return ctx.links.go(JSON.stringify(node.attrs.to), true) }
  const submits = (node.tag === 'button' && (node.attrs.type ?? 'submit') === 'submit') || (node.tag === 'input' && node.attrs.type === 'submit')
  return submits ? 'element.form?.requestSubmit()' : null
}

/** Menu links: the open page is highlighted (NavLink does it itself; TanStack's Link needs activeProps). */
function navProps(ctx: JsxContext, node: ElementNode): string {
  if (!(NAV_ATTR in node.attrs)) return ''
  const home = node.attrs.to === '/'
  if (node.tag === 'NavLink') return home ? ' end' : ''
  return node.tag === 'Link' && ctx.links ? ` activeProps={{ className: 'active' }}${home ? ' activeOptions={{ exact: true }}' : ''}` : ''
}

const KEYS = " role=\"link\" tabIndex={0} style={{ cursor: 'pointer' }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.click() }}"

/**
 * onClick (and keyboard) handlers for "click goes to", "opens pop-up", "closes
 * pop-up" and "ask first"; '' when the element has none. `go` is the page
 * target expression (a prop inside list items).
 */
export function clickAttrs(ctx: JsxContext, node: ElementNode, go?: { value: string; typed: boolean }): string {
  const ui = ctx.show?.ui
  const open = ui ? node.attrs[OPEN_ATTR] : undefined
  const close = Boolean(ui) && CLOSE_ATTR in node.attrs
  const ask = ui ? node.attrs[ASK_ATTR] : undefined
  const steps: string[] = []
  if (go && ctx.links) { ctx.links.navigate = true; steps.push(ctx.links.go(go.value, go.typed)) }
  if (open) { ui!.add('openModal'); steps.push(`openModal(${JSON.stringify(open)})`) }
  if (close) { ui!.add('closeModal'); steps.push('closeModal()') }
  // Layouts: the ☰ button opens the menu on phones, a menu link closes it, "Log out" signs out.
  if (TOGGLE_ATTR in node.attrs) steps.push("document.body.classList.toggle('menu-open')")
  if (NAV_ATTR in node.attrs) steps.push("document.body.classList.remove('menu-open')")
  if (ui && SIGNOUT_ATTR in node.attrs) { ui.add('signOut'); steps.push('void signOut()') }
  const nav = navProps(ctx, node)
  if (!steps.length && !ask) return nav
  const keys = go && ctx.links ? KEYS : ''
  if (!ask) return ` onClick={() => ${steps.length === 1 ? steps[0] : `{ ${steps.join('; ')} }`}}${keys}${nav}`
  ui!.add('askFirst')
  const href = ctx.props?.get(`${node.id}@href`) ?? (node.attrs.href ? JSON.stringify(node.attrs.href) : undefined)
  const after = steps.length ? steps : [nativeStep(ctx, node, href)].filter((step): step is string => Boolean(step))
  const element = after.some((step) => step.includes('element.')) ? 'const element = event.currentTarget; ' : ''
  return ` onClick={(event) => { event.preventDefault(); ${element}void askFirst(${JSON.stringify(ask)}).then((yes) => { if (yes) { ${after.length ? after.join('; ') : '/* do it here */'} } }) }}${keys}${nav}`
}

const IMPORTS: Record<string, (base: string) => string> = {
  Modal: (base) => `import Modal from '${base}/components/ui/Modal'`,
  openModal: (base) => `import { closeModal, openModal } from '${base}/components/ui/popup'`,
  closeModal: (base) => `import { closeModal, openModal } from '${base}/components/ui/popup'`,
  signOut: (base) => `import { signOut } from '${base}/auth/signOut'`,
  askFirst: (base) => `import { askFirst } from '${base}/components/ui/confirm'`,
}

/** The import lines for what a file used from the ui folder (the modal helpers share one line). */
export const uiImports = (ui: UiUse, base: string) => [...new Set([...ui].map((name) => IMPORTS[name]?.(base)).filter((line): line is string => Boolean(line)))]
