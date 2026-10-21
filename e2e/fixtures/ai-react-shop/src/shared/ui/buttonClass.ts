import { cx } from "@/shared/lib/classNames";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

// Builds the class names that make a button or a link look like a button.
export function buttonClass(variant: ButtonVariant, fullWidth: boolean, className?: string): string {
  return cx(styles.button, styles[variant], fullWidth && styles.full, className);
}
