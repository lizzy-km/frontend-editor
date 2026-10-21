import { createPersistentStore } from "@/shared/lib/persistentStore";
import { CART_STORAGE_KEY } from "./constants";
import type { CartState } from "./types";

export const cartStore = createPersistentStore<CartState>(CART_STORAGE_KEY, { items: [], coupon: null });
