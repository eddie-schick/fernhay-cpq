import RoutePaths from "~/constants/route-paths";

import ConfiguratorPageProvider from "~/context/configurator-page-provider/configurator-page-provider";
import MyOrdersPageProvider from "~/context/my-orders-page-context/my-orders-page-context";
import QuotationSummaryPageProvider from "~/context/quotation-summary-page-provider/quotation-summary-page-provider";

import MainLayout from "~/layout/main-layout/main-layout";

import ExpiredLink from "~/pages/expired-link/expired-link";
import SuspiciousLogin from "~/pages/suspicious-login/suspicious-login";

import {
  BuildMyVehiclePage,
  ConfiguratorPage,
  LoginPage,
  ManageInventoryPage,
  MyOrdersPage,
  MyProfilePage,
  OrderDetailPage,
  QuotationSummaryPage,
  SignUpPage,
} from "./all-pages";

type RouteType = {
  id: string | number;
  title: string;
  path: string;
  icon?: JSX.Element;
  element: JSX.Element;
  allowedFor?: "*"[];
};

const PROTECTED_ROUTES: RouteType[] = [
  {
    id: "my-profile",
    title: "My Profile",
    path: RoutePaths.MY_PROFILE,
    icon: <div>icon</div>,
    element: (
      <MainLayout headerTitle="My Profile">
        <MyProfilePage />
      </MainLayout>
    ),
    allowedFor: ["*"],
  },
  {
    id: "build-my-vehicle",
    title: "Build My Vehicle",
    path: RoutePaths.BUILD_MY_VEHICLE_PAGE,
    icon: <div>icon</div>,
    element: (
      <MainLayout>
        <BuildMyVehiclePage />
      </MainLayout>
    ),
    allowedFor: ["*"],
  },
  {
    id: "configurator",
    title: "Build My Vehicle",
    path: RoutePaths.CONFIGURATOR_PAGE,
    icon: <div>icon</div>,
    element: (
      <ConfiguratorPageProvider>
        <ConfiguratorPage />
      </ConfiguratorPageProvider>
    ),
    allowedFor: ["*"],
  },
  {
    id: "quotation-summary",
    title: "Build My Vehicle",
    path: RoutePaths.QUOTATION_SUMMARY,
    icon: <div>icon</div>,
    element: (
      <QuotationSummaryPageProvider>
        <QuotationSummaryPage />
      </QuotationSummaryPageProvider>
    ),
    allowedFor: ["*"],
  },
  {
    id: "my-orders",
    title: "Manage Orders",
    path: RoutePaths.MY_ORDERS,
    icon: <div>icon</div>,
    element: (
      <MainLayout>
        <MyOrdersPageProvider>
          <MyOrdersPage />
        </MyOrdersPageProvider>
      </MainLayout>
    ),
    allowedFor: ["*"],
  },
  {
    id: "order-detail",
    title: "Order Detail",
    path: RoutePaths.ORDER_DETAIL,
    icon: <div>icon</div>,
    element: (
      <MainLayout headerTitle="Order Detail">
        <OrderDetailPage />
      </MainLayout>
    ),
    allowedFor: ["*"],
  },
  {
    id: "manage-inventory",
    title: "Manage Inventory",
    path: RoutePaths.MANAGE_INVENTORY,
    icon: <div>icon</div>,
    element: (
      <MainLayout>
        <ManageInventoryPage />
      </MainLayout>
    ),
    allowedFor: ["*"],
  },
];

const UNPROTECTED_ROUTES: RouteType[] = [
  {
    id: "sign-up",
    title: "",
    path: RoutePaths.SIGN_UP_PAGE,
    icon: <div>icon</div>,
    element: <SignUpPage />,
    allowedFor: ["*"],
  },
  {
    id: "login",
    title: "Welcome Back",
    path: RoutePaths.LOGIN_PAGE,
    icon: <div>icon</div>,
    element: <LoginPage />,
    allowedFor: ["*"],
  },
  {
    id: "expired-link",
    title: "Expired",
    path: RoutePaths.MAGIC_LINK_EXPIRED,
    icon: <div>icon</div>,
    element: <ExpiredLink />,
    allowedFor: ["*"],
  },
  {
    id: "suspicious-login",
    title: "Suspicious Login",
    path: RoutePaths.SUSPICIOUS_LOGIN,
    icon: <div>icon</div>,
    element: <SuspiciousLogin />,
    allowedFor: ["*"],
  },
];

export { PROTECTED_ROUTES, UNPROTECTED_ROUTES };
