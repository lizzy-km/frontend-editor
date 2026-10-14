import type { ElementNode, NodeMap, PageDoc } from './types'

/**
 * Who sees a page or an element. Stored on the element:
 *   data-fe-show="signed-in" | "signed-out"   (missing = everyone)
 *   data-fe-roles="admin,member"               (any of these roles; means signed in)
 *   data-fe-flags="beta"                       (all of these flags must be on)
 * Pages saved before this used data-fe-private (= signed in).
 */
export const SHOW_ATTR = 'data-fe-show'
export const ROLES_ATTR = 'data-fe-roles'
export const FLAGS_ATTR = 'data-fe-flags'
const LEGACY_PRIVATE = 'data-fe-private'

export type Audience = 'everyone' | 'signed-in' | 'signed-out'
export type Condition = { audience: Audience; roles: string[]; flags: string[] }
/** Who is looking: used by the editor's "Viewing as", Preview, and (as code) the React project. */
export type Viewer = { signedIn: boolean; roles: string[]; flags: string[] }

export const EVERYONE: Condition = { audience: 'everyone', roles: [], flags: [] }
export const VISITOR: Viewer = { signedIn: false, roles: [], flags: [] }
export const DEFAULT_ROLES = ['member', 'admin']
/** One shared empty list (stable for store selectors). */
const NO_FLAGS: string[] = []

const list = (value: string | undefined) => (value ?? '').split(',').map((item) => item.trim()).filter(Boolean)

/** The condition on an element or page (everyone when it has none). */
export function conditionOf(node: ElementNode): Condition {
  const roles = list(node.attrs[ROLES_ATTR])
  const show = node.attrs[SHOW_ATTR]
  const audience: Audience = roles.length || show === 'signed-in' || LEGACY_PRIVATE in node.attrs ? 'signed-in' : show === 'signed-out' ? 'signed-out' : 'everyone'
  return { audience, roles: audience === 'signed-in' ? roles : [], flags: list(node.attrs[FLAGS_ATTR]) }
}

export const hasCondition = (condition: Condition) => condition.audience !== 'everyone' || condition.flags.length > 0

/** Can this viewer see it? */
export function visibleTo(condition: Condition, viewer: Viewer): boolean {
  if (condition.audience === 'signed-in' && !viewer.signedIn) return false
  if (condition.audience === 'signed-out' && viewer.signedIn) return false
  if (condition.roles.length && !condition.roles.some((role) => viewer.roles.includes(role))) return false
  return condition.flags.every((flag) => viewer.flags.includes(flag))
}

/** The attributes that store a condition ('' removes one). */
export function conditionAttrs(condition: Condition): Record<string, string> {
  return {
    [SHOW_ATTR]: condition.audience === 'everyone' || condition.roles.length ? '' : condition.audience,
    [ROLES_ATTR]: condition.audience === 'signed-in' ? condition.roles.join(',') : '',
    [FLAGS_ATTR]: condition.flags.join(','),
    [LEGACY_PRIVATE]: '',
  }
}

/** Every element (and page) the viewer can't see. */
export function hiddenFor(nodes: NodeMap, viewer: Viewer): string[] {
  const hidden: string[] = []
  for (const node of Object.values(nodes)) {
    if (node.kind !== 'element') continue
    const condition = conditionOf(node)
    if (hasCondition(condition) && !visibleTo(condition, viewer)) hidden.push(node.id)
  }
  return hidden
}

/** The site's roles and flags (Who can see this, Viewing as). */
export function accessOf(doc: Pick<PageDoc, 'access'>): { roles: string[]; flags: string[] } {
  return { roles: doc.access?.roles?.length ? doc.access.roles : DEFAULT_ROLES, flags: doc.access?.flags ?? NO_FLAGS }
}

/** "Admin only" / "Signed-in visitors" — a short label for lists and badges. */
export function describeCondition(condition: Condition): string {
  const who = condition.audience === 'signed-out' ? 'Signed-out visitors'
    : condition.roles.length ? `${condition.roles.join(' or ')} only`
      : condition.audience === 'signed-in' ? 'Signed-in visitors' : 'Everyone'
  return condition.flags.length ? `${who} · ${condition.flags.join(', ')}` : who
}
