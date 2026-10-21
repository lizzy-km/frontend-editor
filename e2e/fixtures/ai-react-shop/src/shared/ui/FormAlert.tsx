import type { ReactElement } from "react";
import styles from "./FormAlert.module.css";

type FormAlertProps = {
  messages: string[];
};

// Summarises what is wrong with a form; shows nothing when everything is fine.
export function FormAlert({ messages }: FormAlertProps): ReactElement | null {
  if (messages.length === 0) return null;
  return (
    <div className={styles.alert} role="alert">
      <p className={styles.title}>Please check the form</p>
      <ul className={styles.list}>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
