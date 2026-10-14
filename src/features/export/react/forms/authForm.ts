import type { SubmitKind } from '@/features/editor/model/forms'
import { AFTER_SIGN_IN } from '../auth/guardTemplates'

/** What a sign-in form does when sent (log in, create account, forgot / new password, confirm email), by calling useAuth(). */
export type AuthForm = {
  /** Extra import lines, and the hooks and effects at the top of the component. */
  imports: string[]; hooks: string[]; effects: string[]
  /** The lines inside `try` that do the work. */
  send: string[]
  /** Does it replace the form with a thank-you afterwards? */
  thanks: boolean
}

const TOKEN = "new URLSearchParams(window.location.search).get('token')"
const MISSING = "throw new Error('This link is missing its code. Open the link from your email again.')"

/** Fields are read by their usual names (email, password, name); the schema checks them first. */
const READ = ['  const text = (values: Record<string, unknown>, name: string) => String(values[name] ?? \'\')']

export const isAuthKind = (kind: SubmitKind) => kind !== 'send'

/** `lib` is the router's package, which decides how to navigate to an address only known at run time. */
export function authForm(kind: SubmitKind, lib: string): AuthForm {
  const tanstack = lib !== 'react-router'
  const go = tanstack ? 'void navigate({ to: target as never, replace: true })' : 'navigate(target, { replace: true })'
  const leave = [`      const target = ${AFTER_SIGN_IN}`, `      ${go}`]
  const base = { imports: [`import { useNavigate } from '${lib}'`], hooks: ['  const navigate = useNavigate()', ...READ], effects: [] as string[] }
  const auth = (...names: string[]) => `  const { ${names.join(', ')} } = useAuth()`
  const values = 'text(values as Record<string, unknown>'

  switch (kind) {
    case 'sign-in':
      return { ...base, hooks: [auth('signIn'), ...base.hooks], send: [`      await signIn(${values}, 'email'), ${values}, 'password'))`, ...leave], thanks: false }
    case 'register':
      return {
        ...base, hooks: ['  const { register: createAccount } = useAuth()', ...base.hooks], thanks: true,
        send: [`      const result = await createAccount({ name: ${values}, 'name'), email: ${values}, 'email'), password: ${values}, 'password') })`,
          '      if (!result.needsConfirmation) {', ...leave.map((line) => `  ${line}`), '        return', '      }'],
      }
    case 'forgot':
      return { ...base, imports: [], hooks: [auth('forgotPassword'), ...READ], send: [`      await forgotPassword(${values}, 'email'))`], thanks: true }
    case 'reset':
      return {
        ...base, imports: [], hooks: [auth('resetPassword'), ...READ], thanks: true,
        send: [`      const token = ${TOKEN}`, `      if (!token) ${MISSING}`, `      await resetPassword(token, ${values}, 'password'))`],
      }
    default: // confirm: opening the emailed link confirms; the form asks for the link again
      return {
        ...base, hooks: [auth('confirmEmail', 'resendConfirmation'), '  const started = useRef(false)', ...base.hooks], thanks: true,
        effects: [
          '  useEffect(() => {', `    const token = ${TOKEN}`, '    if (!token || started.current) return', '    started.current = true',
          '    confirmEmail(token)', '      .then(() => {', ...leave.map((line) => `  ${line}`), '      })',
          "      .catch((caught) => setError('root', { message: caught instanceof Error ? caught.message : 'That link didn’t work. Ask for a new one below.' }))",
          '  }, [])', '',
        ],
        send: [`      await resendConfirmation(${values}, 'email'))`],
      }
  }
}
