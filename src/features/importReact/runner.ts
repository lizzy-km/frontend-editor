import runtime from './runner/runtime.js?raw'
import type { Compiled } from './compile'
import { importMap } from './externals'

/** What a visited page looks like once the app has drawn it. */
export type Snapshot = { path: string; title: string; html: string; styles: string[]; links: string[]; routes: string[]; errors: string[] }

export type RunnerOptions = {
  /** Where the app's router starts. */
  start: string
  /** The sign-in saved in the app's own storage before it starts (to see members-only pages), or null for a visitor. */
  session: { key: string; value: string } | null
  dependencies: Record<string, string>
}

/** JSON that is safe inside a <script> element (no "<", and the two line separators JavaScript does not like). */
const safeJson = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16)}`)

/** The page the locked frame loads: an import map for the libraries, the compiled project as data, and the runner. */
export function runnerDocument(compiled: Compiled, options: RunnerOptions): string {
  const map = importMap(compiled.externals, options.dependencies)
  const config = { modules: compiled.modules, externals: Object.keys(map), entry: compiled.entry, start: options.start, session: options.session, env: {} }
  return `<!doctype html><html lang="${compiled.html.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`
    + `<script type="importmap">${safeJson({ imports: map })}</script></head><body><div id="root"></div>`
    + `<script type="application/json" id="cfg">${safeJson(config)}</script><script type="module">${runtime.replace(/<\/script/gi, '<\\/script')}</script></body></html>`
}

export type Runner = {
  goto: (path: string) => Promise<void>
  /** Waits until the page stops changing, then returns it. */
  capture: () => Promise<Snapshot>
  close: () => void
}

const SETTLE_MS = 700
const MIN_MS = 500
const MAX_MS = 9000
const LOAD_MS = 45000
const ANSWER_MS = 20000

/** Starts the app in a hidden, locked frame. Rejects when it cannot start (with the app's own error message). */
export function startRunner(compiled: Compiled, options: RunnerOptions): Promise<Runner> {
  const frame = document.createElement('iframe')
  frame.setAttribute('sandbox', 'allow-scripts') // never allow-same-origin: the app's code must not reach the editor or the login
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText = 'position: fixed; left: -10000px; top: 0; width: 1280px; height: 900px; border: 0; visibility: hidden'
  let counter = 0
  const waiting = new Map<number, (data: Record<string, unknown>) => void>()

  const ask = (message: Record<string, unknown>) => new Promise<Record<string, unknown>>((resolve, reject) => {
    const id = ++counter
    const timer = setTimeout(() => { waiting.delete(id); reject(new Error('the page did not answer in time')) }, ANSWER_MS)
    waiting.set(id, (data) => { clearTimeout(timer); resolve(data) })
    frame.contentWindow?.postMessage({ tweakImport: message.type, id, ...message }, '*')
  })
  const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const runner: Runner = {
    async goto(path) {
      const answer = await ask({ type: 'goto', path })
      if (answer.error) throw new Error(String(answer.error))
    },
    async capture() {
      const started = Date.now()
      let last = -1
      let calmSince = Date.now()
      for (;;) {
        const { changes } = (await ask({ type: 'status' })) as { changes: number }
        if (changes !== last) { last = changes; calmSince = Date.now() }
        const age = Date.now() - started
        if ((Date.now() - calmSince >= SETTLE_MS && age >= MIN_MS) || age >= MAX_MS) break
        await pause(120)
      }
      return ((await ask({ type: 'capture' })) as { snapshot: Snapshot }).snapshot
    },
    close() { window.removeEventListener('message', onMessage); frame.remove() },
  }

  let started: { resolve: (runner: Runner) => void; reject: (error: Error) => void }
  function onMessage(event: MessageEvent) {
    const data = event.data as { tweakImport?: boolean; type?: string; id?: number; message?: string } | null
    if (event.source !== frame.contentWindow || !data?.tweakImport) return
    if (data.type === 'reply' && data.id !== undefined) { waiting.get(data.id)?.(data as Record<string, unknown>); waiting.delete(data.id) }
    else if (data.type === 'ready') started.resolve(runner)
    else if (data.type === 'failed') { runner.close(); started.reject(new Error(data.message ?? 'The app could not start.')) }
  }

  return new Promise<Runner>((resolve, reject) => {
    started = { resolve, reject }
    window.addEventListener('message', onMessage)
    setTimeout(() => { runner.close(); reject(new Error('The app took too long to start (are the libraries reachable?).')) }, LOAD_MS)
    frame.srcdoc = runnerDocument(compiled, options)
    document.body.appendChild(frame)
  })
}
