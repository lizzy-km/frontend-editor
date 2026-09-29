import type Konva from 'konva'
import { useRef } from 'react'
import { useFrameStore } from '../frame/frame.store'
import { isTextEditable } from '../model/tree/textRules'
import { getDoc } from '../store/doc.store'
import { useSelectionStore } from '../store/selection.store'
import { useViewStore } from '../store/view.store'
import { nodeIdAt, type FramePlacement } from './geometry'

type Options = { placement: FramePlacement; dragging: boolean; onPan: (dx: number) => void }

const selection = () => useSelectionStore.getState()

/**
 * Mouse handling for the overlay: hover, click to select, double-click to
 * edit text, wheel to scroll the page (Ctrl/⌘ + wheel zooms).
 */
export function useStagePointer({ placement, dragging, onPan }: Options) {
  const frame = useRef(0)

  const pointer = (event: Konva.KonvaEventObject<Event>) => event.target.getStage()?.getPointerPosition()

  const onMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (dragging) return
    const point = pointer(event)
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => selection().hover(point ? nodeIdAt(point.x, point.y, placement) : null))
  }

  // Update hover right away on press so press-and-drag grabs the element under the mouse.
  const onMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (dragging || event.target.getParent()?.className === 'Transformer') return
    const point = pointer(event)
    cancelAnimationFrame(frame.current)
    selection().hover(point ? nodeIdAt(point.x, point.y, placement) : null)
  }

  const onClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.target.getParent()?.className === 'Transformer') return // clicked a resize handle
    const point = pointer(event)
    selection().select(point ? nodeIdAt(point.x, point.y, placement) : null)
  }

  const onDblClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
    const point = pointer(event)
    const id = point ? nodeIdAt(point.x, point.y, placement) : null
    if (id && isTextEditable(getDoc().nodes, id)) selection().editText(id)
  }

  const onWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault()
    const { deltaX, deltaY, ctrlKey, metaKey, shiftKey } = event.evt
    if (ctrlKey || metaKey) {
      const view = useViewStore.getState()
      view.setZoom(Math.round(view.scale * (1 - deltaY * 0.002) * 100) / 100)
      return
    }
    if (shiftKey || Math.abs(deltaX) > Math.abs(deltaY)) {
      onPan(shiftKey ? deltaY : deltaX)
      return
    }
    useFrameStore.getState().iframe?.contentWindow?.scrollBy(0, deltaY / placement.scale)
  }

  const onMouseLeave = () => {
    cancelAnimationFrame(frame.current)
    selection().hover(null)
  }

  return { onMouseMove, onMouseDown, onClick, onDblClick, onWheel, onMouseLeave }
}
