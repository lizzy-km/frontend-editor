import type { ReactElement } from "react";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";
import styles from "./ProductGrid.module.css";

type ProductGridProps = {
  products: Product[];
};

// A responsive grid of product cards.
export function ProductGrid({ products }: ProductGridProps): ReactElement {
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
