import { z } from "zod";

export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
};

export type CartState = {
  items: CartItem[];
  coupon: string | null;
};

export type CartTotals = {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  amountToFreeShipping: number;
};

export const couponSchema = z.object({
  code: z.string().trim().min(1, "Type a coupon code first."),
});

export type CouponInput = z.infer<typeof couponSchema>;
