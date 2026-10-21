import { useState, type ReactElement } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { collectErrors } from "@/shared/lib/formErrors";
import { getErrorMessage } from "@/shared/lib/errorMessage";
import { Button } from "@/shared/ui/Button";
import { FormAlert } from "@/shared/ui/FormAlert";
import { Input } from "@/shared/ui/Input";
import { useAuth } from "../hooks/useAuth";
import { loginSchema, type LoginInput } from "../types";
import { PasswordField } from "./PasswordField";
import styles from "./LoginForm.module.css";

const LOGIN_FALLBACK = "We could not log you in right now. Please try again in a moment.";

// The log in form: email, password and a link to reset a forgotten password.
export function LoginForm(): ReactElement {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
    } catch (error) {
      setServerError(getErrorMessage(error, LOGIN_FALLBACK));
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <FormAlert messages={collectErrors(errors, serverError)} />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      <PasswordField
        label="Password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
      <Button type="submit" fullWidth disabled={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>
      <p className={styles.help}>
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
    </form>
  );
}
