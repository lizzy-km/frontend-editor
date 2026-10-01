import 'quill/dist/quill.bubble.css'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { setInnerHtml } from '../actions/contentActions'
import type { Box } from '../canvas/geometry'
import { askFrame, tellFrame } from '../frame/frame.store'
import type { ComputedStyles } from '../inspector/useComputedStyle'
import { childrenToHtml } from '../model/serialize/nodeToHtml'
import { getElement } from '../model/tree/queries'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { matchTextStyle } from './matchStyle'
import { quillToInlineHtml } from './quillHtml'
import { setupQuill, TEXT_TOOLBAR } from './quillSetup'
import styles from './TextEditor.module.css'

type Props = { id: string; box: Box; scale: number }

const EDITING_ATTR = 'data-fe-editing'
/** In these, Enter finishes editing (Shift+Enter still makes a new line). */
const SINGLE_LINE_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'button', 'span', 'label', 'li', 'strong', 'em', 'small'])

const close = () => useSelectionStore.getState().editText(null)

/** Opens Quill on top of an element, matching its look. Saves on click-outside or Enter. */
export default function QuillEditor({ id, box, scale }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const [look, setLook] = useState<CSSProperties>({})
  useEffect(() => {
    let current = true
    void askFrame<ComputedStyles>('computed', { id }).then((styles) => {
      if (current && styles) setLook(matchTextStyle(styles, scale))
    })
    return () => { current = false }
  }, [id, scale])

  useEffect(() => {
    const container = host.current
    const node = getElement(getDoc().nodes, id)
    if (!container || !node) return
    const quill = new (setupQuill())(container, { theme: 'bubble', placeholder: 'Type your text…', modules: { toolbar: TEXT_TOOLBAR } })
    // Only inline text reaches here (isTextEditable), and Quill converts it
    // through an inert DOMParser into its own model, so nothing can execute.
    quill.clipboard.dangerouslyPasteHTML(childrenToHtml(getDoc().nodes, node).replace(/\s+/g, ' ').trim())
    quill.setSelection(quill.getLength(), 0)
    tellFrame('mark', { id, name: EDITING_ATTR, on: true })

    // Compare with Quill's own first output, so untouched text is never rewritten.
    const initial = quillToInlineHtml(quill.getSemanticHTML())
    let saved = false
    const save = () => {
      if (saved) return
      saved = true
      const html = quillToInlineHtml(quill.getSemanticHTML())
      if (html !== initial) setInnerHtml(id, html)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const finishOnEnter = event.key === 'Enter' && !event.shiftKey && (SINGLE_LINE_TAGS.has(node.tag) || event.ctrlKey || event.metaKey)
      if (event.key === 'Escape') {
        saved = true // cancel: don't save
        close()
      } else if (finishOnEnter) {
        event.preventDefault()
        event.stopPropagation()
        save()
        close()
      }
    }
    const onPointerDown = (event: PointerEvent) => {
      if (container.contains(event.target as Node)) return
      save()
      close()
    }
    container.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      container.removeEventListener('keydown', onKeyDown, true)
      tellFrame('mark', { id, name: EDITING_ATTR, on: false })
      save() // e.g. the user switched screen size mid-edit
      container.replaceChildren()
    }
  }, [id])

  return (
    <div className={styles.wrap} style={{ left: box.x, top: box.y, width: Math.max(box.width, 60), minHeight: box.height }}>
      <div ref={host} className={styles.editor} style={look} />
      <p className={styles.hint}>Click outside or press Enter to finish · Esc to cancel</p>
    </div>
  )
}
