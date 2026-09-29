import { useState } from 'react'
import { describeNode } from '@/features/editor/labels/elementLabels'
import { getElement } from '@/features/editor/model/tree/queries'
import { useDocStore } from '@/features/editor/store/doc.store'
import { useSelectionStore } from '@/features/editor/store/selection.store'
import { Button, Icon, Modal, toast, type IconName } from '@/shared/ui'
import styles from './ExportDialog.module.css'
import { copyHtml, downloadHtml, downloadPng, downloadZip, type ExportScope } from './exportActions'

type Choice = { id: string; icon: IconName; title: string; text: string; run: (scope: ExportScope) => void | Promise<void> }

/** Download options, most useful first, described for non-coders. */
const CHOICES: Choice[] = [
  { id: 'html', icon: 'globe', title: 'Web page (.html)', text: 'One file you can open in any browser or upload to a website host.', run: downloadHtml },
  { id: 'png', icon: 'image', title: 'Picture (.png)', text: 'A sharp image to share on social media or in a chat.', run: downloadPng },
  { id: 'zip', icon: 'code', title: 'Files for a developer (.zip)', text: 'HTML, CSS and JavaScript as separate files.', run: downloadZip },
]

/** "Download" dialog: pick what (whole page or selected part) and how. */
export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const partName = useDocStore((state) => {
    const node = getElement(state.doc.nodes, selectedId)
    return node && node.id !== state.doc.rootId ? describeNode(state.doc.nodes, node, 30) : null
  })
  const [onlyPart, setOnlyPart] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const scope: ExportScope = onlyPart && partName ? selectedId : null

  const run = async (id: string, action: () => void | Promise<void>, done: string) => {
    setBusy(id)
    try {
      await action()
      toast(done, 'success')
    } catch (error) {
      toast(`Sorry — ${(error as Error).message}`, 'error')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Download your page" width={560}>
      {partName && (
        <div className={styles.scope} role="radiogroup" aria-label="What to download">
          <button type="button" role="radio" aria-checked={!onlyPart} onClick={() => setOnlyPart(false)}>Whole page</button>
          <button type="button" role="radio" aria-checked={onlyPart} onClick={() => setOnlyPart(true)}>Only {partName}</button>
        </div>
      )}
      <div className={styles.choices}>
        {CHOICES.map((choice) => (
          <button key={choice.id} type="button" className={styles.choice} disabled={busy !== null}
            onClick={() => run(choice.id, () => choice.run(scope), 'Downloaded!')}>
            <span className={styles.icon}><Icon name={busy === choice.id ? 'sparkle' : choice.icon} size={22} /></span>
            <span><strong>{choice.title}</strong><small>{choice.text}</small></span>
          </button>
        ))}
      </div>
      <Button variant="ghost" icon="copy" onClick={() => run('copy', () => copyHtml(scope), 'Code copied — paste it anywhere')}>
        Copy the code instead
      </Button>
    </Modal>
  )
}
