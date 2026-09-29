import { useEffect } from 'react'
import { deleteNode, duplicateNode, nudgeNode, selectParent } from '../actions/nodeActions'
import { isTextEditable } from '../model/tree/textRules'
import { getDoc, useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'

/** Typing in a field must never trigger editor shortcuts. */
function isTyping(target: EventTarget | null): boolean {
  const element = target as HTMLElement | null
  return Boolean(element?.closest('input, textarea, select, [contenteditable="true"], .ql-editor'))
}

type Shortcut = { match: (event: KeyboardEvent) => boolean; run: (selectedId: string | null) => void }

const mod = (event: KeyboardEvent) => event.ctrlKey || event.metaKey

/** The keyboard map. Add a row to add a shortcut. */
const SHORTCUTS: Shortcut[] = [
  { match: (e) => mod(e) && e.key.toLowerCase() === 'z' && !e.shiftKey, run: () => useDocStore.getState().undo() },
  { match: (e) => mod(e) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey)), run: () => useDocStore.getState().redo() },
  { match: (e) => e.key === 'Delete' || e.key === 'Backspace', run: (id) => id && deleteNode(id) },
  { match: (e) => mod(e) && e.key.toLowerCase() === 'd', run: (id) => id && duplicateNode(id) },
  { match: (e) => e.key === 'Escape', run: (id) => id && selectParent(id) },
  { match: (e) => e.altKey && e.key === 'ArrowUp', run: (id) => id && nudgeNode(id, -1) },
  { match: (e) => e.altKey && e.key === 'ArrowDown', run: (id) => id && nudgeNode(id, 1) },
  {
    match: (e) => e.key === 'Enter' && !mod(e),
    run: (id) => id && isTextEditable(getDoc().nodes, id) && useSelectionStore.getState().editText(id),
  },
]

/** Global editor shortcuts (undo, delete, duplicate, move, select parent). */
export function useEditorShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      const shortcut = SHORTCUTS.find((item) => item.match(event))
      if (!shortcut) return
      event.preventDefault()
      shortcut.run(useSelectionStore.getState().selectedId)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
