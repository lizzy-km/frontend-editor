import { useEffect, useState } from 'react'
import { Icon } from '@/shared/ui'
import { stepState, stepsFor, type ProgressState } from './progressState'
import styles from './ImportProgress.module.css'

/** Seconds since the import started (updates every second). */
function useElapsed(startedAt: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  return Math.max(0, Math.round((now - startedAt) / 1000))
}

/** How far along it is, as a percentage: whole steps done, plus part of the step being worked on (visiting pages has no known end, so it slows down). */
export function percentOf(state: ProgressState): number {
  const steps = stepsFor(state)
  const done = steps.filter((step) => stepState(state, step.id) === 'done').length
  const active = state.stage === 'visit' || state.stage === 'member' ? state.visits / (state.visits + 8) : 0.4
  return Math.min(97, Math.round(((done + active) / steps.length) * 100))
}

/** The screen shown while a React project is opened: a little browser that visits the pages, the steps with their state, and the pages as they are found. */
export function ImportProgress({ state }: { state: ProgressState }) {
  const seconds = useElapsed(state.startedAt)
  const steps = stepsFor(state)
  const percent = percentOf(state)
  const current = steps.find((step) => step.id === state.stage)
  return (
    <section className={styles.card} aria-label="Opening your project">
      <header className={styles.head}>
        <span className={styles.orb} aria-hidden="true"><Icon name="sparkle" size={18} /></span>
        <div>
          <h3>Opening your project</h3>
          <p role="status" aria-live="polite">{current?.label}… {current?.hint}</p>
        </div>
        <span className={styles.time}>{seconds}s</span>
      </header>

      <div className={styles.body}>
        <div className={styles.browser} aria-hidden="true">
          <div className={styles.bar}><i /><i /><i /><span key={state.path} className={styles.address}>{state.path || '/'}</span></div>
          <div className={styles.screen} key={`${state.stage}${state.path}`}>
            <span className={styles.beam} />
            <b className={styles.line} style={{ width: '46%' }} /><b className={styles.line} style={{ width: '82%' }} /><b className={styles.line} style={{ width: '64%' }} />
            <div className={styles.tiles}><u /><u /><u /></div>
          </div>
        </div>

        <ol className={styles.steps}>
          {steps.map((step) => {
            const status = stepState(state, step.id)
            return (
              <li key={step.id} data-status={status}>
                <span className={styles.dot} aria-hidden="true">{status === 'done' ? <Icon name="check" size={14} /> : <i />}</span>
                <span><strong>{step.label}</strong><small>{step.hint}</small></span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className={styles.found} aria-label="Pages found">
        {state.pages.length === 0 && <span className={styles.waiting}>Pages will appear here as they are found…</span>}
        {state.pages.map((page) => (
          <span key={page.path} className={styles.chip} data-private={page.private} title={page.path}>
            {page.private && <Icon name="lock" size={12} />}{page.title}
          </span>
        ))}
      </div>

      <div className={styles.meter} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Progress">
        <span style={{ width: `${percent}%` }} />
      </div>
      <p className={styles.counts}>{state.pages.length} {state.pages.length === 1 ? 'page' : 'pages'} found · {state.visits} {state.visits === 1 ? 'visit' : 'visits'} · {percent}%</p>
    </section>
  )
}
