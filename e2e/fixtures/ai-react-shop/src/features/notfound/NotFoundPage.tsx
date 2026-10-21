import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";

// The page shown when the address does not match any page of the shop.
export default function NotFoundPage(): ReactElement {
  useDocumentTitle("Page not found");

  return (
    <>
      <PageHeader title="Page not found" eyebrow="Error 404" />
      <section className="container">
        <EmptyState
          title="We could not find that page"
          text="The link may be old or mistyped. Head back to the shop and pick up from there."
          action={<ButtonLink to="/shop">Go to the shop</ButtonLink>}
        />
      </section>
    </>
  );
}
