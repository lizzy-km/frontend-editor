import type { ImportEvent } from '@/features/importReact/importApp'

export type ProgressStage = 'read' | 'start' | 'visit' | 'member' | 'build'
export type FoundPage = { path: string; title: string; private: boolean }

/** What the progress screen shows while a React project is being opened. */
export type ProgressState = { stage: ProgressStage; path: string; visits: number; pages: FoundPage[]; signedInPhase: boolean; startedAt: number }

export const startProgress = (now = Date.now()): ProgressState => ({ stage: 'read', path: '', visits: 0, pages: [], signedInPhase: false, startedAt: now })

/** The steps in the order they happen. The signed-in step only shows when the app has members-only pages. */
export function stepsFor(state: Pick<ProgressState, 'signedInPhase'>): { id: ProgressStage; label: string; hint: string }[] {
  return [
    { id: 'read', label: 'Reading your files', hint: 'Compiling TypeScript and styles' },
    { id: 'start', label: 'Starting your app', hint: 'Loading React and your libraries' },
    { id: 'visit', label: 'Visiting your pages', hint: 'Following every menu and link' },
    ...(state.signedInPhase ? [{ id: 'member' as const, label: 'Signing in', hint: 'Opening the members-only pages' }] : []),
    { id: 'build', label: 'Building your site', hint: 'Turning pages into things you can click' },
  ]
}

/** The state after one more thing happened. */
export function advance(state: ProgressState, event: ImportEvent): ProgressState {
  if (event.kind === 'read') return { ...state, stage: 'read' }
  if (event.kind === 'build') return { ...state, stage: 'build', path: '' }
  if (event.kind === 'start') return { ...state, stage: event.signedIn ? 'member' : 'start', signedInPhase: state.signedInPhase || event.signedIn }
  if (event.kind === 'visit') return { ...state, stage: state.signedInPhase ? 'member' : 'visit', path: event.path, visits: event.visits }
  return state.pages.some((page) => page.path === event.path) ? state : { ...state, pages: [...state.pages, { path: event.path, title: event.title, private: event.private }] }
}

/** Where a step is: done, being worked on now, or waiting. */
export function stepState(state: ProgressState, id: ProgressStage): 'done' | 'active' | 'waiting' {
  const order = stepsFor(state).map((step) => step.id)
  const at = order.indexOf(state.stage), mine = order.indexOf(id)
  return mine < at ? 'done' : mine === at ? 'active' : 'waiting'
}
