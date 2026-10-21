import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import { orders as seedOrders } from "@/data/orders";
import { createPersistentStore } from "@/shared/lib/persistentStore";
import type { NewOrder, Order } from "../types";

const ORDERS_KEY = "alder:orders";
const FIRST_NEW_ORDER_NUMBER = 1200;
const MOCK_ORDERS_DELAY_MS = 300;

const ordersStore = createPersistentStore<Order[]>(ORDERS_KEY, seedOrders);

function byNewestFirst(a: Order, b: Order): number {
  return b.placedAt.localeCompare(a.placedAt);
}

// Fetches the orders of one person, newest first.
export async function fetchOrders(userId: string): Promise<Order[]> {
  if (USE_MOCK) {
    const mine = ordersStore.get().filter((order) => order.userId === userId);
    return mockDelay(mine.sort(byNewestFirst), MOCK_ORDERS_DELAY_MS);
  }
  const { data } = await apiClient.get<Order[]>("/orders");
  return data;
}

// Places an order for one person; in mock mode it is saved in the browser.
export async function createOrder(userId: string, input: NewOrder): Promise<Order> {
  if (USE_MOCK) {
    const order: Order = {
      ...input,
      id: `AC-${FIRST_NEW_ORDER_NUMBER + ordersStore.get().length}`,
      userId,
      status: "processing",
      placedAt: new Date().toISOString(),
    };
    ordersStore.set([...ordersStore.get(), order]);
    return mockDelay(order, MOCK_ORDERS_DELAY_MS);
  }
  const { data } = await apiClient.post<Order>("/orders", input);
  return data;
}
