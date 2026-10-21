import { useState } from 'react'
import { track } from '@/features/analytics/track'
import { Button, Icon, toast } from '@/shared/ui'
import { briefFor, buildPrompt, PROMPT_GROUPS, PROMPT_PRESETS, REACT_PROMPT_GROUPS, REACT_PROMPT_PRESETS, rulesFor, switchBriefKind, type PromptKind } from './prompts'
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
export function AiPromptHelper({ kind: pageKind = 'page' }: { kind?: PromptKind }) {
  // "A web page" opens in this editor; "A React project" is a project of many files that runs on your own computer.
  // Each has its own ideas and its own description, so switching back and forth keeps what was typed.
  const [output, setOutput] = useState<'html' | 'react'>('html')
  const kind: PromptKind = output === 'react' ? 'react' : pageKind
  const [htmlIdea, setHtmlIdea] = useState({ id: PROMPT_PRESETS[1]!.id, brief: briefFor(PROMPT_PRESETS[1]!.id, pageKind) })
  const [reactIdea, setReactIdea] = useState({ id: REACT_PROMPT_PRESETS[1]!.id, brief: briefFor(REACT_PROMPT_PRESETS[1]!.id, 'react') })
  const [copied, setCopied] = useState(false)
  const idea = output === 'react' ? reactIdea : htmlIdea
  const setIdea = output === 'react' ? setReactIdea : setHtmlIdea
  const groups = output === 'react' ? REACT_PROMPT_GROUPS : PROMPT_GROUPS
  const presetId = idea.id
  const brief = idea.brief
  const setBrief = (text: string) => setIdea((current) => ({ ...current, brief: text }))

  const choose = (id: string) => setIdea({ id, brief: briefFor(id, kind) })

  // Switching between one page and a website adds or removes the pages line, keeping what was typed.
  const [seenKind, setSeenKind] = useState(pageKind)
  if (seenKind !== pageKind) {
    setSeenKind(pageKind)
    setHtmlIdea((current) => ({ ...current, brief: switchBriefKind(current.brief, pageKind) }))
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildPrompt(brief, presetId, kind))
      track('prompt_copy', { preset: presetId, edited: brief !== briefFor(presetId, kind), kind })
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
        <div className={styles.output} role="radiogroup" aria-label="What should the AI make?">
          <button type="button" role="radio" aria-checked={output === 'html'} className={styles.chip} onClick={() => setOutput('html')}>A web page <small>opens in this editor</small></button>
          <button type="button" role="radio" aria-checked={output === 'react'} className={styles.chip} onClick={() => setOutput('react')}>A React project (TypeScript) <small>runs on your computer</small></button>
        </div>
        <p className={styles.step}><b>1.</b> {output === 'react' ? 'Pick an app close to yours' : 'Pick an idea close to yours'}, then change the description below in your own words.</p>
        {groups.map((group) => (
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
        <label className={styles.briefLabel} htmlFor="ai-brief">{output === 'react' ? 'Your app (change anything)' : 'Your page (change anything)'}</label>
        <textarea id="ai-brief" className={styles.brief} value={brief} spellCheck
          onChange={(event) => setBrief(event.target.value)} />
        <details className={styles.rules}>
          <summary>{kind === 'react' ? 'Rules for the AI (keep these — they make the project clean and complete)' : 'Rules for the AI (keep these — they make the page easy to edit here)'}</summary>
          <pre>{rulesFor(kind)}</pre>
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
        {kind === 'react'
          ? <p className={styles.step}><b>3.</b> The AI answers with a list of files. Save each one at its path in a new folder, then run <code>npm install</code> and <code>npm run dev</code> (needs Node.js 20 or newer). This kind of project does not open in Tweak.</p>
          : <p className={styles.step}><b>3.</b> Copy the AI’s whole answer and paste it into the box above.</p>}
      </div>
    </details>
  )
}
