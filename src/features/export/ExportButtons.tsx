import { useState } from 'react'
import { useViewStore } from '@/features/editor/store/view.store'
import { Button } from '@/shared/ui'
import { ExportDialog } from './ExportDialog'
import { PreviewOverlay } from './PreviewOverlay'

/** "Preview" + "Download" for the editor toolbar. */
export function ExportButtons() {
  const preview = useViewStore((state) => state.preview)
  const setPreview = useViewStore((state) => state.setPreview)
  const [downloading, setDownloading] = useState(false)

  return (
    <>
      <Button size="small" variant="ghost" icon="eye" onClick={() => setPreview(true)}>Preview</Button>
      <Button size="small" icon="download" onClick={() => setDownloading(true)}>Download</Button>
      <ExportDialog open={downloading} onClose={() => setDownloading(false)} />
      {preview && <PreviewOverlay />}
    </>
  )
}
