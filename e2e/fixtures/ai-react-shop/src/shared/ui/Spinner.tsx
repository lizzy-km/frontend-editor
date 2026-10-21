import type { ReactElement } from "react";
import styles from "./Spinner.module.css";

type SpinnerProps = {
  label?: string;
};

// A turning ring shown while something loads, with a hidden label for screen readers.
export function Spinner({ label = "Loading, one moment" }: SpinnerProps): ReactElement {
  return (
    <div className={styles.wrap} role="status">
      <span className={styles.ring} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}
