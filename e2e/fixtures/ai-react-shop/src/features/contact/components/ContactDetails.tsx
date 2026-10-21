import type { ReactElement } from "react";
import { SUPPORT_EMAIL } from "../constants";
import styles from "./ContactDetails.module.css";

// The shop's contact details and a short note about replies and returns.
export function ContactDetails(): ReactElement {
  return (
    <aside className={styles.box} aria-label="Contact details">
      <h2 className={styles.title}>Prefer email?</h2>
      <p>
        Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We answer within one working day.
      </p>
      <h2 className={styles.title}>Opening hours</h2>
      <p>Monday to Friday, 9:00 to 17:00 Pacific Time.</p>
      <h2 className={styles.title}>Returns</h2>
      <p>You have 30 days to return anything unworn or unused. Just tell us the order number.</p>
    </aside>
  );
}
