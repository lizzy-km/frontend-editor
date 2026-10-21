import type { Category } from "@/features/catalog";
import { CLOTHING_PHOTOS, HOME_PHOTOS, unsplash } from "./images";

export const categories: Category[] = [
  { id: "tops", name: "Shirts & Tops", description: "Linen shirts, tees and soft everyday basics.", image: unsplash(CLOTHING_PHOTOS[0]) },
  { id: "knitwear", name: "Knitwear & Outerwear", description: "Merino, lambswool and waxed cotton for cooler days.", image: unsplash(CLOTHING_PHOTOS[4]) },
  { id: "bedding", name: "Bedding & Throws", description: "Linen, percale and waffle weaves for better sleep.", image: unsplash(HOME_PHOTOS[2]) },
  { id: "kitchen", name: "Kitchen & Table", description: "Hand-thrown ceramics, wood and linen for the table.", image: unsplash(HOME_PHOTOS[1]) },
  { id: "decor", name: "Candles & Decor", description: "Small things that make a room feel finished.", image: unsplash(HOME_PHOTOS[3]) },
];
