import { PropsWithChildren, useEffect, useMemo, useState } from "react";

import {
  DEALER_ORDERS_TABS,
  MY_ORDERS_FILTERS,
  MY_ORDERS_TABS,
  QUOTE_ORDER_STATUSES,
  QUOTE_ORDER_STATUS_OPTIONS,
  orderStatusToKontentAiCodenameMap,
} from "~/constants/constants";

import {
  OrderGroup,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { FilterObjType, FilterTypes } from "~/helpers/kontent-ai-helpers";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  useGetQuotesCountQuery,
  useGetQuotesQuery,
} from "~/store/endpoints/quotes/quotes";
import { myOrdersSelector, setOrders } from "~/store/slices/my-orders/slice";

import { useAuthContextValue } from "../auth-context";

import { MyOrdersPageContext } from ".";

export default function MyOrdersPageProvider(props: PropsWithChildren) {
  const ordersSlice = useAppSelector(myOrdersSelector);

  const {
    filterValues: filterState,
    selectedTab,
    quoteStatuses: allStatuses,
  } = ordersSlice;

  const {
    paginationData,
    mainTableSortBy,
    filterValues,
    mainTableSearchText,
    quoteStatuses,
  } = ordersSlice;

  const { user, role } = useAuthContextValue();

  //   const newQuoteById = useAppSelector((state: RootState) =>
  //     selectQuoteById(state, quoteId!)
  //   ) as NewQuoteShape;
  //   const selectedGroup = newQuoteById?.groups?.find(
  //     (group) => group.isSelected === true
  //   ) as NewQuoteShape["groups"][number];

  const dispatch = useAppDispatch();

  const getNewOrderStatusesByGroup = (group: OrderGroup | "Manage Orders") => {
    if (group === MY_ORDERS_TABS.PENDING) {
      return [QUOTE_ORDER_STATUSES.QUOTE_GENERATED];
    }
    if (group === MY_ORDERS_TABS.ACCEPTED) {
      return [
        QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED,
        QUOTE_ORDER_STATUSES.ORDER_PROCESSING,
        QUOTE_ORDER_STATUSES.IN_PRODUCTION,
        QUOTE_ORDER_STATUSES.IN_TRANSIT,
        QUOTE_ORDER_STATUSES.DELIVERED,
      ];
    }
    if (group === MY_ORDERS_TABS.CANCELLED) {
      return [QUOTE_ORDER_STATUSES.CANCELLED];
    }
  };

  const filters: FilterObjType[] = [];

  const userEmailDomain = user?.user ? user?.user?.email.split("@")[1] : "";
  const userDealerEmail = user?.user ? user?.user?.email : "";

  if (selectedTab === DEALER_ORDERS_TABS.MY_ORDERS) {
    filters.push({
      filterElement: "filter.quote.dealerEmail",
      filterValue: userDealerEmail,
    });
  }

  let statusFilter: OrderStatusValue[] = [];

  if (filterState[MY_ORDERS_FILTERS.STATUS].values?.length) {
    statusFilter = filterState[MY_ORDERS_FILTERS.STATUS]
      .values as OrderStatusValue[];
  } else {
    if (role === "admin") {
      statusFilter = getNewOrderStatusesByGroup(
        selectedTab,
      ) as OrderStatusValue[];
    }
  }
  if (statusFilter?.length) {
    filters.push({
      filterElement: "filter.quote.status",
      filterValue: statusFilter,
    });
  }

  // if (filterState[MY_ORDERS_FILTERS.STATUS]?.values?.length) {
  //   statusFilter = filterState[MY_ORDERS_FILTERS.STATUS]
  //     ?.values as OrderStatusValue[];
  // }

  let orderNoFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.OEM_NO]?.values?.length) {
    orderNoFilter = filterState[MY_ORDERS_FILTERS.OEM_NO]?.values;
  }
  if (orderNoFilter?.length) {
    filters.push({
      filterElement: "filter.quote.oemOrderNo",
      filterValue: orderNoFilter,
    });
  }

  let quoteNoFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.QUOTE_NO]?.values?.length) {
    quoteNoFilter = filterState[MY_ORDERS_FILTERS.QUOTE_NO]?.values;
  }
  if (quoteNoFilter?.length) {
    filters.push({
      filterElement: "filter.quote.formattedId",
      filterValue: quoteNoFilter,
    });
  }

  let customerFilter: string[] = [];
  if (filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME]?.values?.length) {
    customerFilter = filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME]?.values;
  }
  if (customerFilter?.length) {
    filters.push({
      filterElement: "filter.quote.customerName",
      filterValue: customerFilter,
    });
  }

  const getOrdersQueryState = useGetQuotesQuery(
    {
      paginationData: {
        limit: paginationData.pageSize || 20,
        page: paginationData.page + 1,
      },
      orderBy: {
        orderElement: "audit.createdAt",
        sortOrder: mainTableSortBy || "desc",
      },
      filters: [...filters],
      searchText: mainTableSearchText.length > 0 ? mainTableSearchText : "",
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    if (
      getOrdersQueryState.isSuccess &&
      !getOrdersQueryState.isFetching &&
      getOrdersQueryState?.data?.data
    ) {
      dispatch(setOrders(getOrdersQueryState?.data?.data));
    }
  }, [
    dispatch,
    getOrdersQueryState?.data,
    getOrdersQueryState.isFetching,
    getOrdersQueryState.isSuccess,
  ]);

  type QuoteOrderStatus =
    (typeof QUOTE_ORDER_STATUSES)[keyof typeof QUOTE_ORDER_STATUSES];

  const appliedPendingStatusFilters: QuoteOrderStatus[] = [
    QUOTE_ORDER_STATUSES.QUOTE_GENERATED,
  ];
  const appliedAcceptedStatusFilters: QuoteOrderStatus[] = [
    QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED,
    QUOTE_ORDER_STATUSES.ORDER_PROCESSING,
    QUOTE_ORDER_STATUSES.IN_PRODUCTION,
    QUOTE_ORDER_STATUSES.IN_TRANSIT,
    QUOTE_ORDER_STATUSES.DELIVERED,
  ];
  const appliedCancelledStatusFilters: QuoteOrderStatus[] = [
    QUOTE_ORDER_STATUSES.CANCELLED,
  ];

  const statusFilterForAllOrdersCountQuery = appliedPendingStatusFilters
    .concat(appliedAcceptedStatusFilters, appliedCancelledStatusFilters)
    ?.filter((status) => {
      return filterValues?.primaryStatus?.values?.includes(status);
    });

  const allOrdersCountQueryState = useGetQuotesCountQuery(
    {
      filters: [
        ...filters.filter(
          (obj) =>
            obj?.filterElement !== "filter.quote.status" &&
            obj?.filterElement !== "filter.dealerEmail",
        ),
        ...(statusFilterForAllOrdersCountQuery?.length > 0
          ? ([
              {
                filterElement: "filter.quote.status",
                filterValue: statusFilterForAllOrdersCountQuery,
              },
            ] as FilterObjType[])
          : ([
              {
                filterElement: "filter.quote.status",
                filterValue: appliedPendingStatusFilters.concat(
                  appliedAcceptedStatusFilters,
                  appliedCancelledStatusFilters,
                ),
              },
            ] as FilterObjType[])),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
    },
  );

  const myOrdersCountQueryState = useGetQuotesCountQuery(
    {
      filters: [
        ...filters,
        {
          filterElement: "filter.quote.dealerEmail",
          filterValue: userDealerEmail,
        },
      ],
    },
    {
      refetchOnMountOrArgChange: true,
      skip: role === "admin",
    },
  );

  const statusFilterForPendingOrdersCountQuery = appliedPendingStatusFilters
    ?.filter((status) => {
      return filterValues?.primaryStatus?.values?.includes(status);
    })
    ?.map((statusValue) => orderStatusToKontentAiCodenameMap[statusValue]);

  const pendingOrdersCountQueryState = useGetQuotesCountQuery(
    {
      filters: [
        ...filters.filter(
          (obj) => obj?.filterElement !== "filter.quote.status",
        ),
        ...(statusFilterForPendingOrdersCountQuery?.length
          ? ([
              {
                filterElement: "filter.quote.status",
                filterValue: statusFilterForPendingOrdersCountQuery,
              },
            ] as FilterObjType[])
          : ([
              {
                filterElement: "filter.quote.status",
                filterValue: appliedPendingStatusFilters,
              },
            ] as FilterObjType[])),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !appliedPendingStatusFilters.length || role !== "admin",
    },
  );

  const statusFilterForAcceptedOrdersCountQuery = appliedAcceptedStatusFilters
    ?.filter((status) => {
      return filterValues?.primaryStatus?.values?.includes(status);
    })
    ?.map((statusValue) => orderStatusToKontentAiCodenameMap[statusValue]);
  const acceptedOrdersCountQueryState = useGetQuotesCountQuery(
    {
      filters: [
        ...filters.filter(
          (obj) => obj?.filterElement !== "filter.quote.status",
        ),
        ...(statusFilterForAcceptedOrdersCountQuery?.length
          ? ([
              {
                filterElement: "filter.quote.status",
                filterValue: statusFilterForAcceptedOrdersCountQuery,
              },
            ] as FilterObjType[])
          : ([
              {
                filterElement: "filter.quote.status",
                filterValue: appliedAcceptedStatusFilters,
              },
            ] as FilterObjType[])),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !appliedAcceptedStatusFilters.length || role !== "admin",
    },
  );

  const statusFilterForCancelledOrdersCountQuery = appliedCancelledStatusFilters
    ?.filter((status) => {
      return filterValues?.primaryStatus?.values?.includes(status);
    })
    ?.map((statusValue) => orderStatusToKontentAiCodenameMap[statusValue]);
  const cancelledOrdersCountQueryState = useGetQuotesCountQuery(
    {
      filters: [
        ...filters.filter(
          (obj) => obj?.filterElement !== "filter.quote.status",
        ),
        ...(statusFilterForCancelledOrdersCountQuery?.length
          ? ([
              {
                filterElement: "filter.quote.status",
                filterValue: statusFilterForCancelledOrdersCountQuery,
              },
            ] as FilterObjType[])
          : ([
              {
                filterElement: "filter.quote.status",
                filterValue: appliedCancelledStatusFilters,
              },
            ] as FilterObjType[])),
      ],
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !appliedCancelledStatusFilters.length || role !== "admin",
    },
  );

  const pendingOrdersCount: number = useMemo(() => {
    return pendingOrdersCountQueryState.data?.meta?.pagination?.total || 0;
  }, [pendingOrdersCountQueryState.data?.meta?.pagination?.total]);

  const acceptedOrdersCount: number = useMemo(() => {
    return acceptedOrdersCountQueryState.data?.meta?.pagination?.total || 0;
  }, [acceptedOrdersCountQueryState.data?.meta?.pagination?.total]);

  const cancelledOrdersCount: number = useMemo(() => {
    return cancelledOrdersCountQueryState.data?.meta?.pagination?.total || 0;
  }, [cancelledOrdersCountQueryState.data?.meta?.pagination?.total]);

  const allOrdersCount: number = useMemo(() => {
    return allOrdersCountQueryState?.data?.meta?.pagination?.total || 0;
  }, [allOrdersCountQueryState?.data?.meta?.pagination?.total]);

  const myOrdersCount: number = useMemo(() => {
    return myOrdersCountQueryState?.data?.meta?.pagination?.total || 0;
  }, [myOrdersCountQueryState?.data?.meta?.pagination?.total]);

  const isLoading = useMemo(
    () =>
      pendingOrdersCountQueryState.isLoading ||
      acceptedOrdersCountQueryState.isLoading ||
      cancelledOrdersCountQueryState.isLoading ||
      myOrdersCountQueryState.isLoading,
    [
      acceptedOrdersCountQueryState.isLoading,
      cancelledOrdersCountQueryState.isLoading,
      pendingOrdersCountQueryState.isLoading,
      myOrdersCountQueryState.isLoading,
    ],
  );

  const getOrdersTotalCountQueryState = useGetQuotesCountQuery({
    filters: [...filters],
  });

  const getOrdersCurrentCount = (() => {
    let count = 0;
    if (!getOrdersTotalCountQueryState?.isLoading) {
      count = getOrdersTotalCountQueryState?.data?.meta?.pagination?.total || 0;
    }
    return count;
  })();

  const providerValue = useMemo(
    () => ({
      //   newQuoteById,
      //   selectedGroup,
      getOrdersQueryState,

      isLoading,
      allOrdersCount: allOrdersCount || 0,
      pendingOrdersCount: pendingOrdersCount || 0,
      acceptedOrdersCount: acceptedOrdersCount || 0,
      cancelledOrdersCount: cancelledOrdersCount || 0,
      getOrdersCurrentCount: getOrdersCurrentCount || 0,
      myOrdersCount: myOrdersCount || 0,
    }),
    [
      acceptedOrdersCount,

      allOrdersCount,
      cancelledOrdersCount,
      getOrdersQueryState,
      isLoading,
      pendingOrdersCount,
      getOrdersCurrentCount,
      myOrdersCount,
    ],
  );

  return (
    //@ts-ignore
    <MyOrdersPageContext.Provider value={providerValue}>
      {props.children}
    </MyOrdersPageContext.Provider>
  );
}
