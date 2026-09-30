import { Modal } from '@/shared/ui'
import { HtmlCodeBox } from '../sidebar/code/HtmlCodeBox'

type Props = { id: string; name: string; onClose: () => void }

/**
 * "Edit code" for one part of the page — e.g. paste the fixed section an AI
 * gave you over the old one. Applying is one undo step.
 */
export function EditCodeDialog({ id, name, onClose }: Props) {
  return (
    <Modal open title={`Edit code — ${name}`} onClose={onClose} width={860}>
      <HtmlCodeBox targetId={id} label="HTML of this part" onApplied={onClose} tall />
    </Modal>
  )
}
