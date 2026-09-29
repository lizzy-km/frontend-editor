import { Link } from 'react-router-dom'
import { features } from '@/config/features.config'
import { AccountMenu } from '@/features/auth/components/AccountMenu'
import { useAuthStore } from '@/features/auth/auth.store'
import { planFor } from '@/features/billing/plans'
import { useAsync } from '@/shared/hooks/useAsync'
import { EmptyState, PageSpinner, TopBar } from '@/shared/ui'
import { getUsage, listMyProjects } from './api/projectQueries'
import { ProjectGrid } from './components/ProjectGrid'
import { UsageMeter } from './components/UsageMeter'
import styles from './components/Workspace.module.css'

/** "My pages": every saved page, how many slots are left, and a way to add one. */
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)!
  const projects = useAsync(() => listMyProjects(user.uid), user.uid)
  const usage = useAsync(() => getUsage(user.uid), user.uid)
  const plan = planFor(usage.data?.plan)
  const used = projects.data?.length ?? usage.data?.count ?? 0
  const canCreate = used < plan.maxProjects

  return (
    <>
      <TopBar>
        {features.enable_gallery && <Link to="/gallery" className="hideOnPhone">Explore</Link>}
        <AccountMenu />
      </TopBar>
      <main className={styles.main}>
        <div className={styles.head}>
          <h1>Your pages</h1>
          {usage.data && <UsageMeter used={used} max={plan.maxProjects} />}
        </div>

        {!canCreate && (
          <div className={styles.limit} role="status">
            <strong>You’ve used all {plan.maxProjects} page slots.</strong>
            <span>Delete a page you don’t need to make room{features.enable_billing ? <>, or <Link to="/plans">get more with Pro</Link></> : ''}.</span>
          </div>
        )}

        {projects.loading && <PageSpinner />}
        {Boolean(projects.error) && <p className={styles.error}>We couldn’t load your pages. Check your connection and refresh.</p>}
        {projects.data && projects.data.length === 0 && (
          <EmptyState icon="sparkle" title="No saved pages yet" text="Paste code from an AI to start your first page."
            action={<Link to="/projects/new">Start a new page</Link>} />
        )}
        {projects.data && projects.data.length > 0 && (
          <ProjectGrid uid={user.uid} projects={projects.data} canCreate={canCreate} onChange={projects.setData} onDeleted={usage.reload} />
        )}
      </main>
    </>
  )
}
