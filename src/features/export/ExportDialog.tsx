import { useEffect, useState } from 'react'
import type { ExportFormat } from '@/features/analytics/events'
import { track } from '@/features/analytics/track'
import { describeNode } from '@/features/editor/labels/elementLabels'
import { getElement } from '@/features/editor/model/tree/queries'
import { useDocStore } from '@/features/editor/store/doc.store'
import { useSelectionStore } from '@/features/editor/store/selection.store'
import { Button, Icon, Modal, toast, type IconName } from '@/shared/ui'
import { DownloadsLeft, SignInToDownload } from './DownloadNotice'
import { downloadsBlocked, gateWhere, type DownloadGate } from './downloadGate'
import styles from './ExportDialog.module.css'
import { prepareCopy, prepareHtml, preparePng, prepareReact, prepareZip, type Deliver, type ExportScope } from './exportActions'

type Choice = { id: string; icon: IconName; title: string; text: string; prepare: (scope: ExportScope) => Promise<Deliver> }

/** Download options, most useful first, described for non-coders. */
const CHOICES: Choice[] = [
  { id: 'html', icon: 'globe', title: 'Web page (.html)', text: 'One file you can open in any browser or upload to a website host.', prepare: prepareHtml },
  { id: 'png', icon: 'image', title: 'Picture (.png)', text: 'A sharp image to share on social media or in a chat.', prepare: preparePng },
  { id: 'zip', icon: 'code', title: 'Files for a developer (.zip)', text: 'HTML, CSS and JavaScript as separate files.', prepare: prepareZip },
  { id: 'react', icon: 'layers', title: 'React project (.zip)', text: 'For developers: React + TypeScript, one file for each part of the page.', prepare: prepareReact },
]

type Props = { open: boolean; onClose: () => void; gate: DownloadGate }

/** Name of the selected part, if one is selected (for "Only …"). */
function useSelectedPartName() {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const name = useDocStore((state) => {
    const node = getElement(state.doc.nodes, selectedId)
    return node && node.id !== state.doc.rootId ? describeNode(state.doc.nodes, node, 30) : null
  })
  return { selectedId, name }
}

/** "Download" dialog: pick what (whole page or selected part) and how. */
export function ExportDialog({ open, onClose, gate }: Props) {
  const part = useSelectedPartName()
  const [onlyPart, setOnlyPart] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const scope: ExportScope = onlyPart && part.name ? part.selectedId : null
  const blocked = downloadsBlocked(gate)
  const blockedBy = !open ? null : gate.kind === 'signin' ? 'signin' : gate.kind === 'counted' && gate.status === 'ready' && blocked ? 'limit' : null
  useEffect(() => { if (blockedBy) track('download_blocked', { reason: blockedBy }) }, [blockedBy])

  // Prepare first, count second, deliver last: a failed export never uses a download.
  const run = async (id: string, prepare: (scope: ExportScope) => Promise<Deliver>, done: string) => {
    setBusy(id)
    try {
      const deliver = await prepare(scope)
      if (gate.kind === 'counted') await gate.consume()
      await deliver()
      track('download', { format: id as ExportFormat, scope: scope ? 'part' : 'page', where: gateWhere(gate) })
      toast(done, 'success')
      onClose()
    } catch (error) {
      toast(`Sorry — ${(error as Error).message}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Download your page" width={560}>
      {gate.kind === 'signin' ? <SignInToDownload gate={gate} /> : <DownloadsLeft gate={gate} />}
      {part.name && !blocked && (
        <div className={styles.scope} role="radiogroup" aria-label="What to download">
          <button type="button" role="radio" aria-checked={!onlyPart} onClick={() => setOnlyPart(false)}>Whole page</button>
          <button type="button" role="radio" aria-checked={onlyPart} onClick={() => setOnlyPart(true)}>Only {part.name}</button>
        </div>
      )}
      <div className={styles.choices}>
        {CHOICES.map((choice) => (
          <button key={choice.id} type="button" className={styles.choice} disabled={busy !== null || blocked}
            onClick={() => run(choice.id, choice.prepare, 'Downloaded!')}>
            <span className={styles.icon}><Icon name={busy === choice.id ? 'sparkle' : choice.icon} size={22} /></span>
            <span><strong>{choice.title}</strong><small>{choice.text}</small></span>
          </button>
        ))}
      </div>
      <Button variant="ghost" icon="copy" disabled={busy !== null || blocked}
        onClick={() => run('copy', prepareCopy, 'Code copied — paste it anywhere')}>
        Copy the code instead
      </Button>
    </Modal>
  )
}
