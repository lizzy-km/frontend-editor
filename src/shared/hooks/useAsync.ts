import { useCallback, useEffect, useRef, useState } from 'react'

type AsyncState<T> = { data: T | undefined; error: unknown; loading: boolean }

/**
 * Runs an async loader and tracks loading/error. It runs again when `key`
 * changes (e.g. the user id) or when `reload()` is called. Results from an
 * outdated run are ignored.
 */
export function useAsync<T>(load: () => Promise<T>, key: string) {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, error: null, loading: true })
  const [runId, setRunId] = useState(0)
  const loadRef = useRef(load)
  useEffect(() => { loadRef.current = load })

  useEffect(() => {
    let current = true
    loadRef.current().then(
      (data) => current && setState({ data, error: null, loading: false }),
      (error: unknown) => current && setState({ data: undefined, error, loading: false }),
    )
    return () => { current = false }
  }, [key, runId])

  const reload = useCallback(() => setRunId((id) => id + 1), [])
  const setData = useCallback((data: T) => setState({ data, error: null, loading: false }), [])
  return { ...state, reload, setData }
}
