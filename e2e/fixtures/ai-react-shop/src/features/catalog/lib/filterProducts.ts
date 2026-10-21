import { PRICE_RANGES } from "../constants";
import type { Product, ProductFilters, ProductSort } from "../types";

// Orders a list of products by the chosen sort option, without changing the original list.
export function sortProducts(products: Product[], sort: ProductSort): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "featured":
      return sorted.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

function matchesQuery(product: Product, query: string): boolean {
  if (!query) return true;
  return `${product.name} ${product.description}`.toLowerCase().includes(query);
}

// Applies the search text, category and price filters, then the sort order.
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const query = filters.q.trim().toLowerCase();
  const range = PRICE_RANGES.find((option) => option.id === filters.price) ?? PRICE_RANGES[0];
  const matches = products.filter(
    (product) =>
      matchesQuery(product, query) &&
      (!filters.category || product.categoryId === filters.category) &&
      product.price >= range.min &&
      product.price < range.max,
  );
  return sortProducts(matches, filters.sort);
}
