import { useMemo } from 'react'
import { buildPageParts, partsToSingleFile } from '@/features/editor/model/serialize/buildPage'
import { withoutLocalFiles } from '@/features/editor/model/serialize/localFiles'
import type { PageDoc } from '@/features/editor/model/types'

type Props = { doc: PageDoc; width?: number | string; className?: string; title: string }

/**
 * Shows someone else's page. Their code is untrusted, so the sandbox allows
 * scripts but NEVER allow-same-origin: it can't read the viewer's account,
 * cookies or this app.
 */
export function SafePageFrame({ doc, width = '100%', className, title }: Props) {
  const html = useMemo(() => partsToSingleFile(buildPageParts(withoutLocalFiles(doc))), [doc])
  return (
    <iframe
      title={title} srcDoc={html} className={className} style={{ width }}
      sandbox="allow-scripts allow-forms allow-popups allow-modals"
      referrerPolicy="no-referrer"
    />
  )
}
