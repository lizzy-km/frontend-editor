import type { ReactElement } from "react";
import { Link } from "react-router";
import { ProductGrid, useFeaturedProducts } from "@/features/catalog";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import styles from "./FeaturedProducts.module.css";

// A row of the shop's featured products with a link to the whole catalogue.
export function FeaturedProducts(): ReactElement {
  const { data: products, isPending, isError, refetch } = useFeaturedProducts();

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.heading}>
          <h2>Featured this season</h2>
          <Link to="/shop">View all products</Link>
        </div>
        {isPending ? <Spinner label="Loading featured products" /> : null}
        {isError ? <ErrorState message="We could not load the featured products. Please try again." onRetry={() => void refetch()} /> : null}
        {products ? <ProductGrid products={products} /> : null}
      </div>
    </section>
  );
}
