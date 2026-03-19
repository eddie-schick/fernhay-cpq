import { MenuItem, Select, styled } from "@mui/material";

import { MY_ORDER_SORT_BY_VALUES } from "~/constants/constants";

import { OrderByType } from "~/helpers/kontent-ai-helpers";

import { useAppDispatch, useAppSelector } from "~/store";
import { myOrdersSelector, setSortBy } from "~/store/slices/my-orders/slice";

function MyOrdersSortSelect({ id = "" }: { id?: string }) {
  const { mainTableSortBy } = useAppSelector(myOrdersSelector);
  const dispatch = useAppDispatch();

  return (
    <StyledSelect
      renderValue={(value: string) => (
        <RenderValue>
          <span className="render-value-text">Sort By:</span>{" "}
          {value === MY_ORDER_SORT_BY_VALUES.RECENT ? "Recent" : "Oldest"}
        </RenderValue>
      )}
      displayEmpty
      value={mainTableSortBy}
      defaultValue={MY_ORDER_SORT_BY_VALUES.RECENT}
      onChange={(e) => {
        dispatch(setSortBy(e.target.value as OrderByType["sortOrder"]));
      }}
      id={id}
    >
      <StyledMenuItem
        id={`${id}-recent`}
        value={MY_ORDER_SORT_BY_VALUES.RECENT}
      >
        Recent
      </StyledMenuItem>
      <StyledMenuItem
        id={`${id}-oldest`}
        value={MY_ORDER_SORT_BY_VALUES.OLDEST}
      >
        Oldest
      </StyledMenuItem>
    </StyledSelect>
  );
}

export default MyOrdersSortSelect;

const StyledMenuItem = styled(MenuItem)(() => ({
  "&.MuiMenuItem-root": {
    fontSize: "0.875rem !important",
  },
}));

const StyledSelect = styled(Select<string>)(({ theme }) => ({
  padding: 0,
  minWidth: "9rem",
  [theme.breakpoints.down("lg")]: {
    height: "2.5rem",
    marginLeft: "auto",
    marginTop: "auto",
    marginBottom: "auto",
  },

  ".MuiSelect-outlined": {
    padding: "0.5rem 0.75rem",
    borderRadius: "5px",
    [theme.breakpoints.down("lg")]: {
      padding: "4px 8px",
    },
  },

  ".render-value-text": {
    [theme.breakpoints.down("sm")]: {},
  },

  fieldset: {
    borderColor: theme.palette.custom.tertiary,
  },
}));

const RenderValue = styled("div")(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: "0.875rem",

  span: {
    color: "black",
  },
}));
