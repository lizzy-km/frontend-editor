import { describe, expect, it } from 'vitest'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'
import { askButtonHtml, popupBlockHtml } from '@/features/editor/model/popups'
import { buildReactProject } from '../buildReactProject'

const project = (html: string) => buildReactProject(parseHtmlDocument(`<body><header>Hi</header>${html}</body>`))
const part = (files: Record<string, string>) => Object.entries(files).filter(([path]) => path.startsWith('src/components/') && !path.includes('/ui/')).map(([, code]) => code).join(' ')

describe('pop-up export', () => {
  it('writes <Modal>, openModal / closeModal and the ui files', () => {
    const files = project(popupBlockHtml('welcome'))
    expect(part(files)).toContain('<Modal name="welcome"')
    expect(part(files)).toContain('onClick={() => openModal("welcome")}')
    expect(part(files)).toContain('onClick={() => closeModal()}')
    // each file imports only the helpers it uses (strict TypeScript flags unused imports)
    expect(part(files)).toContain("import { openModal } from '../components/ui/popup'")
    expect(part(files)).toContain("import { closeModal } from '../components/ui/popup'")
    expect(files['src/components/ui/Modal.tsx']).toContain('createPortal')
    expect(files['src/components/ui/popup.ts']).toContain('export const openModal')
    expect(files['src/components/ui/confirm.tsx']).toBeUndefined()
    expect(files['src/main.tsx']).not.toContain('ConfirmHost')
    // the file names differ by more than case (case-insensitive file systems)
    expect(new Set(Object.keys(files).map((path) => path.toLowerCase())).size).toBe(Object.keys(files).length)
  })

  it('asks first, then does the click (link, submit button, nothing)', () => {
    const files = project(`${askButtonHtml}<a href="https://example.com" data-fe-ask="Leave?">Out</a><form><button data-fe-ask="Send?">Go</button></form>`)
    const code = part(files)
    expect(code).toContain('void askFirst("Are you sure you want to delete this?")')
    expect(code).toContain('/* do it here */')
    expect(code).toContain('window.location.assign("https://example.com")')
    expect(code).toContain('element.form?.requestSubmit()')
    expect(files['src/components/ui/confirm.tsx']).toContain('export function askFirst')
    expect(files['src/main.tsx']).toContain('<ConfirmHost />')
    expect(files['src/components/ui/Modal.tsx']).toBeUndefined()
  })
})
