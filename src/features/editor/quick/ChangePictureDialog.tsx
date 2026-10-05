import { setAttributes } from '../actions/nodeActions'
import { getElement } from '../model/tree/queries'
import { getDoc } from '../store/doc.store'
import { PicturePickerDialog } from './PicturePickerDialog'

type Props = { id: string; open: boolean; onClose: () => void }

/** Swap a picture (<img>) and describe it. */
export function ChangePictureDialog({ id, open, onClose }: Props) {
  const node = getElement(getDoc().nodes, id)
  return (
    <PicturePickerDialog
      open={open} onClose={onClose} title="Change picture"
      initialUrl={node?.attrs.src ?? ''} initialDescription={node?.attrs.alt ?? ''}
      // srcset (sharper images) would override the new src, so it is removed.
      onUse={(url, alt) => setAttributes(id, { src: url, alt, srcset: '' })}
    />
  )
}
