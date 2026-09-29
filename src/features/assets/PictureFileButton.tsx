import { useRef, useState } from 'react'
import { Button, toast } from '@/shared/ui'
import { pictureFromFile } from './uploadImage'

/** "Use a picture from my computer" — uploads or embeds, then hands back the address. */
export function PictureFileButton({ onPicked }: { onPicked: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      onPicked(await pictureFromFile(file))
    } catch (error) {
      toast((error as Error).message, 'error')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" hidden
        onChange={(event) => pick(event.target.files?.[0])} />
      <Button icon="upload" full loading={busy} onClick={() => input.current?.click()}>
        Use a picture from my computer
      </Button>
    </>
  )
}
