import { useRef, useState } from 'react'
import { moveNodeTo } from '../actions/nodeActions'
import { setStyles } from '../actions/styleActions'
import { askFrame } from '../frame/frame.store'
import { useSelectionStore } from '../store/selection.store'
import { findDropTarget, type DropTarget } from './dropTarget'
import type { FramePlacement } from './geometry'

/** How the element is placed, read from the frame when the drag starts. */
type Placement = { position: string; left: number; top: number }

type DragState = { id: string; placed: Promise<Placement | null>; free: boolean; startX: number; startY: number }

/** Elements placed with position absolute/fixed move freely; everything else is reordered. */
const isFree = (placed: Placement | null) => placed?.position === 'absolute' || placed?.position === 'fixed'

function moveFreely(id: string, placed: Placement, dx: number, dy: number, scale: number) {
  const left = placed.left + dx / scale
  const top = placed.top + dy / scale
  setStyles(id, { left: `${Math.round(left)}px`, top: `${Math.round(top)}px` })
}

/**
 * Drag & drop for elements on the canvas.
 * Returns handlers for Konva shapes and the current drop line to draw.
 */
export function useBoxDrag(placement: FramePlacement) {
  const state = useRef<DragState | null>(null)
  const moves = useRef(0)
  const [target, setTarget] = useState<DropTarget | null>(null)
  const [dragging, setDragging] = useState(false)

  const start = (id: string, x: number, y: number) => {
    const placed = askFrame<Placement>('position', { id })
    const drag: DragState = { id, placed, free: false, startX: x, startY: y }
    void placed.then((value) => { drag.free = isFree(value) })
    state.current = drag
    setDragging(true)
  }

  const move = (x: number, y: number) => {
    const current = state.current
    if (!current || current.free) return
    // Answers can come back out of order: only the latest one counts.
    const move = ++moves.current
    void findDropTarget(current.id, x, y, placement).then((drop) => {
      if (move === moves.current && state.current === current) setTarget(drop)
    })
  }

  const end = async (x: number, y: number) => {
    const current = state.current
    state.current = null
    moves.current++
    setDragging(false)
    setTarget(null)
    if (!current) return
    const placed = await current.placed
    if (placed && isFree(placed)) moveFreely(current.id, placed, x - current.startX, y - current.startY, placement.scale)
    else {
      const drop = await findDropTarget(current.id, x, y, placement)
      if (drop) moveNodeTo(current.id, drop.parentId, drop.index)
    }
    useSelectionStore.getState().select(current.id)
  }

  return { start, move, end, target, dragging }
}

export type BoxDrag = ReturnType<typeof useBoxDrag>
