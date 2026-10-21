import type { ReactElement, ReactNode } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card } from "@/shared/ui/Card";
import styles from "./AuthShell.module.css";

type AuthShellProps = {
  title: string;
  intro: string;
  footer: ReactNode;
  children: ReactNode;
};

// The shared frame of the sign-in pages: a title band and one centred card.
export function AuthShell({ title, intro, footer, children }: AuthShellProps): ReactElement {
  return (
    <>
      <PageHeader title={title} intro={intro} />
      <section className={`container ${styles.wrap}`}>
        <Card className={styles.card}>
          <div className={styles.body}>{children}</div>
        </Card>
        <div className={styles.footer}>{footer}</div>
      </section>
    </>
  );
}
