import type { ReactElement } from "react";
import { cx } from "@/shared/lib/classNames";
import { useFavourites } from "../hooks/useFavourites";
import styles from "./FavouriteButton.module.css";

type FavouriteButtonProps = {
  productId: string;
  productName: string;
};

// A heart button that saves a product to the favourites or removes it again.
export function FavouriteButton({ productId, productName }: FavouriteButtonProps): ReactElement {
  const { isFavourite, toggleFavourite } = useFavourites();
  const isSaved = isFavourite(productId);

  return (
    <button
      type="button"
      className={cx(styles.button, isSaved && styles.saved)}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${productName} from favourites` : `Save ${productName} to favourites`}
      onClick={() => toggleFavourite(productId)}
    >
      <span aria-hidden="true">{isSaved ? "♥" : "♡"}</span>
    </button>
  );
}
