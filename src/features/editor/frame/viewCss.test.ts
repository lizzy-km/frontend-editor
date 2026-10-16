import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { viewCss } from './editorSource'

describe('editing a component on its own', () => {
  const doc = parseHtmlDocument('<body><header>H</header><section class="a"><p>x</p></section></body>')
  const section = Object.values(doc.nodes).find((node) => node.kind === 'element' && node.tag === 'section')!

  it('hides everything that is not the component, inside it, or around it', () => {
    const css = viewCss(doc, null, undefined, section.id)
    expect(css).toContain(`body *:not([data-fe-id="${section.id}"]):not([data-fe-id="${section.id}"] *):not(:has([data-fe-id="${section.id}"]))`)
    expect(css).toContain('display: none !important')
  })

  it('does nothing without a focus, or when the component no longer exists', () => {
    expect(viewCss(doc, null)).toBe('')
    expect(viewCss(doc, null, undefined, 'gone')).toBe('')
  })
})
