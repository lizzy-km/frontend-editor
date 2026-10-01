/**
 * Talks to the runtime inside the sandboxed editor frame (see runtime/).
 * The frame has its own origin, so everything goes through postMessage:
 *   send(type, payload)     fire and forget (sync, css, watch, mark, scroll)
 *   request(type, payload)  promise of the frame's answer (hit, drop, computed…)
 * Messages sent before the frame says "ready" wait in a queue.
 */
export type FrameBridge = {
  send: (type: string, payload?: unknown) => void
  request: <T>(type: string, payload?: unknown) => Promise<T>
  on: (type: string, listener: (payload: unknown) => void) => () => void
  dispose: () => void
}

type Message = { fe: 1; type: string; payload?: unknown; rid?: number }
type Reply = { ok: boolean; value?: unknown; error?: string }
type Pending = { resolve: (value: unknown) => void; reject: (error: Error) => void }

const isMessage = (data: unknown): data is Message =>
  typeof data === 'object' && data !== null && (data as Message).fe === 1 && typeof (data as Message).type === 'string'

export function createBridge(iframe: HTMLIFrameElement): FrameBridge {
  let ready = false
  let nextRid = 1
  const queue: Message[] = []
  const pending = new Map<number, Pending>()
  const listeners = new Map<string, Set<(payload: unknown) => void>>()

  const post = (message: Message) => {
    if (ready) iframe.contentWindow?.postMessage(message, '*')
    else queue.push(message)
  }

  const onMessage = (event: MessageEvent) => {
    // Only our own frame; its origin is opaque ("null"), so the window is the check.
    if (event.source !== iframe.contentWindow || !isMessage(event.data)) return
    const { type, payload, rid } = event.data
    if (type === 'ready') {
      ready = true
      queue.splice(0).forEach(post)
    }
    if (type === 'reply' && rid !== undefined) {
      const waiting = pending.get(rid)
      pending.delete(rid)
      const reply = payload as Reply
      if (reply.ok) waiting?.resolve(reply.value)
      else waiting?.reject(new Error(reply.error ?? 'The page did not answer.'))
      return
    }
    listeners.get(type)?.forEach((listener) => listener(payload))
  }
  window.addEventListener('message', onMessage)

  return {
    send: (type, payload) => post({ fe: 1, type, payload }),
    request: <T,>(type: string, payload?: unknown) =>
      new Promise<T>((resolve, reject) => {
        const rid = nextRid++
        pending.set(rid, { resolve: resolve as (value: unknown) => void, reject })
        post({ fe: 1, type, payload, rid })
      }),
    on: (type, listener) => {
      const set = listeners.get(type) ?? new Set()
      listeners.set(type, set.add(listener))
      return () => set.delete(listener)
    },
    dispose: () => {
      window.removeEventListener('message', onMessage)
      pending.forEach(({ reject }) => reject(new Error('The page was reloaded.')))
      pending.clear()
      queue.length = 0
    },
  }
}
