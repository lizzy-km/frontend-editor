import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/features/auth/auth.store'
import type { DownloadGate } from '@/features/export/downloadGate'
import { nextReset, readDownloadUsage, recordDownload, type DownloadUsage } from './api/downloads'

/**
 * The download allowance for a saved page: how many are left this month,
 * and `consume()` that records one on the server (the rules have the last word).
 */
export function useDownloadGate(projectId: string): DownloadGate {
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const [usage, setUsage] = useState<DownloadUsage | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unknown'>('loading')

  useEffect(() => {
    let current = true
    readDownloadUsage(projectId, uid)
      .then((value) => { if (current) { setUsage(value); setStatus('ready') } })
      .catch(() => current && setStatus('unknown')) // let the server decide on click
    return () => { current = false }
  }, [projectId, uid])

  const consume = useCallback(async () => {
    try {
      setUsage(await recordDownload(projectId, uid))
      setStatus('ready')
    } catch (error) {
      // Refresh so the dialog shows the real count (e.g. used up on another device).
      readDownloadUsage(projectId, uid).then((value) => { setUsage(value); setStatus('ready') }).catch(() => {})
      throw error
    }
  }, [projectId, uid])

  return useMemo(() => ({
    kind: 'counted',
    status,
    used: usage?.used ?? 0,
    max: usage ? usage.max : null,
    resetsOn: nextReset(),
    consume,
  }), [status, usage, consume])
}
