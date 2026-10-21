import type { ReactElement } from "react";
import { useRelatedProducts } from "../hooks/useProducts";
import type { Product } from "../types";
import { ProductGrid } from "./ProductGrid";
import styles from "./RelatedProducts.module.css";

type RelatedProductsProps = {
  product: Product;
};

// A row of other products from the same category; it stays hidden when there are none.
export function RelatedProducts({ product }: RelatedProductsProps): ReactElement | null {
  const { data: related } = useRelatedProducts(product);
  if (!related || related.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2>You might also like</h2>
        <ProductGrid products={related} />
      </div>
    </section>
  );
}
