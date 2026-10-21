import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { Benefits } from "./components/Benefits";
import { CategoryTiles } from "./components/CategoryTiles";
import { FeaturedProducts } from "./components/FeaturedProducts";
import { Hero } from "./components/Hero";
import { NewsletterBand } from "./components/NewsletterBand";

// The home page: hero, categories, featured products, benefits and the newsletter.
export default function HomePage(): ReactElement {
  useDocumentTitle("Clothes and home goods");

  return (
    <>
      <Hero />
      <CategoryTiles />
      <FeaturedProducts />
      <Benefits />
      <NewsletterBand />
    </>
  );
}
