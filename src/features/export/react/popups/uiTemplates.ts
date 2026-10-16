import { popupUse } from '@/features/editor/model/popups'
import type { NodeMap } from '@/features/editor/model/types'

/** Ready-made pop-up and confirm parts (src/components/ui/), added when the page uses them. */

const MODAL_STORE = `import { useSyncExternalStore } from 'react'

let current: string | null = null
let item: unknown = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }

/** Opens the pop-up with this name: openModal('welcome'). A data card passes its item: openModal('details', product). */
export const openModal = (name: string, row?: unknown) => { current = name; item = row ?? null; emit() }

/** Closes whichever pop-up is open. */
export const closeModal = () => { current = null; item = null; emit() }

/** The name of the open pop-up (or null). */
export const useOpenModal = () => useSyncExternalStore(subscribe, () => current)

/** The item of the data card that opened the pop-up (undefined when it was opened any other way). */
export const useModalRow = <T,>() => useSyncExternalStore(subscribe, () => item) as T | undefined
`

const MODAL = `import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { closeModal, useOpenModal } from './popup'

/**
 * A pop-up over the page. Open it with openModal(name) (a button's onClick),
 * close it with closeModal(), the Esc key or a click outside the box.
 */
export default function Modal({ name, className, children }: { name: string; className?: string; children: ReactNode }) {
  const open = useOpenModal() === name
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const before = document.activeElement as HTMLElement | null
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') closeModal() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    box.current?.querySelector<HTMLElement>('button, a[href], input, select, textarea, [tabindex]')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      before?.focus()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div
      ref={box} role="dialog" aria-modal="true" className={className}
      onClick={(event) => { if (event.target === event.currentTarget) closeModal() }}
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}
    >
      {children}
    </div>,
    document.body,
  )
}
`

const CONFIRM = `import { useEffect, useRef, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

type Question = { message: string; answer: (yes: boolean) => void }

let pending: Question | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/** Asks a yes / no question: if (await askFirst('Delete this?')) remove(). */
export function askFirst(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    pending = { message, answer: (yes) => { pending = null; emit(); resolve(yes) } }
    emit()
  })
}

/** The same question, from a component: const confirm = useConfirm(). */
export const useConfirm = () => askFirst

/** Shows the question. It is mounted once, in main.tsx. */
export function ConfirmHost() {
  const question = useSyncExternalStore((listener) => { listeners.add(listener); return () => { listeners.delete(listener) } }, () => pending)
  const yes = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!question) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') question.answer(false) }
    document.addEventListener('keydown', onKey)
    yes.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [question])

  if (!question) return null
  return createPortal(
    <div
      role="alertdialog" aria-modal="true" aria-label={question.message}
      onClick={(event) => { if (event.target === event.currentTarget) question.answer(false) }}
      style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'grid', placeItems: 'center', background: 'rgba(28, 25, 23, .55)' }}
    >
      <div style={{ width: 'min(420px, calc(100% - 48px))', padding: 28, borderRadius: 16, background: '#fff', color: '#1c1917' }}>
        <p style={{ margin: '0 0 20px', fontWeight: 600 }}>{question.message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => question.answer(false)}>Cancel</button>
          <button type="button" ref={yes} onClick={() => question.answer(true)}>Yes</button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
`

/** src/components/ui/{popup.ts, Modal.tsx} and/or confirm.tsx for what the project uses. */
export function popupFiles(nodes: NodeMap): Record<string, string> {
  const use = popupUse(nodes)
  return {
    ...(use.modal ? { 'src/components/ui/popup.ts': MODAL_STORE, 'src/components/ui/Modal.tsx': MODAL } : {}),
    ...(use.ask ? { 'src/components/ui/confirm.tsx': CONFIRM } : {}),
  }
}
