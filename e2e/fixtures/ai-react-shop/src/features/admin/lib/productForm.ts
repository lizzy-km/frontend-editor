import type { Product, ProductInput } from "@/features/catalog";
import type { ProductFormValues } from "../types";

function splitList(text: string): string[] {
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

// Turns the text typed in the product form into the data the shop stores.
export function toProductInput(values: ProductFormValues): ProductInput {
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    price: Number(values.price),
    categoryId: values.categoryId,
    sizes: splitList(values.sizes),
    colours: splitList(values.colours),
    image: values.image,
    stock: Number(values.stock),
  };
}

// Turns a stored product into the text shown in the product form.
export function toFormValues(product: Product | null): Partial<ProductFormValues> {
  if (!product) return {};
  return {
    name: product.name,
    categoryId: product.categoryId,
    price: String(product.price),
    stock: String(product.stock),
    sizes: product.sizes.join(", "),
    colours: product.colours.join(", "),
    image: product.images[0],
    description: product.description,
  };
}
