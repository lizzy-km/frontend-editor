import type { Order } from "@/features/orders";
import { CLOTHING_PHOTOS, HOME_PHOTOS, unsplash } from "./images";
import { DEMO_MEMBER_ID } from "./users";

const SHIPPING_TO = "Maya Member, 14 Willow Lane, Portland, OR 97205, United States";

export const orders: Order[] = [
  {
    id: "AC-1042",
    userId: DEMO_MEMBER_ID,
    status: "delivered",
    placedAt: "2026-08-14T10:24:00.000Z",
    total: 132,
    shippingTo: SHIPPING_TO,
    items: [
      { productId: "1", name: "Linen Camp Shirt", image: unsplash(CLOTHING_PHOTOS[0]), size: "M", colour: "Sand", price: 68, quantity: 1 },
      { productId: "2", name: "Organic Cotton Tee", image: unsplash(CLOTHING_PHOTOS[1]), size: "S", colour: "Olive", price: 32, quantity: 2 },
    ],
  },
  {
    id: "AC-1087",
    userId: DEMO_MEMBER_ID,
    status: "delivered",
    placedAt: "2026-09-28T16:02:00.000Z",
    total: 94,
    shippingTo: SHIPPING_TO,
    items: [
      { productId: "17", name: "Stoneware Dinner Plate Set", image: unsplash(HOME_PHOTOS[4]), size: "Set of 4", colour: "Speckled white", price: 58, quantity: 1 },
      { productId: "18", name: "Hand-Thrown Mug", image: unsplash(HOME_PHOTOS[5]), size: "One size", colour: "Moss glaze", price: 18, quantity: 2 },
    ],
  },
  {
    id: "AC-1121",
    userId: DEMO_MEMBER_ID,
    status: "shipped",
    placedAt: "2026-10-16T09:11:00.000Z",
    total: 76.95,
    shippingTo: SHIPPING_TO,
    items: [
      { productId: "12", name: "Ribbed Wool Beanie", image: unsplash(CLOTHING_PHOTOS[3]), size: "One size", colour: "Oatmeal", price: 28, quantity: 1 },
      { productId: "9", name: "Lambswool Scarf", image: unsplash(CLOTHING_PHOTOS[2]), size: "One size", colour: "Rust", price: 42, quantity: 1 },
    ],
  },
];
