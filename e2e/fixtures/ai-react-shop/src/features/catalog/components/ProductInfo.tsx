import type { ReactElement } from "react";
import { Link } from "react-router";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart";
import { formatPrice } from "@/shared/lib/formatPrice";
import { useCategories } from "../hooks/useCategories";
import type { Product } from "../types";
import { FavouriteButton } from "./FavouriteButton";
import { ProductPurchase } from "./ProductPurchase";
import { RatingStars } from "./RatingStars";
import styles from "./ProductInfo.module.css";

type ProductInfoProps = {
  product: Product;
};

// The text side of a product page: name, price, rating, description, choices and delivery notes.
export function ProductInfo({ product }: ProductInfoProps): ReactElement {
  const { data: categories } = useCategories();
  const category = categories?.find((item) => item.id === product.categoryId);

  return (
    <div className={styles.info}>
      {category ? (
        <p className={styles.category}>
          <Link to={`/shop?category=${category.id}`}>{category.name}</Link>
        </p>
      ) : null}
      <h1 className={styles.name}>{product.name}</h1>
      <p className={styles.price}>{formatPrice(product.price)}</p>
      <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      <p className={styles.description}>{product.description}</p>
      <ProductPurchase product={product} />
      <div className={styles.save}>
        <FavouriteButton productId={product.id} productName={product.name} />
        <span>Save to favourites</span>
      </div>
      <ul className={styles.perks}>
        <li>Free shipping on orders over {formatPrice(FREE_SHIPPING_THRESHOLD)}</li>
        <li>30-day returns, no questions asked</li>
        {product.stock > 0 ? <li>{product.stock} in stock, ready to ship</li> : <li>Currently sold out</li>}
      </ul>
    </div>
  );
}
