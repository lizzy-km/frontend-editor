import type { ReactElement } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart";
import { SUPPORT_EMAIL } from "@/features/contact";
import { formatPrice } from "@/shared/lib/formatPrice";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import styles from "./ReturnsBand.module.css";

// A dark band that explains shipping and the 30-day return promise.
export function ReturnsBand(): ReactElement {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div>
          <h2>Shipping and returns, simply</h2>
          <p>
            Shipping is free on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}. If something is not right, send it
            back within 30 days and we will refund you. Questions? Write to {SUPPORT_EMAIL}.
          </p>
        </div>
        <ButtonLink to="/contact" variant="secondary" className={styles.button}>
          Talk to us
        </ButtonLink>
      </div>
    </section>
  );
}
