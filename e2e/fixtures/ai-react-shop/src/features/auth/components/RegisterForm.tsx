import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { collectErrors } from "@/shared/lib/formErrors";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { registerSchema, type RegisterInput } from "../types";
import { PasswordField } from "./PasswordField";

const REGISTER_FALLBACK = "We could not create your account right now. Please try again in a moment.";

// The create account form: name, email and a password typed twice.
export function RegisterForm(): ReactElement {
  const { register: createAccount } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await createAccount(values);
    } catch (error) {
      setServerError(getErrorMessage(error, REGISTER_FALLBACK));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormAlert messages={collectErrors(errors, serverError)} />
      <Input label="Your name" autoComplete="name" error={errors.name?.message} {...register("name")} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <PasswordField
        label="Password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...register("password")}
      />
      <PasswordField
        label="Type the password again"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}
