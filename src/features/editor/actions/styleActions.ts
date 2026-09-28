import type { Breakpoint, ElementNode } from '../model/types'
import { patchNode } from '../model/tree/treeOps'
import { useViewStore } from '../store/view.store'
import { updateNodes } from './commit'

const currentBreakpoint = () => useViewStore.getState().breakpoint

/**
 * Sets one CSS property on an element for the screen size being edited.
 * An empty value removes the property (falls back to the original CSS).
 */
export function setStyle(id: string, property: string, value: string, breakpoint: Breakpoint = currentBreakpoint()) {
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => {
    const styles = { ...node.styles[breakpoint] }
    if (value.trim()) styles[property] = value.trim()
    else delete styles[property]
    return { ...node, styles: { ...node.styles, [breakpoint]: styles } }
  }), `style:${id}:${property}:${breakpoint}`)
}

/** Sets several properties at once (e.g. all four paddings) as one undo step. */
export function setStyles(id: string, values: Record<string, string>) {
  const breakpoint = currentBreakpoint()
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => {
    const styles = { ...node.styles[breakpoint] }
    for (const [property, value] of Object.entries(values)) {
      if (value.trim()) styles[property] = value.trim()
      else delete styles[property]
    }
    return { ...node, styles: { ...node.styles, [breakpoint]: styles } }
  }), `styles:${id}:${Object.keys(values).join(',')}:${breakpoint}`)
}

/** Undoes every edit made to this element on this screen size. */
export function resetStyles(id: string) {
  const breakpoint = currentBreakpoint()
  updateNodes((nodes) => patchNode<ElementNode>(nodes, id, (node) => {
    const styles = { ...node.styles }
    delete styles[breakpoint]
    return { ...node, styles }
  }))
}
