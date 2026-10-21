import { MAX_QUANTITY } from "../constants";
import type { CartItem, CartState } from "../types";

// Builds the key that tells two cart lines apart: same product, size and colour is one line.
export function itemKey(item: Pick<CartItem, "productId" | "size" | "colour">): string {
  return `${item.productId}|${item.size}|${item.colour}`;
}

function clampQuantity(quantity: number): number {
  return Math.min(MAX_QUANTITY, Math.max(0, quantity));
}

// Adds a product to the cart, or raises the quantity when the same line is already there.
export function addToCart(state: CartState, item: CartItem): CartState {
  const key = itemKey(item);
  const existing = state.items.find((line) => itemKey(line) === key);
  if (!existing) {
    return { ...state, items: [...state.items, { ...item, quantity: clampQuantity(item.quantity) }] };
  }
  return changeQuantity(state, key, existing.quantity + item.quantity);
}

// Sets how many of one cart line there are; zero removes the line.
export function changeQuantity(state: CartState, key: string, quantity: number): CartState {
  const nextQuantity = clampQuantity(quantity);
  const items = state.items
    .map((line) => (itemKey(line) === key ? { ...line, quantity: nextQuantity } : line))
    .filter((line) => line.quantity > 0);
  return { ...state, items };
}

// Removes one line from the cart.
export function removeFromCart(state: CartState, key: string): CartState {
  return { ...state, items: state.items.filter((line) => itemKey(line) !== key) };
}
