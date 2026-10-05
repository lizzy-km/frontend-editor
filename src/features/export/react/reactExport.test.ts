import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { getElement } from '@/features/editor/model/tree/queries'
import { buildReactProject } from './buildReactProject'
import { jsxAttr } from './jsxAttrs'
import { writeElement } from './jsxWriter'

const project = (body: string, head = '') => buildReactProject(parseHtmlDocument(`<!doctype html><html><head>${head}</head><body>${body}</body></html>`))
const jsxOf = (html: string) => {
  const doc = parseHtmlDocument(`<body>${html}</body>`)
  const first = getElement(doc.nodes, doc.rootId)!.children[0]!
  return writeElement({ nodes: doc.nodes, classFor: (node) => node.attrs.class }, first, '')
}

describe('JSX attributes', () => {
  it('uses React names, numbers and booleans', () => {
    expect(jsxAttr('label', 'for', 'email', false)).toBe(' htmlFor="email"')
    expect(jsxAttr('textarea', 'rows', '3', false)).toBe(' rows={3}')
    expect(jsxAttr('input', 'required', '', false)).toBe(' required')
    expect(jsxAttr('input', 'value', 'Hi', false)).toBe(' defaultValue="Hi"')
    expect(jsxAttr('path', 'stroke-width', '2', true)).toBe(' strokeWidth="2"')
    expect(jsxAttr('button', 'onclick', 'go()', false)).toBe(' data-onclick="go()"')
    expect(jsxAttr('a', 'title', 'Say "hi" {now}', false)).toBe(' title={"Say \\"hi\\" {now}"}')
  })
})

describe('JSX elements', () => {
  it('keeps the spaces between words and tags', () => {
    expect(jsxOf('<p>Visit\n   <a href="#x">us</a>  today</p>')).toBe('<p>Visit <a href="#x">us</a> today</p>')
  })

  it('escapes braces and keeps <pre> exactly', () => {
    expect(jsxOf('<p>Use {curly}</p>')).toBe('<p>{"Use {curly}"}</p>')
    expect(jsxOf('<pre>a\n  b</pre>')).toBe('<pre>{"a\\n  b"}</pre>')
  })

  it('keeps the gap between inline elements on separate lines', () => {
    expect(jsxOf('<div><a class="btn">A</a> <a class="btn">B</a></div>')).toContain("{' '}")
  })
})

describe('React project', () => {
  const cards = [1, 2, 3].map((n) => `<div class="card"><h3>Dish ${n}</h3><p>Tasty ${n}</p><img src="d${n}.jpg" alt="Dish ${n}"></div>`).join('')
  const files = project(`<header class="top"><a href="#menu">Menu</a></header><main><section id="menu" class="section">${cards}</section></main><footer>Bye</footer><script>document.title = 'x'</script>`)

  it('has a runnable Vite + React + TypeScript setup', () => {
    for (const path of ['package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', 'src/main.tsx', 'src/App.tsx', 'README.md']) {
      expect(files[path], path).toBeTruthy()
    }
    expect(files['index.html']).toContain('<div id="root"></div>')
  })

  it('makes one component per part, with <main> kept in App', () => {
    expect(Object.keys(files).filter((path) => path.startsWith('src/components/')).sort())
      .toEqual(['src/components/Card.tsx', 'src/components/Footer.tsx', 'src/components/Menu.tsx', 'src/components/Top.tsx'])
    expect(files['src/App.tsx']).toMatch(/<main>\s+<Menu \/>\s+<\/main>/)
  })

  it('turns repeated cards into one component and a typed list', () => {
    expect(files['src/components/Card.tsx']).toContain('export type CardProps = {\n  title: string\n  text: string\n  image: string\n  imageAlt: string\n}')
    expect(files['src/components/Card.tsx']).toContain('<img src={image} alt={imageAlt} />')
    expect(files['src/components/Menu.tsx']).toContain('{ title: "Dish 2", text: "Tasty 2", image: "d2.jpg", imageAlt: "Dish 2" },')
    expect(files['src/components/Menu.tsx']).toContain('{cardItems.map((item, index) => <Card key={index} {...item} />)}')
  })

  it('moves page code to public/scripts and runs it after mount', () => {
    expect(files['public/scripts/page-1.js']).toBe("document.title = 'x'\n")
    expect(files['src/runPageScripts.ts']).toContain("{ src: 'scripts/page-1.js', module: false },")
    expect(files['index.html']).not.toContain('document.title')
  })

  it('points "body >" rules through #root', () => {
    const css = buildReactProject(parseHtmlDocument('<style>body > header { color: red }</style><header>Hi</header>'))['src/styles/page.css']!
    expect(css).toContain('body > #root > header')
    expect(css).toContain('#root { display: contents; }')
  })
})
