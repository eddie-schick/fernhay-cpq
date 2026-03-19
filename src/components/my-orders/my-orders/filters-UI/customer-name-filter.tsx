import { CircularProgress } from "@mui/material";

import { MY_ORDERS_FILTERS } from "~/constants/constants";

import { QuoteOrder200ResponseSchema } from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

import useCustomersNameQuery from "~/components/my-orders/hooks/use-customer-name-query";
import MuiBox from "~/components/shared/mui-box/mui-box";

import CheckBoxFilter from "./checkbox-filter";

function CustomerNameFilter() {
  const { customers, isLoading } = useCustomersNameQuery();

  const dispatch = useAppDispatch();
  const { filterValues: filterState } = useAppSelector(myOrdersSelector);

  return isLoading ? (
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
  ) : (
    <CheckBoxFilter
      id="customer-name"
      content={getCustomerCheckboxes(
        customers,
        filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME].values.map(
          (customer) => customer.id
        )
      )}
      onCheckboxChange={(checked, id, title, kontentAi__item__codename) => {
        dispatch(
          setFilters({
            filterId: MY_ORDERS_FILTERS.CUSTOMER_NAME,
            data: {
              //@ts-ignore
              values: checked
                ? [
                    ...filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME].values,
                    { id, title, kontentAi__item__codename },
                  ]
                : (filterState[MY_ORDERS_FILTERS.CUSTOMER_NAME].values.filter(
                    (user) => user.id !== id
                  ) as {
                    id: number;
                    title: string;
                    kontentAi__item__codename: string;
                  }[]),
            },
          })
        );
      }}
    />
  );
}

export default CustomerNameFilter;

const getCustomerCheckboxes = (
  customers: QuoteOrder200ResponseSchema["customer"][],
  selectedCustomers: QuoteOrder200ResponseSchema["customer"]["id"][]
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
