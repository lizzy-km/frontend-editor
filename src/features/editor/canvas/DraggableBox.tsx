import type Konva from 'konva'
import { useEffect, useRef, type RefObject } from 'react'
import { Rect } from 'react-konva'
import type { Box } from './geometry'
import type { BoxDrag } from './useBoxDrag'

type Props = {
  id: string
  box: Box
  drag: BoxDrag
  stroke: string
  strokeWidth?: number
  dash?: number[]
  draggable: boolean
  rectRef?: RefObject<Konva.Rect | null>
}

const pointerOf = (event: Konva.KonvaEventObject<DragEvent>) => event.target.getStage()?.getPointerPosition() ?? { x: 0, y: 0 }

/**
 * An outline that follows an element and can be dragged to move it.
 * The box is set imperatively (not as props) so Konva's own drag/resize
 * changes don't fight React; it snaps back to the real element afterwards.
 */
export function DraggableBox({ id, box, drag, stroke, strokeWidth = 2, dash, draggable, rectRef }: Props) {
  const localRef = useRef<Konva.Rect>(null)
  const ref = rectRef ?? localRef
  const busy = useRef(false)
  const latest = useRef(box)

  useEffect(() => {
    latest.current = box
    if (!busy.current) ref.current?.setAttrs(box)
  }, [box, ref])

  const release = () => {
    busy.current = false
    ref.current?.setAttrs(latest.current)
  }

  return (
    <Rect
      ref={ref}
      stroke={stroke}
      strokeWidth={strokeWidth}
      dash={dash}
      strokeScaleEnabled={false}
      fill="rgba(0,0,0,0.001)" // near-transparent fill so the inside is grabbable
      draggable={draggable}
      onDragStart={(event) => {
        busy.current = true
        const pointer = pointerOf(event)
        drag.start(id, pointer.x, pointer.y)
      }}
      onDragMove={(event) => {
        const pointer = pointerOf(event)
        drag.move(pointer.x, pointer.y)
      }}
      onDragEnd={(event) => {
        const pointer = pointerOf(event)
        drag.end(pointer.x, pointer.y)
        release()
      }}
      onTransformStart={() => { busy.current = true }}
      onTransformEnd={release}
      opacity={drag.dragging ? 0.6 : 1}
    />
  )
}
