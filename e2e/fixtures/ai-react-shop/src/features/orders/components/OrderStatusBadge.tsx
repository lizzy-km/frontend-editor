import type { ReactElement } from "react";
import { cx } from "@/shared/lib/classNames";
import type { OrderStatus } from "../types";
import styles from "./OrderStatusBadge.module.css";

const LABELS: Record<OrderStatus, string> = {
  processing: "Being packed",
  shipped: "On its way",
  delivered: "Delivered",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

// A small coloured label that says where an order is.
export function OrderStatusBadge({ status }: OrderStatusBadgeProps): ReactElement {
  return <span className={cx(styles.badge, styles[status])}>{LABELS[status]}</span>;
}
