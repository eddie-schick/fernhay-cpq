import { useContext } from "react";

import { CircularProgress, Tab, Tabs, Typography, styled } from "@mui/material";

import {
  DEALER_ORDERS_TABS,
  MY_ORDERS_FILTERS,
  MY_ORDERS_TABS,
} from "~/constants/constants";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  myOrdersSelector,
  setFilters,
  setSelectedTab,
} from "~/store/slices/my-orders/slice";

import { AuthContextFactory } from "~/context/auth-context/auth-context";
import { useMyOrdersPageContextValue } from "~/context/my-orders-page-context";

import MuiBox from "../shared/mui-box/mui-box";

const MyOrdersTabs = () => {
  const dispatch = useAppDispatch();

  const { selectedTab } = useAppSelector(myOrdersSelector);

  const orderContext = useMyOrdersPageContextValue();

  const {
    acceptedOrdersCount,
    pendingOrdersCount,
    allOrdersCount,
    myOrdersCount,
    cancelledOrdersCount,
    isLoading,
  } = orderContext;

  const { role } = useContext(AuthContextFactory);

  return (
    <MyOrdersTabsStyled>
      <Tabs
        variant="scrollable"
        scrollButtons={false}
        aria-label="scrollable prevent tabs example"
      >
        {role === "admin"
          ? Object.values(MY_ORDERS_TABS).map((tab, idx) => {
              return (
                <Tab
                  id={`my-orders-tab-${idx + 1}`}
                  value={tab}
                  key={tab.toLowerCase()}
                  label={
                    <MuiBox
                      className={`my-orders__tab-ui ${
                        tab === selectedTab ? "active-tab" : ""
                      }`}
                    >
                      <Typography
                        className={`my-orders__tab-ui-text ${
                          tab === selectedTab ? "active-text" : ""
                        }`}
                      >
                        {tab}
                      </Typography>
                      <Typography
                        className={`my-orders__tab-ui-count ${
                          tab === selectedTab ? "active-background" : ""
                        }`}
                      >
                        {isLoading ? (
                          <CircularProgress size={12} />
                        ) : tab === MY_ORDERS_TABS.ALL ? (
                          allOrdersCount
                        ) : tab === MY_ORDERS_TABS.PENDING ? (
                          pendingOrdersCount
                        ) : tab === MY_ORDERS_TABS.ACCEPTED ? (
                          acceptedOrdersCount
                        ) : tab === MY_ORDERS_TABS.CANCELLED ? (
                          cancelledOrdersCount
                        ) : null}
                      </Typography>
                    </MuiBox>
                  }
                  onClick={() => {
                    dispatch(setSelectedTab(tab));

                    // Reset status's filter only when tab's switched
                    dispatch(
                      setFilters({
                        filterId: MY_ORDERS_FILTERS.STATUS,
                        data: {
                          values: [],
                        },
                      }),
                    );
                    // props.onPaginationChange({
                    //   page: 0,
                    //   pageSize: 10,
                    // });
                  }}
                />
              );
            })
          : Object.values(DEALER_ORDERS_TABS).map((tab, idx) => {
              return (
                <Tab
                  id={`my-orders-tab-${idx + 1}`}
                  value={tab}
                  key={tab.toLowerCase()}
                  label={
                    <MuiBox
                      className={`my-orders__tab-ui ${
                        tab === selectedTab ? "active-tab" : ""
                      }`}
                    >
                      <Typography
                        className={`my-orders__tab-ui-text ${
                          tab === selectedTab ? "active-text" : ""
                        }`}
                      >
                        {tab}
                      </Typography>
                      <Typography
                        className={`my-orders__tab-ui-count ${
                          tab === selectedTab ? "active-background" : ""
                        }`}
                      >
                        {isLoading ? (
                          <CircularProgress size={12} />
                        ) : tab === DEALER_ORDERS_TABS.ALL ? (
                          allOrdersCount
                        ) : tab === DEALER_ORDERS_TABS.MY_ORDERS ? (
                          myOrdersCount
                        ) : null}
                      </Typography>
                    </MuiBox>
                  }
                  onClick={() => {
                    dispatch(setSelectedTab(tab));
                    // props.onPaginationChange({
                    //   page: 0,
                    //   pageSize: 10,
                    // });
                  }}
                />
              );
            })}
      </Tabs>
    </MyOrdersTabsStyled>
  );
};

const MyOrdersTabsStyled = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  paddingInline: "1.25rem",

  [theme.breakpoints.down("md")]: {
    paddingInline: "0.75rem",
  },

  ".MuiTab-root": {
    padding: "0rem 0.8rem",
    textTransform: "none",
    minWidth: "unset",
    fontSize: "1rem",

    [theme.breakpoints.down("sm")]: {
      padding: "0rem 0.5rem",
    },
  },

  ".my-orders__tab-ui": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    paddingBottom: "0.6rem",

    ".my-orders__tab-ui-text": {
      fontSize: "1rem",
      color: theme.palette.custom.lightGray,

      [theme.breakpoints.down("sm")]: {
        fontSize: "0.8rem",
      },
    },
    ".my-orders__tab-ui-count": {
      padding: "0.13rem 0.26rem",
      background: theme.palette.custom.tertiary,
      color: theme.palette.custom.lightGray,
      borderRadius: "0.3rem",
      fontSize: "0.875rem",

      [theme.breakpoints.down("sm")]: {
        fontSize: "0.8rem",
      },
    },
    ".active-text": {
      color: theme.palette.primary.main,
      fontWeight: "700",
    },
    ".active-background": {
      color: theme.palette.primary.main,
      background: theme.palette.custom.miscActiveColor,
      fontWeight: "700",
    },
  },
  ".active-tab": {
    borderBottom: `0.2rem solid ${theme.palette.primary.main}`,
  },
}));

export default MyOrdersTabs;
