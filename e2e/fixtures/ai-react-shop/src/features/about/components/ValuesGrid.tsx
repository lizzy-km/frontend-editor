import type { ReactElement } from "react";
import { Card } from "@/shared/ui/Card";
import styles from "./ValuesGrid.module.css";

const VALUES = [
  { title: "Natural fibres", text: "Linen, cotton, wool and wood. Materials that age well and can return to the earth." },
  { title: "Fair making", text: "We know the people who make our products and we pay them what the work is worth." },
  { title: "Made to last", text: "We would rather sell you one thing you keep for ten years than five you replace." },
];

// Three short cards that explain what the shop stands for.
export function ValuesGrid(): ReactElement {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2>What we care about</h2>
        <ul className={styles.grid}>
          {VALUES.map((value) => (
            <Card as="li" key={value.title}>
              <div className={styles.body}>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </div>
            </Card>
          ))}
        </ul>
      </div>
    </section>
  );
}
