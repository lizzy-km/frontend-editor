import type Konva from 'konva'
import { useRef } from 'react'
import { tellFrame } from '../frame/frame.store'
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
  // Hit answers come back from the frame asynchronously: only the newest one counts.
  const asked = useRef(0)
  const hitAt = async (point: { x: number; y: number } | null | undefined) => {
    const ask = ++asked.current
    const id = point ? await nodeIdAt(point.x, point.y, placement) : null
    return ask === asked.current ? { id } : null
  }
  const hoverAt = (point: { x: number; y: number } | null | undefined) =>
    void hitAt(point).then((hit) => { if (hit) selection().hover(hit.id) })

  const pointer = (event: Konva.KonvaEventObject<Event>) => event.target.getStage()?.getPointerPosition()

  const onMouseMove = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (dragging) return
    const point = pointer(event)
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => hoverAt(point))
  }

  // Update hover right away on press so press-and-drag grabs the element under the mouse.
  const onMouseDown = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (dragging || event.target.getParent()?.className === 'Transformer') return
    const point = pointer(event)
    cancelAnimationFrame(frame.current)
    hoverAt(point)
  }

  // Double-click is read from the native click count: Konva's own dblclick needs
  // both clicks on the same shape, but the first click swaps hover box -> selection box.
  const onClick = (event: Konva.KonvaEventObject<MouseEvent>) => {
    if (event.target.getParent()?.className === 'Transformer') return // clicked a resize handle
    const clicks = event.evt.detail
    const point = pointer(event)
    // Not dropped by later hovers: every click is answered.
    void (point ? nodeIdAt(point.x, point.y, placement) : Promise.resolve(null)).then((id) => {
      if (clicks >= 2 && id && isTextEditable(getDoc().nodes, id)) selection().editText(id)
      else selection().select(id)
    })
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
    tellFrame('scroll', { dy: deltaY / placement.scale })
  }

  const onMouseLeave = () => {
    cancelAnimationFrame(frame.current)
    asked.current++
    selection().hover(null)
  }

  return { onMouseMove, onMouseDown, onClick, onWheel, onMouseLeave }
}
