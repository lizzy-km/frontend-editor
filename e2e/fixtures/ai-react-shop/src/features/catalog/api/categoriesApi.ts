import { apiClient, mockDelay, USE_MOCK } from "@/api/client";
import { categories } from "@/data/categories";
import { MOCK_DATA_DELAY_MS } from "../constants";
import type { Category } from "../types";

// Fetches the shop's categories.
export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return mockDelay(categories, MOCK_DATA_DELAY_MS);
  const { data } = await apiClient.get<Category[]>("/categories");
  return data;
}
