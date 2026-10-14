import { afterEach, describe, expect, it, vi } from 'vitest'
import { askButtonHtml, popupBlockHtml } from '../popups'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from './forVisitors'
import { POPUP_SCRIPT, withPopups } from './popupPlayer'

const play = (html: string) => {
  document.body.innerHTML = html
  new Function(POPUP_SCRIPT)()
}
const popup = () => document.querySelector<HTMLElement>('[data-fe-modal]')!
const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))

afterEach(() => { document.body.innerHTML = ''; document.body.style.overflow = '' })

describe('pop-up player', () => {
  it('is added only when something uses pop-ups or asks first', () => {
    const doc = (html: string) => parseHtmlDocument(`<body>${html}</body>`)
    expect(withPopups(doc('<p>Hi</p>')).scripts).toHaveLength(0)
    expect(forVisitors(doc(popupBlockHtml('welcome'))).scripts.some((script) => script.code?.includes('data-fe-modal'))).toBe(true)
    expect(withPopups(doc(askButtonHtml)).scripts).toHaveLength(1)
  })

  it('hides the pop-up, opens it from its button and closes it three ways', () => {
    play(popupBlockHtml('welcome'))
    expect(popup().style.display).toBe('none')
    const opener = document.querySelector('[data-fe-open]')!
    click(opener)
    expect(popup().style.display).toBe('flex')
    expect(popup().style.position).toBe('fixed')
    expect(document.body.style.overflow).toBe('hidden')
    click(document.querySelector('[data-fe-close]')!)
    expect(popup().style.display).toBe('none')
    expect(document.body.style.overflow).toBe('')
    click(opener)
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(popup().style.display).toBe('none')
    click(opener)
    click(popup()) // outside the card
    expect(popup().style.display).toBe('none')
    click(opener)
    click(popup().firstElementChild!) // inside the card stays open
    expect(popup().style.display).toBe('flex')
  })

  it('asks before the click goes through', async () => {
    play(askButtonHtml)
    const button = document.querySelector('button')!
    const clicks = vi.fn()
    button.addEventListener('click', clicks)
    click(button)
    expect(clicks).not.toHaveBeenCalled()
    expect(document.querySelector('[role=dialog]')?.textContent).toContain('Are you sure you want to delete this?')
    click(document.querySelector('[data-no]')!)
    await Promise.resolve()
    expect(document.querySelector('[role=dialog]')).toBeNull()
    expect(clicks).not.toHaveBeenCalled()
    click(button)
    click(document.querySelector('[data-yes]')!)
    await vi.waitFor(() => expect(clicks).toHaveBeenCalledTimes(1))
  })
})
