import { ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface GuardedRouteProps {
  isRouteAccessible: boolean;
  redirectRoute: string;
  component: ReactElement;
}

function AuthGuard({
  isRouteAccessible = true,
  redirectRoute = "/",
  component,
}: GuardedRouteProps) {
  if (isRouteAccessible) return component;

  return <Navigate to={redirectRoute} replace />;
}

export default AuthGuard;
