import { useEffect, useMemo, useRef } from 'react'
import { buildPageParts, partsToSingleFile } from '@/features/editor/model/serialize/buildPage'
import { withoutLocalFiles } from '@/features/editor/model/serialize/localFiles'
import { isMultiPage, listPages } from '@/features/editor/model/pages'
import { pageDoc } from '@/features/editor/model/serialize/sitePages'
import type { PageDoc } from '@/features/editor/model/types'

type Props = {
  doc: PageDoc; width?: number | string; className?: string; title: string
  /** Sites: the page to show, and what to do when a visitor clicks a link to another page. */
  pageId?: string | null
  onOpenPage?: (pageId: string) => void
}

/** In a site, links to other pages ask the parent to show that page (the frame can't navigate itself). */
const NAVIGATE = `<script>document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href^="/"]');if(!a)return;e.preventDefault();parent.postMessage({tweakOpenPath:a.getAttribute('href')},'*')})</script>`

/**
 * Shows someone else's page. Their code is untrusted, so the sandbox allows
 * scripts but NEVER allow-same-origin: it can't read the viewer's account,
 * cookies or this app.
 */
export function SafePageFrame({ doc, width = '100%', className, title, pageId = null, onOpenPage }: Props) {
  const frame = useRef<HTMLIFrameElement>(null)
  const site = isMultiPage(doc)
  const html = useMemo(() => {
    const page = partsToSingleFile(buildPageParts(withoutLocalFiles(pageDoc(doc, pageId))))
    return site ? page.replace(/<\/body>/i, `${NAVIGATE}</body>`) : page
  }, [doc, pageId, site])

  useEffect(() => {
    if (!site || !onOpenPage) return
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const path = (event.data as { tweakOpenPath?: unknown })?.tweakOpenPath
      const target = listPages(doc).find((page) => page.path === path)
      if (target) onOpenPage(target.id)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [doc, site, onOpenPage])

  return (
    <iframe ref={frame}
      title={title} srcDoc={html} className={className} style={{ width }}
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      referrerPolicy="no-referrer"
    />
  )
}
