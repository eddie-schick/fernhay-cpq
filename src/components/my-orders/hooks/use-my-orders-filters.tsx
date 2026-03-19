import React from "react";

import { MY_ORDERS_FILTERS } from "~/constants/constants";

import { useAppDispatch, useAppSelector } from "~/store";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

export default function useMyOrdersFilters(
  filter_type: (typeof MY_ORDERS_FILTERS)[keyof typeof MY_ORDERS_FILTERS],
) {
  let onCheckboxClick: (
    e: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => void;

  const state = useAppSelector(myOrdersSelector);
  const dispatch = useAppDispatch();

  switch (filter_type) {
    case MY_ORDERS_FILTERS.STATUS: {
      onCheckboxClick = (e, value) => {
        if (
          !state.filterValues[MY_ORDERS_FILTERS.STATUS].values.includes(value)
        ) {
          dispatch(
            setFilters({
              filterId: MY_ORDERS_FILTERS.STATUS,
              data: {
                values: [
                  ...state.filterValues[MY_ORDERS_FILTERS.STATUS].values,
                  value,
                ],
              },
            }),
          );
        } else {
          dispatch(
            setFilters({
              filterId: MY_ORDERS_FILTERS.STATUS,
              data: {
                values: state.filterValues[
                  MY_ORDERS_FILTERS.STATUS
                ].values.filter((filterValue) => filterValue !== value),
              },
            }),
          );
        }
      };
      break;
    }
    case MY_ORDERS_FILTERS.CUSTOMER_NAME: {
      onCheckboxClick = (e, value) => {
        if (
          !state.filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values.includes(
            value,
          )
        ) {
          dispatch(
            setFilters({
              filterId: MY_ORDERS_FILTERS.CUSTOMER_NAME,
              data: {
                values: [
                  ...state.filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values,
                  value,
                ],
              },
            }),
          );
        } else {
          dispatch(
            setFilters({
              filterId: MY_ORDERS_FILTERS.CUSTOMER_NAME,
              data: {
                values: state.filterValues[
                  MY_ORDERS_FILTERS.CUSTOMER_NAME
                ].values.filter((filterValue) => filterValue !== value),
              },
            }),
          );
        }
      };
      break;
    }

    default:
      throw new Error("Invalid filterType provided");
  }

  //@ts-ignore
  const onCheckboxClickWrapper = (...args) => {
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return onCheckboxClick(...args);
  };

  return {
    onCheckboxClick: onCheckboxClickWrapper,
  };
}
