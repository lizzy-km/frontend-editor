import type { ReactElement } from "react";
import { formatPrice } from "@/shared/lib/formatPrice";
import type { CartTotals } from "../types";
import styles from "./TotalsList.module.css";

type TotalsListProps = {
  totals: CartTotals;
  coupon: string | null;
};

// Shows subtotal, coupon discount, shipping and the total to pay.
export function TotalsList({ totals, coupon }: TotalsListProps): ReactElement {
  return (
    <dl className={styles.list}>
      <div className={styles.row}>
        <dt>Subtotal</dt>
        <dd>{formatPrice(totals.subtotal)}</dd>
      </div>
      {coupon ? (
        <div className={styles.row}>
          <dt>Coupon {coupon}</dt>
          <dd>-{formatPrice(totals.discount)}</dd>
        </div>
      ) : null}
      <div className={styles.row}>
        <dt>Shipping</dt>
        <dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd>
      </div>
      <div className={`${styles.row} ${styles.total}`}>
        <dt>Total</dt>
        <dd>{formatPrice(totals.total)}</dd>
      </div>
    </dl>
  );
}
