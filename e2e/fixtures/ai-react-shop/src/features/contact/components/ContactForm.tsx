import type { ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { collectErrors } from "@/shared/lib/formErrors";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { Textarea } from "@/shared/ui/Textarea";
import { useSendMessage } from "../hooks/useSendMessage";
import { contactSchema, type ContactInput } from "../types";
import styles from "./ContactForm.module.css";

const SEND_FALLBACK = "We could not send your message. Please try again, or email us directly.";

// The contact form; after sending it shows a thank-you message.
export function ContactForm(): ReactElement {
  const send = useSendMessage();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  const onSubmit = handleSubmit((values) => send.mutate(values, { onSuccess: () => reset() }));

  if (send.isSuccess) {
    return (
      <div className={styles.thanks} role="status">
        <h2>Thank you, your message is on its way</h2>
        <p>We read every message and reply within one working day.</p>
        <Button variant="secondary" onClick={() => send.reset()}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormAlert messages={collectErrors(errors, send.isError ? getErrorMessage(send.error, SEND_FALLBACK) : null)} />
      <Input label="Your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Textarea label="How can we help?" error={errors.message?.message} {...register("message")} />
      <Button type="submit" disabled={send.isPending}>
        {send.isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
