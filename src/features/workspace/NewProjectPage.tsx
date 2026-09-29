import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AccountMenu } from '@/features/auth/components/AccountMenu'
import { useAuthStore } from '@/features/auth/auth.store'
import type { PageDoc } from '@/features/editor/model/types'
import { clearLocalDraft, loadLocalDraft } from '@/features/editor/persistence/localDraft'
import { PasteScreen } from '@/features/import/PasteScreen'
import { Button, TopBar, toast } from '@/shared/ui'
import { createProject } from './api/projectMutations'
import { ProjectLimitError, ProjectTooBigError } from './api/types'

/** Paste code -> a new saved page (counts toward the page limit). */
export default function NewProjectPage() {
  const user = useAuthStore((state) => state.user)!
  const navigate = useNavigate()
  const [draft] = useState(loadLocalDraft)
  const [busy, setBusy] = useState(false)

  const create = async (doc: PageDoc, fromDraft = false) => {
    if (busy) return
    setBusy(true)
    try {
      const id = await createProject(user, doc)
      if (fromDraft) clearLocalDraft()
      navigate(`/edit/${id}`, { replace: true })
    } catch (error) {
      const known = error instanceof ProjectLimitError || error instanceof ProjectTooBigError
      toast(known ? error.message : 'We couldn’t save the new page. Check your connection and try again.', 'error')
      if (error instanceof ProjectLimitError) navigate('/projects')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <TopBar><Link to="/projects">My pages</Link><AccountMenu /></TopBar>
      <PasteScreen
        heading="New page"
        onOpen={(doc) => create(doc)}
        secondary={draft && (
          <Button size="large" loading={busy} onClick={() => create(draft, true)}>Save the page from “Try it”</Button>
        )}
      />
    </>
  )
}
