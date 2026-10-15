import { describe, expect, it } from 'vitest'
import { companionStyles, releasedStyles } from './companionStyles'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { setStyle } from '../actions/styleActions'
import { buildPageParts } from '../model/serialize/buildPage'

describe('Max lines', () => {
  it('sets the helpers a line limit needs, and only for a real limit', () => {
    expect(companionStyles('-webkit-line-clamp', '3', {})).toEqual({ display: '-webkit-box', '-webkit-box-orient': 'vertical', overflow: 'hidden', 'text-overflow': 'ellipsis' })
    expect(companionStyles('-webkit-line-clamp', 'none', {})).toEqual({})
  })

  it('clears only the helpers it set when going back to no limit', () => {
    const set = { display: '-webkit-box', '-webkit-box-orient': 'vertical', overflow: 'hidden', 'text-overflow': 'ellipsis' }
    expect(releasedStyles('-webkit-line-clamp', 'none', set)).toEqual({ display: '', '-webkit-box-orient': '', overflow: '', 'text-overflow': '' })
    // a display chosen by hand stays; other settings are not touched
    expect(releasedStyles('-webkit-line-clamp', 'none', { ...set, display: 'flex' })).not.toHaveProperty('display')
    expect(releasedStyles('font-size', 'none', set)).toEqual({})
    expect(releasedStyles('-webkit-line-clamp', '2', set)).toEqual({})
  })

  it('reaches the page CSS (editor, Preview, download)', async () => {
    const { useDocStore } = await import('../store/doc.store')
    useDocStore.getState().load(parseHtmlDocument('<body><p>Long text</p></body>'))
    const id = Object.values(useDocStore.getState().doc.nodes).find((node) => node.kind === 'element' && node.tag === 'p')!.id
    setStyle(id, '-webkit-line-clamp', '2')
    expect(buildPageParts(useDocStore.getState().doc).css).toContain('-webkit-line-clamp: 2')
  })
})
