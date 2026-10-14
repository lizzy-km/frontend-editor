/** src/auth/authMock.ts: a pretend auth server so the project works before there is an API. */
export const MOCK = `import type { AuthResult, RegisterInput, RegisterResult, User } from './types'

/**
 * A pretend auth server in this browser (VITE_USE_MOCK is not "false").
 * Demo accounts: admin@example.com / admin123 (admin), member@example.com / member123 (member).
 * Confirmation and password-reset links are printed in the browser console.
 */
type Stored = User & { password: string }
const KEY = 'auth:mock-users'
const DEMO: Stored[] = [
  { id: 'u-admin', email: 'admin@example.com', name: 'Admin', roles: ['admin'], emailConfirmed: true, password: 'admin123' },
  { id: 'u-member', email: 'member@example.com', name: 'Member', roles: ['member'], emailConfirmed: true, password: 'member123' },
]

const wait = () => new Promise((resolve) => setTimeout(resolve, 350))
const users = (): Stored[] => JSON.parse(localStorage.getItem(KEY) ?? 'null') ?? DEMO
const save = (list: Stored[]) => localStorage.setItem(KEY, JSON.stringify(list))
const publicUser = (stored: Stored): User => ({ id: stored.id, email: stored.email, name: stored.name, roles: stored.roles, emailConfirmed: stored.emailConfirmed })
const result = (stored: Stored): AuthResult => ({ user: publicUser(stored), accessToken: \`mock.\${stored.id}\`, refreshToken: \`mock-refresh.\${stored.id}\` })
const byToken = (token?: string) => users().find((user) => token?.endsWith(\`.\${user.id}\`))
const fail = (message: string): never => { throw new Error(message) }

export async function signIn(email: string, password: string): Promise<AuthResult> {
  await wait()
  const user = users().find((item) => item.email.toLowerCase() === email.trim().toLowerCase())
  if (!user || user.password !== password) fail('That email and password don’t match.')
  if (!user!.emailConfirmed) fail('Please confirm your email first. We can send the link again.')
  return result(user!)
}

export async function register({ name, email, password }: RegisterInput): Promise<RegisterResult> {
  await wait()
  const list = users()
  if (list.some((user) => user.email.toLowerCase() === email.toLowerCase())) fail('There is already an account with this email.')
  const user: Stored = { id: \`u-\${Date.now()}\`, email, name, roles: ['member'], emailConfirmed: false, password }
  save([...list, user])
  console.info(\`[mock] Confirm \${email}: \${location.origin}/confirm-email?token=\${user.id}\`)
  return { needsConfirmation: true, email }
}

export async function confirmEmail(token: string): Promise<AuthResult> {
  await wait()
  const list = users()
  const user = list.find((item) => item.id === token) ?? fail('This confirmation link is not valid any more.')
  user.emailConfirmed = true
  save(list)
  return result(user)
}

export async function resendConfirmation(email: string): Promise<void> {
  await wait()
  const user = users().find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (user) console.info(\`[mock] Confirm \${email}: \${location.origin}/confirm-email?token=\${user.id}\`)
}

export async function forgotPassword(email: string): Promise<void> {
  await wait()
  const user = users().find((item) => item.email.toLowerCase() === email.toLowerCase())
  if (user) console.info(\`[mock] Reset the password of \${email}: \${location.origin}/reset-password?token=\${user.id}\`)
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await wait()
  const list = users()
  const user = list.find((item) => item.id === token) ?? fail('This reset link is not valid any more.')
  user.password = password
  save(list)
}

export async function me(token?: string): Promise<User> {
  await wait()
  return publicUser(byToken(token) ?? fail('Not signed in.'))
}

export async function refresh(token?: string): Promise<AuthResult> {
  await wait()
  return result(byToken(token) ?? fail('Not signed in.'))
}
`
