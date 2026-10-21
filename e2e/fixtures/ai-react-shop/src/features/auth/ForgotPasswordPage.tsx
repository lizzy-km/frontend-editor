import type { ReactElement } from "react";
import { Link } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AuthShell } from "./components/AuthShell";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";

// The page where people ask for a password reset link.
export default function ForgotPasswordPage(): ReactElement {
  useDocumentTitle("Forgot password");

  return (
    <AuthShell
      title="Forgot your password?"
      intro="Enter your email and we will send you a link to choose a new one."
      footer={
        <p>
          Remembered it? <Link to="/login">Back to log in</Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
