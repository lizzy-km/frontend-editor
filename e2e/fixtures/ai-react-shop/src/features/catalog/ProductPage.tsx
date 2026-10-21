import type { ReactElement } from "react";
import { useParams } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { ProductGallery } from "./components/ProductGallery";
import { ProductInfo } from "./components/ProductInfo";
import { RelatedProducts } from "./components/RelatedProducts";
import { useProduct } from "./hooks/useProducts";
import styles from "./ProductPage.module.css";

// The page of one product: pictures, details, add to cart and related items.
export default function ProductPage(): ReactElement {
  const { id = "" } = useParams();
  const { data: product, isPending, isError, refetch } = useProduct(id);
  useDocumentTitle(product ? product.name : "Product");

  if (isPending || isError || !product) {
    return (
      <>
        <PageHeader title={isPending ? "Loading product" : "Product"} />
        <section className="container">
          {isPending ? <Spinner label="Loading product" /> : null}
          {isError ? <ErrorState message="We could not load this product. Please try again." onRetry={() => void refetch()} /> : null}
          {!isPending && !isError ? (
            <EmptyState
              title="We could not find that product"
              text="It may have sold out for good, or the link may be wrong. The shop has plenty more to look at."
              action={<ButtonLink to="/shop">Back to the shop</ButtonLink>}
            />
          ) : null}
        </section>
      </>
    );
  }

  return (
    <>
      <section className={`container ${styles.layout}`}>
        <ProductGallery key={product.id} name={product.name} images={product.images} />
        <ProductInfo key={`${product.id}-info`} product={product} />
      </section>
      <RelatedProducts product={product} />
    </>
  );
}
