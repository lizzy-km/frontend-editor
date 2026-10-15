import { GO_ATTR } from '@/features/editor/model/pages'
import { animationOf, type Animation } from '@/features/editor/model/animations'
import { conditionOf, hasCondition } from '@/features/editor/model/conditions'
import { NAV_ATTR } from '@/features/editor/model/layouts'
import { isParamSegment, matchPath, routeParams, tanstackPath } from '@/features/editor/model/routes'
import type { ElementNode } from '@/features/editor/model/types'
import type { JsxContext } from './jsxWriter'
import { uiImports, type UiUse } from './popups/jsxPopups'

/** Sites and data: list-card fields, editor-only attributes, "click goes to" handlers, router links. */

/** A row field as JSX text or an attribute value of the right type. */
export function fieldExpression(ctx: JsxContext, field: string, asText: boolean): string | null {
  // An address with the row's values in it ("/products/:id").
  if (field.startsWith('/')) {
    const names = routeParams(field).filter((name) => ctx.row?.has(name))
    return `\`${field.split('/').map((segment) => (isParamSegment(segment) && names.includes(segment.slice(1)) ? `\${encodeURIComponent(String(${segment.slice(1)}))}` : segment)).join('/')}\``
  }
  const type = ctx.row?.get(field)
  if (!type) return null
  if (type === 'boolean') return `${field} ? 'Yes' : 'No'`
  return type === 'number' && !asText ? `String(${field})` : field
}

/** Attributes for the browser only: the editor's own data-fe-* markers never reach the React code. */
export const isEditorAttr = (name: string) => name.startsWith('data-fe-') && name !== GO_ATTR

/** "Click goes to": the whole box opens the page, by mouse or keyboard. */
export function goHandlers(ctx: JsxContext, target: string, typed: boolean): string {
  ctx.links!.navigate = true
  const go = ctx.links!.go(target, typed)
  return ` role="link" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => ${go}} onKeyDown={(event) => { if (event.key === 'Enter') ${go} }}`
}

/** <a href="/about"> -> <Link to="/about"> when /about is a page of the site (not inside item templates' changing links). */
export function asRouterLink(ctx: JsxContext, node: ElementNode): ElementNode {
  const href = node.attrs.href ?? ''
  if (node.tag !== 'a' || !ctx.links || ctx.props?.has(`${node.id}@href`)) return node
  // A link to a page with a changing part (/products/3): TanStack wants the pattern and the values apart.
  const pattern = ctx.links.paths.has(href) ? undefined : ctx.links.dynamic?.find((each) => matchPath(each, href))
  if (!ctx.links.paths.has(href) && !pattern) return node
  const attrs: Record<string, string> = { to: href, ...node.attrs }
  delete attrs.href
  if (pattern && ctx.links.lib !== 'react-router') {
    attrs.to = tanstackPath(pattern)
    attrs[PARAMS_ATTR] = JSON.stringify(matchPath(pattern, href))
  }
  // Menu links (data-fe-nav) highlight the open page: React Router's NavLink adds the "active" class itself.
  if (NAV_ATTR in node.attrs && ctx.links.lib === 'react-router') {
    ctx.links.navLink = true
    return { ...node, tag: 'NavLink', attrs }
  }
  ctx.links.used = true
  return { ...node, tag: 'Link', attrs }
}

/** Marks a TanStack link whose route has changing parts (the values are written as params={{ … }}). */
export const PARAMS_ATTR = 'data-fe-params'

/** Motion state of one generated file: which helpers it used, and children to animate one by one. */
export type MotionState = { animation: boolean; item: boolean; items: Map<string, string> }
export const motionState = (): MotionState => ({ animation: false, item: false, items: new Map() })

/** The options object written into the code, e.g. { effect: 'fade-up', trigger: 'scroll', duration: 0.6 }. */
function optionsLiteral(animation: Animation): string {
  const parts = [`effect: '${animation.effect}'`, `trigger: '${animation.trigger}'`, `duration: ${animation.duration}`]
  if (animation.delay) parts.push(`delay: ${animation.delay}`)
  if (animation.ease !== 'smooth') parts.push(`ease: '${animation.ease}'`)
  if (animation.stagger) parts.push(`stagger: ${animation.stagger}`)
  if (animation.repeat) parts.push('once: false')
  return `{ ${parts.join(', ')} }`
}

/**
 * An animated element becomes motion.<tag> with {...animation(…)}; with "one by
 * one", its element children become motion items ({...animationItem(…)}).
 */
export function motionFor(ctx: JsxContext, node: ElementNode): { tag: string; extra: string } {
  const state = ctx.motion
  const animation = animationOf(node)
  const item = state?.items.get(node.id)
  if (!state || node.tag === 'Link' || node.tag === 'NavLink' || node.tag === 'Modal' || (!animation && !item)) return { tag: node.tag, extra: '' }
  let extra = ''
  if (item) {
    state.item = true
    extra += item
  }
  if (animation) {
    state.animation = true
    extra += ` {...animation(${optionsLiteral(animation)})}`
    const childItem = staggerItem(node)
    if (childItem) for (const child of node.children) if (ctx.nodes[child]?.kind === 'element') state.items.set(child, childItem)
  }
  return { tag: `motion.${node.tag}`, extra }
}

/** What the children of a "one by one" element get (null when it doesn't stagger). */
export function staggerItem(node: ElementNode): string | null {
  const animation = animationOf(node)
  if (!animation?.stagger || (animation.trigger !== 'scroll' && animation.trigger !== 'load')) return null
  const options = `{ duration: ${animation.duration}${animation.ease !== 'smooth' ? `, ease: '${animation.ease}'` : ''} }`
  return ` {...animationItem('${animation.effect}', ${options})}`
}

/** The import lines a file needs for what motionFor wrote. */
export function motionImports(state: MotionState | undefined, base: string): string[] {
  if (!state || (!state.animation && !state.item)) return []
  const helpers = [state.animation && 'animation', state.item && 'animationItem'].filter(Boolean).join(', ')
  return ["import { motion } from 'motion/react'", `import { ${helpers} } from '${base}/components/ui/animation'`]
}

/** The <Show when={…}> props for an element with "who can see this", or null. */
export function showWhen(node: ElementNode): string | null {
  const condition = conditionOf(node)
  if (!hasCondition(condition)) return null
  const parts = [
    condition.audience === 'signed-in' && 'signedIn: true',
    condition.audience === 'signed-out' && 'signedIn: false',
    condition.roles.length && `roles: ${JSON.stringify(condition.roles)}`,
    condition.flags.length && `flags: ${JSON.stringify(condition.flags)}`,
  ].filter(Boolean)
  return `{{ ${parts.join(', ')} }}`
}

/** What one generated file used from src/auth and src/components/ui: Show, Modal, the pop-up helpers, askFirst. */
export type ShowState = { used: boolean; ui: UiUse }
export const newShow = (): ShowState => ({ used: false, ui: new Set() })

/** The import lines for what the file used (`import { Show } …`, Modal, askFirst…). */
export const showImport = (show: ShowState | undefined, base: string) =>
  show ? [...(show.used ? [`import { Show } from '${base}/auth/Show'`] : []), ...uiImports(show.ui, base)] : []
