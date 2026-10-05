export type ScriptFile = { src: string; module: boolean }

/**
 * src/runPageScripts.ts in the exported project. The page's own JavaScript
 * was written for a plain web page, so it runs unchanged after React has
 * put the page on screen.
 */
export function runnerSource(scripts: ScriptFile[], handlerEvents: string[]): string {
  const list = scripts.map((script) => `  { src: '${script.src}', module: ${script.module} },`)
  return `/**
 * Runs the page's own JavaScript (public/scripts/) once, after React has put
 * the page on screen, so it finds every element just like on the original page.
 * Over time you can move these behaviours into React components.
 */
type PageScript = { src: string; module: boolean }
type AddListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => void

const SCRIPTS: PageScript[] = [
${list.join('\n')}
]

/** Inline handlers such as onclick="…" (React can't take them as text, so they wait in data-on…). */
const HANDLER_EVENTS: string[] = ${JSON.stringify(handlerEvents)}

let started = false

function restoreInlineHandlers(): void {
  for (const event of HANDLER_EVENTS) {
    document.querySelectorAll(\`[data-on\${event}]\`).forEach((element) => {
      element.setAttribute(\`on\${event}\`, element.getAttribute(\`data-on\${event}\`) ?? '')
    })
  }
}

function callNow(target: EventTarget, type: string, listener: EventListenerOrEventListenerObject): void {
  const event = new Event(type)
  setTimeout(() => (typeof listener === 'function' ? listener.call(target, event) : listener.handleEvent(event)))
}

/** "Wait until the page has loaded" code runs right away: by now it has. Returns a function that undoes this. */
function runReadyListenersNow(): () => void {
  const documentAdd = document.addEventListener
  const windowAdd = window.addEventListener
  const wrap = (target: EventTarget, add: AddListener): AddListener => (type, listener, options) => {
    if (type === 'DOMContentLoaded' || (target === window && type === 'load')) callNow(target, type, listener)
    else add.call(target, type, listener, options)
  }
  document.addEventListener = wrap(document, documentAdd) as typeof document.addEventListener
  window.addEventListener = wrap(window, windowAdd) as typeof window.addEventListener
  return () => {
    document.addEventListener = documentAdd
    window.addEventListener = windowAdd
  }
}

function loadScript({ src, module }: PageScript): Promise<void> {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    if (module) script.type = 'module'
    script.src = import.meta.env.BASE_URL + src
    script.onload = () => resolve()
    script.onerror = () => {
      console.error(\`Could not run \${src}\`)
      resolve()
    }
    document.body.appendChild(script)
  })
}

/** Call once when the app has mounted (App.tsx does). Safe to call twice. */
export function runPageScripts(): void {
  if (started) return
  started = true
  restoreInlineHandlers()
  const undo = runReadyListenersNow()
  void SCRIPTS.reduce((previous, script) => previous.then(() => loadScript(script)), Promise.resolve()).finally(undo)
}
`
}
