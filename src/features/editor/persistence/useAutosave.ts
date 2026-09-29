import { useEffect, useRef } from 'react'
import { AUTOSAVE_DELAY_MS } from '@/config/app.config'
import type { PageDoc } from '../model/types'
import { useDocStore } from '../store/doc.store'
import { useSaveStore } from './save.store'

export type SaveFn = (doc: PageDoc) => Promise<void> | void

/**
 * Saves the page a moment after the last edit, and once more when leaving.
 * `save` can be anything: local storage, Firestore... Status goes to useSaveStore.
 */
export function useAutosave(save: SaveFn, where: string, delay = AUTOSAVE_DELAY_MS) {
  const saveRef = useRef(save)
  useEffect(() => { saveRef.current = save }, [save])

  useEffect(() => {
    const { setStatus, setWhere } = useSaveStore.getState()
    setWhere(where)
    setStatus('idle')
    let timer: ReturnType<typeof setTimeout> | undefined
    let pending = false

    const run = async () => {
      pending = false
      setStatus('saving')
      try {
        await saveRef.current(useDocStore.getState().doc)
        setStatus(pending ? 'unsaved' : 'saved')
      } catch (error) {
        console.error(error)
        setStatus('error')
      }
    }

    const unsubscribe = useDocStore.subscribe((state, prev) => {
      if (state.version === prev.version || state.doc === prev.doc) return
      pending = true
      setStatus('unsaved')
      clearTimeout(timer)
      timer = setTimeout(run, delay)
    })

    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (pending) event.preventDefault()
    }
    window.addEventListener('beforeunload', warnBeforeLeaving)

    return () => {
      unsubscribe()
      clearTimeout(timer)
      window.removeEventListener('beforeunload', warnBeforeLeaving)
      if (pending) void run() // leaving the editor: save what's left
    }
  }, [where, delay])
}

/** Save right now (Ctrl+S / "Save" button). */
export function useSaveNow(save: SaveFn) {
  return async () => {
    const { setStatus } = useSaveStore.getState()
    setStatus('saving')
    try {
      await save(useDocStore.getState().doc)
      setStatus('saved')
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }
}
