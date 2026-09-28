import { useEffect, useMemo, useRef } from 'react'
import { escapeRawTag } from '../model/serialize/escape'
import { wrapUserCss } from '../model/serialize/styleSheets'
import type { PageDoc } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useFrameStore } from './frame.store'
import { buildFrameShell, EDITS_STYLE_ID, editorOverrideCss, PAGE_STYLE_ID, shellKey } from './frameDocument'
import { createFrameRenderer, type FrameRenderer } from './frameRenderer'

type Props = { width: number; height: number; scale: number }

/** Pushes the latest page into an already-loaded frame. */
function renderInto(frameDoc: Document, renderer: FrameRenderer, doc: PageDoc, prev?: PageDoc) {
  const nodesChanged = renderer.sync(doc.nodes, doc.rootId)
  if (nodesChanged) {
    const edits = frameDoc.getElementById(EDITS_STYLE_ID)
    const css = escapeRawTag(editorOverrideCss(doc.nodes), 'style')
    if (edits && edits.textContent !== css) edits.textContent = css
  }
  if (prev && doc.css !== prev.css) {
    const page = frameDoc.getElementById(PAGE_STYLE_ID)
    if (page) page.textContent = escapeRawTag(wrapUserCss(doc.css), 'style')
  }
}

/**
 * The live page. Scripts are limited (see model/scripts.ts) and pointer
 * events are off: all clicks go through the overlay on top.
 */
export function EditorFrame({ width, height, scale }: Props) {
  const unsubscribe = useRef<() => void>(() => {})
  const key = useDocStore((state) => shellKey(state.doc))
  // Only rebuild the shell when the key changes; the body is rendered live.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const shell = useMemo(() => buildFrameShell(useDocStore.getState().doc), [key])

  useEffect(() => () => {
    unsubscribe.current()
    useFrameStore.getState().setFrame(null, null)
  }, [shell])

  function handleLoad(iframe: HTMLIFrameElement) {
    const frameDoc = iframe.contentDocument
    if (!frameDoc) return
    unsubscribe.current()
    const renderer = createFrameRenderer(frameDoc)
    renderInto(frameDoc, renderer, useDocStore.getState().doc)
    useFrameStore.getState().setFrame(iframe, renderer)
    unsubscribe.current = useDocStore.subscribe((state, prev) => {
      if (state.doc !== prev.doc) renderInto(frameDoc, renderer, state.doc, prev.doc)
    })
  }

  return (
    <iframe
      key={shell}
      title="Your page"
      srcDoc={shell}
      onLoad={(event) => handleLoad(event.currentTarget)}
      // Same origin so the editor can read the page. Scripts: trusted style libraries only.
      // No allow-forms / allow-popups / allow-top-navigation: the page can't leave the editor.
      sandbox="allow-same-origin allow-scripts"
      style={{
        width, height, border: 0, display: 'block', background: '#fff',
        transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none',
      }}
    />
  )
}
