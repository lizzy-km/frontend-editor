import type { ReactElement, ReactNode } from "react";
import styles from "./EmptyState.module.css";

type EmptyStateProps = {
  title: string;
  text: string;
  action?: ReactNode;
};

// Tells the visitor that there is nothing here yet and offers a next step.
export function EmptyState({ title, text, action }: EmptyStateProps): ReactElement {
  return (
    <div className={styles.box}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      {action}
    </div>
  );
}
