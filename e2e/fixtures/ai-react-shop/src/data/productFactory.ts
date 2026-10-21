import type { Product } from "@/features/catalog";
import { unsplash } from "./images";

export type ProductSeed = Omit<Product, "images">;

const PICTURES_PER_PRODUCT = 3;

export const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
export const ONE_SIZE = ["One size"];

// Gives every product seed three pictures taken from a pool of photo ids.
export function withPhotos(seeds: ProductSeed[], pool: readonly string[]): Product[] {
  return seeds.map((seed, index) => ({
    ...seed,
    images: Array.from({ length: PICTURES_PER_PRODUCT }, (_, step) =>
      unsplash(pool[(index + step) % pool.length]),
    ),
  }));
}
