import { useStore } from "@/shared/hooks/useStore";
import { COUPON_CODE } from "../constants";
import { addToCart, changeQuantity, itemKey, removeFromCart } from "../lib/cartState";
import { calculateTotals } from "../lib/totals";
import { cartStore } from "../store";
import type { CartItem, CartTotals } from "../types";

export type CartApi = {
  items: CartItem[];
  coupon: string | null;
  totals: CartTotals;
  count: number;
  addItem: (item: CartItem) => void;
  setQuantity: (item: CartItem, quantity: number) => void;
  removeItem: (item: CartItem) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => boolean;
};

// Gives a component the cart saved in the browser and the actions that change it.
export function useCart(): CartApi {
  const state = useStore(cartStore);

  return {
    items: state.items,
    coupon: state.coupon,
    totals: calculateTotals(state),
    count: state.items.reduce((sum, line) => sum + line.quantity, 0),
    addItem: (item) => cartStore.set(addToCart(cartStore.get(), item)),
    setQuantity: (item, quantity) => cartStore.set(changeQuantity(cartStore.get(), itemKey(item), quantity)),
    removeItem: (item) => cartStore.set(removeFromCart(cartStore.get(), itemKey(item))),
    clearCart: () => cartStore.set({ items: [], coupon: null }),
    applyCoupon: (code) => {
      if (code.trim().toUpperCase() !== COUPON_CODE) return false;
      cartStore.set({ ...cartStore.get(), coupon: COUPON_CODE });
      return true;
    },
  };
}
