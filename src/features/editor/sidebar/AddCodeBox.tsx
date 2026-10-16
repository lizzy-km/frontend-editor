import { useState } from 'react'
import { Button, toast } from '@/shared/ui'
import { addCodeToPage } from '../actions/addCodeActions'
import { CodePartsBox, EMPTY_PARTS, hasCode } from './CodePartsBox'
import styles from './Sidebar.module.css'

/** Paste more code: HTML, CSS and JavaScript in one place. Any of the three can be left empty. */
export function AddCodeBox() {
  const [code, setCode] = useState(EMPTY_PARTS)

  const add = () => {
    const result = addCodeToPage(code)
    if (!result.ok) return toast(result.problem, 'error')
    setCode(EMPTY_PARTS)
    toast(`Added to your page${result.found.length ? `: ${result.found.join(', ')}` : ''}`, 'success')
  }

  return (
    <>
      <span className={styles.addLabel}>Paste more code</span>
      <CodePartsBox value={code} onChange={setCode} />
      <Button size="small" icon="plus" disabled={!hasCode(code)} onClick={add}>Add this code</Button>
    </>
  )
}
