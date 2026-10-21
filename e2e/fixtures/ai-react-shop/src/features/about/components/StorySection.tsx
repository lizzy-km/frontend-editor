import type { ReactElement } from "react";
import { STORE_PHOTO, unsplash } from "@/data/images";
import styles from "./StorySection.module.css";

// The story of how Alder & Co. started, next to a photo of the shop.
export function StorySection(): ReactElement {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.layout}`}>
        <div>
          <h2>Two friends, one small shop</h2>
          <p>
            Alder &amp; Co. began in 2019 in a rented room in Portland, when Ines and Tom got tired of clothes that
            lost their shape and home goods that were never meant to last.
          </p>
          <p>
            Today we work with a handful of mills and workshops in Portugal, Lithuania and Italy. We visit each one,
            we pay fairly, and we only sell what we would use ourselves.
          </p>
        </div>
        <img className={styles.image} src={unsplash(STORE_PHOTO)} alt="Shelves of folded clothes and home goods in the Alder & Co. shop" loading="lazy" />
      </div>
    </section>
  );
}
