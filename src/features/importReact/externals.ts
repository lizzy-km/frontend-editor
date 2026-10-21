const CDN = 'https://esm.sh'
/** Libraries that must share ONE copy of React (so hooks and context work across them). */
const SHARE_REACT = '?external=react,react-dom'

/** "react-router/dom" -> { name: "react-router", subpath: "/dom" }; "@scope/pkg/sub" -> { name: "@scope/pkg", subpath: "/sub" }. */
export function splitSpecifier(spec: string): { name: string; subpath: string } {
  const parts = spec.split('/')
  const length = spec.startsWith('@') ? 2 : 1
  return { name: parts.slice(0, length).join('/'), subpath: parts.length > length ? `/${parts.slice(length).join('/')}` : '' }
}

/** The address a library is loaded from: the version the project asked for, one shared React. */
export function externalUrl(spec: string, dependencies: Record<string, string>): string {
  const { name, subpath } = splitSpecifier(spec)
  const range = dependencies[name] ?? ''
  const version = range && !/^(workspace|file|link|git|http)/.test(range) ? `@${range}` : ''
  const share = name === 'react' || name === 'react-dom' ? '' : SHARE_REACT
  return `${CDN}/${name}${version}${subpath}${share}`
}

/** The libraries every React app needs even if its code never names them (the runner starts it with them). */
export const ALWAYS = ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime']

/** The import map for the runner: each library name to its address. */
export function importMap(externals: string[], dependencies: Record<string, string>): Record<string, string> {
  return Object.fromEntries([...new Set([...ALWAYS, ...externals])].map((spec) => [spec, externalUrl(spec, dependencies)]))
}
