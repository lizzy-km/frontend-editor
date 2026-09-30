import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { startAuth, useAuthStore } from '@/features/auth/auth.store'
import { BREAKPOINTS } from '@/features/editor/model/breakpoints'
import type { Breakpoint } from '@/features/editor/model/types'
import { loadProjectContent } from '@/features/workspace/api/projectContent'
import { getProjectMeta } from '@/features/workspace/api/projectQueries'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, EmptyState, Icon, PageSpinner } from '@/shared/ui'
import styles from './Gallery.module.css'
import { SafePageFrame } from '@/features/export/SafePageFrame'
import { useMakeCopy } from './useMakeCopy'

async function loadPublicPage(id: string) {
  const [meta, doc] = await Promise.all([getProjectMeta(id), loadProjectContent(id)])
  return meta && doc ? { meta, doc } : null
}

const SIZES: Breakpoint[] = ['desktop', 'tablet', 'mobile']

/**
 * /p/:projectId — look at a shared page, or make your own copy.
 * No direct download: downloads are counted per page for its owner, so
 * visitors download their own copy (which follows their own limit).
 */
export default function PublicPageView() {
  const { projectId = '' } = useParams()
  const page = useAsync(() => loadPublicPage(projectId), projectId)
  const uid = useAuthStore((state) => state.user?.uid)
  const [size, setSize] = useState<Breakpoint>('desktop')
  const { makeCopy, busy } = useMakeCopy(projectId, page.data?.doc)
  useEffect(startAuth, [])

  if (page.loading) return <PageSpinner />
  if (!page.data) {
    return <EmptyState icon="lock" title="This page isn’t shared" text="The owner may have made it private or deleted it." action={<Link to="/gallery">Explore other pages</Link>} />
  }
  const { meta, doc } = page.data
  const isOwner = uid === meta.ownerId

  return (
    <div className={styles.viewer}>
      <header className={styles.bar}>
        <Link to="/gallery" aria-label="Back to Explore"><Icon name="arrowLeft" /></Link>
        <div className={styles.title}>
          <strong>{meta.name}</strong>
          <small>Shared by {meta.ownerName || 'someone'}</small>
        </div>
        <div role="group" aria-label="Screen size">
          {SIZES.map((key) => (
            <Button key={key} size="small" variant={size === key ? 'secondary' : 'ghost'} icon={BREAKPOINTS[key].icon}
              aria-label={BREAKPOINTS[key].label} aria-pressed={size === key} onClick={() => setSize(key)} />
          ))}
        </div>
        {isOwner
          ? <Link to={`/edit/${meta.id}`}><Button size="small" variant="primary" icon="pencil">Edit</Button></Link>
          : <Button size="small" variant="primary" icon="copy" loading={busy} onClick={makeCopy}>Make my own copy</Button>}
      </header>
      <div className={styles.stage}>
        <SafePageFrame doc={doc} title={meta.name} className={styles.frame} width={size === 'desktop' ? '100%' : BREAKPOINTS[size].frameWidth} />
      </div>
    </div>
  )
}
