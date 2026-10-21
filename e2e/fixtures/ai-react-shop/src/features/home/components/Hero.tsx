import type { ReactElement } from "react";
import { FREE_SHIPPING_THRESHOLD } from "@/features/cart";
import { CLOTHING_PHOTOS, unsplash } from "@/data/images";
import { formatPrice } from "@/shared/lib/formatPrice";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import styles from "./Hero.module.css";

// The big first section of the home page: headline, short line, two buttons and a large photo.
export function Hero(): ReactElement {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>The autumn collection</p>
          <h1 className={styles.title}>Soft clothes and calm rooms, made to last.</h1>
          <p className={styles.lead}>
            Linen shirts, merino knits, stoneware and bedding in natural fibres. Simple things for people who would
            rather buy once.
          </p>
          <div className={styles.actions}>
            <ButtonLink to="/shop">Shop the collection</ButtonLink>
            <ButtonLink to="/about" variant="secondary">
              Our story
            </ButtonLink>
          </div>
        </div>
        <div className={styles.visual}>
          <img
            className={styles.photo}
            src={unsplash(CLOTHING_PHOTOS[2])}
            alt="Alder & Co. clothing in soft, natural colours"
          />
          <p className={styles.badge}>Free shipping over {formatPrice(FREE_SHIPPING_THRESHOLD)}</p>
        </div>
      </div>
    </section>
  );
}
