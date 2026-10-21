import type { ReactElement } from "react";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { PageHeader } from "@/shared/ui/PageHeader";
import { ContactDetails } from "./components/ContactDetails";
import { ContactForm } from "./components/ContactForm";
import styles from "./ContactPage.module.css";

// The contact page: a message form next to the shop's contact details.
export default function ContactPage(): ReactElement {
  useDocumentTitle("Contact");

  return (
    <>
      <PageHeader title="Contact us" intro="Questions about an order, a size or a return? We are happy to help." />
      <section className={`container ${styles.layout}`}>
        <div>
          <ContactForm />
        </div>
        <ContactDetails />
      </section>
    </>
  );
}
