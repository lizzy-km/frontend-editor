import { Link } from 'react-router-dom'
import { timeAgo } from '@/lib/time'
import { Button, Icon } from '@/shared/ui'
import type { ProjectMeta } from '../api/types'
import styles from './Workspace.module.css'

type Props = {
  project: ProjectMeta
  onRename: () => void
  onTogglePublic: () => void
  onDelete: () => void
}

/** Soft colour from the name, so every card without a picture still looks distinct. */
const hueOf = (text: string) => [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360

export function ProjectThumb({ project }: { project: ProjectMeta }) {
  if (project.thumbnailUrl) return <img className={styles.thumb} src={project.thumbnailUrl} alt="" loading="lazy" />
  return (
    <span className={styles.thumb} style={{ background: `hsl(${hueOf(project.name)} 70% 88%)` }} aria-hidden="true">
      {project.name.charAt(0).toUpperCase()}
    </span>
  )
}

/** One saved page on the dashboard. */
export function ProjectCard({ project, onRename, onTogglePublic, onDelete }: Props) {
  return (
    <article className={styles.card}>
      <Link to={`/edit/${project.id}`} className={styles.cardLink} aria-label={`Open ${project.name}`}>
        <ProjectThumb project={project} />
      </Link>
      <div className={styles.cardBody}>
        <Link to={`/edit/${project.id}`} className={styles.cardTitle}>{project.name}</Link>
        <p className={styles.cardMeta}>
          <span className={project.isPublic ? styles.public : styles.private}>
            <Icon name={project.isPublic ? 'globe' : 'lock'} size={13} /> {project.isPublic ? 'Public' : 'Private'}
          </span>
          · Changed {timeAgo(project.updatedAt)}
        </p>
      </div>
      <div className={styles.cardActions}>
        <Button size="small" variant="ghost" icon="pencil" aria-label="Rename" title="Rename" onClick={onRename} />
        <Button size="small" variant="ghost" icon={project.isPublic ? 'lock' : 'globe'} title={project.isPublic ? 'Make private' : 'Make public'}
          aria-label={project.isPublic ? 'Make private' : 'Make public'} onClick={onTogglePublic} />
        <Button size="small" variant="ghost" icon="trash" aria-label="Delete" title="Delete" onClick={onDelete} />
      </div>
    </article>
  )
}
