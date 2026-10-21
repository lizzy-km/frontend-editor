import { useState, type ReactElement } from "react";
import {
  DEFAULT_FILTERS,
  useCategories,
  useProductMutations,
  useProducts,
  type Product,
  type ProductInput,
} from "@/features/catalog";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Modal } from "@/shared/ui/Modal";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Spinner } from "@/shared/ui/Spinner";
import { DeleteProductDialog } from "./components/DeleteProductDialog";
import { ProductForm } from "./components/ProductForm";
import { ProductsTable } from "./components/ProductsTable";
import styles from "./AdminProductsPage.module.css";

type EditorState = Product | "new" | null;

// The admin page: list, add, edit and delete products (the changes last until the page reloads).
export default function AdminProductsPage(): ReactElement {
  useDocumentTitle("Admin products");
  const { data: products, isPending, isError, refetch } = useProducts(DEFAULT_FILTERS);
  const { data: categories } = useCategories();
  const { create, update, remove } = useProductMutations();
  const [editor, setEditor] = useState<EditorState>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [notice, setNotice] = useState("");

  const editedProduct = editor === "new" ? null : editor;

  const handleSave = async (input: ProductInput): Promise<void> => {
    if (editedProduct) await update.mutateAsync({ id: editedProduct.id, input });
    else await create.mutateAsync(input);
    setNotice(`${input.name} was saved.`);
    setEditor(null);
  };

  const handleDelete = async (product: Product): Promise<void> => {
    await remove.mutateAsync(product.id);
    setNotice(`${product.name} was deleted.`);
    setProductToDelete(null);
  };

  return (
    <>
      <PageHeader title="Admin products" intro="Add, change or remove products. In this demo your changes last until you reload the page." />
      <section className={`container ${styles.section}`}>
        <div className={styles.bar}>
          <p className={styles.notice} role="status">
            {notice}
          </p>
          <Button onClick={() => setEditor("new")}>Add a product</Button>
        </div>
        {isPending ? <Spinner label="Loading products" /> : null}
        {isError ? <ErrorState message="We could not load the products. Please try again." onRetry={() => void refetch()} /> : null}
        {products?.length === 0 ? (
          <EmptyState title="No products yet" text="Add your first product to start selling." />
        ) : null}
        {products && products.length > 0 ? (
          <ProductsTable products={products} categories={categories ?? []} onEdit={setEditor} onDelete={setProductToDelete} />
        ) : null}
      </section>
      <Modal open={editor !== null} title={editedProduct ? "Edit product" : "Add a product"} onClose={() => setEditor(null)}>
        <ProductForm
          key={editedProduct?.id ?? "new"}
          product={editedProduct}
          categories={categories ?? []}
          onSave={handleSave}
          onCancel={() => setEditor(null)}
        />
      </Modal>
      <DeleteProductDialog product={productToDelete} onConfirm={handleDelete} onClose={() => setProductToDelete(null)} />
    </>
  );
}
