import React from "react";

import { TablePagination, Theme, styled, useMediaQuery } from "@mui/material";

import { QuoteOrder200ResponseSchema } from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  myOrdersSelector,
  resetPagination,
  setPaginationData,
  setSearch,
} from "~/store/slices/my-orders/slice";

import { useMyOrdersPageContextValue } from "~/context/my-orders-page-context";

import MuiBox from "~/components/shared/mui-box/mui-box";
import Searchbar from "~/components/shared/search-bar/search-bar";

import MyOrdersFilters from "./my-orders-filters";
import MyOrdersSortSelect from "./my-orders-sort-select";

// eslint-disable-next-line react-refresh/only-export-components
const MyOrdersToolbar = ({
  totalFuzzyOrdersCount,
}: {
  totalFuzzyOrdersCount: number;
  fuzzySearchedOrders: QuoteOrder200ResponseSchema[];
}) => {
  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );

  const { paginationData, mainTableSearchText, selectedTab } =
    useAppSelector(myOrdersSelector);
  const dispatch = useAppDispatch();

  const {
    allOrdersCount,
    pendingOrdersCount,
    acceptedOrdersCount,
    cancelledOrdersCount,
    myOrdersCount,
    getOrdersQueryState,
    allVinsQueryState,
  } = useMyOrdersPageContextValue();

  const getPaginationCount = () => {
    if (mainTableSearchText.length > 0) {
      return totalFuzzyOrdersCount;
    }
    switch (selectedTab) {
      case "All":
        return allOrdersCount || 0;
      case "Pending":
        return pendingOrdersCount || 0;
      case "Accepted":
        return acceptedOrdersCount || 0;
      case "Manage Orders":
        return myOrdersCount || 0;
      default:
        return cancelledOrdersCount || 0;
    }
  };

  const onPaginationChange = (
    _e: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    page: number,
  ) => {
    dispatch(
      setPaginationData({
        ...paginationData,
        page,
      }),
    );

    void getOrdersQueryState?.refetch();
    void allVinsQueryState?.refetch();
  };

  return (
    <ToolbarContainer>
      {!isTablet && (
        <>
          <MyOrdersFilters />
          <RightSide>
            <Searchbar
              search={mainTableSearchText}
              id="desktop-my-orders-search"
              onSearch={(newSearch) => {
                console.log("newSearch", newSearch);
                dispatch(resetPagination());
                dispatch(setSearch(newSearch));
                // dispatch(setSearch(newSearch));
              }}
              placeholder="Search by quote ID, customer name..."
            />
            <MyOrdersSortSelect id="tablet-my-orders-sort" />

            <TablePagination
              page={paginationData.page ?? 0}
              count={getPaginationCount()}
              onPageChange={onPaginationChange}
              rowsPerPage={paginationData.pageSize || 20}
              rowsPerPageOptions={[]}
            />
          </RightSide>
        </>
      )}
      {isTablet && (
        <>
          <MuiBox className="toolbar-header--tablet">
            <MyOrdersFilters />
            <MyOrdersSortSelect id="tablet-my-orders-sort" />
          </MuiBox>
          <Searchbar
            search={mainTableSearchText}
            onSearch={(newSearch) => {
              console.log("newSearch", newSearch);
              dispatch(setSearch(newSearch));
              // dispatch(setSearch(newSearch));
            }}
            id="tablet-my-orders-search"
            placeholder="Search by quote ID, customer name..."
          />
          <StyledTablePagination
            page={paginationData.page ?? 0}
            count={
              mainTableSearchText.length > 0
                ? totalFuzzyOrdersCount
                : selectedTab === "All"
                ? allOrdersCount || 0
                : selectedTab === "Pending"
                ? pendingOrdersCount || 0
                : selectedTab === "Accepted"
                ? acceptedOrdersCount || 0
                : cancelledOrdersCount || 0
            }
            onPageChange={onPaginationChange}
            rowsPerPage={paginationData.pageSize || 20}
            rowsPerPageOptions={[]}
          />
        </>
      )}
    </ToolbarContainer>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export default React.memo(MyOrdersToolbar);

// eslint-disable-next-line react-refresh/only-export-components
const StyledTablePagination = styled(TablePagination)(() => ({
  minWidth: "unset",
}));

// eslint-disable-next-line react-refresh/only-export-components
const ToolbarContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingInline: "1.4rem",

  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
    paddingInline: "1rem",
  },

  ".toolbar-header--tablet": {
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: "0.75rem",
  },

  ".MuiTablePagination-root": {
    border: 0,
    minWidth: "unset",
    [theme.breakpoints.down("lg")]: {
      alignSelf: "flex-end",
    },
  },

  ".MuiTablePagination-displayedRows": {
    fontSize: "0.875rem !important",
  },
  ".MuiTablePagination-toolbar": {
    paddingLeft: "0px !important",
  },

  ".MuiTablePagination-actions": {
    marginLeft: "0rem !important",
  },

  ".MuiTablePagination-actions .MuiIconButton-root": {
    padding: "0rem",
  },

  ".MuiTablePagination-actions .MuiSvgIcon-root": {
    width: "1.4rem",
    height: "1.4rem",
  },
}));

// eslint-disable-next-line react-refresh/only-export-components
const RightSide = styled(MuiBox)(() => ({
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",

  ".MuiTablePagination-displayedRows": {
    fontSize: "1rem",
  },

  ".MuiTablePagination-actions": {
    marginLeft: "0rem !important",
  },

  ".MuiTablePagination-actions .MuiIconButton-root": {
    padding: "0rem",
  },

  ".MuiTablePagination-actions .MuiSvgIcon-root": {
    width: "1.4rem",
    height: "1.4rem",
  },
  ".MuiTablePagination-root": {
    borderBottom: "none",
  },
}));
