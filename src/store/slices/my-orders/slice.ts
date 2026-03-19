import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import {
  MY_ORDERS_FILTERS,
  MY_ORDERS_TABS,
  MY_ORDER_SORT_BY_VALUES,
} from "~/constants/constants";

import {
  OrderGroup,
  OrderStatus,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { RootState } from "~/store";
import { extendedApiSlice } from "~/store/endpoints/quotes/quotes";

type FilterValueType = {
  searchText?: string | null;
  values: string[];
  recentValues?: string[];
};

type FilterCheckboxValueType = {
  values: { id: number; title: string; kontentAi__item__codename: string }[];
};

type FilterValuesType = {
  [MY_ORDERS_FILTERS.QUOTE_NO]: FilterValueType;
  [MY_ORDERS_FILTERS.OEM_NO]: FilterValueType;
  [MY_ORDERS_FILTERS.BOM_ID]: FilterValueType;
  [MY_ORDERS_FILTERS.STATUS]: FilterValueType;
  [MY_ORDERS_FILTERS.CUSTOMER_NAME]: FilterValueType;
};

export type MyOrdersInitSliceState = {
  orders: QuoteOrder200ResponseSchema[];
  selectedTab: OrderGroup | "Manage Orders";
  mainTableSortBy: "asc" | "desc";
  paginationData: {
    page: number;
    pageSize: number;
  };
  filterValues: FilterValuesType;
  mainTableSearchText: string;
  quoteStatuses: OrderStatusValue[] | [];
};
const initialState: MyOrdersInitSliceState = {
  orders: [],
  selectedTab: MY_ORDERS_TABS.ALL,
  mainTableSortBy: MY_ORDER_SORT_BY_VALUES.RECENT,
  mainTableSearchText: "",
  paginationData: {
    page: 0,
    pageSize: 20,
  },
  filterValues: {
    [MY_ORDERS_FILTERS.OEM_NO]: {
      searchText: null,
      values: [],
      recentValues: [],
    },
    [MY_ORDERS_FILTERS.BOM_ID]: {
      searchText: null,
      values: [],
      recentValues: [],
    },
    [MY_ORDERS_FILTERS.QUOTE_NO]: {
      searchText: null,
      values: [],
      recentValues: [],
    },
    [MY_ORDERS_FILTERS.STATUS]: {
      values: [],
    },
    [MY_ORDERS_FILTERS.CUSTOMER_NAME]: {
      values: [],
    },
  },
  quoteStatuses: [
    "Quote Generated",
    "Quote Accepted",
    "Order Processing",
    "In Production",
    "In Transit",
    "Delivered",
    "Cancelled",
  ],
};
const myOrdersSlice = createSlice({
  name: "myOrders",
  initialState,
  reducers: {
    setOrders: (
      state,
      action: PayloadAction<QuoteOrder200ResponseSchema[]>,
    ) => {
      state.orders = action.payload;
    },
    updateOrderById: (
      state,
      action: PayloadAction<{
        id: string | number;
        data: Partial<QuoteOrder200ResponseSchema>;
      }>,
    ) => {
      state.orders = state.orders.map((quote) =>
        quote?.id !== action?.payload?.id
          ? quote
          : {
              ...quote,
              ...action.payload.data,
            },
      );
    },
    setSelectedTab: (
      state,
      action: PayloadAction<OrderGroup | "Manage Orders">,
    ) => {
      state.selectedTab = action.payload;
    },
    setSortBy: (state, action: PayloadAction<"desc" | "asc">) => {
      state.mainTableSortBy = action.payload;
    },
    clearSearchText: (state) => {
      state.mainTableSearchText = initialState.mainTableSearchText;
    },
    setSearch: (state, action: PayloadAction<string>) => {
      state.mainTableSearchText = action.payload;
    },
    setPaginationData: (
      state,
      action: PayloadAction<{ page: number; pageSize: number }>,
    ) => {
      state.paginationData = action.payload;
    },
    resetPagination: (state) => {
      state.paginationData = {
        page: 0,
        pageSize: 20,
      };
    },
    setFilters: (
      state,
      action: PayloadAction<{
        filterId: string;
        data: {
          values:
            | string[]
            | {
                id: number;
                title: string;
                kontentAi__item__codename: string;
              }[];
          recentValues?: string[];
          searchText?: string | null;
        };
      }>,
    ) => {
      console.log(action.payload.data);
      state.filterValues = {
        ...state.filterValues,
        [action.payload.filterId]: {
          ...state.filterValues[
            action.payload.filterId as keyof typeof state.filterValues
          ],
          ...action.payload.data,
        },
      };
    },
    clearFilters: (state) => {
      state.filterValues = {
        [MY_ORDERS_FILTERS.OEM_NO]: {
          searchText: null,
          values: [],
          recentValues: [],
        },
        [MY_ORDERS_FILTERS.BOM_ID]: {
          searchText: null,
          values: [],
          recentValues: [],
        },
        [MY_ORDERS_FILTERS.QUOTE_NO]: {
          searchText: null,
          values: [],
          recentValues: [],
        },
        [MY_ORDERS_FILTERS.STATUS]: {
          values: [],
        },
        [MY_ORDERS_FILTERS.CUSTOMER_NAME]: {
          values: [],
        },
      };
    },
  },
});

export const {
  setOrders,
  updateOrderById,
  setSelectedTab,
  setSortBy,
  setSearch,
  clearSearchText,
  setFilters,
  clearFilters,
  setPaginationData,
  resetPagination,
} = myOrdersSlice.actions;
export default myOrdersSlice.reducer;
export const myOrdersSelector = (state: RootState) => state.myOrders;
