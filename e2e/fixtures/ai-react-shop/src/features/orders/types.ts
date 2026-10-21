export type OrderStatus = "processing" | "shipped" | "delivered";

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  colour: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  placedAt: string;
  shippingTo: string;
};

export type NewOrder = {
  items: OrderItem[];
  total: number;
  shippingTo: string;
};
