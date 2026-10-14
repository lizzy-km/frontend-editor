import { conditionAttrs } from './conditions'
import { BOX, BUTTON, field, FIELD, INPUT } from './formBlocks'
import { MATCH_ATTR, SUBMIT_ATTR, SUCCESS_ATTR, type SubmitKind } from './forms'
import { listPages } from './pages'
import { addPage } from './pageOps'
import { patchNode } from './tree/treeOps'
import type { ElementNode, PageDoc } from './types'

/** The sign-in pages of a site: ordinary pages with ordinary forms, so every word, color and rule can be changed. */

const LINK = 'color: inherit; font-weight: 600'
const input = (type: string, name: string, extra = '') => `<input type="${type}" name="${name}" required ${extra} style="${INPUT}">`
const email = field('Email', input('email', 'email', 'autocomplete="email"'))
const password = (label: string, name: string, extra: string) => field(label, input('password', name, extra))
const note = (html: string) => `<p style="margin: 0; font-size: 14px; color: #57534e">${html}</p>`
const button = (text: string) => `<button type="submit" style="${BUTTON}">${text}</button>`

const form = (kind: SubmitKind, success: string, inner: string) =>
  `<form ${SUBMIT_ATTR}="${kind}" ${SUCCESS_ATTR}="${success}" style="${BOX}">${inner}</form>`

type AuthPage = { title: string; path: string; signedOutOnly: boolean; html: string }

export const AUTH_PAGES: AuthPage[] = [
  {
    title: 'Log in', path: '/login', signedOutOnly: true,
    html: form('sign-in', 'Signed in. (In your real site you are sent to your account.)',
      '<h1 style="margin: 0; font-size: 28px">Welcome back</h1>' + note('Log in to your account.') + email
      + password('Password', 'password', 'autocomplete="current-password"')
      + note(`<a href="/forgot-password" style="${LINK}">Forgot your password?</a>`) + button('Log in')
      + note(`New here? <a href="/register" style="${LINK}">Create an account</a>`)),
  },
  {
    title: 'Create account', path: '/register', signedOutOnly: true,
    html: form('register', 'Almost there! Check your email to confirm your account.',
      '<h1 style="margin: 0; font-size: 28px">Create your account</h1>'
      + field('Full name', input('text', 'name', 'minlength="2" autocomplete="name"')) + email
      + password('Password', 'password', 'minlength="8" autocomplete="new-password"')
      + password('Repeat password', 'confirmPassword', `${MATCH_ATTR}="password" autocomplete="new-password"`)
      + `<label style="${FIELD.replace('display: grid; gap: 6px; ', 'display: flex; gap: 10px; align-items: center; ')}"><input type="checkbox" name="terms" required> I accept the terms</label>`
      + button('Create account') + note(`Already have an account? <a href="/login" style="${LINK}">Log in</a>`)),
  },
  {
    title: 'Forgot password', path: '/forgot-password', signedOutOnly: true,
    html: form('forgot', 'If that email has an account, a link to set a new password is on its way.',
      '<h1 style="margin: 0; font-size: 28px">Forgot your password?</h1>' + note('Enter your email and we’ll send you a link.') + email
      + button('Send the link') + note(`<a href="/login" style="${LINK}">Back to log in</a>`)),
  },
  {
    title: 'Set a new password', path: '/reset-password', signedOutOnly: false,
    html: form('reset', 'Password changed. You can log in now.',
      '<h1 style="margin: 0; font-size: 28px">Choose a new password</h1>'
      + password('New password', 'password', 'minlength="8" autocomplete="new-password"')
      + password('Repeat new password', 'confirmPassword', `${MATCH_ATTR}="password" autocomplete="new-password"`)
      + button('Save password') + note(`<a href="/login" style="${LINK}">Back to log in</a>`)),
  },
  {
    title: 'Confirm email', path: '/confirm-email', signedOutOnly: false,
    html: form('confirm', 'Sent! Check your inbox for the new link.',
      '<h1 style="margin: 0; font-size: 28px">Confirm your email</h1>'
      + note('Open the link we emailed you and you’re done. Didn’t get it? We can send it again.') + email
      + button('Send it again')),
  },
]

/** Adds the sign-in pages the site doesn't have yet (matched by address). One new document. */
export function addAuthPages(doc: PageDoc): PageDoc {
  let result = doc
  for (const page of AUTH_PAGES) {
    if (listPages(result).some((existing) => existing.path === page.path)) continue
    const added = addPage(result, { title: page.title, path: page.path, from: 'code', code: page.html })
    const access = page.signedOutOnly ? Object.fromEntries(Object.entries(conditionAttrs({ audience: 'signed-out', roles: [], flags: [] })).filter(([, value]) => value)) : {}
    result = { ...added.doc, nodes: patchNode<ElementNode>(added.doc.nodes, added.pageId, (node) => ({ ...node, attrs: { ...node.attrs, ...access } })) }
  }
  return result
}

/** Which sign-in pages are still missing (shown on the button). */
export const missingAuthPages = (doc: PageDoc) => AUTH_PAGES.filter((page) => !listPages(doc).some((existing) => existing.path === page.path))
