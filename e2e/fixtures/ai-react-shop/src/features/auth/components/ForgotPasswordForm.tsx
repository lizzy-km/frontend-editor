import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { collectErrors } from "@/shared/lib/formErrors";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { requestPasswordReset } from "../api/authApi";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../types";

const RESET_FALLBACK = "We could not send the email right now. Please try again in a moment.";

// The forgot password form; it always thanks the person so nobody can guess which emails have accounts.
export function ForgotPasswordForm(): ReactElement {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await requestPasswordReset(values);
      setSentTo(values.email);
    } catch (error) {
      setServerError(getErrorMessage(error, RESET_FALLBACK));
    }
  });

  if (sentTo) {
    return (
      <p role="status">
        If there is an account for <strong>{sentTo}</strong>, we have sent a link to choose a new password. It can take a few minutes to arrive.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormAlert messages={collectErrors(errors, serverError)} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send me a reset link"}
      </Button>
    </form>
  );
}
