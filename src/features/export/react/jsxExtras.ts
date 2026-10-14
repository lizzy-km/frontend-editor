import { GO_ATTR } from '@/features/editor/model/pages'
import { animationOf, type Animation } from '@/features/editor/model/animations'
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
  if (!state || node.tag === 'Link' || (!animation && !item)) return { tag: node.tag, extra: '' }
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
