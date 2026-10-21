import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ReturnsBand } from "./components/ReturnsBand";
import { StorySection } from "./components/StorySection";
import { ValuesGrid } from "./components/ValuesGrid";

// The About page: the shop's story, its values and its return promise.
export default function AboutPage(): ReactElement {
  useDocumentTitle("About");

  return (
    <>
      <PageHeader title="About Alder & Co." intro="Clothes and home goods for people who like things simple, soft and long-lasting." />
      <StorySection />
      <ValuesGrid />
      <ReturnsBand />
    </>
  );
}
