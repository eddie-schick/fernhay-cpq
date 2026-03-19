import { useMemo } from "react";

import {
  Box,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Theme,
  Typography,
  styled,
  Checkbox,
} from "@mui/material";

import { MY_ORDERS_FILTERS } from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { QuoteOrder200ResponseSchema } from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import { useGetDistinctValuesQuery } from "~/store/endpoints/quotes/quotes";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

import MuiBox from "~/components/shared/mui-box/mui-box";

import useMyOrdersFilters from "../hooks/use-my-orders-filters";

import CheckBoxFilter from "./checkbox-filter";

function CustomerNameFilter() {
  const customerNameQueryState = useGetDistinctValuesQuery(
    {
      field: "customerName",
      headers: {
        Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
      },
    },
    {
      refetchOnMountOrArgChange: false,
    },
  );

  const customers = useMemo(() => {
    let fetchedCustomers: string[] = [];
    if (customerNameQueryState?.isSuccess) {
      fetchedCustomers = (customerNameQueryState?.data ||
        []) as unknown as string[];
    }

    return fetchedCustomers;
  }, [customerNameQueryState?.data, customerNameQueryState?.isSuccess]);

  const dispatch = useAppDispatch();
  const { filterValues: filterState } = useAppSelector(myOrdersSelector);
  const myOrdersState = useAppSelector(myOrdersSelector);

  const { onCheckboxClick } = useMyOrdersFilters(
    MY_ORDERS_FILTERS.CUSTOMER_NAME,
  );

  console.log(
    "customers new",
    myOrdersState.filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values,
    customers,
  );

  const renderUI = () => {
    if (customerNameQueryState?.isLoading) {
      return (
        <MuiBox
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <CircularProgress size={24} />
        </MuiBox>
      );
    }

    if (customerNameQueryState?.isError) {
      return (
        <Typography sx={(theme) => ({ color: theme.palette.custom.redHover })}>
          Error fetching data
        </Typography>
      );
    }

    return (
      <CustomerTypeFilterStyled>
        <FormGroup className="checkbox-filter">
          {customers.map((customer, index) => {
            return (
              <FormControlLabel
                id={`status-filter-option--${customer}`}
                key={index}
                className="checkbox-container"
                control={
                  <Checkbox
                    sx={(theme: Theme) => ({
                      "& .MuiSvgIcon-root": {
                        fontSize: 20,
                        fill: theme.palette.primary.main,
                      },
                    })}
                    className="checkbox"
                    checked={myOrdersState.filterValues[
                      MY_ORDERS_FILTERS.CUSTOMER_NAME
                    ].values.includes(customer)}
                    onChange={(e) => {
                      onCheckboxClick(e, customer);
                    }}
                  />
                }
                label={customer}
              />
            );
          })}
        </FormGroup>
      </CustomerTypeFilterStyled>
    );
  };

  return <>{renderUI()}</>;
}

export default CustomerNameFilter;

const CustomerTypeFilterStyled = styled(Box)(({ theme }) => ({
  ".checkbox-filter": {
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",

    ".checkbox-container": {
      display: "flex",
      gap: "0.5rem",
      flexDirection: "row",
      alignItems: "center",

      ".checkbox-text": {
        color: [theme.palette.primary.light],
      },

      ".checkbox.Mui-checked": {
        color: `${theme.palette.primary.main} !important`,
      },

      ".checkbox": {
        color: [theme.palette.primary.main],

        "&.Mui-checked": {
          color: [theme.palette.primary.main],
        },
      },

      ".MuiFormControlLabel-label": {
        fontSize: "0.875rem",
        color: [theme.palette.custom.accentBlack],
      },

      ".MuiCheckbox-root": {
        padding: "0rem !important",
      },
    },
  },
}));

const getCustomerCheckboxes = (
  customers: QuoteOrder200ResponseSchema["customer"][],
  selectedCustomers: QuoteOrder200ResponseSchema["customer"]["id"][],
) => {
  const checks = customers.map((customer) => ({
    id: customer.id,
    title: customer.buyerName,
    isChecked: selectedCustomers.includes(customer.id),

    kontentAi__item__codename:
      customer?.customer__kontentAi__codename as string,
  }));
  // console.log("Checks", { checks });
  return checks;
};
