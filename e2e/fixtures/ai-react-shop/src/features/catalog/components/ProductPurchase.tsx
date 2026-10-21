import { useState, type ReactElement } from "react";
import { Link } from "react-router";
import { useCart } from "@/features/cart";
import { Button } from "@/shared/ui/Button";
import type { Product } from "../types";
import { OptionPicker } from "./OptionPicker";
import styles from "./ProductPurchase.module.css";

type ProductPurchaseProps = {
  product: Product;
};

// The size and colour choices and the add to cart button of a product page.
export function ProductPurchase({ product }: ProductPurchaseProps): ReactElement {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [colour, setColour] = useState(product.colours[0] ?? "");
  const [isAdded, setIsAdded] = useState(false);
  const isSoldOut = product.stock === 0;

  const handleAdd = (): void => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      size,
      colour,
      quantity: 1,
    });
    setIsAdded(true);
  };

  return (
    <div>
      <OptionPicker legend="Size" name="size" options={product.sizes} value={size} onChange={setSize} />
      <OptionPicker legend="Colour" name="colour" options={product.colours} value={colour} onChange={setColour} />
      <Button fullWidth disabled={isSoldOut} onClick={handleAdd}>
        {isSoldOut ? "Sold out" : "Add to cart"}
      </Button>
      <p className={styles.status} role="status">
        {isAdded ? (
          <>
            Added to your cart. <Link to="/cart">View cart</Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
