import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import type { PageDoc } from '@/features/editor/model/types'
import { createProject } from '@/features/workspace/api/projectMutations'
import { ProjectLimitError, ProjectTooBigError } from '@/features/workspace/api/types'
import { toast } from '@/shared/ui'

/**
 * "Make my own copy" of a public page: signs in first if needed, then saves
 * a private copy in the user's pages (counts toward their limit).
 */
export function useMakeCopy(projectId: string, doc: PageDoc | undefined) {
  const navigate = useNavigate()
  const status = useAuthStore((state) => state.status)
  const [busy, setBusy] = useState(false)

  const makeCopy = async () => {
    const user = useAuthStore.getState().user
    if (status !== 'signedIn' || !user) {
      navigate(`/login?next=${encodeURIComponent(`/p/${projectId}`)}`)
      return
    }
    if (!doc || busy) return
    setBusy(true)
    try {
      const copy = { ...doc, title: `${doc.title} (my copy)` }
      const id = await createProject(user, copy, projectId)
      toast('Copied to your pages — change anything you like', 'success')
      navigate(`/edit/${id}`)
    } catch (error) {
      const known = error instanceof ProjectLimitError || error instanceof ProjectTooBigError
      toast(known ? error.message : 'We couldn’t make a copy. Please try again.', 'error')
    } finally {
      setBusy(false)
    }
  }
  return { makeCopy, busy }
}
