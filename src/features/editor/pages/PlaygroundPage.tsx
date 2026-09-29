import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@/shared/ui'
import { EditorLayout } from '../layout/EditorLayout'
import { parseHtmlDocument } from '../model/parse/parseDocument'
import { WELCOME_HTML } from '../samples/welcomePage'
import { useDocStore } from '../store/doc.store'
import { EditorToolbar } from '../toolbar/EditorToolbar'

/** "Try it" editor: no account needed, starts with a sample page. */
export default function PlaygroundPage() {
  useEffect(() => {
    useDocStore.getState().load(parseHtmlDocument(WELCOME_HTML))
  }, [])

  return (
    <EditorLayout
      toolbar={
        <EditorToolbar
          start={<Link to="/" aria-label="Back to home"><Icon name="arrowLeft" /></Link>}
        />
      }
    />
  )
}
