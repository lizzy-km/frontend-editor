import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { buildPageParts } from '@/features/editor/model/serialize/buildPage'
import { getElement } from '@/features/editor/model/tree/queries'
import { partsToSplitFiles } from './buildFiles'

const PAGE = `<!doctype html><html><head><title>Shop</title>
  <script src="https://cdn.tailwindcss.com"></script><style>h1{color:red}</style></head>
  <body class="bg"><section><h1>Hi</h1></section><footer>Bye</footer>
  <script>console.log(1)</script><script type="module">import x from './x.js'</script>
  <script type="application/ld+json">{"a":1}</script></body></html>`

describe('split export files', () => {
  const doc = parseHtmlDocument(PAGE)
  const files = partsToSplitFiles(buildPageParts(doc))

  it('moves css and inline js into their own files', () => {
    expect(Object.keys(files).sort()).toEqual(['index.html', 'module.js', 'script.js', 'styles.css'])
    expect(files['styles.css']).toContain('@layer page')
    expect(files['script.js']).toContain('console.log(1)')
    expect(files['module.js']).toContain("import x from './x.js'")
  })

  it('keeps external and data scripts in the html and links the new files', () => {
    const html = files['index.html']!
    expect(html).toContain('<script src="https://cdn.tailwindcss.com"></script>')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('<link rel="stylesheet" href="styles.css">')
    expect(html).toContain('<script src="script.js"></script>')
    expect(html).not.toContain('console.log(1)')
  })

  it('exports only one section when asked, keeping body classes', () => {
    const section = getElement(doc.nodes, doc.rootId)!.children.find((id) => getElement(doc.nodes, id)?.tag === 'section')!
    const html = partsToSplitFiles(buildPageParts(doc, section))['index.html']!
    expect(html).toContain('<section><h1>Hi</h1></section>')
    expect(html).not.toContain('<footer>')
    expect(html).toContain('<body class="bg">')
  })
})
