import { isAxiosError } from "axios";
import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import { FEATURED_PRODUCT_COUNT, MOCK_DATA_DELAY_MS } from "../constants";
import { filterProducts } from "../lib/filterProducts";
import type { Product, ProductFilters, ProductInput } from "../types";
import { addMockProduct, deleteMockProduct, listMockProducts, updateMockProduct } from "./mockProducts";

const NOT_FOUND_STATUS = 404;

// Fetches the products that match the search, category, price and sort choices.
export async function fetchProducts(filters: ProductFilters): Promise<Product[]> {
  if (USE_MOCK) return mockDelay(filterProducts(listMockProducts(), filters), MOCK_DATA_DELAY_MS);
  const { data } = await apiClient.get<Product[]>("/products", { params: filters });
  return data;
}

// Fetches the products shown on the home page.
export async function fetchFeaturedProducts(): Promise<Product[]> {
  if (USE_MOCK) {
    const featured = listMockProducts().filter((product) => product.featured);
    return mockDelay(featured.slice(0, FEATURED_PRODUCT_COUNT), MOCK_DATA_DELAY_MS);
  }
  const { data } = await apiClient.get<Product[]>("/products/featured");
  return data;
}

// Fetches one product, or null when there is no product with that id.
export async function fetchProduct(id: string): Promise<Product | null> {
  if (USE_MOCK) {
    return mockDelay(listMockProducts().find((product) => product.id === id) ?? null, MOCK_DATA_DELAY_MS);
  }
  try {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === NOT_FOUND_STATUS) return null;
    throw error;
  }
}

// Creates a product (staff only).
export async function createProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK) return mockDelay(addMockProduct(input), MOCK_DATA_DELAY_MS);
  const { data } = await apiClient.post<Product>("/products", input);
  return data;
}

// Saves changes to a product (staff only).
export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  if (USE_MOCK) return mockDelay(updateMockProduct(id, input), MOCK_DATA_DELAY_MS);
  const { data } = await apiClient.put<Product>(`/products/${id}`, input);
  return data;
}

// Deletes a product (staff only).
export async function deleteProduct(id: string): Promise<void> {
  if (USE_MOCK) {
    deleteMockProduct(id);
    await mockDelay(null, MOCK_DATA_DELAY_MS);
    return;
  }
  await apiClient.delete(`/products/${id}`);
}
