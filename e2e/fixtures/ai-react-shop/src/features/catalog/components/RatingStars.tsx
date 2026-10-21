import type { ReactElement } from "react";
import styles from "./RatingStars.module.css";

const MAX_STARS = 5;

type RatingStarsProps = {
  rating: number;
  reviewCount: number;
};

// Shows a rating as stars with the number of reviews, or "New" when there are none yet.
export function RatingStars({ rating, reviewCount }: RatingStarsProps): ReactElement {
  if (reviewCount === 0) {
    return <span className={styles.new}>New</span>;
  }
  const filled = Math.round(rating);

  return (
    <span className={styles.rating}>
      <span
        className={styles.stars}
        role="img"
        aria-label={`Rated ${rating.toFixed(1)} out of ${MAX_STARS} from ${reviewCount} reviews`}
      >
        {"★".repeat(filled)}
        {"☆".repeat(MAX_STARS - filled)}
      </span>
      <span className={styles.count}>({reviewCount})</span>
    </span>
  );
}
