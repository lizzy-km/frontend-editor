import type { ReactElement } from "react";
import { useCart } from "@/features/cart";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { AddressForm } from "./components/AddressForm";
import { OrderConfirmation } from "./components/OrderConfirmation";
import { OrderSummary } from "./components/OrderSummary";
import { useCheckout } from "./hooks/useCheckout";
import styles from "./CheckoutPage.module.css";

// The checkout page: delivery address, order summary and, after ordering, a confirmation.
export default function CheckoutPage(): ReactElement {
  useDocumentTitle("Checkout");
  const { items, totals, coupon } = useCart();
  const { placedOrder, errorMessage, isPlacing, submitOrder } = useCheckout();

  if (placedOrder) {
    return (
      <>
        <PageHeader title="Order placed" />
        <section className="container">
          <OrderConfirmation order={placedOrder} />
        </section>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Checkout" intro="Tell us where to send your order. This is a demo, so nothing is charged." />
      <section className="container">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            text="Add something to your cart before you check out."
            action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
          />
        ) : (
          <div className={styles.layout}>
            <div>
              <h2>Delivery address</h2>
              <AddressForm isPlacing={isPlacing} serverError={errorMessage} onSubmit={submitOrder} />
            </div>
            <OrderSummary items={items} totals={totals} coupon={coupon} />
          </div>
        )}
      </section>
    </>
  );
}
