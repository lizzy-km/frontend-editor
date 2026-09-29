import { useCallback, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/auth.store'
import { openDocument } from '@/features/editor/actions/documentActions'
import { Inspector } from '@/features/editor/inspector/Inspector'
import { EditorLayout } from '@/features/editor/layout/EditorLayout'
import type { PageDoc } from '@/features/editor/model/types'
import { useAutosave, useSaveNow } from '@/features/editor/persistence/useAutosave'
import { useSaveShortcut } from '@/features/editor/persistence/useSaveShortcut'
import { Sidebar } from '@/features/editor/sidebar/Sidebar'
import { useDocStore } from '@/features/editor/store/doc.store'
import { EditorToolbar } from '@/features/editor/toolbar/EditorToolbar'
import { SaveIndicator } from '@/features/editor/toolbar/SaveIndicator'
import { ExportButtons } from '@/features/export/ExportButtons'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, EmptyState, Icon, PageSpinner } from '@/shared/ui'
import { loadProjectContent, saveProjectContent } from './api/projectContent'
import { getProjectMeta } from './api/projectQueries'
import { ShareDialog } from './components/ShareDialog'
import { useThumbnail } from './useThumbnail'
import styles from './components/Workspace.module.css'

/** Loads meta + content and opens it in the editor (owners only). */
async function loadForEditing(id: string, uid: string) {
  const meta = await getProjectMeta(id)
  if (!meta || meta.ownerId !== uid) return null
  const doc = await loadProjectContent(id)
  if (!doc) return null
  openDocument(doc)
  return meta
}

function Editor({ id, initialPublic }: { id: string; initialPublic: boolean }) {
  const refreshThumbnail = useThumbnail(id)
  const save = useCallback(async (doc: PageDoc) => {
    await saveProjectContent(id, doc)
    void refreshThumbnail() // throttled, runs in the background
  }, [id, refreshThumbnail])
  useAutosave(save, 'to your account')
  const saveNow = useSaveNow(async (doc) => {
    await saveProjectContent(id, doc)
    void refreshThumbnail(true)
  })
  useSaveShortcut(saveNow)
  const title = useDocStore((state) => state.doc.title)
  const [isPublic, setIsPublic] = useState(initialPublic)
  const [sharing, setSharing] = useState(false)

  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          start={<><Link to="/projects" aria-label="Back to my pages"><Icon name="arrowLeft" /></Link><span className={styles.projectName}>{title}</span></>}
          end={
            <>
              <SaveIndicator />
              <Button size="small" variant="ghost" icon={isPublic ? 'globe' : 'lock'} onClick={() => setSharing(true)}>Share</Button>
              <ExportButtons />
              {sharing && <ShareDialog projectId={id} isPublic={isPublic} onChange={setIsPublic} onClose={() => setSharing(false)} />}
            </>
          }
        />
      }
      left={<Sidebar />}
      right={<Inspector />}
    />
  )
}

/** /edit/:projectId — a saved page, autosaved to the account. */
export default function ProjectEditorPage() {
  const { projectId = '' } = useParams()
  const uid = useAuthStore((state) => state.user?.uid ?? '')
  const project = useAsync(() => loadForEditing(projectId, uid), `${projectId}:${uid}`)

  if (project.loading) return <PageSpinner />
  if (!project.data) {
    return <EmptyState icon="help" title="We couldn’t open this page" text="It may have been deleted, or it belongs to someone else."
      action={<Link to="/projects">Back to my pages</Link>} />
  }
  return <Editor key={projectId} id={projectId} initialPublic={project.data.isPublic} />
}
