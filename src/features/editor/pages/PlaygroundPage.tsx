import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExportButtons } from '@/features/export/ExportButtons'
import { PasteScreen } from '@/features/import/PasteScreen'
import { Button, Icon, TopBar } from '@/shared/ui'
import { openDocument } from '../actions/documentActions'
import { Inspector } from '../inspector/Inspector'
import { EditorLayout } from '../layout/EditorLayout'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import type { PageDoc } from '../model/types'
import { clearLocalDraft, loadLocalDraft, saveLocalDraft } from '../persistence/localDraft'
import { useAutosave } from '../persistence/useAutosave'
import { WELCOME_HTML } from '../samples/welcomePage'
import { EditorToolbar } from '../toolbar/EditorToolbar'
import { SaveIndicator } from '../toolbar/SaveIndicator'

/** The editor for "Try it": saves to this browser only. */
function PlaygroundEditor({ onStartOver }: { onStartOver: () => void }) {
  useAutosave(saveLocalDraft, 'in this browser')
  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          start={
            <>
              <Link to="/" aria-label="Back to home"><Icon name="arrowLeft" /></Link>
              <Button size="small" variant="ghost" onClick={onStartOver}>Paste new code</Button>
            </>
          }
          end={
            <>
              <SaveIndicator />
              <ExportButtons />
              <Link to="/signup"><Button size="small" variant="primary">Save to an account</Button></Link>
            </>
          }
        />
      }
      right={<Inspector />}
    />
  )
}

/** "Try it" — no account needed. Paste first, then edit. */
export default function PlaygroundPage() {
  const [editing, setEditing] = useState(false)
  const [draft] = useState(loadLocalDraft)

  const open = (doc: PageDoc) => {
    openDocument(doc)
    setEditing(true)
  }
  const startOver = () => {
    clearLocalDraft()
    setEditing(false)
  }

  if (editing) return <PlaygroundEditor onStartOver={startOver} />
  return (
    <>
      <TopBar><Link to="/login">Sign in</Link></TopBar>
      <PasteScreen
        onOpen={(doc) => {
          saveLocalDraft(doc)
          open(doc)
        }}
        secondary={
          <>
            {draft && <Button size="large" onClick={() => open(draft)}>Continue my last page</Button>}
            <Button size="large" variant="ghost" onClick={() => open(parseHtmlDocument(WELCOME_HTML))}>Try an example page</Button>
          </>
        }
      />
    </>
  )
}
