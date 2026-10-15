import { useState } from 'react'
import { track } from '@/features/analytics/track'
import { Button, Icon, toast } from '@/shared/ui'
import { briefFor, PAGES_LINE, buildPrompt, PROMPT_GROUPS, PROMPT_PRESETS, type PromptKind } from './prompts'
import { PROMPT_RULES } from './promptRules'
import { SITE_RULES } from './siteRules'
import styles from './AiPromptHelper.module.css'

/** Where people usually paste the prompt. Plain links, opened in a new tab. */
const AI_TOOLS = [
  { name: 'ChatGPT', href: 'https://chatgpt.com/' },
  { name: 'Claude', href: 'https://claude.ai/new' },
  { name: 'Gemini', href: 'https://gemini.google.com/app' },
]

/**
 * "No code yet?" — pick a ready-made page idea, change the description in
 * your own words, copy the prompt into an AI, then paste its answer here.
 */
export function AiPromptHelper({ kind = 'page' }: { kind?: PromptKind }) {
  const [presetId, setPresetId] = useState(PROMPT_PRESETS[1]!.id)
  const [brief, setBrief] = useState(() => briefFor(PROMPT_PRESETS[1]!.id, kind))
  const [copied, setCopied] = useState(false)

  const choose = (id: string) => {
    setPresetId(id)
    setBrief(briefFor(id, kind))
  }

  // Switching between "one page" and "website" adds or removes the pages line, keeping what was typed.
  const [seenKind, setSeenKind] = useState(kind)
  if (seenKind !== kind) {
    setSeenKind(kind)
    setBrief((current) => (kind === 'site' ? (current.includes(PAGES_LINE) ? current : `${current}
${PAGES_LINE}`) : current.replace(`
${PAGES_LINE}`, '')))
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt(brief, presetId, kind))
      track('prompt_copy', { preset: presetId, edited: brief !== briefFor(presetId, kind) })
      setCopied(true)
      toast('Prompt copied — paste it into your AI tool', 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Couldn’t copy. Select the text in the box and copy it yourself.', 'error')
    }
  }

  return (
    <details className={styles.helper}>
      <summary className={styles.summary}>
        <Icon name="sparkle" size={16} /> No code yet? Get a page from an AI in 3 steps
      </summary>
      <div className={styles.body}>
        <p className={styles.step}><b>1.</b> Pick an idea close to yours, then change the description below in your own words.</p>
        {PROMPT_GROUPS.map((group) => (
          <div key={group.id} className={styles.group}>
            <p className={styles.groupLabel}>{group.label}</p>
            <div className={styles.chips} role="radiogroup" aria-label={group.label}>
              {group.presets.map((preset) => (
                <button key={preset.id} type="button" role="radio" aria-checked={preset.id === presetId}
                  className={styles.chip} onClick={() => choose(preset.id)}>
                  <span aria-hidden="true">{preset.icon}</span> {preset.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <label className={styles.briefLabel} htmlFor="ai-brief">Your page (change anything)</label>
        <textarea id="ai-brief" className={styles.brief} value={brief} spellCheck
          onChange={(event) => setBrief(event.target.value)} />
        <details className={styles.rules}>
          <summary>Rules for the AI (keep these — they make the page easy to edit here)</summary>
          <pre>{kind === 'site' ? `${PROMPT_RULES}

${SITE_RULES}` : PROMPT_RULES}</pre>
        </details>

        <p className={styles.step}><b>2.</b> Copy the prompt and paste it into an AI chat:</p>
        <div className={styles.row}>
          <Button variant="primary" icon={copied ? 'check' : 'copy'} onClick={copy}>{copied ? 'Copied' : 'Copy prompt'}</Button>
          {AI_TOOLS.map((tool) => (
            <a key={tool.name} className={styles.tool} href={tool.href} target="_blank" rel="noopener noreferrer">
              Open {tool.name} <Icon name="link" size={14} />
            </a>
          ))}
        </div>
        <p className={styles.step}><b>3.</b> Copy the AI’s whole answer and paste it into the box above.</p>
      </div>
    </details>
  )
}
