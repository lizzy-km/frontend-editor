import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { OrderCard } from "./components/OrderCard";
import { useOrders } from "./hooks/useOrders";
import styles from "./OrdersPage.module.css";

// The My orders page: every order the signed-in member has placed, newest first.
export default function OrdersPage(): ReactElement {
  useDocumentTitle("My orders");
  const { data: orders, isPending, isError, refetch } = useOrders();

  return (
    <>
      <PageHeader title="My orders" intro="Follow what is on its way and look back at what you have bought." />
      <section className={`container ${styles.section}`}>
        {isPending ? <Spinner label="Loading your orders" /> : null}
        {isError ? <ErrorState message="We could not load your orders. Please try again." onRetry={() => void refetch()} /> : null}
        {orders?.length === 0 ? (
          <EmptyState
            title="No orders yet"
            text="When you place an order it will show up here, so you can follow it."
            action={<ButtonLink to="/shop">Browse the shop</ButtonLink>}
          />
        ) : null}
        {orders && orders.length > 0 ? (
          <div className={styles.list}>
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
