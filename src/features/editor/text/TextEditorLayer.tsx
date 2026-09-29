import { lazy, Suspense } from 'react'
import type { FramePlacement } from '../canvas/geometry'
import { useTrackedBox } from '../canvas/useTrackedBox'
import { useSelectionStore } from '../store/selection.store'

// Quill (and its CSS) only downloads the first time someone edits text.
const QuillEditor = lazy(() => import('./QuillEditor'))

/** Shows the text editor over the element being edited, if any. */
export function TextEditorLayer({ placement }: { placement: FramePlacement }) {
  const id = useSelectionStore((state) => state.editingTextId)
  const box = useTrackedBox(id, placement)
  if (!id || !box) return null

  return (
    <Suspense fallback={null}>
      <QuillEditor key={id} id={id} box={box} scale={placement.scale} />
    </Suspense>
  )
}
