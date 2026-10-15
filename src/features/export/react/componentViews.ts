import { isMultiPage } from '@/features/editor/model/pages'
import { getAncestorIds } from '@/features/editor/model/tree/queries'
import type { NodeMap, PageDoc } from '@/features/editor/model/types'
import { buildReactProject } from './buildReactProject'
import { buildSiteProject } from './buildSiteProject'

/** Where a generated file came from: its path, name and the page elements it was made from. */
export type Origin = { path: string; name: string; ids: string[] }
export type ComponentView = Origin & { code: string }

/** Every component of the React download with its code (a multi-page site shows the React Router version). */
export function componentViews(doc: PageDoc): ComponentView[] {
  const origins: Origin[] = []
  const files = isMultiPage(doc) ? buildSiteProject(doc, { router: 'react-router', origins }) : buildReactProject(doc, undefined, origins)
  return origins.filter((origin) => files[origin.path] !== undefined).map((origin) => ({ ...origin, code: files[origin.path]! }))
}

/**
 * The component the selected element belongs to: the deepest one made from it or
 * from something around it (a card, a form, a section), else null.
 */
export function focusedView(views: ComponentView[], nodes: NodeMap, selectedId: string | null): ComponentView | null {
  if (!selectedId || !nodes[selectedId]) return null
  for (const id of [selectedId, ...getAncestorIds(nodes, selectedId)]) {
    // Several files can come from one element (a form that is also a whole part): the later one is the more specific.
    const view = views.filter((candidate) => candidate.ids.includes(id)).at(-1)
    if (view) return view
  }
  return null
}
