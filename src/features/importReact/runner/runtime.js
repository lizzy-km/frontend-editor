// Runs inside the locked frame (sandbox="allow-scripts", never allow-same-origin). It loads the project's libraries from the import map,
// runs the project's compiled files one by one (a tiny module system), starts the app, and answers the editor's messages:
//   goto { path }    -> navigate the app's router
//   status           -> how much the page has changed (so the editor knows when it has settled)
//   capture          -> the page as HTML + CSS, where the app is, and what it links to
const cfg = JSON.parse(document.getElementById('cfg').textContent)
const send = (message) => parent.postMessage({ tweakImport: true, ...message }, '*')
const errors = []

try {
  // The app thinks it has a browser of its own: storage that lives only in this frame, and no real scrolling.
  const memoryStore = () => {
    const map = new Map()
    return { getItem: (key) => (map.has(key) ? map.get(key) : null), setItem: (key, value) => { map.set(String(key), String(value)) }, removeItem: (key) => { map.delete(key) }, clear: () => map.clear(), key: (index) => [...map.keys()][index] ?? null, get length() { return map.size } }
  }
  Object.defineProperty(window, 'localStorage', { value: memoryStore(), configurable: true })
  Object.defineProperty(window, 'sessionStorage', { value: memoryStore(), configurable: true })
  if (cfg.session) localStorage.setItem(cfg.session.key, cfg.session.value)
  window.scrollTo = () => {}
  Element.prototype.scrollIntoView = () => {}
  window.addEventListener('error', (event) => errors.push(String(event.message)))
  window.addEventListener('unhandledrejection', (event) => errors.push(String(event.reason && event.reason.message ? event.reason.message : event.reason)))

  // Libraries (from the CDN), each as { __esModule, default, …named } so both import styles work.
  const wrap = (namespace) => Object.assign(Object.create(null), namespace, { __esModule: true })
  const ext = {}
  // A library that cannot be loaded is noted and skipped: the app only fails if it really uses it.
  for (const spec of cfg.externals) {
    try { ext[spec] = wrap(await import(spec)) } catch (error) { errors.push(`The library "${spec}" could not be loaded: ${error && error.message ? error.message : error}`) }
  }
  const React = ext.react

  // The app asks for a browser router; there is no address bar here, so it gets a router that starts where we say.
  const patchRouter = (lib) => {
    const memory = (routes, options) => {
      window.__routes = routes
      window.__router = lib.createMemoryRouter(routes, { ...options, initialEntries: [cfg.start] })
      return window.__router
    }
    const patched = { ...lib, createBrowserRouter: memory, createHashRouter: memory }
    patched.BrowserRouter = (props) => React.createElement(lib.MemoryRouter, { initialEntries: [cfg.start], ...props })
    return patched
  }
  for (const name of ['react-router', 'react-router-dom']) if (ext[name]) ext[name] = patchRouter(ext[name])

  // CSS Modules: every class gets a unique name; the file's export is { className: uniqueName }.
  const addStyle = (css) => { const element = document.createElement('style'); element.textContent = css; document.head.appendChild(element) }
  const hashOf = (text) => [...text].reduce((sum, char) => (Math.imul(sum, 31) + char.charCodeAt(0)) >>> 0, 7).toString(36)
  const cssModule = (path, css) => {
    const map = {}
    const scoped = css.replace(/(url\([^)]*\))|(:global\([^)]*\))|\.(-?[_a-zA-Z][\w-]*)/g, (all, url, global, name) => {
      if (url) return url
      if (global) return global.slice(8, -1)
      map[name] = map[name] || `${name}_${hashOf(path)}`
      return `.${map[name]}`
    })
    addStyle(scoped)
    return { __esModule: true, default: map, ...map }
  }

  const ENV = { MODE: 'development', DEV: true, PROD: false, SSR: false, BASE_URL: '/', VITE_USE_MOCK: 'true', VITE_API_URL: '', ...cfg.env }
  const cache = {}
  const require = (module, spec) => {
    if (spec in module.deps) return module.deps[spec] ? load(module.deps[spec]) : {}
    if (spec in ext) return ext[spec]
    throw new Error(`The library "${spec}" is not available here.`)
  }
  function load(path) {
    if (cache[path]) return cache[path].exports
    const file = cfg.modules[path]
    const record = { exports: {} }
    cache[path] = record
    if (file.type === 'css') addStyle(file.code)
    else if (file.type === 'cssmodule') record.exports = cssModule(path, file.code)
    else if (file.type === 'json') record.exports = { __esModule: true, default: JSON.parse(file.code) }
    // Running the project's own code is the point of this file; the frame is locked (no same-origin), so it cannot reach the editor or the login.
    else new Function('require', 'module', 'exports', '__env', '__glob', file.code)((spec) => require(file, spec), record, record.exports, ENV, () => ({}))
    return record.exports
  }

  // Where the app is, what it links to, and which paths its router knows.
  const pathsOf = (routes, base = '') => routes.flatMap((route) => {
    const here = route.path === undefined ? base : route.path.startsWith('/') ? route.path : `${base}/${route.path}`.replace(/\/+/g, '/')
    const own = route.path === '*' ? [] : [here || '/']
    return [...own, ...pathsOf(route.children || [], here)]
  })
  const root = document.getElementById('root')
  let changes = 0
  new MutationObserver(() => { changes += 1 }).observe(root, { subtree: true, childList: true, attributes: true, characterData: true })
  const where = () => (window.__router ? window.__router.state.location.pathname + window.__router.state.location.search : cfg.start)
  const snapshot = () => ({
    path: where(), title: document.title, html: root.innerHTML, errors,
    styles: [...document.querySelectorAll('style')].map((element) => element.textContent),
    links: [...root.querySelectorAll('a[href]')].map((link) => link.getAttribute('href')).filter((href) => href && href.startsWith('/') && !href.startsWith('//')),
    routes: window.__routes ? pathsOf(window.__routes) : [],
  })

  window.addEventListener('message', (event) => {
    const message = event.data
    if (event.source !== parent || !message || !message.tweakImport) return
    const reply = (data) => send({ type: 'reply', id: message.id, ...data })
    if (message.tweakImport === 'status') reply({ changes })
    else if (message.tweakImport === 'capture') reply({ snapshot: snapshot() })
    else if (message.tweakImport === 'goto') {
      if (!window.__router) return reply({ error: 'This app does not use createBrowserRouter, so its pages cannot be visited.' })
      Promise.resolve(window.__router.navigate(message.path)).then(() => reply({}), (error) => reply({ error: String(error && error.message ? error.message : error) }))
    }
  })

  load(cfg.entry)
  send({ type: 'ready' })
} catch (error) {
  send({ type: 'failed', message: String(error && error.message ? error.message : error), errors })
}
