import type { ReactElement } from "react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/ui/Button";
import { ButtonLink } from "@/shared/ui/ButtonLink";
import styles from "./AccountActions.module.css";

// Log in and Sign up buttons, or the person's name and a Log out button once signed in.
export function AccountActions(): ReactElement {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div className={styles.actions}>
        <ButtonLink to="/login" variant="secondary">
          Log in
        </ButtonLink>
        <ButtonLink to="/register">Sign up</ButtonLink>
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <span className={styles.name}>Hi, {user.name.split(" ")[0]}</span>
      <Button variant="secondary" onClick={logout}>
        Log out
      </Button>
    </div>
  );
}
