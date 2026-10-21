import type { ReactElement } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  intro?: string;
  eyebrow?: string;
};

// The sand-coloured title band at the top of a page; it holds the page's only h1.
export function PageHeader({ title, intro, eyebrow }: PageHeaderProps): ReactElement {
  return (
    <section className={styles.band}>
      <div className="container">
        {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
      </div>
    </section>
  );
}
