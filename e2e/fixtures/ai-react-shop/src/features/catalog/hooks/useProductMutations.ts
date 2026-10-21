import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createProduct, deleteProduct, updateProduct } from "../api/productsApi";
import { productKeys } from "../queryKeys";
import type { Product, ProductInput } from "../types";

type UpdateVariables = { id: string; input: ProductInput };

export type ProductMutations = {
  create: UseMutationResult<Product, Error, ProductInput>;
  update: UseMutationResult<Product, Error, UpdateVariables>;
  remove: UseMutationResult<void, Error, string>;
};

// Gives the admin page the actions that add, change and delete products and refresh the lists afterwards.
export function useProductMutations(): ProductMutations {
  const queryClient = useQueryClient();
  const refreshProducts = (): Promise<void> => queryClient.invalidateQueries({ queryKey: productKeys.all });

  const create = useMutation({ mutationFn: createProduct, onSuccess: refreshProducts });
  const update = useMutation({
    mutationFn: ({ id, input }: UpdateVariables) => updateProduct(id, input),
    onSuccess: refreshProducts,
  });
  const remove = useMutation({ mutationFn: deleteProduct, onSuccess: refreshProducts });

  return { create, update, remove };
}
