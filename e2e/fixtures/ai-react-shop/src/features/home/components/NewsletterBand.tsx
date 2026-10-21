import type { ReactElement } from "react";
import { NewsletterForm } from "@/features/newsletter";
import styles from "./NewsletterBand.module.css";

// An olive band with the newsletter sign-up and the WELCOME10 offer.
export function NewsletterBand(): ReactElement {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2>Get 10% off your first order</h2>
          <p>Join our list for new arrivals and quiet sales, and we will send you the code WELCOME10.</p>
        </div>
        <div className={styles.form}>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
