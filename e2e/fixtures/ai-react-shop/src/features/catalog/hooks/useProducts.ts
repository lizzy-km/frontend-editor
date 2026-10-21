import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchFeaturedProducts, fetchProduct, fetchProducts } from "../api/productsApi";
import { DEFAULT_FILTERS, RELATED_PRODUCT_COUNT } from "../constants";
import { productKeys } from "../queryKeys";
import type { Product, ProductFilters } from "../types";

// Loads the products that match the filters, keeping the old list on screen while a new one loads.
export function useProducts(filters: ProductFilters): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => fetchProducts(filters),
    placeholderData: keepPreviousData,
  });
}

// Loads the products shown on the home page.
export function useFeaturedProducts(): UseQueryResult<Product[]> {
  return useQuery({ queryKey: productKeys.featured, queryFn: fetchFeaturedProducts });
}

// Loads one product by its id; the result is null when there is no such product.
export function useProduct(id: string): UseQueryResult<Product | null> {
  return useQuery({ queryKey: productKeys.detail(id), queryFn: () => fetchProduct(id) });
}

// Loads other products from the same category as the given one.
export function useRelatedProducts(product: Product): UseQueryResult<Product[]> {
  return useQuery({
    queryKey: productKeys.related(product.id),
    queryFn: async () => {
      const sameCategory = await fetchProducts({ ...DEFAULT_FILTERS, category: product.categoryId });
      return sameCategory.filter((item) => item.id !== product.id).slice(0, RELATED_PRODUCT_COUNT);
    },
  });
}
