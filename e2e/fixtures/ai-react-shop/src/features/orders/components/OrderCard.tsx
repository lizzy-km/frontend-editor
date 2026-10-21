import type { ReactElement } from "react";
import { Link } from "react-router";
import { formatDate } from "@/shared/lib/formatDate";
import { formatPrice } from "@/shared/lib/formatPrice";
import { Card } from "@/shared/ui/Card";
import type { Order } from "../types";
import { OrderStatusBadge } from "./OrderStatusBadge";
import styles from "./OrderCard.module.css";

type OrderCardProps = {
  order: Order;
};

// One past order: number, date, status, the items bought and the total paid.
export function OrderCard({ order }: OrderCardProps): ReactElement {
  return (
    <Card as="article">
      <div className={styles.body}>
        <div className={styles.top}>
          <div>
            <h2 className={styles.title}>Order {order.id}</h2>
            <p className={styles.date}>Placed on {formatDate(order.placedAt)}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
        <ul className={styles.items}>
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.size}-${item.colour}`} className={styles.item}>
              <img className={styles.image} src={item.image} alt={item.name} loading="lazy" />
              <div>
                <Link to={`/shop/${item.productId}`}>{item.name}</Link>
                <p className={styles.meta}>
                  {item.size} · {item.colour} · Qty {item.quantity}
                </p>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className={styles.total}>Total paid: {formatPrice(order.total)}</p>
      </div>
    </Card>
  );
}
