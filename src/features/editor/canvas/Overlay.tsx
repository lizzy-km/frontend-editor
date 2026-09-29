import Konva from 'konva'
import { Layer, Rect, Stage } from 'react-konva'
import { describeNode } from '../labels/elementLabels'
import { getElement } from '../model/tree/queries'
import { useDocStore } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { DraggableBox } from './DraggableBox'
import type { Box, FramePlacement } from './geometry'
import { NameTag } from './NameTag'
import { OVERLAY } from './overlayTheme'
import { SelectionBox } from './SelectionBox'
import { useBoxDrag } from './useBoxDrag'
import { useStagePointer } from './useStagePointer'
import { useTrackedBox } from './useTrackedBox'

// A click that moves less than this is a click, not a drag.
Konva.dragDistance = 4

type Props = { width: number; height: number; placement: FramePlacement; clip: Box; onPan: (dx: number) => void }

/** Friendly label for a node id; re-computes only when that node's data changes. */
function useNodeName(id: string | null): string {
  return useDocStore((state) => {
    const node = getElement(state.doc.nodes, id)
    return node ? describeNode(state.doc.nodes, node) : ''
  })
}

/** Konva layer drawn over the page: outlines, resize handles, drop line, labels. */
export function Overlay({ width, height, placement, clip, onPan }: Props) {
  const selectedId = useSelectionStore((state) => state.selectedId)
  const hoveredId = useSelectionStore((state) => state.hoveredId)
  const editingText = useSelectionStore((state) => state.editingTextId !== null)
  const rootId = useDocStore((state) => state.doc.rootId)

  const drag = useBoxDrag(placement)
  const pointer = useStagePointer({ placement, dragging: drag.dragging, onPan })
  const hoverId = hoveredId !== selectedId ? hoveredId : null
  const hoverBox = useTrackedBox(hoverId, placement)
  const selectedBox = useTrackedBox(selectedId, placement)
  const hoverName = useNodeName(hoverId)
  const selectedName = useNodeName(selectedId)

  return (
    <Stage
      width={width} height={height}
      style={{ position: 'absolute', inset: 0, visibility: editingText ? 'hidden' : 'visible' }}
      {...pointer}
    >
      <Layer clipX={clip.x} clipY={clip.y} clipWidth={clip.width} clipHeight={clip.height}>
        {hoverId && hoverBox && (
          <DraggableBox id={hoverId} box={hoverBox} drag={drag} stroke={OVERLAY.hover} strokeWidth={1.5} dash={[4, 3]} draggable={hoverId !== rootId} />
        )}
        {selectedId && selectedBox && (
          <SelectionBox id={selectedId} box={selectedBox} scale={placement.scale} drag={drag} isRoot={selectedId === rootId} />
        )}
        {drag.target && <Rect {...drag.target.indicator} fill={OVERLAY.drop} cornerRadius={2} listening={false} />}
      </Layer>
      <Layer listening={false}>
        {hoverBox && hoverName && !drag.dragging && <NameTag box={hoverBox} text={hoverName} faded />}
        {selectedBox && selectedName && <NameTag box={selectedBox} text={selectedName} />}
      </Layer>
    </Stage>
  )
}
