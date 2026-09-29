import { useState } from 'react'
import { Link } from 'react-router-dom'
import { wasSignedIn } from '@/features/auth/auth.store'
import { listPublicProjects } from '@/features/workspace/api/projectQueries'
import type { ProjectMeta } from '@/features/workspace/api/types'
import { ProjectThumb } from '@/features/workspace/components/ProjectCard'
import { isFirebaseConfigured } from '@/lib/firebaseConfig'
import { timeAgo } from '@/lib/time'
import { useAsync } from '@/shared/hooks/useAsync'
import { Button, EmptyState, PageSpinner, TopBar, toast } from '@/shared/ui'
import styles from './Gallery.module.css'

function GalleryCard({ project }: { project: ProjectMeta }) {
  return (
    <Link to={`/p/${project.id}`} className={styles.card}>
      <ProjectThumb project={project} />
      <span className={styles.cardText}>
        <strong>{project.name}</strong>
        <small>by {project.ownerName || 'someone'} · {timeAgo(project.updatedAt)}</small>
      </span>
    </Link>
  )
}

/** Explore: pages other people chose to share. */
export default function GalleryPage() {
  const first = useAsync(() => (isFirebaseConfigured ? listPublicProjects() : Promise.resolve(null)), 'gallery')
  const [more, setMore] = useState<ProjectMeta[]>([])
  const [cursor, setCursor] = useState<number | null | undefined>(undefined)
  const [loadingMore, setLoadingMore] = useState(false)
  const next = cursor === undefined ? first.data?.nextCursor ?? null : cursor
  const projects = [...(first.data?.projects ?? []), ...more]

  const loadMore = async () => {
    if (!next) return
    setLoadingMore(true)
    try {
      const page = await listPublicProjects(next)
      setMore((old) => [...old, ...page.projects])
      setCursor(page.nextCursor)
    } catch {
      toast('Couldn’t load more pages.', 'error')
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <>
      <TopBar>{wasSignedIn() ? <Link to="/projects">My pages</Link> : <Link to="/login">Sign in</Link>}</TopBar>
      <main className={styles.main}>
        <header className={styles.head}>
          <h1>Explore pages</h1>
          <p>Pages people made and shared. Open one to look around, or make your own copy to change it.</p>
        </header>
        {!isFirebaseConfigured && <EmptyState icon="globe" title="Nothing to explore yet" text="Sharing needs accounts, which aren’t switched on in this copy of the app." />}
        {first.loading && <PageSpinner />}
        {Boolean(first.error) && <p className={styles.error}>We couldn’t load pages right now. Please refresh.</p>}
        {first.data && projects.length === 0 && <EmptyState icon="globe" title="No shared pages yet" text="Be the first: open one of your pages and choose Share." />}
        <div className={styles.grid}>{projects.map((project) => <GalleryCard key={project.id} project={project} />)}</div>
        {next && <Button onClick={loadMore} loading={loadingMore}>Show more</Button>}
      </main>
    </>
  )
}
