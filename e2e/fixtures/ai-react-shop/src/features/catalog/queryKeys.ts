import type { ProductFilters } from "./types";

export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  featured: ["products", "featured"] as const,
  detail: (id: string) => ["products", "detail", id] as const,
  related: (id: string) => ["products", "related", id] as const,
};

export const categoryKeys = {
  all: ["categories"] as const,
};
