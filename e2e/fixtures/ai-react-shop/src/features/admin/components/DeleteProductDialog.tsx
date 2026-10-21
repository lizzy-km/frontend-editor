import { useState, type ReactElement } from "react";
import type { Product } from "@/features/catalog";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import styles from "./DeleteProductDialog.module.css";

const DELETE_FALLBACK = "We could not delete the product. Please try again.";

type DeleteProductDialogProps = {
  product: Product | null;
  onConfirm: (product: Product) => Promise<void>;
  onClose: () => void;
};

// Asks the admin to confirm before a product is deleted.
export function DeleteProductDialog({ product, onConfirm, onClose }: DeleteProductDialogProps): ReactElement {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleConfirm = async (): Promise<void> => {
    if (!product) return;
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await onConfirm(product);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, DELETE_FALLBACK));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal open={product !== null} title="Delete this product?" onClose={onClose}>
      <p>
        <strong>{product?.name}</strong> will disappear from the shop. In this demo it comes back when you reload the page.
      </p>
      {errorMessage ? (
        <p className={styles.error} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <div className={styles.actions}>
        <Button variant="ghost" onClick={onClose}>
          Keep it
        </Button>
        <Button variant="danger" disabled={isDeleting} onClick={() => void handleConfirm()}>
          {isDeleting ? "Deleting…" : "Yes, delete"}
        </Button>
      </div>
    </Modal>
  );
}
