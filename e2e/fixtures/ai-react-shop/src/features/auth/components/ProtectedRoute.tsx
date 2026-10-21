import type { ReactElement } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";
import { NoAccess } from "./NoAccess";

type ProtectedRouteProps = {
  role?: Role;
};

// Shows the pages inside it only to signed-in people (and only to one role when role is given).
export function ProtectedRoute({ role }: ProtectedRouteProps): ReactElement {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (role && user.role !== role) {
    return <NoAccess />;
  }
  return <Outlet />;
}
