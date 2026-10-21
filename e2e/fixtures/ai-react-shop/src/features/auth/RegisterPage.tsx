import type { ReactElement } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AuthShell } from "./components/AuthShell";
import { RegisterForm } from "./components/RegisterForm";
import { useAuth } from "./hooks/useAuth";
import { readRedirectPath } from "./lib/redirect";

// The create account page; new members are signed in straight away.
export default function RegisterPage(): ReactElement {
  useDocumentTitle("Create account");
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to={readRedirectPath(location.state)} replace />;
  }

  return (
    <AuthShell
      title="Create your account"
      intro="Members can order, keep favourites and see every order in one place."
      footer={
        <p>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
