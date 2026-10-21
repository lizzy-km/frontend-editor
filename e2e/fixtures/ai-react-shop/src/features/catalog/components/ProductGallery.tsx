import { useState, type ReactElement } from "react";
import { cx } from "@/shared/lib/classNames";
import styles from "./ProductGallery.module.css";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

// A big product photo with small pictures underneath that switch the big one.
export function ProductGallery({ name, images }: ProductGalleryProps): ReactElement {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={styles.gallery}>
      <img className={styles.main} src={images[activeIndex]} alt={`${name}, picture ${activeIndex + 1}`} />
      {images.length > 1 ? (
        <ul className={styles.thumbs}>
          {images.map((image, index) => (
            <li key={`${index}-${image}`}>
              <button
                type="button"
                className={cx(styles.thumb, index === activeIndex && styles.active)}
                aria-label={`Show picture ${index + 1} of ${images.length}`}
                aria-pressed={index === activeIndex}
                onClick={() => setActiveIndex(index)}
              >
                <img src={image} alt={`${name}, thumbnail ${index + 1}`} loading="lazy" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
