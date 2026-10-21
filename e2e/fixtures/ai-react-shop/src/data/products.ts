import type { Product } from "@/features/catalog";
import { clothingProducts } from "./clothingProducts";
import { homeProducts } from "./homeProducts";

export const products: Product[] = [...clothingProducts, ...homeProducts];
