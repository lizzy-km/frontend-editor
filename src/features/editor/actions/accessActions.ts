import { track } from '@/features/analytics/track'
import type { AuthEndpointKey } from '../model/authApi'
import { accessOf, conditionAttrs, type Condition } from '../model/conditions'
import { codeName } from '../model/data'
import { setAttributes } from './nodeActions'
import { updateDoc } from './commit'

/** Who can see an element or a page. One undo step. */
export function setCondition(id: string, condition: Condition) {
  setAttributes(id, conditionAttrs(condition))
  track('condition_set', { audience: condition.audience, roles: condition.roles.length, flags: condition.flags.length })
}

/** Adds a role or flag the site can use ("Content editor" -> "contentEditor"). */
export function addAccessName(kind: 'roles' | 'flags', name: string) {
  const clean = codeName(name, '')
  if (!clean) return
  updateDoc((doc) => {
    const access = accessOf(doc)
    return access[kind].includes(clean) ? doc : { ...doc, access: { ...access, [kind]: [...access[kind], clean] } }
  })
}

/** Removes a role or flag from the site's list (elements that used it keep their setting). */
export function removeAccessName(kind: 'roles' | 'flags', name: string) {
  updateDoc((doc) => {
    const access = accessOf(doc)
    return { ...doc, access: { ...access, [kind]: access[kind].filter((item) => item !== name) } }
  })
}

/** One sign-in API path (empty = the usual one). Typing in the box is one undo step. */
export function setAuthEndpoint(key: AuthEndpointKey, path: string) {
  updateDoc((doc) => {
    const rest = { ...doc.authApi }
    delete rest[key]
    const authApi = path.trim() ? { ...rest, [key]: path.trim() } : rest
    return { ...doc, authApi: Object.keys(authApi).length ? authApi : undefined }
  }, `auth-api-${key}`)
}
