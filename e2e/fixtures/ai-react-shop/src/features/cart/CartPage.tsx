import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { Card } from "@/shared/ui/Card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { CartItemRow } from "./components/CartItemRow";
import { CouponForm } from "./components/CouponForm";
import { FreeShippingBar } from "./components/FreeShippingBar";
import { TotalsList } from "./components/TotalsList";
import { useCart } from "./hooks/useCart";
import styles from "./CartPage.module.css";

// The cart page: the lines, a free shipping bar, a coupon box and the totals.
export default function CartPage(): ReactElement {
  useDocumentTitle("Your cart");
  const { items, coupon, totals, setQuantity, removeItem, applyCoupon } = useCart();

  return (
    <>
      <PageHeader title="Your cart" intro="Review your things, add a coupon and head to checkout when you are ready." />
      <section className="container">
        {items.length === 0 ? (
          <EmptyState
            title="Your cart is empty"
            text="Nothing here yet. Browse the shop and add a few favourites."
            action={<ButtonLink to="/shop">Start shopping</ButtonLink>}
          />
        ) : (
          <div className={styles.layout}>
            <ul className={styles.items}>
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productId}-${item.size}-${item.colour}`}
                  item={item}
                  onQuantityChange={setQuantity}
                  onRemove={removeItem}
                />
              ))}
            </ul>
            <Card className={styles.summary}>
              <div className={styles.summaryBody}>
                <h2>Order summary</h2>
                <FreeShippingBar totals={totals} />
                <CouponForm appliedCoupon={coupon} onApply={applyCoupon} />
                <TotalsList totals={totals} coupon={coupon} />
                <ButtonLink to="/checkout" fullWidth>
                  Go to checkout
                </ButtonLink>
              </div>
            </Card>
          </div>
        )}
      </section>
    </>
  );
}
