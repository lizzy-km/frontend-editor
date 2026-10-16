import { create } from 'zustand'
import type { LibraryItem } from '@/features/workspace/api/componentLibrary'

/** The signed-in person's saved components (loaded when the Components panel opens). */
type LibraryState = { items: LibraryItem[]; status: 'idle' | 'loading' | 'ready' | 'error'; busy: boolean }

export const useLibraryStore = create<LibraryState>(() => ({ items: [], status: 'idle', busy: false }))
