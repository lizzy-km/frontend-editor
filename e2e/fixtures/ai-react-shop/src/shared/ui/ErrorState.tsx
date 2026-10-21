import type { ReactElement } from "react";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  message?: string;
  onRetry: () => void;
};

// Explains in plain words that loading failed and lets the visitor try again.
export function ErrorState({
  message = "Something went wrong while loading this. Please try again.",
  onRetry,
}: ErrorStateProps): ReactElement {
  return (
    <div className={styles.box} role="alert">
      <p className={styles.text}>{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
