import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

// Tells a signed-in member that this page is only for the shop team.
export function NoAccess(): ReactElement {
  useDocumentTitle("No access");

  return (
    <>
      <PageHeader title="No access" />
      <section className="container">
        <EmptyState
          title="This page is for the shop team"
          text="Your account is a member account, so you cannot manage products. You can still browse, save favourites and follow your orders."
          action={<ButtonLink to="/shop">Back to the shop</ButtonLink>}
        />
      </section>
    </>
  );
}
