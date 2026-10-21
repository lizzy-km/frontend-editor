import type { ReactElement } from "react";
import { DEFAULT_FILTERS, ProductGrid, useFavourites, useProducts } from "@/features/catalog";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import styles from "./FavouritesPage.module.css";

// The Favourites page: every product the member has saved with the heart button.
export default function FavouritesPage(): ReactElement {
  useDocumentTitle("Favourites");
  const { ids } = useFavourites();
  const { data: products, isPending, isError, refetch } = useProducts(DEFAULT_FILTERS);
  const favourites = products?.filter((product) => ids.includes(product.id)) ?? [];

  return (
    <>
      <PageHeader title="Your favourites" intro="The things you have saved for later, all in one place." />
      <section className={`container ${styles.section}`}>
        {isPending ? <Spinner label="Loading your favourites" /> : null}
        {isError ? <ErrorState message="We could not load your favourites. Please try again." onRetry={() => void refetch()} /> : null}
        {products && favourites.length === 0 ? (
          <EmptyState
            title="No favourites yet"
            text="Tap the heart on any product to save it here."
            action={<ButtonLink to="/shop">Find something you love</ButtonLink>}
          />
        ) : null}
        {favourites.length > 0 ? <ProductGrid products={favourites} /> : null}
      </section>
    </>
  );
}
