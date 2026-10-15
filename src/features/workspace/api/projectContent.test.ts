import { describe, expect, it, vi } from 'vitest'
import { parseHtmlDocument } from '@/features/editor/model/parse/parseDocument'

vi.mock('firebase/firestore/lite', () => ({ getDoc: vi.fn(), serverTimestamp: vi.fn(), updateDoc: vi.fn(), writeBatch: vi.fn() }))
vi.mock('@/lib/firebase', () => ({ firestore: vi.fn() }))
vi.mock('./refs', () => ({ contentRef: vi.fn(), projectRef: vi.fn() }))

const { serializeDoc } = await import('./projectContent')
const { ProjectTooBigError } = await import('./types')

/** Random-looking text does not squeeze: like a real picture. */
const noise = (length: number) => Array.from({ length }, (_, i) => String.fromCharCode(48 + ((i * 7919 + (i >> 3) * 104729 + (i * i) % 251) % 74))).join('')

describe('saving a page to the account', () => {
  it('accepts a normal page', async () => {
    expect(await serializeDoc(parseHtmlDocument('<body><h1>Hi</h1></body>'))).toContain('Hi')
  })

  it('says what is too big when pictures pasted in the code do not fit even squeezed', async () => {
    const picture = `data:image/png;base64,${noise(1_400_000)}`
    const doc = parseHtmlDocument(`<body><img src="${picture}" alt=""></body>`)
    const error = await serializeDoc(doc).catch((caught: unknown) => caught)
    expect(error).toBeInstanceOf(ProjectTooBigError)
    expect((error as Error).message).toContain('Pictures pasted inside the code take about')
    expect((error as { friendly?: boolean }).friendly).toBe(true)
  })
})
