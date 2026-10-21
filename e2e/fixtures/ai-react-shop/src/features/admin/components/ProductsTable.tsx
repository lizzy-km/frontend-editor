import type { ReactElement } from "react";
import { Link } from "react-router";
import type { Category, Product } from "@/features/catalog";
import { formatPrice } from "@/shared/lib/formatPrice";
import { Button } from "@/shared/ui/Button";
import styles from "./ProductsTable.module.css";

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

// A table of every product with Edit and Delete buttons.
export function ProductsTable({ products, categories, onEdit, onDelete }: ProductsTableProps): ReactElement {
  const categoryName = (id: string): string => categories.find((category) => category.id === id)?.name ?? "Unknown";

  return (
    <div className={styles.scroll}>
      <table className={styles.table}>
        <caption className="visually-hidden">All products in the shop</caption>
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Category</th>
            <th scope="col">Price</th>
            <th scope="col">Stock</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <Link to={`/shop/${product.id}`}>{product.name}</Link>
              </td>
              <td>{categoryName(product.categoryId)}</td>
              <td>{formatPrice(product.price)}</td>
              <td>{product.stock}</td>
              <td className={styles.actions}>
                <Button variant="secondary" onClick={() => onEdit(product)} aria-label={`Edit ${product.name}`}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
