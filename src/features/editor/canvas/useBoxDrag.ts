import { useRef, useState } from 'react'
import { moveNodeTo } from '../actions/nodeActions'
import { setStyles } from '../actions/styleActions'
import { getNodeElement } from '../frame/frame.store'
import { useSelectionStore } from '../store/selection.store'
import { findDropTarget, type DropTarget } from './dropTarget'
import type { FramePlacement } from './geometry'

type DragState = { id: string; mode: 'flow' | 'free'; startX: number; startY: number }

/** Elements placed with position absolute/fixed move freely; everything else is reordered. */
function dragModeFor(id: string): DragState['mode'] {
  const element = getNodeElement(id)
  const position = element && element.ownerDocument.defaultView?.getComputedStyle(element).position
  return position === 'absolute' || position === 'fixed' ? 'free' : 'flow'
}

function moveFreely(state: DragState, x: number, y: number, scale: number) {
  const element = getNodeElement(state.id)
  const style = element && element.ownerDocument.defaultView?.getComputedStyle(element)
  if (!style) return
  const left = (parseFloat(style.left) || 0) + (x - state.startX) / scale
  const top = (parseFloat(style.top) || 0) + (y - state.startY) / scale
  setStyles(state.id, { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` })
}

/**
 * Drag & drop for elements on the canvas.
 * Returns handlers for Konva shapes and the current drop line to draw.
 */
export function useBoxDrag(placement: FramePlacement) {
  const state = useRef<DragState | null>(null)
  const [target, setTarget] = useState<DropTarget | null>(null)
  const [dragging, setDragging] = useState(false)

  const start = (id: string, x: number, y: number) => {
    state.current = { id, mode: dragModeFor(id), startX: x, startY: y }
    setDragging(true)
  }

  const move = (x: number, y: number) => {
    const current = state.current
    if (current?.mode === 'flow') setTarget(findDropTarget(current.id, x, y, placement))
  }

  const end = (x: number, y: number) => {
    const current = state.current
    state.current = null
    setDragging(false)
    setTarget(null)
    if (!current) return
    if (current.mode === 'free') moveFreely(current, x, y, placement.scale)
    else {
      const drop = findDropTarget(current.id, x, y, placement)
      if (drop) moveNodeTo(current.id, drop.parentId, drop.index)
    }
    useSelectionStore.getState().select(current.id)
  }

  return { start, move, end, target, dragging }
}

export type BoxDrag = ReturnType<typeof useBoxDrag>
