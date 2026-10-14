import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_FORM_HTML, SIGN_UP_FORM_HTML } from '../formBlocks'
import { parseHtmlDocument } from '../parse/parseDocument'
import { forVisitors } from './forVisitors'
import { FORM_SCRIPT, withForms } from './formPlayer'

const play = (html: string) => {
  document.body.innerHTML = html
  new Function(FORM_SCRIPT)()
  return document.querySelector('form')!
}
const submit = (form: HTMLFormElement) => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
const fill = (form: HTMLFormElement, values: Record<string, string>) =>
  Object.entries(values).forEach(([name, value]) => { (form.elements.namedItem(name) as HTMLInputElement).value = value })

afterEach(() => vi.restoreAllMocks())

describe('form player', () => {
  it('is added only when a form was set up', () => {
    const doc = (html: string) => parseHtmlDocument(`<body>${html}</body>`)
    expect(withForms(doc('<form><input></form>')).scripts).toHaveLength(0)
    expect(forVisitors(doc(CONTACT_FORM_HTML)).scripts.some((script) => script.code.includes('data-fe-submit'))).toBe(true)
  })

  it('stops a send with a problem and keeps the form', () => {
    const form = play(CONTACT_FORM_HTML)
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    submit(form)
    expect(fetcher).not.toHaveBeenCalled()
    expect(form.querySelector('[data-fe-note]')).toBeNull()
  })

  it('thanks the visitor when valid and there is no address', () => {
    const form = play(SIGN_UP_FORM_HTML)
    fill(form, { name: 'Jane', email: 'jane@example.com', password: 'secret123', confirmPassword: 'secret123' })
    ;(form.elements.namedItem('terms') as HTMLInputElement).checked = true
    submit(form)
    expect(document.querySelector('[data-fe-note]')?.textContent).toBe('Welcome aboard! Check your inbox.')
  })

  it('checks "same as" fields', () => {
    const form = play(SIGN_UP_FORM_HTML)
    fill(form, { password: 'secret123', confirmPassword: 'other' })
    form.dispatchEvent(new Event('input', { bubbles: true }))
    expect((form.elements.namedItem('confirmPassword') as HTMLInputElement).validationMessage).toContain('match')
    fill(form, { confirmPassword: 'secret123' })
    form.dispatchEvent(new Event('input', { bubbles: true }))
    expect((form.elements.namedItem('confirmPassword') as HTMLInputElement).validationMessage).toBe('')
  })

  it('posts the answers as JSON to the form address', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetcher)
    const form = play(CONTACT_FORM_HTML.replace('<form ', '<form action="https://api.example.com/contact" '))
    fill(form, { name: 'Jane', email: 'jane@example.com', topic: 'A quote', message: 'Hello there, a quote please' })
    submit(form)
    await vi.waitFor(() => expect(document.querySelector('[data-fe-note]')?.textContent).toContain('get back to you'))
    expect(fetcher.mock.calls[0]![0]).toBe('https://api.example.com/contact')
    expect(JSON.parse(fetcher.mock.calls[0]![1].body)).toMatchObject({ name: 'Jane', email: 'jane@example.com', topic: 'A quote' })
  })
})
