import { describe, expect, it } from 'vitest'
import { CONTACT_FORM_HTML, SIGN_UP_FORM_HTML } from './formBlocks'
import { fieldsOf, formAround, formSettings } from './forms'
import { parseHtmlDocument } from './parse/parseDocument'
import { isElement } from './types'

const formIn = (html: string) => {
  const doc = parseHtmlDocument(`<body>${html}</body>`)
  const form = Object.values(doc.nodes).find((node) => isElement(node) && node.tag === 'form')!
  return { nodes: doc.nodes, form: form as Extract<typeof form, { kind: 'element' }> }
}

describe('forms', () => {
  it('reads fields, labels and rules from plain HTML', () => {
    const { nodes, form } = formIn(CONTACT_FORM_HTML)
    const fields = fieldsOf(nodes, form.id)
    expect(fields.map((field) => `${field.name}:${field.kind}`)).toEqual(['name:text', 'email:email', 'topic:select', 'message:longText', 'newsletter:checkbox'])
    expect(fields[0]).toMatchObject({ label: 'Your name', required: true, minLength: 2 })
    expect(fields[3]).toMatchObject({ minLength: 10, maxLength: 1000 })
    expect(fields[4]!.required).toBe(false)
  })

  it('groups radio buttons, skips buttons and names unnamed fields from their label', () => {
    const { nodes, form } = formIn('<form><label for="e">E-mail address:</label><input id="e" type="email">'
      + '<input type="radio" name="size" value="s"><input type="radio" name="size" value="m"><input type="file"><button>Go</button><input type="submit"></form>')
    const fields = fieldsOf(nodes, form.id)
    expect(fields.map((field) => field.name)).toEqual(['eMailAddress', 'size'])
    expect(fields[0]!.label).toBe('E-mail address')
    expect(fields[1]!.ids).toHaveLength(2)
    expect(fields[1]!.label).toBe('Size')
  })

  it('knows matching fields and the form settings', () => {
    const { nodes, form } = formIn(SIGN_UP_FORM_HTML)
    expect(fieldsOf(nodes, form.id).find((field) => field.name === 'confirmPassword')!.match).toBe('password')
    expect(formSettings(form)).toMatchObject({ submit: 'send', address: '', success: 'Welcome aboard! Check your inbox.' })
    expect(formSettings({ ...form, attrs: { action: 'https://api.example.com/contact' } }).address).toBe('https://api.example.com/contact')
    expect(formSettings({ ...form, attrs: { action: '#' } }).address).toBe('')
    const input = fieldsOf(nodes, form.id)[0]!.ids[0]!
    expect(formAround(nodes, input)?.id).toBe(form.id)
  })
})
