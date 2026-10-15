import type { JsxContext } from './jsxWriter'

/** Sites: page addresses that become router links, where Link/useNavigate come from, and how to call navigate. */
export type RouterLinks = { paths: Set<string>; dynamic?: string[]; lib: string; go: (target: string, typed: boolean) => string }

export const linksFor = (router?: RouterLinks) => (router ? { paths: router.paths, dynamic: router.dynamic, lib: router.lib, used: false, navigate: false, go: router.go } : undefined)

/** `import { Link, useNavigate } from '…'` for what the file used. */
export function linkImport(ctx: JsxContext, router?: RouterLinks): string[] {
  const names = [ctx.links?.used && 'Link', ctx.links?.navLink && 'NavLink', ctx.links?.navigate && 'useNavigate'].filter(Boolean)
  return names.length && router ? [`import { ${names.join(', ')} } from '${router.lib}'`] : []
}

/** The hook line for components with "click goes to" boxes. */
export const navigateHook = (ctx: JsxContext) => (ctx.links?.navigate ? ['  const navigate = useNavigate()'] : [])
