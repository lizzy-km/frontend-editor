import type { ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useSubscribe } from "../hooks/useSubscribe";
import { newsletterSchema, type NewsletterInput } from "../types";
import styles from "./NewsletterForm.module.css";

const SUBSCRIBE_FALLBACK = "We could not sign you up right now. Please try again in a moment.";

// An email box and button that sign people up to the newsletter, then thank them.
export function NewsletterForm(): ReactElement {
  const subscribe = useSubscribe();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterInput>({ resolver: zodResolver(newsletterSchema) });

  const onSubmit = handleSubmit((values) => subscribe.mutate(values, { onSuccess: () => reset() }));

  if (subscribe.isSuccess) {
    return (
      <p className={styles.thanks} role="status">
        Thank you! You are on the list. Look out for a welcome note and your WELCOME10 code.
      </p>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <Input
        label="Your email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        error={errors.email?.message ?? (subscribe.isError ? getErrorMessage(subscribe.error, SUBSCRIBE_FALLBACK) : undefined)}
        {...register("email")}
      />
      <Button type="submit" disabled={subscribe.isPending}>
        {subscribe.isPending ? "Signing you up…" : "Join the list"}
      </Button>
    </form>
  );
}
