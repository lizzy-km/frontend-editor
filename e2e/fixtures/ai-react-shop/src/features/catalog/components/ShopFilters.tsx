import type { ReactElement } from "react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { Select } from "@/shared/ui/Select";
import { PRICE_RANGES, SORT_OPTIONS } from "../constants";
import type { Category, ProductFilters } from "../types";
import styles from "./ShopFilters.module.css";

type ShopFiltersProps = {
  filters: ProductFilters;
  categories: Category[];
  hasFilters: boolean;
  onChange: (key: keyof ProductFilters, value: string) => void;
  onClear: () => void;
};

// The search box and the category, price and sort choices above the product grid.
export function ShopFilters({ filters, categories, hasFilters, onChange, onClear }: ShopFiltersProps): ReactElement {
  return (
    <form className={styles.form} role="search" aria-label="Search and filter products" onSubmit={(event) => event.preventDefault()}>
      <Input
        label="Search"
        type="search"
        placeholder="Try linen, mug or sweater"
        value={filters.q}
        onChange={(event) => onChange("q", event.target.value)}
      />
      <Select label="Category" value={filters.category} onChange={(event) => onChange("category", event.target.value)}>
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>
      <Select label="Price" value={filters.price} onChange={(event) => onChange("price", event.target.value)}>
        {PRICE_RANGES.map((range) => (
          <option key={range.id} value={range.id}>
            {range.label}
          </option>
        ))}
      </Select>
      <Select label="Sort by" value={filters.sort} onChange={(event) => onChange("sort", event.target.value)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </Select>
      {hasFilters ? (
        <Button variant="ghost" onClick={onClear}>
          Clear filters
        </Button>
      ) : null}
    </form>
  );
}
