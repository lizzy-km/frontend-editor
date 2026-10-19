import { afterEach, describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from './forVisitors'
import { flagScript } from './flagPlayer'

const PAGE = '<body><button data-fe-flag="beta" data-fe-flag-mode="toggle">Beta</button><button data-fe-flag="beta" data-fe-flag-mode="off">Off</button><button data-fe-flag="beta" data-fe-flag-mode="on">On</button><section data-fe-flags="beta" style="display: grid">New</section><p>Plain</p></body>'
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
const section = () => document.querySelector<HTMLElement>('section')!
const play = (initial: string[] = []) => { localStorage.clear(); document.body.innerHTML = PAGE.replace(/^<body>|<\/body>$/g, ''); new Function(flagScript(initial))() }

afterEach(() => { document.body.innerHTML = ''; localStorage.clear() })

describe('flag clicks for visitors', () => {
  it('keeps boxes that depend on flags in the page, with the player, only when a click changes a flag', () => {
    const page = forVisitors(parseHtmlDocument(PAGE))
    expect(Object.values(page.nodes).some((node) => node.kind === 'element' && node.attrs['data-fe-flags'] === 'beta')).toBe(true)
    expect(page.scripts.some((script) => script.code?.includes('tweak:flags'))).toBe(true)
    const without = forVisitors(parseHtmlDocument('<body><section data-fe-flags="beta">New</section></body>'))
    expect(Object.values(without.nodes).some((node) => node.kind === 'element' && node.tag === 'section')).toBe(false)
    expect(without.scripts).toHaveLength(0)
  })

  it('starts hidden, then a click switches the box on and off, and the choice is remembered', () => {
    play()
    expect(section().style.display).toBe('none')
    const [toggle, off, on] = [...document.querySelectorAll('button')]
    click(toggle!)
    expect(section().style.display).toBe('grid')
    expect(JSON.parse(localStorage.getItem('tweak:flags')!)).toEqual({ beta: true })
    click(off!)
    expect(section().style.display).toBe('none')
    click(on!); click(on!)
    expect(section().style.display).toBe('grid')
    click(toggle!)
    expect(section().style.display).toBe('none')
  })

  it('starts on when the viewer already has the flag', () => {
    play(['beta'])
    expect(section().style.display).toBe('grid')
  })
})
