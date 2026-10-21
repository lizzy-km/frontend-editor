import type { ReactElement } from "react";
import { Link } from "react-router";
import { formatPrice } from "@/shared/lib/formatPrice";
import { Card } from "@/shared/ui/Card";
import { LOW_STOCK_LIMIT } from "../constants";
import type { Product } from "../types";
import { FavouriteButton } from "./FavouriteButton";
import { RatingStars } from "./RatingStars";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  product: Product;
};

function stockLabel(stock: number): string | null {
  if (stock === 0) return "Sold out";
  return stock <= LOW_STOCK_LIMIT ? `Only ${stock} left` : null;
}

// A product tile with a big photo, price, rating and a favourites heart; the whole card opens the product.
export function ProductCard({ product }: ProductCardProps): ReactElement {
  const label = stockLabel(product.stock);

  return (
    <Card as="article" hoverable className={styles.card}>
      <div className={styles.media}>
        <img className={styles.image} src={product.images[0]} alt={product.name} loading="lazy" />
        {label ? <span className={styles.badge}>{label}</span> : null}
        <FavouriteButton productId={product.id} productName={product.name} />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link className={styles.link} to={`/shop/${product.id}`}>
            {product.name}
          </Link>
        </h3>
        <p className={styles.price}>{formatPrice(product.price)}</p>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      </div>
    </Card>
  );
}
