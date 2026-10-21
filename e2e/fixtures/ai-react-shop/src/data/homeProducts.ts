import type { Product } from "@/features/catalog";
import { HOME_PHOTOS } from "./images";
import { ONE_SIZE, withPhotos } from "./productFactory";

export const homeProducts: Product[] = withPhotos(
  [
    { id: "13", name: "Stonewashed Linen Duvet Cover", categoryId: "bedding", price: 148, sizes: ["Double", "King"], colours: ["Oat", "Sage", "Fog"], rating: 4.9, reviewCount: 203, stock: 11, featured: true,
      description: "A breathable duvet cover in stonewashed French flax linen. It gets softer every time you wash it." },
    { id: "14", name: "Percale Pillowcase Pair", categoryId: "bedding", price: 36, sizes: ["Standard", "Super king"], colours: ["White", "Sand"], rating: 4.5, reviewCount: 119, stock: 45, featured: false,
      description: "Two crisp, cool percale pillowcases with an envelope closure, woven from long-staple cotton." },
    { id: "15", name: "Waffle Throw Blanket", categoryId: "bedding", price: 64, sizes: ONE_SIZE, colours: ["Cream", "Olive", "Clay"], rating: 4.7, reviewCount: 96, stock: 16, featured: true,
      description: "A light waffle-weave throw for the sofa or the end of the bed. Generous at 130 x 180 cm." },
    { id: "16", name: "Quilted Cotton Bedspread", categoryId: "bedding", price: 120, sizes: ["Double", "King"], colours: ["Sand", "Moss"], rating: 4.6, reviewCount: 41, stock: 8, featured: false,
      description: "A diamond-quilted bedspread with a soft cotton filling. Works as a summer cover or an extra winter layer." },
    { id: "17", name: "Stoneware Dinner Plate Set", categoryId: "kitchen", price: 58, sizes: ["Set of 4"], colours: ["Speckled white", "Moss glaze"], rating: 4.8, reviewCount: 154, stock: 22, featured: true,
      description: "Four hand-glazed stoneware plates with a slightly uneven rim. Dishwasher and microwave safe." },
    { id: "18", name: "Hand-Thrown Mug", categoryId: "kitchen", price: 18, sizes: ONE_SIZE, colours: ["Speckled white", "Moss glaze", "Sand"], rating: 4.7, reviewCount: 262, stock: 80, featured: false,
      description: "A 350 ml mug thrown by hand in our partner studio in Portugal, with a thumb-sized handle." },
    { id: "19", name: "Olive Wood Serving Board", categoryId: "kitchen", price: 46, sizes: ["Small", "Large"], colours: ["Natural"], rating: 4.6, reviewCount: 83, stock: 19, featured: false,
      description: "A serving board carved from a single piece of sustainably harvested olive wood. Every grain is different." },
    { id: "20", name: "Linen Napkins, Set of 4", categoryId: "kitchen", price: 29, sizes: ONE_SIZE, colours: ["Oat", "Sage", "Clay"], rating: 4.5, reviewCount: 77, stock: 35, featured: false,
      description: "Four generous 45 cm napkins in stonewashed linen with a narrow hem. Best used, creased and loved." },
    { id: "21", name: "Cedar Soy Wax Candle", categoryId: "decor", price: 26, sizes: ONE_SIZE, colours: ["Cedar", "Fig leaf"], rating: 4.8, reviewCount: 305, stock: 64, featured: true,
      description: "A 220 g candle poured by hand in a reusable amber jar. Burns for about 45 hours with a clean, woody scent." },
    { id: "22", name: "Ceramic Bud Vase", categoryId: "decor", price: 34, sizes: ONE_SIZE, colours: ["Chalk", "Moss glaze"], rating: 4.4, reviewCount: 58, stock: 27, featured: false,
      description: "A small, narrow-necked vase that is just right for a single stem or a sprig of dried grass." },
    { id: "23", name: "Woven Seagrass Basket", categoryId: "decor", price: 52, sizes: ["Medium", "Large"], colours: ["Natural"], rating: 4.5, reviewCount: 64, stock: 3, featured: false,
      description: "A sturdy basket with two handles, woven by a family workshop. Holds logs, laundry or a big houseplant." },
    { id: "24", name: "Wool Cushion Cover", categoryId: "decor", price: 38, sizes: ["45 x 45 cm", "60 x 40 cm"], colours: ["Oatmeal", "Rust", "Forest"], rating: 4.6, reviewCount: 90, stock: 38, featured: false,
      description: "A tactile cushion cover in a thick wool blend, with a hidden zip so it sits smooth and flat." },
  ],
  HOME_PHOTOS,
);
