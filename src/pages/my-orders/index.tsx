import Fuse from "fuse.js";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";

import { styled } from "@mui/material";

import { QuoteOrder200ResponseSchema } from "~/global/types/types";

import { useAppSelector } from "~/store";
import {
  myOrdersSelector,
  setPaginationData,
} from "~/store/slices/my-orders/slice";

import { useMyOrdersPageContextValue } from "~/context/my-orders-page-context";

import MyOrdersTable from "~/components/my-orders/my-orders-table";
import MyOrdersTabs from "~/components/my-orders/my-orders-tabs";
import MyOrdersToolbar from "~/components/my-orders/my-orders-toolbar";
import MuiBox from "~/components/shared/mui-box/mui-box";

const MyOrders = () => {
  const dispatch = useDispatch();

  const { getOrdersQueryState } = useMyOrdersPageContextValue();

  const { paginationData, mainTableSearchText, orders } =
    useAppSelector(myOrdersSelector);

  const fuzzySearchedOrders: {
    finalSearchOutcome: QuoteOrder200ResponseSchema[] | [];
    totalFuzzyCount: number;
  } = useMemo(() => {
    const fuseOptions = {
      keys: ["formattedId", "customer.buyerName"],
      threshold: 0.2,
    };

    const fuse = new Fuse(orders, fuseOptions);
    if (mainTableSearchText.length > 0) {
      const searchOutcome = fuse.search(mainTableSearchText, {
        limit: 500,
      });

      const mappedOutcome = searchOutcome.map(
        (searchedObj) => searchedObj.item,
      );

      const finalSearchOutcome = mappedOutcome.filter(
        (sObj, idx) =>
          idx >= paginationData?.page * 20 &&
          idx < paginationData?.page * 20 + 20,
      );

      return { finalSearchOutcome, totalFuzzyCount: mappedOutcome.length };
    }
    return { finalSearchOutcome: [], totalFuzzyCount: 0 };
  }, [mainTableSearchText, orders, paginationData?.page]);

  useEffect(() => {
    if (
      fuzzySearchedOrders?.finalSearchOutcome.length === 0 &&
      mainTableSearchText.length > 0
    ) {
      dispatch(
        setPaginationData({
          page: 0,
          pageSize: 20,
        }),
      );
    }
  }, [
    fuzzySearchedOrders?.finalSearchOutcome.length,
    dispatch,
    mainTableSearchText.length,
  ]);

  return (
    <MyOrdersStyled>
      <MuiBox className="my-orders__container">
        <MyOrdersTabs />
        <MyOrdersToolbar
          totalFuzzyOrdersCount={fuzzySearchedOrders?.totalFuzzyCount}
          fuzzySearchedOrders={fuzzySearchedOrders?.finalSearchOutcome}
        />
        <MyOrdersTable
          getOrdersQueryState={getOrdersQueryState}
          orders={orders}
          fuzzySearchedOrders={fuzzySearchedOrders?.finalSearchOutcome}
        />
      </MuiBox>
    </MyOrdersStyled>
  );
};

const MyOrdersStyled = styled(MuiBox)(({ theme }) => ({
  padding: "1.5rem",
  height: "calc(100vh - 64px)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  ".my-orders__container": {
    padding: "1.5rem 0rem",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    borderRadius: "10px",
    gap: "1.5rem",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    overflow: "hidden",

    [theme.breakpoints.down("md")]: {
      gap: "0.5rem",
    },
  },
}));

export default MyOrders;
