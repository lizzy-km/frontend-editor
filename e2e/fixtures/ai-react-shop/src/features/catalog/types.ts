export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sizes: string[];
  colours: string[];
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  featured: boolean;
};

export type ProductSort = "featured" | "price-asc" | "price-desc" | "rating";
export type PriceRangeId = "any" | "under-50" | "50-100" | "over-100";

export type ProductFilters = {
  q: string;
  category: string;
  price: PriceRangeId;
  sort: ProductSort;
};

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  sizes: string[];
  colours: string[];
  image: string;
  stock: number;
};
