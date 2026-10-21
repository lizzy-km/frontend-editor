import type { ReactElement } from "react";
import { formatPrice } from "@/shared/lib/formatPrice";
import { FREE_SHIPPING_THRESHOLD } from "../constants";
import type { CartTotals } from "../types";
import styles from "./FreeShippingBar.module.css";

type FreeShippingBarProps = {
  totals: CartTotals;
};

// Shows how close the cart is to free shipping.
export function FreeShippingBar({ totals }: FreeShippingBarProps): ReactElement {
  const spentShare = Math.min(100, Math.round(((FREE_SHIPPING_THRESHOLD - totals.amountToFreeShipping) / FREE_SHIPPING_THRESHOLD) * 100));
  const isFree = totals.amountToFreeShipping === 0;

  return (
    <div className={styles.box}>
      <p className={styles.text}>
        {isFree
          ? "You have free shipping on this order."
          : `Add ${formatPrice(totals.amountToFreeShipping)} more to get free shipping.`}
      </p>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Progress towards free shipping"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={spentShare}
      >
        <div className={styles.fill} style={{ width: `${spentShare}%` }} />
      </div>
    </div>
  );
}
