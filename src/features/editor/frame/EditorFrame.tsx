import { useLayoutEffect, useMemo, useRef } from 'react'
import { wrapUserCss } from '../model/serialize/styleSheets'
import type { PageDoc } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { createBridge, type FrameBridge } from './bridge'
import { diffNodes } from './diffNodes'
import { buildEditorSource, editorOverrideCss, sourceKey } from './editorSource'
import { useFrameStore } from './frame.store'

type Props = { width: number; height: number; scale: number }

/** Sends the frame what changed between two versions of the page. */
function pushChanges(bridge: FrameBridge, doc: PageDoc, prev: PageDoc) {
  if (doc.nodes !== prev.nodes) {
    bridge.send('sync', diffNodes(doc.nodes, prev.nodes))
    bridge.send('css', { edits: editorOverrideCss(doc.nodes) })
  }
  if (doc.css !== prev.css) bridge.send('css', { page: wrapUserCss(doc.css) })
}

/**
 * The live page, rendered like Preview: its own CSS and scripts run, but in
 * a locked frame (own origin, no access to the app, no forms/popups/leaving).
 * The editor talks to it through the bridge; clicks go through the overlay.
 */
export function EditorFrame({ width, height, scale }: Props) {
  const frame = useRef<HTMLIFrameElement>(null)
  const key = useDocStore((state) => sourceKey(state.doc))
  // Rebuilt only when the key changes (new scripts can't be patched in); the rest is patched live.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const built = useMemo(() => { const doc = useDocStore.getState().doc; return { doc, source: buildEditorSource(doc) } }, [key])

  // Layout effect: the bridge listens before the frame can say "ready".
  useLayoutEffect(() => {
    const iframe = frame.current
    if (!iframe) return
    const bridge = createBridge(iframe)
    // Edits made while the frame loads wait in the bridge's queue.
    let sent = built.doc
    const sendLatest = (doc: PageDoc) => {
      if (doc === sent) return
      pushChanges(bridge, doc, sent)
      sent = doc
    }
    sendLatest(useDocStore.getState().doc)
    const unsubscribe = useDocStore.subscribe((state) => sendLatest(state.doc))
    useFrameStore.getState().setBridge(bridge)
    return () => {
      unsubscribe()
      bridge.dispose()
      useFrameStore.getState().setBridge(null)
    }
  }, [built])

  return (
    <iframe
      ref={frame}
      key={built.source}
      title="Your page"
      srcDoc={built.source}
      // Scripts only: no allow-same-origin (the page can't reach the app or its login),
      // no forms / popups / top navigation (the page can't leave the editor).
      sandbox="allow-scripts"
      style={{
        width, height, border: 0, display: 'block', background: '#fff',
        transform: `scale(${scale})`, transformOrigin: '0 0', pointerEvents: 'none',
      }}
    />
  )
}
