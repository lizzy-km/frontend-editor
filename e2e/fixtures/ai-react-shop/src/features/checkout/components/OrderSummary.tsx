import type { ReactElement } from "react";
import { TotalsList, type CartItem, type CartTotals } from "@/features/cart";
import { formatPrice } from "@/shared/lib/formatPrice";
import { Card } from "@/shared/ui/Card";
import styles from "./OrderSummary.module.css";

type OrderSummaryProps = {
  items: CartItem[];
  totals: CartTotals;
  coupon: string | null;
};

// The list of things being bought, with the totals, shown next to the address form.
export function OrderSummary({ items, totals, coupon }: OrderSummaryProps): ReactElement {
  return (
    <Card>
      <div className={styles.body}>
        <h2>Order summary</h2>
        <ul className={styles.items}>
          {items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.colour}`} className={styles.item}>
              <img className={styles.image} src={item.image} alt={item.name} loading="lazy" />
              <div>
                <p className={styles.name}>{item.name}</p>
                <p className={styles.meta}>
                  {item.size} · {item.colour} · Qty {item.quantity}
                </p>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <TotalsList totals={totals} coupon={coupon} />
      </div>
    </Card>
  );
}
