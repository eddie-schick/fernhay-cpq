import { lazy } from "react";

const LoginPage = lazy(() => import("~/pages/login/login"));
const MyOrdersPage = lazy(() => import("~/pages/my-orders/index"));
const MyProfilePage = lazy(() => import("~/pages/my-profile/my-profile"));
const ConfiguratorPage = lazy(() => import("~/pages/configurator/index"));
const SignUpPage = lazy(() => import("~/pages/sign-up/sign-up"));
const BuildMyVehiclePage = lazy(() => import("~/pages/build-my-vehicle/index"));
const QuotationSummaryPage = lazy(
  () => import("~/pages/quotation-summary/index")
);
const OrderDetailPage = lazy(
  () => import("~/pages/order-detail/index")
);
const ManageInventoryPage = lazy(
  () => import("~/pages/manage-inventory/index")
);

export {
  LoginPage,
  MyOrdersPage,
  ConfiguratorPage,
  SignUpPage,
  BuildMyVehiclePage,
  MyProfilePage,
  QuotationSummaryPage,
  OrderDetailPage,
  ManageInventoryPage,
};
