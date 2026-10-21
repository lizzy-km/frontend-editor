import { useState } from "react";
import { useCart } from "@/features/cart";
import { usePlaceOrder, type Order } from "@/features/orders";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import type { AddressInput } from "../types";

const ORDER_FALLBACK = "We could not place your order. Nothing was charged, so please try again.";

export type CheckoutApi = {
  placedOrder: Order | null;
  errorMessage: string | null;
  isPlacing: boolean;
  submitOrder: (address: AddressInput) => Promise<void>;
};

// Turns the cart and the delivery address into an order, then empties the cart.
export function useCheckout(): CheckoutApi {
  const { items, totals, clearCart } = useCart();
  const placeOrder = usePlaceOrder();
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submitOrder = async (address: AddressInput): Promise<void> => {
    setErrorMessage(null);
    const shippingTo = `${address.fullName}, ${address.street}, ${address.city} ${address.postcode}, ${address.country}`;
    try {
      const order = await placeOrder.mutateAsync({ items, total: totals.total, shippingTo });
      clearCart();
      setPlacedOrder(order);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, ORDER_FALLBACK));
    }
  };

  return { placedOrder, errorMessage, isPlacing: placeOrder.isPending, submitOrder };
}
