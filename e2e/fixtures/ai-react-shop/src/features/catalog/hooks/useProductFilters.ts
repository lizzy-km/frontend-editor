import { useSearchParams } from "react-router";
import { DEFAULT_FILTERS } from "../constants";
import { parsePrice, parseSort } from "../lib/parseFilters";
import type { ProductFilters } from "../types";

export type ProductFilterControls = {
  filters: ProductFilters;
  hasFilters: boolean;
  setFilter: (key: keyof ProductFilters, value: string) => void;
  clearFilters: () => void;
};

// Keeps the search, category, price and sort choices in the page address so links can be shared.
export function useProductFilters(): ProductFilterControls {
  const [params, setParams] = useSearchParams();

  const filters: ProductFilters = {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    price: parsePrice(params.get("price")),
    sort: parseSort(params.get("sort")),
  };

  const setFilter = (key: keyof ProductFilters, value: string): void => {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value === "" || value === DEFAULT_FILTERS[key]) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  };

  const clearFilters = (): void => setParams({}, { replace: true });

  const hasFilters = filters.q !== "" || filters.category !== "" || filters.price !== DEFAULT_FILTERS.price;

  return { filters, hasFilters, setFilter, clearFilters };
}
