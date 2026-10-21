import { COUPON_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from "../constants";
import type { CartState, CartTotals } from "../types";

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

// Works out subtotal, coupon discount, shipping and the final total for a cart.
export function calculateTotals(state: CartState): CartTotals {
  const subtotal = roundToCents(state.items.reduce((sum, line) => sum + line.price * line.quantity, 0));
  const discount = state.coupon ? roundToCents(subtotal * COUPON_RATE) : 0;
  const discounted = subtotal - discount;
  const isFreeShipping = state.items.length === 0 || discounted > FREE_SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_FEE;

  return {
    subtotal,
    discount,
    shipping,
    total: roundToCents(discounted + shipping),
    amountToFreeShipping: roundToCents(Math.max(0, FREE_SHIPPING_THRESHOLD - discounted)),
  };
}
