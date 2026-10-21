import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "@/features/auth";
import { createOrder, fetchOrders } from "../api/ordersApi";
import { orderKeys } from "../queryKeys";
import type { NewOrder, Order } from "../types";

// Loads the orders of the signed-in person.
export function useOrders(): UseQueryResult<Order[]> {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  return useQuery({
    queryKey: orderKeys.forUser(userId),
    queryFn: () => fetchOrders(userId),
    enabled: userId !== "",
  });
}

// Gives the action that places an order for the signed-in person and refreshes the order list.
export function usePlaceOrder(): UseMutationResult<Order, Error, NewOrder> {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: NewOrder) => createOrder(user?.id ?? "", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: orderKeys.all }),
  });
}
