const RoutePaths = {
  LOGIN_PAGE: "/login",
  SIGN_UP_PAGE: "/sign-up",
  BUILD_MY_VEHICLE_PAGE: "/build-my-vehicle",
  CONFIGURATOR_PAGE: "/build-my-vehicle/configurator",
  MY_ORDERS: "/my-orders",
  ORDER_DETAIL: "/my-orders/:orderId",
  MANAGE_INVENTORY: "/manage-inventory",
  MY_PROFILE: "/profile",
  MAGIC_LINK_EXPIRED: "/expired",
  QUOTATION_SUMMARY: "/build-my-vehicle/quotation-summary",
  SUSPICIOUS_LOGIN: "/report",
} as const;

export default RoutePaths;
