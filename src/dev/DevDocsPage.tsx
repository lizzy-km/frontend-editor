import { useCallback, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import NotFoundPage from '@/app/NotFoundPage'
import { CodeReference } from './CodeReference'
import { DocView } from './DocView'
import { DOC_FILES, README, SKILLS, readFile } from './docsFiles'
import { OverviewView } from './OverviewView'
import { WorkflowView } from './WorkflowView'
import styles from './dev.module.css'

const TABS = [
  ['overview', 'Overview'], ['workflow', 'Workflow'], ['features', 'Features'], ['architecture', 'Architecture'], ['code', 'Code reference'],
  ['rules', 'Rules'], ['history', 'History'], ['readme', 'README'],
] as const
type Tab = (typeof TABS)[number][0]

/** Which document a link inside a doc points at, as a tab ("ARCHITECTURE.md" → architecture). */
const TAB_FOR_FILE: Record<string, Tab> = { 'ARCHITECTURE.md': 'architecture', 'HISTORY.md': 'history', 'WORKFLOW.md': 'workflow', 'FEATURES.md': 'features', 'README.md': 'readme' }

/** The skills (rule files) of the project, by short name. */
const skillNames = () => Object.keys(SKILLS).map((path) => path.split('/').slice(-2)[0]!)

/**
 * Developer docs: workflow diagrams, architecture, a code reference read from the source, the project rules and history.
 * Hidden: only the development server has this route (it is not in a production build) and nothing links to it.
 */
export default function DevDocsPage() {
  const [params, setParams] = useSearchParams()
  const tab = (TABS.find(([id]) => id === params.get('tab'))?.[0] ?? 'overview') as Tab
  const [skill, setSkill] = useState(skillNames()[0] ?? '')
  const open = useCallback((next: Tab) => setParams({ tab: next }), [setParams])
  const navigate = useCallback((target: string) => { const next = TAB_FOR_FILE[target.split('/').pop() ?? '']; if (next) open(next) }, [open])
  const loadDoc = useCallback((file: string) => () => readFile(DOC_FILES, file), [])
  const loadReadme = useCallback(() => readFile(README, 'README.md'), [])
  const loadSkill = useCallback(() => readFile(SKILLS, `/${skill}/SKILL.md`), [skill])

  if (!import.meta.env.DEV) return <NotFoundPage />
  return (
    <div className={styles.page}>
      <header className={styles.top}>
        <h1>Tweak developer docs</h1>
        <span className={styles.badge}>Development only</span>
        <Link to="/dev/payment" className={styles.muted}>Payment and market docs →</Link>
        <nav className={styles.tabs} role="tablist" aria-label="Sections">
          {TABS.map(([id, label]) => <button key={id} type="button" role="tab" className={styles.tab} aria-selected={tab === id} onClick={() => open(id)}>{label}</button>)}
        </nav>
      </header>
      <main className={styles.body}>
        {tab === 'overview' && <OverviewView />}
        {tab === 'workflow' && <WorkflowView />}
        {tab === 'features' && <DocView key="features" load={loadDoc('FEATURES.md')} onNavigate={navigate} />}
        {tab === 'architecture' && <DocView key="architecture" load={loadDoc('ARCHITECTURE.md')} onNavigate={navigate} />}
        {tab === 'code' && <CodeReference />}
        {tab === 'rules' && (
          <>
            <p className={styles.muted}>The rules the project follows (from <code>.claude/skills</code>): pick one.
              {' '}{skillNames().map((name) => <button key={name} type="button" className={styles.tab} aria-selected={skill === name} onClick={() => setSkill(name)}>{name}</button>)}
            </p>
            <DocView key={skill} load={loadSkill} onNavigate={navigate} />
          </>
        )}
        {tab === 'history' && <DocView key="history" load={loadDoc('HISTORY.md')} onNavigate={navigate} />}
        {tab === 'readme' && <DocView key="readme" load={loadReadme} onNavigate={navigate} />}
      </main>
    </div>
  )
}
