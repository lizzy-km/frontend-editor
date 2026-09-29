import { create } from 'zustand'
import { createId } from '@/lib/ids'

export type Toast = { id: string; message: string; tone: 'info' | 'success' | 'error' }

type ToastState = {
  toasts: Toast[]
  push: (message: string, tone?: Toast['tone']) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (message, tone = 'info') => {
    const id = createId()
    // The same message again replaces the old one instead of stacking up.
    set({ toasts: [...get().toasts.filter((item) => item.message !== message), { id, message, tone }] })
    setTimeout(() => get().dismiss(id), 4000)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((item) => item.id !== id) }),
}))

/** Call from anywhere (even outside React): toast('Saved', 'success') */
export const toast = (message: string, tone?: Toast['tone']) => useToastStore.getState().push(message, tone)
