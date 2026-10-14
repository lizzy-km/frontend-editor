import { create } from 'zustand'
import { VISITOR, type Viewer } from '../model/conditions'
import type { Breakpoint } from '../model/types'

export type SidePanel = 'pages' | 'layers' | 'add' | 'colors' | 'data' | 'code'
export type ZoomMode = 'fit' | number

type ViewState = {
  breakpoint: Breakpoint
  /** 'fit' = shrink the page so its full width is visible. */
  zoom: ZoomMode
  /** The zoom actually applied after 'fit' is resolved (set by the canvas). */
  scale: number
  preview: boolean
  sidePanel: SidePanel
  /** The page shown in the editor (multi-page sites); null = the first page. */
  pageId: string | null
  /** "Viewing as": who the editor and Preview show the page to (signed in, roles, flags). */
  viewer: Viewer
  setBreakpoint: (breakpoint: Breakpoint) => void
  setZoom: (zoom: ZoomMode) => void
  setScale: (scale: number) => void
  setPreview: (preview: boolean) => void
  setSidePanel: (panel: SidePanel) => void
  setPageId: (pageId: string | null) => void
  setViewer: (viewer: Viewer) => void
}

export const ZOOM_MIN = 0.25
export const ZOOM_MAX = 2

export const useViewStore = create<ViewState>((set) => ({
  breakpoint: 'desktop',
  zoom: 'fit',
  scale: 1,
  preview: false,
  sidePanel: 'layers',
  pageId: null,
  viewer: VISITOR,
  setBreakpoint: (breakpoint) => set({ breakpoint }),
  setZoom: (zoom) => set({ zoom: zoom === 'fit' ? 'fit' : Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom)) }),
  setScale: (scale) => set({ scale }),
  setPreview: (preview) => set({ preview }),
  setSidePanel: (sidePanel) => set({ sidePanel }),
  setPageId: (pageId) => set({ pageId }),
  setViewer: (viewer) => set({ viewer }),
}))
