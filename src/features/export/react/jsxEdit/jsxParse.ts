/**
 * Reads the JSX the export writes (and only that): elements, text, string / number
 * attributes, `{" "}` spaces, and two kinds of placeholders for parts that are code
 * rather than markup (`<Card />` components and `{items.map(…)}` repeated items).
 * Anything else (handlers, props, conditions) is reported, not guessed.
 */
export type JsxAttrs = Record<string, string | true>
export type JsxElement = { kind: 'element'; tag: string; attrs: JsxAttrs; children: JsxChild[] }
export type JsxText = { kind: 'text'; text: string }
/** A component used as a block: the page elements it was made from are kept as they are. */
export type JsxOpaque = { kind: 'opaque'; name: string }
export type JsxChild = JsxElement | JsxText | JsxOpaque
export type JsxResult = { ok: true; root: JsxElement } | { ok: false; error: string; line: number }

class Stop extends Error {
  constructor(message: string, readonly at: number) { super(message) }
}

/** JSX trims lines of text and joins them with one space; text without line breaks is kept as written. */
function cleanText(raw: string): string {
  if (!/\n/.test(raw)) return raw
  const lines = raw.split(/\r?\n/)
  return lines.map((line, index) => {
    let text = line
    if (index > 0) text = text.trimStart()
    if (index < lines.length - 1) text = text.trimEnd()
    return text
  }).filter(Boolean).join(' ')
}

const REPEAT = /^\s*[\w$]+\.map\(\(item, index\) => <(\w+) key=\{index\} \{\.\.\.item\} \/>\)\s*$/
const WORD = /[\w:.-]/

/** `{"text"}` / `{' '}` / `{12}` / `{true}` as a value, or null when it is code. */
function literal(code: string): string | true | null {
  const text = code.trim()
  if (/^(["'])[\s\S]*\1$/.test(text) && !/[^\\]["']/.test(text.slice(1, -1).replace(/\\./g, ''))) return text.slice(1, -1).replace(/\\(["'\\])/g, '$1')
  if (/^-?\d+(\.\d+)?$/.test(text)) return text
  return text === 'true' ? true : null
}

class Reader {
  pos = 0
  constructor(private source: string) {}

  fail(message: string, at = this.pos): never { throw new Stop(message, at) }
  peek(text: string) { return this.source.startsWith(text, this.pos) }
  skip() { while (this.pos < this.source.length && /\s/.test(this.source[this.pos]!)) this.pos++ }
  word() { const start = this.pos; while (this.pos < this.source.length && WORD.test(this.source[this.pos]!)) this.pos++; return this.source.slice(start, this.pos) }

  /** The text of a quoted string at `pos`. */
  quoted(): string {
    const quote = this.source[this.pos]!
    const start = ++this.pos
    while (this.pos < this.source.length && this.source[this.pos] !== quote) this.pos += this.source[this.pos] === '\\' ? 2 : 1
    if (this.pos >= this.source.length) this.fail('A quote is not closed.', start)
    const body = this.source.slice(start, this.pos++)
    return quote === '"' && body.includes('\\') ? (JSON.parse(`"${body}"`) as string) : body.replace(/\\(['\\])/g, '$1')
  }

  /** The text between a `{` at `pos` and its matching `}`. */
  braces(): string {
    const start = this.pos
    let depth = 0
    for (; this.pos < this.source.length; this.pos++) {
      const char = this.source[this.pos]!
      if (char === '"' || char === "'" || char === '`') { this.quoted(); this.pos-- } else if (char === '{') depth++
      else if (char === '}' && --depth === 0) { this.pos++; return this.source.slice(start + 1, this.pos - 1) }
    }
    return this.fail('A { is not closed.', start)
  }

  attributes(): JsxAttrs {
    const attrs: JsxAttrs = {}
    for (this.skip(); this.pos < this.source.length && !this.peek('>') && !this.peek('/>'); this.skip()) {
      if (this.peek('{')) this.fail('This tag has props or code inside {…}, which can only be changed in the editor.')
      const start = this.pos
      const name = this.word()
      if (!name) this.fail('Unexpected character in a tag.')
      if (this.source[this.pos] !== '=') { attrs[name] = true; continue }
      this.pos++
      const next = this.source[this.pos]
      if (next === '"' || next === "'") attrs[name] = this.quoted()
      else if (next === '{') {
        const value = literal(this.braces())
        if (value === null) this.fail(`“${name}” holds code ({…}), which can only be changed in the editor.`, start)
        attrs[name] = value as string | true
      } else this.fail(`“${name}” needs a value in quotes.`, start)
    }
    return attrs
  }

  element(): JsxElement | JsxOpaque {
    const open = this.pos
    this.pos++ // <
    const tag = this.word()
    if (!tag) this.fail('A tag needs a name.', open)
    const attrs = this.attributes()
    const self = this.peek('/>')
    this.pos += self ? 2 : 1
    // A component with no props stands for the elements it was made from.
    if (/^[A-Z]/.test(tag) && !['Link', 'NavLink'].includes(tag)) {
      if (Object.keys(attrs).length || !self) this.fail(`<${tag}> is a component with its own code: it can only be moved or removed here.`, open)
      return { kind: 'opaque', name: tag }
    }
    return { kind: 'element', tag, attrs, children: self ? [] : this.children(tag, open) }
  }

  children(tag: string, open: number): JsxChild[] {
    const children: JsxChild[] = []
    for (;;) {
      if (this.pos >= this.source.length) this.fail(`<${tag}> is never closed.`, open)
      if (this.peek('</')) {
        this.pos += 2
        const closing = this.word()
        this.skip()
        if (closing !== tag || this.source[this.pos] !== '>') this.fail(`</${closing}> does not match <${tag}>.`)
        this.pos++
        return children
      }
      const child = this.peek('<') ? this.element() : this.peek('{') ? this.expression() : this.text()
      if (child) children.push(child)
    }
  }

  expression(): JsxChild {
    const start = this.pos
    const code = this.braces()
    const value = literal(code)
    if (typeof value === 'string') return { kind: 'text', text: value }
    const repeat = REPEAT.exec(code)
    return repeat ? { kind: 'opaque', name: repeat[1]! } : this.fail('This {…} is code (a value, a condition or a function), which can only be changed in the editor.', start)
  }

  text(): JsxText | null {
    const start = this.pos
    while (this.pos < this.source.length && this.source[this.pos] !== '<' && this.source[this.pos] !== '{') this.pos++
    const value = cleanText(this.source.slice(start, this.pos))
    return value ? { kind: 'text', text: value } : null
  }

  root(): JsxElement {
    this.skip()
    if (!this.peek('<')) this.fail('The code must start with a tag, like <section>.')
    const root = this.element()
    if (root.kind !== 'element') this.fail('The outer tag must be an HTML tag, not a component.', 0)
    this.skip()
    if (this.pos < this.source.length) this.fail('There is more than one outer tag. Wrap them in one.')
    return root as JsxElement
  }
}

export function parseJsx(source: string): JsxResult {
  const reader = new Reader(source)
  try {
    return { ok: true, root: reader.root() }
  } catch (error) {
    if (!(error instanceof Stop)) throw error
    return { ok: false, error: error.message, line: source.slice(0, error.at).split('\n').length }
  }
}
