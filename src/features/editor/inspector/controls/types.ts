/** Every control takes the current value and reports a new one. */
export type ControlProps = {
  value: string
  onChange: (value: string) => void
  label: string
}

export type Option = { value: string; label: string }
