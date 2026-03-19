import { Suspense } from "react";
import {
  Route,
  Navigate,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";
import { createBrowserRouter } from "react-router-dom";

import { LicenseInfo } from "@mui/x-license-pro";

import Envs from "~/constants/envs";
import RoutePaths from "~/constants/route-paths";

import ErrorBoundary from "~/global/error-boundary";
import PageLoader from "~/global/page-loader";

import { useGetAppSettingsQuery } from "~/store/endpoints/misc/misc";

import { useAuthContextValue } from "~/context/auth-context";

import Root from "~/pages/root";

import { PROTECTED_ROUTES, UNPROTECTED_ROUTES } from "./all-routes";
import AuthGuard from "./auth-guard";

export default function AppRouter() {
  LicenseInfo.setLicenseKey(Envs.MUI_GRID_LICENSE_KEY);

  const authContextValue = useAuthContextValue();
  const { isAuth, isAuthLoaded } = authContextValue;

  console.log("auths", isAuth, isAuthLoaded);

  const getAppSettingsQueryState = useGetAppSettingsQuery();
  console.log("%cauthContextValue:", "background-color:black;color:white;", {
    authContextValue,
  });

  const renderRouter = () => {
    if (getAppSettingsQueryState.isLoading) {
      return null;
    }

    const router = createBrowserRouter(
      createRoutesFromElements(
        <Route path="/" element={<Root />}>
          {PROTECTED_ROUTES.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                <AuthGuard
                  isRouteAccessible={isAuth}
                  redirectRoute={RoutePaths.LOGIN_PAGE}
                  component={route.element}
                />
              }
            ></Route>
          ))}

          {UNPROTECTED_ROUTES.map((route) => (
            <Route
              key={route.id}
              path={route.path}
              element={
                <AuthGuard
                  isRouteAccessible={!isAuth}
                  redirectRoute={RoutePaths.BUILD_MY_VEHICLE_PAGE}
                  component={route.element}
                />
              }
            />
          ))}

          <Route path="*" element={<Navigate to={"/login"} />} />
        </Route>,
      ),
    );

    return <RouterProvider router={router} />;
  };

  return !isAuthLoaded ? null : (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>{renderRouter()}</Suspense>
    </ErrorBoundary>
  );
}
