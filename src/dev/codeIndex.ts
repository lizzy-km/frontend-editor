/**
 * Reads the exports and their comments out of a source file, for the code reference. The repo's own rule makes this work:
 * every exported function has a one-line comment above it, and files start with a short description.
 */
export type EntryKind = 'component' | 'function' | 'const' | 'type' | 'class'
export type Entry = { name: string; kind: EntryKind; signature: string; doc: string; line: number }
export type FileDoc = { path: string; summary: string; entries: Entry[]; lines: number }

const clean = (lines: string[]) => lines.map((line) => line.replace(/^\s*\/?\*+\/?\s?/, '').replace(/\*\/\s*$/, '').replace(/^\s*\/\/\s?/, '').trim()).filter(Boolean).join(' ')

/** What kind of export a line declares, with its name; null for lines that export nothing we list. */
export function declaration(line: string, isTsx: boolean): { name: string; kind: EntryKind } | null {
  const fn = /^export\s+(?:default\s+)?(?:async\s+)?function\s*\*?\s*(\w+)/.exec(line)
  if (fn) return { name: fn[1]!, kind: isTsx && /^[A-Z]/.test(fn[1]!) ? 'component' : 'function' }
  const constant = /^export\s+const\s+(\w+)/.exec(line)
  if (constant) {
    const name = constant[1]!
    const arrow = /=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*(?::[^=]+)?=>/.test(line) || /=\s*(?:async\s+)?function/.test(line)
    return { name, kind: arrow ? (isTsx && /^[A-Z]/.test(name) ? 'component' : 'function') : 'const' }
  }
  const type = /^export\s+(?:type|interface)\s+(\w+)/.exec(line)
  if (type) return { name: type[1]!, kind: 'type' }
  const klass = /^export\s+(?:default\s+)?class\s+(\w+)/.exec(line)
  return klass ? { name: klass[1]!, kind: 'class' } : null
}

/** The module description and the commented exports of one file. */
export function indexFile(path: string, text: string): FileDoc {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const isTsx = path.endsWith('.tsx')
  const entries: Entry[] = []
  const loose: string[] = []
  let pending: { text: string; end: number } | null = null
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (/^\s*\/\*\*/.test(line)) {
      const body = [line]
      let end = i
      while (!/\*\//.test(lines[end]!) && end + 1 < lines.length) body.push(lines[++end]!)
      pending = { text: clean(body), end }
      i = end
      continue
    }
    if (/^\/\/\s/.test(line) && !pending) {
      const body = [line]
      while (/^\/\/\s/.test(lines[i + 1] ?? '')) body.push(lines[++i]!)
      pending = { text: clean(body), end: i }
      continue
    }
    const found = declaration(line, isTsx)
    if (found) {
      const attached = pending && pending.end === i - 1
      entries.push({ ...found, signature: line.replace(/\s*\{\s*$/, '').slice(0, 170), doc: attached ? pending!.text : '', line: i + 1 })
      pending = null
    } else if (pending && line.trim() && pending.end < i) {
      if (!entries.length && !loose.length) loose.push(pending.text)
      pending = null
    }
  }
  return { path, summary: loose[0] ?? '', entries, lines: lines.length }
}
