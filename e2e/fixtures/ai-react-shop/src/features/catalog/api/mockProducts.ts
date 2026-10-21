import { products as seedProducts } from "@/data/products";
import type { Product, ProductInput } from "../types";

const NOT_FOUND_MESSAGE = "We could not find that product. It may have been removed.";

let mockProducts: Product[] = [...seedProducts];

// Returns the sample products as they are right now, including admin changes since the page loaded.
export function listMockProducts(): Product[] {
  return mockProducts;
}

function nextId(): string {
  const highest = mockProducts.reduce((max, product) => Math.max(max, Number(product.id) || 0), 0);
  return String(highest + 1);
}

// Adds a new sample product; it disappears when the page reloads.
export function addMockProduct(input: ProductInput): Product {
  const { image, ...details } = input;
  const product: Product = { ...details, id: nextId(), images: [image], rating: 0, reviewCount: 0, featured: false };
  mockProducts = [...mockProducts, product];
  return product;
}

// Changes a sample product; the first picture is replaced by the one in the form.
export function updateMockProduct(id: string, input: ProductInput): Product {
  const existing = mockProducts.find((product) => product.id === id);
  if (!existing) throw new Error(NOT_FOUND_MESSAGE);
  const { image, ...details } = input;
  const updated: Product = { ...existing, ...details, images: [image, ...existing.images.slice(1)] };
  mockProducts = mockProducts.map((product) => (product.id === id ? updated : product));
  return updated;
}

// Removes a sample product until the page reloads.
export function deleteMockProduct(id: string): void {
  if (!mockProducts.some((product) => product.id === id)) throw new Error(NOT_FOUND_MESSAGE);
  mockProducts = mockProducts.filter((product) => product.id !== id);
}
