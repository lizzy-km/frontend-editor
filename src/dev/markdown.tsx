import { Fragment, type ReactNode } from 'react'

/** A small Markdown reader for the repo's own docs: headings, paragraphs, lists, tables, code, quotes, images, links. Output is React elements (no raw HTML). */
export type Block =
  | { kind: 'heading'; level: number; text: string; id: string }
  | { kind: 'paragraph'; text: string }
  | { kind: 'code'; lang: string; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'quote'; text: string }
  | { kind: 'rule' }

export const slug = (text: string) => text.toLowerCase().replace(/`/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim())
const isTableRule = (line: string) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line)

/** Splits a document into blocks. */
export function parseMarkdown(text: string): Block[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]!
    if (!line.trim()) { i++; continue }
    const fence = /^```(\w*)/.exec(line)
    if (fence) {
      const body: string[] = []
      for (i++; i < lines.length && !lines[i]!.startsWith('```'); i++) body.push(lines[i]!)
      blocks.push({ kind: 'code', lang: fence[1] ?? '', text: body.join('\n') })
      i++
      continue
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) { blocks.push({ kind: 'heading', level: heading[1]!.length, text: heading[2]!, id: slug(heading[2]!) }); i++; continue }
    if (/^\s*([-*_])\1\1+\s*$/.test(line)) { blocks.push({ kind: 'rule' }); i++; continue }
    if (line.includes('|') && isTableRule(lines[i + 1] ?? '')) {
      const rows: string[][] = []
      let j = i + 2
      while (j < lines.length && lines[j]!.includes('|') && lines[j]!.trim()) rows.push(cells(lines[j++]!))
      blocks.push({ kind: 'table', head: cells(line), rows })
      i = j
      continue
    }
    if (/^>\s?/.test(line)) {
      const quote: string[] = []
      for (; i < lines.length && /^>\s?/.test(lines[i]!); i++) quote.push(lines[i]!.replace(/^>\s?/, ''))
      blocks.push({ kind: 'quote', text: quote.join(' ') })
      continue
    }
    const item = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(line)
    if (item) {
      const ordered = /\d/.test(item[2]!)
      const items: string[] = []
      for (; i < lines.length; i++) {
        const next = /^(\s*)([-*]|\d+\.)\s+(.*)$/.exec(lines[i]!)
        if (next) items.push(next[3]!)
        else if (/^\s{2,}\S/.test(lines[i]!) && items.length) items[items.length - 1] += ` ${lines[i]!.trim()}`
        else break
      }
      blocks.push({ kind: 'list', ordered, items })
      continue
    }
    const paragraph: string[] = []
    for (; i < lines.length && lines[i]!.trim() && !/^(#{1,6}\s|```|>|\s*([-*]|\d+\.)\s)/.test(lines[i]!) && !(lines[i]!.includes('|') && isTableRule(lines[i + 1] ?? '')); i++) paragraph.push(lines[i]!.trim())
    blocks.push({ kind: 'paragraph', text: paragraph.join(' ') })
  }
  return blocks
}

export type LinkHandler = (target: string) => void
type Renderers = { onLink: LinkHandler; image: (src: string) => string }

/** `code`, **bold**, *italic*, ![image](src) and [text](link) inside a line of text. */
export function inline(text: string, { onLink, image }: Renderers): ReactNode[] {
  const out: ReactNode[] = []
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))|(\*[^*\s][^*]*\*)/g
  let last = 0
  for (const match of text.matchAll(pattern)) {
    const at = match.index ?? 0
    if (at > last) out.push(text.slice(last, at))
    const [token] = match
    const key = at
    if (token.startsWith('`')) out.push(<code key={key}>{token.slice(1, -1)}</code>)
    else if (token.startsWith('**')) out.push(<strong key={key}>{inline(token.slice(2, -2), { onLink, image })}</strong>)
    else if (token.startsWith('![')) {
      const [, alt, src] = /!\[([^\]]*)\]\(([^)]+)\)/.exec(token)!
      out.push(<img key={key} src={image(src!)} alt={alt} />)
    } else if (token.startsWith('[')) {
      const [, label, target] = /\[([^\]]+)\]\(([^)]+)\)/.exec(token)!
      out.push(<a key={key} href={target} onClick={(event) => { if (!/^https?:/.test(target!)) { event.preventDefault(); onLink(target!) } }}>{inline(label!, { onLink, image })}</a>)
    } else out.push(<em key={key}>{token.slice(1, -1)}</em>)
    last = at + token.length
  }
  if (last < text.length) out.push(text.slice(last))
  return out.map((part, index) => <Fragment key={index}>{part}</Fragment>)
}

/** One block as React elements. */
export function BlockView({ block, render }: { block: Block; render: Renderers }) {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${Math.min(block.level + 1, 6)}` as 'h2'
      return <Tag id={block.id}>{inline(block.text, render)}</Tag>
    }
    case 'paragraph': return <p>{inline(block.text, render)}</p>
    case 'code': return <pre data-lang={block.lang}><code>{block.text}</code></pre>
    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return <List>{block.items.map((item, index) => <li key={index}>{inline(item, render)}</li>)}</List>
    }
    case 'table': return (
      <div className="tableScroll">
        <table>
          <thead><tr>{block.head.map((cell, index) => <th key={index}>{inline(cell, render)}</th>)}</tr></thead>
          <tbody>{block.rows.map((row, index) => <tr key={index}>{row.map((cell, i) => <td key={i}>{inline(cell, render)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    )
    case 'quote': return <blockquote>{inline(block.text, render)}</blockquote>
    case 'rule': return <hr />
  }
}
