import { useToastStore } from './toast.store'
import styles from './Toaster.module.css'

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts)
  const dismiss = useToastStore((state) => state.dismiss)

  return (
    <div className={styles.stack} aria-live="polite">
      {toasts.map((item) => (
        <button
          key={item.id} type="button"
          className={`${styles.toast} ${styles[item.tone]}`}
          onClick={() => dismiss(item.id)}
        >
          {item.message}
        </button>
      ))}
    </div>
  )
}
