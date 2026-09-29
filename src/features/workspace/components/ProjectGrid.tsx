import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon, toast } from '@/shared/ui'
import { deleteProject, renameProject, setProjectPublic } from '../api/projectMutations'
import type { ProjectMeta } from '../api/types'
import { ConfirmDialog } from './ConfirmDialog'
import { ProjectCard } from './ProjectCard'
import { RenameDialog } from './RenameDialog'
import styles from './Workspace.module.css'

type Props = {
  uid: string
  projects: ProjectMeta[]
  canCreate: boolean
  /** Called with the new list after a change (optimistic update). */
  onChange: (projects: ProjectMeta[]) => void
  onDeleted: () => void
}

/** The cards + the rename / delete dialogs for them. */
export function ProjectGrid({ uid, projects, canCreate, onChange, onDeleted }: Props) {
  const [renaming, setRenaming] = useState<ProjectMeta | null>(null)
  const [deleting, setDeleting] = useState<ProjectMeta | null>(null)
  const replace = (next: ProjectMeta) => onChange(projects.map((item) => (item.id === next.id ? next : item)))

  const togglePublic = async (project: ProjectMeta) => {
    await setProjectPublic(project.id, !project.isPublic)
    replace({ ...project, isPublic: !project.isPublic })
    toast(project.isPublic ? 'Now only you can see it' : 'Now anyone with the link can see it', 'success')
  }

  return (
    <>
      <div className={styles.grid}>
        <Link to={canCreate ? '/projects/new' : '#'} className={styles.newCard} aria-disabled={!canCreate}
          onClick={(event) => !canCreate && event.preventDefault()}>
          <Icon name="plus" size={28} /> New page
        </Link>
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project}
            onRename={() => setRenaming(project)} onTogglePublic={() => togglePublic(project)} onDelete={() => setDeleting(project)} />
        ))}
      </div>
      {renaming && (
        <RenameDialog name={renaming.name} onClose={() => setRenaming(null)}
          onSave={async (name) => { await renameProject(renaming.id, name); replace({ ...renaming, name }) }} />
      )}
      <ConfirmDialog
        open={deleting !== null} onClose={() => setDeleting(null)} confirmLabel="Delete forever"
        title={`Delete “${deleting?.name ?? ''}”?`}
        message="This can't be undone. Download it first if you might want it later. You'll get the page slot back."
        onConfirm={async () => {
          if (!deleting) return
          await deleteProject(uid, deleting.id)
          onChange(projects.filter((item) => item.id !== deleting.id))
          onDeleted()
        }}
      />
    </>
  )
}
