import type { Product } from "@/features/catalog";
import { CLOTHING_PHOTOS } from "./images";
import { CLOTHING_SIZES, ONE_SIZE, withPhotos } from "./productFactory";

export const clothingProducts: Product[] = withPhotos(
  [
    { id: "1", name: "Linen Camp Shirt", categoryId: "tops", price: 68, sizes: CLOTHING_SIZES, colours: ["Sand", "Olive", "Chalk"], rating: 4.7, reviewCount: 128, stock: 14, featured: true,
      description: "A relaxed short-sleeve shirt in washed European linen. Cool in summer, soft from the very first wear." },
    { id: "2", name: "Organic Cotton Tee", categoryId: "tops", price: 32, sizes: CLOTHING_SIZES, colours: ["Chalk", "Olive", "Clay"], rating: 4.6, reviewCount: 212, stock: 40, featured: false,
      description: "A heavyweight everyday tee in GOTS-certified organic cotton, cut with a slightly boxy shoulder." },
    { id: "3", name: "Striped Breton Top", categoryId: "tops", price: 44, sizes: CLOTHING_SIZES, colours: ["Navy stripe", "Olive stripe"], rating: 4.4, reviewCount: 57, stock: 9, featured: false,
      description: "A boat-neck long-sleeve top in a dense cotton jersey that keeps its shape wash after wash." },
    { id: "4", name: "Poplin Button-Down", categoryId: "tops", price: 79, sizes: CLOTHING_SIZES, colours: ["White", "Pale blue"], rating: 4.5, reviewCount: 94, stock: 18, featured: false,
      description: "A crisp, easy-iron poplin shirt with a soft collar and mother-of-pearl style buttons." },
    { id: "5", name: "Washed Linen Overshirt", categoryId: "tops", price: 96, sizes: CLOTHING_SIZES, colours: ["Olive", "Sand"], rating: 4.8, reviewCount: 73, stock: 6, featured: true,
      description: "A generous overshirt with two chest pockets, made to be worn open over a tee or buttoned up on its own." },
    { id: "6", name: "Ribbed Cotton Tank", categoryId: "tops", price: 24, sizes: CLOTHING_SIZES, colours: ["Chalk", "Clay", "Black"], rating: 4.3, reviewCount: 161, stock: 52, featured: false,
      description: "A fitted ribbed tank that layers under everything. Stretchy, breathable and gentle on skin." },
    { id: "7", name: "Merino Crew Sweater", categoryId: "knitwear", price: 98, sizes: CLOTHING_SIZES, colours: ["Oatmeal", "Olive", "Charcoal"], rating: 4.9, reviewCount: 187, stock: 21, featured: true,
      description: "A fine-gauge crew neck in responsibly sourced merino. Warm without bulk and machine washable." },
    { id: "8", name: "Chunky Cable Cardigan", categoryId: "knitwear", price: 128, sizes: CLOTHING_SIZES, colours: ["Cream", "Moss"], rating: 4.8, reviewCount: 66, stock: 7, featured: true,
      description: "A deep-cable cardigan with horn-effect buttons and two big pockets. Knitted for slow weekends." },
    { id: "9", name: "Lambswool Scarf", categoryId: "knitwear", price: 42, sizes: ONE_SIZE, colours: ["Heather grey", "Rust", "Olive"], rating: 4.6, reviewCount: 88, stock: 30, featured: false,
      description: "A generous, brushed lambswool scarf in a soft herringbone weave, finished with a hand-knotted fringe." },
    { id: "10", name: "Brushed Cotton Hoodie", categoryId: "knitwear", price: 72, sizes: CLOTHING_SIZES, colours: ["Sand", "Forest"], rating: 4.5, reviewCount: 102, stock: 25, featured: false,
      description: "A cosy pullover hoodie with a brushed inside, a deep pouch pocket and a relaxed drop shoulder." },
    { id: "11", name: "Waxed Cotton Jacket", categoryId: "knitwear", price: 168, sizes: CLOTHING_SIZES, colours: ["Olive", "Navy"], rating: 4.7, reviewCount: 49, stock: 0, featured: false,
      description: "A shower-proof jacket in waxed organic cotton with a corduroy collar. Re-waxing instructions come in the box." },
    { id: "12", name: "Ribbed Wool Beanie", categoryId: "knitwear", price: 28, sizes: ONE_SIZE, colours: ["Oatmeal", "Charcoal", "Rust"], rating: 4.4, reviewCount: 140, stock: 60, featured: false,
      description: "A stretchy double-layer beanie in soft ribbed wool. Sits close and stays put on windy days." },
  ],
  CLOTHING_PHOTOS,
);
