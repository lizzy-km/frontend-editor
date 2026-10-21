import type { ReactElement } from "react";
import { Link } from "react-router";
import { formatPrice } from "@/shared/lib/formatPrice";
import { MAX_QUANTITY } from "../constants";
import type { CartItem } from "../types";
import styles from "./CartItemRow.module.css";

type CartItemRowProps = {
  item: CartItem;
  onQuantityChange: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
};

// One line of the cart: picture, details, quantity buttons and a remove button.
export function CartItemRow({ item, onQuantityChange, onRemove }: CartItemRowProps): ReactElement {
  return (
    <li className={styles.row}>
      <img className={styles.image} src={item.image} alt={item.name} loading="lazy" />
      <div className={styles.details}>
        <h2 className={styles.name}>
          <Link to={`/shop/${item.productId}`}>{item.name}</Link>
        </h2>
        <p className={styles.meta}>
          {item.size} · {item.colour} · {formatPrice(item.price)} each
        </p>
        <div className={styles.controls}>
          <div className={styles.stepper}>
            <button
              type="button"
              aria-label={`Fewer ${item.name}`}
              onClick={() => onQuantityChange(item, item.quantity - 1)}
            >
              −
            </button>
            <span aria-live="polite">{item.quantity}</span>
            <button
              type="button"
              aria-label={`More ${item.name}`}
              disabled={item.quantity >= MAX_QUANTITY}
              onClick={() => onQuantityChange(item, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <button type="button" className={styles.remove} onClick={() => onRemove(item)}>
            Remove
          </button>
        </div>
      </div>
      <p className={styles.lineTotal}>{formatPrice(item.price * item.quantity)}</p>
    </li>
  );
}
