import type { ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from './Icon'
import { Spinner } from './Spinner'
import styles from './Button.module.css'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: IconName
  loading?: boolean
  full?: boolean
}

export function Button({
  variant = 'secondary', size = 'medium', icon, loading, full, children, className, ...rest
}: Props) {
  const classes = [
    styles.button, styles[variant], size !== 'medium' && styles[size],
    !children && styles.iconOnly, full && styles.full, className,
  ].filter(Boolean).join(' ')

  return (
    <button type="button" className={classes} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Spinner size={16} /> : icon && <Icon name={icon} size={size === 'small' ? 16 : 18} />}
      {children}
    </button>
  )
}
