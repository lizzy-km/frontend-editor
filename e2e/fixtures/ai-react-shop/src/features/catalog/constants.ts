import type { PriceRangeId, ProductFilters, ProductSort } from "./types";

export const DEFAULT_FILTERS: ProductFilters = { q: "", category: "", price: "any", sort: "featured" };

export const MOCK_DATA_DELAY_MS = 250;
export const RELATED_PRODUCT_COUNT = 4;
export const FEATURED_PRODUCT_COUNT = 4;
export const LOW_STOCK_LIMIT = 5;
export const FAVOURITES_STORAGE_KEY = "alder:favourites";

export const PRICE_RANGES: { id: PriceRangeId; label: string; min: number; max: number }[] = [
  { id: "any", label: "Any price", min: 0, max: Infinity },
  { id: "under-50", label: "Under $50", min: 0, max: 50 },
  { id: "50-100", label: "$50 to $100", min: 50, max: 100 },
  { id: "over-100", label: "$100 and over", min: 100, max: Infinity },
];

export const SORT_OPTIONS: { id: ProductSort; label: string }[] = [
  { id: "featured", label: "Featured first" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Best rated" },
];
