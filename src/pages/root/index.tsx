import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";

import Envs from "~/constants/envs";
import LocalStorageKeys from "~/constants/local-storage-keys";
import RoutePaths from "~/constants/route-paths";

import { useGetCustomersQuery } from "~/store/endpoints/customers/customers";

import { useAuthContextValue } from "~/context/auth-context";

function appendScript() {
  // Skip HubSpot script if no ID configured (self-contained demo mode)
  if (!Envs.HUBSPOT_ID) return;

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.id = "hs-script-loader";
  script.async = true;
  script.defer = true;
  script.src = `//js-na1.hs-scripts.com/${Envs.HUBSPOT_ID}.js`;
  document.head.appendChild(script);
}

export default function Root() {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuth, user } = useAuthContextValue();

  const getCustomersQueryState = useGetCustomersQuery(
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
      },
      filterString: `filter.dealer.email=$eq:${user?.user?.email}`,
    },
    {
      skip: !isAuth,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  console.log("%croot.tsx:", "background-color:black;color:white;", {
    getCustomersQueryState,
  });

  useEffect(() => {
    appendScript();
  }, []);

  useEffect(() => {
    function navigateToOtherPageIfBaseRoute() {
      if (window.location.pathname === "/") {
        navigate(RoutePaths.LOGIN_PAGE);
      }
    }

    navigateToOtherPageIfBaseRoute();
  }, [navigate]);

  useEffect(() => {
    // Scroll to top on any route change
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <>
      <Outlet />
    </>
  );
}
