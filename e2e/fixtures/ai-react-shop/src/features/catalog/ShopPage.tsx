import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ProductResults } from "./components/ProductResults";
import { ShopFilters } from "./components/ShopFilters";
import { useCategories } from "./hooks/useCategories";
import { useProductFilters } from "./hooks/useProductFilters";
import { useProducts } from "./hooks/useProducts";
import styles from "./ShopPage.module.css";

// The shop page: search, filters and sorting kept in the address, then the product grid.
export default function ShopPage(): ReactElement {
  useDocumentTitle("Shop");
  const { filters, hasFilters, setFilter, clearFilters } = useProductFilters();
  const products = useProducts(filters);
  const categories = useCategories();

  return (
    <>
      <PageHeader
        title="Shop clothes and home goods"
        intro="Natural fabrics, simple shapes and things made to be used every day."
      />
      <section className={`container ${styles.section}`}>
        <h2 className="visually-hidden">Products</h2>
        <ShopFilters
          filters={filters}
          categories={categories.data ?? []}
          hasFilters={hasFilters}
          onChange={setFilter}
          onClear={clearFilters}
        />
        <ProductResults query={products} hasFilters={hasFilters} onClear={clearFilters} />
      </section>
    </>
  );
}
