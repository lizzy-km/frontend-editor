import type { ReactElement } from "react";
import { Link, Navigate, useLocation } from "react-router";
import { useDocumentTitle } from "@/shared/hooks/useDocumentTitle";
import { AuthShell } from "./components/AuthShell";
import { DemoAccounts } from "./components/DemoAccounts";
import { LoginForm } from "./components/LoginForm";
import { useAuth } from "./hooks/useAuth";
import { readRedirectPath } from "./lib/redirect";

// The log in page; people who are already signed in are sent on to where they wanted to go.
export default function LoginPage(): ReactElement {
  useDocumentTitle("Log in");
  const { user } = useAuth();
  const location = useLocation();

  if (user) {
    return <Navigate to={readRedirectPath(location.state)} replace />;
  }

  return (
    <AuthShell
      title="Welcome back"
      intro="Log in to check out, save favourites and follow your orders."
      footer={
        <p>
          New to Alder &amp; Co.? <Link to="/register">Create an account</Link>
        </p>
      }
    >
      <DemoAccounts />
      <LoginForm />
    </AuthShell>
  );
}
