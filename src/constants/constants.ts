import { OrderGroup, OrderStatus } from "~/global/types/types";

export const DRAWER_WIDTH = 216;
export const HEADER_Z_INDEX = 1299;

//strings
export const POWERED_BY_SHAED_TEXT = "Powered By SHAED";
export const SHAED_TEXT = "SHAED";

//Routes
export const ROOT_PAGE_PATH = "/";
export const MY_ORDERS_PAGE_PATH = "/my-orders";
export const BUILD_MY_VEHICLE_PATH = "/build-my-vehicle";

export const APP_NAMES = {
  FERNHAY: "Fernhay",
  RAM: "RAM",
  STREET_ROD: "Streetrod",
};

export const PAGE_BREAKER_TABLE_CONTENT_LIMIT = 13;

// values

export const MY_ORDERS_TABS: { [x: string]: OrderGroup } = {
  ALL: "All",
  PENDING: "Pending",
  ACCEPTED: "Accepted",
} as const;

export const DEALER_ORDERS_TABS: { [x: string]: "All" | "Manage Orders" } = {
  ALL: "All",
  MY_ORDERS: "Manage Orders",
} as const;

export const MY_ORDER_SORT_BY_VALUES = {
  RECENT: "desc",
  OLDEST: "asc",
} as const;

export const MY_ORDERS_FILTERS = {
  OEM_NO: "oem", // need to update based on api val
  QUOTE_NO: "formattedId",
  BOM_ID: "bomid", // need to update based on api val
  STATUS: "primaryStatus",
  CUSTOMER_NAME: "customerName",
} as const;

export const QUOTE_ORDER_STATUSES = {
  QUOTE_GENERATED: "Quote Generated",
  QUOTE_ACCEPTED: "Quote Accepted",
  ORDER_PROCESSING: "Order Processing",
  IN_PRODUCTION: "In Production",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

export const MY_ORDERS_QUOTE_EXPIRY_DAYS = 30;

export const QUOTE_ORDER_STATUS_OPTIONS = [
  QUOTE_ORDER_STATUSES.QUOTE_GENERATED,
  QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED,
  QUOTE_ORDER_STATUSES.ORDER_PROCESSING,
  QUOTE_ORDER_STATUSES.IN_PRODUCTION,
  QUOTE_ORDER_STATUSES.IN_TRANSIT,
  QUOTE_ORDER_STATUSES.DELIVERED,
  QUOTE_ORDER_STATUSES.CANCELLED,
];

export const orderStatusToKontentAiCodenameMap: Record<
  OrderStatus["status"],
  string
> = {
  "Quote Generated": "quote_generated",
  "Quote Accepted": "quote_accepted",
  "Order Processing": "order_processing",
  "In Transit": "in_transit",
  "In Production": "in_production",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export const Regexs = {
  ALPHABET_WITH_SPACES_ONLY: /^[A-Za-z ]+$/,
  ALPHABET_WITH_SPACES_BUT_NOT_ONLY_SPACES: /^(?!\s*$)[a-zA-Z\s]+$/,
  ALPHABET_WITH_SPACE_AND_HYPHEN_ONLY: /^[A-Za-z  -]+$/,
  ALPHANUMERIC_WITH_SPACE_ONLY: /^[A-Za-z0-9 ]+$/,
  ALPHANUMERIC_WITH_SPACE_AND_HYPHEN_ONLY: /^[a-zA-Z0-9 -]+$/,
  ALPHANUMERIC_AND_SPECIAL_CHARACTERS:
    /^(?!\s+$)(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*()-_=+[\]{};:'",.<>?`~|\\/ ]*$/,
  PHONE_NUMBER: /^\+[\d ()-]+$/,
  EMAIL: /^(?!.*\.{2})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

export const PHONE_NUMBER_MINIMUM_LENGTH_LIMIT = 10;
