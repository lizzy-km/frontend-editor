import { afterEach, describe, expect, it } from 'vitest'
import { applyLayout } from '../layouts'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from './forVisitors'
import { LAYOUT_SCRIPT, withLayouts } from './layoutPlayer'

afterEach(() => { document.body.innerHTML = ''; document.body.className = '' })
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true }))

describe('layout player', () => {
  it('is added only when there is a menu', () => {
    const plain = parseHtmlDocument('<body><h1>Hi</h1></body>')
    expect(withLayouts(plain).scripts).toHaveLength(0)
    expect(forVisitors(applyLayout(plain, 'top', false)).scripts.some((script) => script.code?.includes('menu-open'))).toBe(true)
  })

  it('opens the menu with the button and closes it after a link click', () => {
    document.body.innerHTML = '<button data-fe-menu-toggle>☰</button><a href="/shop" data-fe-nav>Shop</a>'
    new Function(LAYOUT_SCRIPT)()
    click(document.querySelector('button')!)
    expect(document.body.classList.contains('menu-open')).toBe(true)
    click(document.querySelector('a')!)
    expect(document.body.classList.contains('menu-open')).toBe(false)
  })
})
