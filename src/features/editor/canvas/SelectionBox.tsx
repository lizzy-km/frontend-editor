import type Konva from 'konva'
import { useEffect, useRef } from 'react'
import { Transformer } from 'react-konva'
import { DraggableBox } from './DraggableBox'
import type { Box } from './geometry'
import { OVERLAY } from './overlayTheme'
import { resizeFromHandle } from './resize'
import type { BoxDrag } from './useBoxDrag'

type Props = { id: string; box: Box; scale: number; drag: BoxDrag; isRoot: boolean }

const ANCHORS = ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']

/** The selected element: solid outline, drag to move, handles to resize. */
export function SelectionBox({ id, box, scale, drag, isRoot }: Props) {
  const rectRef = useRef<Konva.Rect>(null)
  const transformerRef = useRef<Konva.Transformer>(null)

  // Re-attach whenever the handles re-appear (they hide while dragging).
  useEffect(() => {
    if (rectRef.current && transformerRef.current) transformerRef.current.nodes([rectRef.current])
  }, [id, drag.dragging])

  const handleTransform = () => {
    const rect = rectRef.current
    const anchor = transformerRef.current?.getActiveAnchor()
    if (!rect || !anchor) return
    const width = rect.width() * rect.scaleX()
    const height = rect.height() * rect.scaleY()
    rect.setAttrs({ scaleX: 1, scaleY: 1, width, height })
    resizeFromHandle(id, anchor, width / scale, height / scale)
  }

  return (
    <>
      <DraggableBox id={id} box={box} drag={drag} stroke={OVERLAY.accent} draggable={!isRoot} rectRef={rectRef} />
      {!isRoot && !drag.dragging && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          flipEnabled={false}
          keepRatio={false}
          enabledAnchors={ANCHORS}
          anchorSize={9}
          anchorCornerRadius={5}
          anchorStroke={OVERLAY.accent}
          anchorFill={OVERLAY.handleFill}
          borderEnabled={false}
          ignoreStroke
          boundBoxFunc={(oldBox, newBox) => (newBox.width < 4 || newBox.height < 4 ? oldBox : newBox)}
          onTransform={handleTransform}
        />
      )}
    </>
  )
}
