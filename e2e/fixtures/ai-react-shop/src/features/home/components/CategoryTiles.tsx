import type { ReactElement } from "react";
import { Link } from "react-router";
import { useCategories } from "@/features/catalog";
import { ErrorState } from "@/shared/ui/ErrorState";
import { Spinner } from "@/shared/ui/Spinner";
import styles from "./CategoryTiles.module.css";

// A bento-style grid of category tiles, each a link to the shop filtered by that category.
export function CategoryTiles(): ReactElement {
  const { data: categories, isPending, isError, refetch } = useCategories();

  return (
    <section className={styles.section}>
      <div className="container">
        <h2>Shop by category</h2>
        {isPending ? <Spinner label="Loading categories" /> : null}
        {isError ? <ErrorState message="We could not load the categories. Please try again." onRetry={() => void refetch()} /> : null}
        {categories ? (
          <ul className={styles.grid}>
            {categories.map((category) => (
              <li key={category.id} className={styles.tile}>
                <img className={styles.image} src={category.image} alt={category.name} loading="lazy" />
                <div className={styles.text}>
                  <h3 className={styles.name}>
                    <Link className={styles.link} to={`/shop?category=${category.id}`}>
                      {category.name}
                    </Link>
                  </h3>
                  <p className={styles.description}>{category.description}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
