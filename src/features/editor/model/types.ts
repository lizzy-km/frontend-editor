/**
 * The page model. A pasted page becomes a flat map of nodes (id -> node).
 * Flat + immutable means: stable ids when things move, cheap undo snapshots,
 * and components can subscribe to exactly one node.
 */

/** Screen sizes a style can target. Desktop is the base; others override it. */
export type Breakpoint = 'desktop' | 'tablet' | 'mobile'

/** CSS property (kebab-case, e.g. "font-size") -> value (e.g. "18px"). */
export type StyleMap = Record<string, string>

export type ElementNode = {
  id: string
  kind: 'element'
  tag: string
  parentId: string | null
  /** Original HTML attributes (class, href, src...). Never includes "style". */
  attrs: Record<string, string>
  /** Styles set by the user in the editor (plus the pasted inline style). */
  styles: Partial<Record<Breakpoint, StyleMap>>
  children: string[]
  hidden?: boolean
}

export type TextNode = {
  id: string
  kind: 'text'
  parentId: string | null
  text: string
}

export type EditorNode = ElementNode | TextNode

export type NodeMap = Record<string, EditorNode>

/** A <script> from the pasted page, kept in its original order. */
export type PageScript = {
  src?: string
  code?: string
  /** Original type attribute, e.g. "module". Undefined = classic script. */
  type?: string
  inHead: boolean
}

export type PageDoc = {
  title: string
  /** Id of the <body> node — the root of the tree. */
  rootId: string
  nodes: NodeMap
  /** Attributes on <html>, e.g. lang or Tailwind's class="dark". */
  htmlAttrs: Record<string, string>
  /** All pasted CSS (every <style> block joined). */
  css: string
  /** Stylesheet URLs from <link rel="stylesheet"> (fonts, icon packs...). */
  links: string[]
  scripts: PageScript[]
  /**
   * Other safe <head> tags kept for the export (viewport, description,
   * preconnect, icons...). Optional: pages saved before this existed lack it.
   */
  headTags?: HeadTag[]
}

export type HeadTag = { tag: 'meta' | 'link'; attrs: Record<string, string> }

export const isElement = (node: EditorNode | undefined): node is ElementNode => node?.kind === 'element'
export const isText = (node: EditorNode | undefined): node is TextNode => node?.kind === 'text'
