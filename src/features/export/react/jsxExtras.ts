import { GO_ATTR } from '@/features/editor/model/pages'
import type { ElementNode } from '@/features/editor/model/types'
import type { JsxContext } from './jsxWriter'

/** Sites and data: list-card fields, editor-only attributes, "click goes to" handlers, router links. */

/** A row field as JSX text or an attribute value of the right type. */
export function fieldExpression(ctx: JsxContext, field: string, asText: boolean): string | null {
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
  if (node.tag !== 'a' || !ctx.links?.paths.has(href) || ctx.props?.has(`${node.id}@href`)) return node
  ctx.links.used = true
  const attrs: Record<string, string> = { to: href, ...node.attrs }
  delete attrs.href
  return { ...node, tag: 'Link', attrs }
}
