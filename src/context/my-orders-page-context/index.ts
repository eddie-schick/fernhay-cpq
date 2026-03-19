import { TypedUseQueryHookResult } from "@reduxjs/toolkit/query/react";
import { createContext, useContext } from "react";

import { FilterObjType } from "~/helpers/kontent-ai-helpers";

import { AxiosBaseQueryFnType } from "~/store/api-slice";
import { GetQuotesResultType } from "~/store/endpoints/quotes/quotes";

export type GetVinsResultType = TypedUseQueryHookResult<
  { data: { vin: string; id: string }[] },
  { filters?: FilterObjType[] | [] },
  AxiosBaseQueryFnType
>;

type InitialValuesType = {
  acceptedOrdersCount: number;
  allOrdersCount: number;
  cancelledOrdersCount: number;
  getOrdersQueryState: GetQuotesResultType | null;
  allVinsQueryState: GetVinsResultType | null;
  isLoading: boolean;
  pendingOrdersCount: number;
  getOrdersCurrentCount: number;
  myOrdersCount: number;
  allVins: { id: string; vin: string }[];
  setAllVins?: React.Dispatch<
    React.SetStateAction<
      {
        id: string;
        vin: string;
      }[]
    >
  >;
};
export const initialValue: InitialValuesType = {
  getOrdersQueryState: null,
  allVinsQueryState: null,
  acceptedOrdersCount: 0,
  allOrdersCount: 0,
  cancelledOrdersCount: 0,
  isLoading: false,
  pendingOrdersCount: 0,
  getOrdersCurrentCount: 0,
  myOrdersCount: 0,
  allVins: [],
};

export const MyOrdersPageContext = createContext(initialValue);

export const useMyOrdersPageContextValue = () =>
  useContext(MyOrdersPageContext);
