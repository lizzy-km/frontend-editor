import type { ReactElement } from "react";
import { type Order } from "@/features/orders";
import { formatPrice } from "@/shared/lib/formatPrice";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import styles from "./OrderConfirmation.module.css";

type OrderConfirmationProps = {
  order: Order;
};

// The thank-you message shown after an order is placed.
export function OrderConfirmation({ order }: OrderConfirmationProps): ReactElement {
  return (
    <div className={styles.box} role="status">
      <p className={styles.tick} aria-hidden="true">
        ✓
      </p>
      <h2>Thank you, your order is in</h2>
      <p>
        Order <strong>{order.id}</strong> for {formatPrice(order.total)} is being packed. We will send it to{" "}
        {order.shippingTo}.
      </p>
      <div className={styles.actions}>
        <ButtonLink to="/account/orders">See my orders</ButtonLink>
        <ButtonLink to="/shop" variant="secondary">
          Keep shopping
        </ButtonLink>
      </div>
    </div>
  );
}
