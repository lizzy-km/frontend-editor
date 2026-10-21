import type { ReactElement } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart";
import { formatPrice } from "@/shared/lib/formatPrice";
import styles from "./Benefits.module.css";

const BENEFITS = [
  { icon: "🚚", title: "Free shipping", text: `On every order over ${formatPrice(FREE_SHIPPING_THRESHOLD)}, tracked to your door.` },
  { icon: "↩️", title: "30-day returns", text: "Not quite right? Send it back within 30 days for a full refund." },
  { icon: "🌿", title: "Natural fibres", text: "Linen, cotton, wool and clay, chosen to feel good and age well." },
  { icon: "📦", title: "Plastic-free packing", text: "Recycled card and paper tape, so there is nothing to untangle." },
];

// Four short reasons to shop with Alder & Co.
export function Benefits(): ReactElement {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Good to know</h2>
        <ul className={styles.grid}>
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className={styles.item}>
              <span className={styles.icon} aria-hidden="true">
                {benefit.icon}
              </span>
              <h3>{benefit.title}</h3>
              <p>{benefit.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
