import { useContext, useMemo } from "react";

import { DEALER_ORDERS_TABS, MY_ORDERS_FILTERS } from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { FilterObjType, FilterTypes } from "~/helpers/kontent-ai-helpers";

import { useAppSelector } from "~/store";
import { myOrdersSelector } from "~/store/slices/my-orders/slice";

import {
  AuthContextFactory,
  UserSchema,
} from "~/context/auth-context/auth-context";

import {
  OrderGroup,
  OrderStatus,
  OrderStatusValue,
  orderStatusToKontentAiCodenameMap,
} from "../../../global/types/types";

export const getOrderStatusesByGroup = (
  group: OrderGroup | "Manage Orders",
  statuses: OrderStatus[]
) => {
  return statuses
    .filter((status) => status?.group === group)
    .map((status) => status?.status);
};

export default function useKontentAiFilters(): FilterObjType[] {
  const {
    filterValues: filterState,
    selectedTab,
    quoteStatuses: allStatuses,
    mainTableSearchText: searchText,
  } = useAppSelector(myOrdersSelector);

  console.log(
    "%cuseKontentAiFilters:",
    "background-color:deeppink;color:white;",
    {
      filterState,
    }
  );

  const { user, role: userRole } = useContext(AuthContextFactory);

  console.log("userRole is", userRole, user);

  // const userRole = user?.user?.metadata?.role || "";
  const userEmailDomain = user?.user ? user?.user?.email.split("@")[1] : "";
  const userDealerName = user?.user ? user?.user?.name : "";

  const filters: FilterObjType[] = [];
  let statusFilter: OrderStatusValue[] = [];

  if (userRole !== "admin") {
    filters.push({
      filterType: FilterTypes.EQUALS_FILTER,
      filterElement: "elements.user_email_domain",
      filterValue: userEmailDomain,
    });
    if (selectedTab === DEALER_ORDERS_TABS.MY_ORDERS) {
      filters.push({
        filterType: FilterTypes.EQUALS_FILTER,
        filterElement: "elements.sales_manager_name",
        filterValue: userDealerName,
      });
    }
  }

  if (filterState[MY_ORDERS_FILTERS.STATUS].values?.length) {
    statusFilter = filterState[MY_ORDERS_FILTERS.STATUS]
      .values as OrderStatusValue[];
  } else {
    if (userRole === "admin") {
      statusFilter = getOrderStatusesByGroup(selectedTab, allStatuses);
    }
  }
  if (statusFilter?.length) {
    filters.push({
      filterType: FilterTypes.ANY_FILTER,
      filterElement: "elements.status",
      filterValue: statusFilter?.map(
        (statusValue) => orderStatusToKontentAiCodenameMap[statusValue]
      ),
    });
  }

  let orderNoFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.OEM_NO]?.values?.length) {
    orderNoFilter = filterState[MY_ORDERS_FILTERS.OEM_NO]?.values;
  }
  if (orderNoFilter?.length) {
    filters.push({
      filterType: FilterTypes.IN_FILTER,
      filterElement: "elements.oem_order_no",
      filterValue: orderNoFilter,
    });
  }

  let quoteNoFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.QUOTE_NO]?.values?.length) {
    quoteNoFilter = filterState[MY_ORDERS_FILTERS.QUOTE_NO]?.values;
  }
  if (quoteNoFilter?.length) {
    filters.push({
      filterType: FilterTypes.IN_FILTER,
      filterElement: "elements.formatted_id",
      filterValue: quoteNoFilter,
    });
  }

  let customerFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME]?.values?.length) {
    customerFilter = filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME]?.values?.map(
      (obj) => obj?.kontentAi__item__codename
    );
  }
  if (customerFilter?.length) {
    filters.push({
      filterType: FilterTypes.ANY_FILTER,
      filterElement: "elements.customer",
      filterValue: customerFilter,
    });
  }

  // if (searchText) {
  //   filters.push({
  //     filterType: FilterTypes.EQUALS_FILTER,
  //     filterElement: "elements.formatted_id",
  //     filterValue: searchText,
  //   });
  // }

  return filters;
}
