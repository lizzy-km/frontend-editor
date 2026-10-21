import type { ReactElement } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import type { Product } from "../types";
import { ProductGrid } from "./ProductGrid";
import styles from "./ProductResults.module.css";

type ProductResultsProps = {
  query: UseQueryResult<Product[]>;
  hasFilters: boolean;
  onClear: () => void;
};

// Shows the product grid with a results count, or the loading, error or empty state.
export function ProductResults({ query, hasFilters, onClear }: ProductResultsProps): ReactElement {
  if (query.isPending) return <Spinner label="Loading products" />;
  if (query.isError) {
    return <ErrorState message="We could not load the products. Please try again." onRetry={() => void query.refetch()} />;
  }
  const products = query.data;
  if (products.length === 0) {
    return (
      <EmptyState
        title="No products match your search"
        text="Try a different word, or clear the filters to see everything we sell."
        action={hasFilters ? <Button onClick={onClear}>Clear filters</Button> : undefined}
      />
    );
  }

  return (
    <>
      <p className={styles.count} aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
      </p>
      <ProductGrid products={products} />
    </>
  );
}
