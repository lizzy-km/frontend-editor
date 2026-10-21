import type { ReactElement } from "react";
import styles from "./DemoAccounts.module.css";

const ACCOUNTS = [
  { role: "Member", email: "member@example.com", password: "member123" },
  { role: "Admin", email: "admin@example.com", password: "admin123" },
];

// Lists the two demo accounts so anyone can try the shop straight away.
export function DemoAccounts(): ReactElement {
  return (
    <aside className={styles.box} aria-label="Demo accounts">
      <h2 className={styles.title}>Try a demo account</h2>
      <ul className={styles.list}>
        {ACCOUNTS.map((account) => (
          <li key={account.email}>
            <strong>{account.role}:</strong> {account.email} / {account.password}
          </li>
        ))}
      </ul>
    </aside>
  );
}
