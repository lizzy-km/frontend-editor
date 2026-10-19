import type { PageDoc } from '@/features/editor/model/types'

/**
 * A finished example site people can open in the editor, change and download. It is built from the editor's own pieces
 * (data sources, lists, widgets, pop-ups, flags, forms, components…), so it shows what the editor really does.
 */
export type Showcase = {
  id: string
  title: string
  /** One plain sentence: what the site is. */
  tagline: string
  /** What it shows off, in plain words (shown as small tags). */
  features: string[]
  /** Attribute names that must be in the page (the tests check that each example really uses what it claims). */
  requires: string[]
  build: () => PageDoc
}
