import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchCategories } from "../api/categoriesApi";
import { categoryKeys } from "../queryKeys";
import type { Category } from "../types";

// Loads the shop's categories.
export function useCategories(): UseQueryResult<Category[]> {
  return useQuery({ queryKey: categoryKeys.all, queryFn: fetchCategories });
}
