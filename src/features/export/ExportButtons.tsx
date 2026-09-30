import { useState } from 'react'
import { useViewStore } from '@/features/editor/store/view.store'
import { Button } from '@/shared/ui'
import type { DownloadGate } from './downloadGate'
import { ExportDialog } from './ExportDialog'
import { PreviewOverlay } from './PreviewOverlay'

/** "Preview" + "Download" for the editor toolbar. `gate` says who may download and how it's counted. */
export function ExportButtons({ gate }: { gate: DownloadGate }) {
  const preview = useViewStore((state) => state.preview)
  const setPreview = useViewStore((state) => state.setPreview)
  const [downloading, setDownloading] = useState(false)

  return (
    <>
      <Button size="small" variant="ghost" icon="eye" onClick={() => setPreview(true)}>Preview</Button>
      <Button size="small" icon="download" onClick={() => setDownloading(true)}>Download</Button>
      <ExportDialog open={downloading} onClose={() => setDownloading(false)} gate={gate} />
      {preview && <PreviewOverlay />}
    </>
  )
}
