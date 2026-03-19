import { useState } from "react";

import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Theme,
  styled,
} from "@mui/material";

import {
  MY_ORDERS_FILTERS,
  MY_ORDERS_TABS,
  QUOTE_ORDER_STATUSES,
} from "~/constants/constants";

import { useAppSelector } from "~/store";
import { myOrdersSelector } from "~/store/slices/my-orders/slice";

import useMyOrdersFilters from "~/components/my-orders/hooks/use-my-orders-filters";

const StatusFilter = () => {
  const myOrdersState = useAppSelector(myOrdersSelector);

  type StatusKey = keyof typeof QUOTE_ORDER_STATUSES;

  let initialFilterContent: string[] = Object.keys(QUOTE_ORDER_STATUSES).map(
    (key) => QUOTE_ORDER_STATUSES[key as StatusKey],
  );

  initialFilterContent = initialFilterContent.filter((content) =>
    myOrdersState.selectedTab === MY_ORDERS_TABS.PENDING
      ? content === "Quote Generated"
      : myOrdersState.selectedTab === MY_ORDERS_TABS.ACCEPTED
        ? [
            "Delivered",
            "In Production",
            "In Transit",
            "Order Processing",
          ].includes(content)
        : content,
  );

  const [testFilterContent] = useState<string[]>(initialFilterContent);

  const { onCheckboxClick } = useMyOrdersFilters(MY_ORDERS_FILTERS.STATUS);

  return (
    <StatusTypeFilterStyled>
      <FormGroup className="checkbox-filter">
        {testFilterContent.map((type, index) => {
          return (
            <FormControlLabel
              id={`status-filter-option--${type}`}
              key={index}
              className="checkbox-container"
              control={
                <Checkbox
                  sx={(theme: Theme) => ({
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                      fill: myOrdersState.filterValues[
                        MY_ORDERS_FILTERS.STATUS
                      ].values.includes(type)
                        ? theme.palette.primary.main
                        : theme.palette.primary.main,
                    },
                  })}
                  className="checkbox"
                  checked={myOrdersState.filterValues[
                    MY_ORDERS_FILTERS.STATUS
                  ].values.includes(type)}
                  onChange={(e) => {
                    onCheckboxClick(e, type);
                  }}
                />
              }
              label={type}
            />
          );
        })}
      </FormGroup>
    </StatusTypeFilterStyled>
  );
};

const StatusTypeFilterStyled = styled(Box)(({ theme }) => ({
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

export default StatusFilter;
