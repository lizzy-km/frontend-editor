import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { legal } from '@/config/legal.config'

/** The words behind each {token}; an empty setting shows a visible placeholder (so it cannot go live unnoticed). */
const TOKENS: Record<string, string> = {
  operator: legal.operator || '[operator name not set]',
  email: legal.email || '[contact email not set]',
  address: legal.address || '[postal address not set]',
  country: legal.country || '[governing country not set]',
}

/** Fills the {tokens} of a text. */
export const fill = (text: string) => text.replace(/\{(operator|email|address|country)\}/g, (_, name: string) => TOKENS[name]!)

const PART = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/

/** Renders a text with **bold** and [links](/path or https://…), tokens filled. Links to the app stay inside it. */
export function Rich({ text }: { text: string }): ReactNode {
  return fill(text).split(PART).map((part, index) => {
    if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (!link) return <Fragment key={index}>{part}</Fragment>
    const [, label, to] = link
    if (to!.startsWith('mailto:') || to!.startsWith('http')) return <a key={index} href={to}>{label}</a>
    return <Link key={index} to={to!}>{label}</Link>
  })
}
