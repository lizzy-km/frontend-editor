import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from '@/features/auth/auth.store'
import type { LibraryItem } from '@/features/workspace/api/componentLibrary'
import { LIBRARY_ATTR } from '../model/reuse/attrs'
import { linkOf } from '../model/reuse/entry'
import { setup } from '../model/reuse/testKit'
import type { ElementNode } from '../model/types'
import { getDoc } from '../store/doc.store'
import { useLibraryStore } from '../store/library.store'
import { addFromLibrary, loadLibrary, newerInLibrary, saveToMyLibrary, updateFromLibrary } from './libraryActions'

const stored: LibraryItem[] = []
vi.mock('@/features/workspace/api/componentLibrary', () => ({
  listLibrary: async () => [...stored],
  saveToLibrary: async (_uid: string, entry: LibraryItem['entry']) => { stored.push({ id: `e${stored.length + 1}`, name: entry.name, version: 1, updatedAt: 1, entry }); return stored.at(-1)!.id },
  updateLibraryEntry: async (id: string, entry: LibraryItem['entry'], version: number) => { Object.assign(stored.find((item) => item.id === id)!, { entry, version: version + 1 }); return version + 1 },
  deleteLibraryEntry: async () => undefined,
}))

beforeEach(() => {
  stored.length = 0
  useAuthStore.setState({ user: { uid: 'u1', email: null, displayName: null, photoURL: null }, status: 'signedIn' })
  useLibraryStore.setState({ items: [], status: 'idle', busy: false })
})

describe('account library actions', () => {
  it('saves a component, links it, and adds it to a page as a linked main component', async () => {
    const { main } = setup()
    await saveToMyLibrary(main)
    expect(stored).toHaveLength(1)
    expect(linkOf(getDoc().nodes[main] as ElementNode)).toEqual({ id: 'e1', version: 1 })
    addFromLibrary('e1')
    const linked = Object.values(getDoc().nodes).filter((node) => node.kind === 'element' && node.attrs[LIBRARY_ATTR] === 'e1@1')
    expect(linked).toHaveLength(2) // the original and the added one
  })

  it('saving a linked component again makes version 2, and another page is told a newer version exists', async () => {
    const { main } = setup()
    await saveToMyLibrary(main)
    await saveToMyLibrary(main)
    expect(stored[0]!.version).toBe(2)
    expect(linkOf(getDoc().nodes[main] as ElementNode)?.version).toBe(2)
    addFromLibrary('e1')
    stored[0]!.version = 3
    await loadLibrary()
    expect(newerInLibrary(main)).toBe(true)
    updateFromLibrary(main)
    expect(linkOf(getDoc().nodes[main] as ElementNode)?.version).toBe(3)
    expect(newerInLibrary(main)).toBe(false)
  })

  it('does nothing when signed out', async () => {
    useAuthStore.setState({ user: null, status: 'signedOut' })
    const { main } = setup()
    await saveToMyLibrary(main)
    expect(stored).toHaveLength(0)
  })
})
