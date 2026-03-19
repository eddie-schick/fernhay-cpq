import { CircularProgress } from "@mui/material";

import { MY_ORDERS_FILTERS } from "~/constants/constants";

import { useAppDispatch, useAppSelector } from "~/store";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

import MuiBox from "~/components/shared/mui-box/mui-box";

import CheckboxFilterWithSearchAndRecent from "../checkbox-filter-with-search-and-recent";

function BOMIDFilters() {
  const { filterValues } = useAppSelector(myOrdersSelector);

  // const orderNoSearch = useAppSelector((state: RootState) =>
  //   orderNoSearchTextSelector(state)
  // );
  // const { orderNos: filteredOrderNos, isLoading } =
  // 	useOrderNumberQuery(orderNoSearch);

  const isLoading = false;

  const dispatch = useAppDispatch();

  const setBOMIDSearchText = (search: string) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.BOM_ID,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.BOM_ID],
          searchText: search,
        },
      })
    );
  };

  const setSelectedOrderNumbers = (values: string[]) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.BOM_ID,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.BOM_ID],
          values,
          recentValues: Array.from(
            new Set([
              ...(filterValues[MY_ORDERS_FILTERS.BOM_ID]
                .recentValues as string[]),
              ...values,
            ])
          ),
        },
      })
    );
  };
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
    <CheckboxFilterWithSearchAndRecent<string>
      searchbar={{
        search: filterValues[MY_ORDERS_FILTERS.BOM_ID].searchText || "",
        onSearch: (search: string) => {
          setBOMIDSearchText(search);
        },
        placeholder: "Search for BOM ID#",
        // autocompleteItems: filteredOrderNos as string[],
        autocompleteItems: ["test"] as string[], // needs to be replaced by above value once apis are completed
        getAutocompleteItemLabel: (item: string) => item,
      }}
      recentSearched={
        filterValues[MY_ORDERS_FILTERS.BOM_ID].recentValues as string[]
      }
      getRecentItemLabel={(item: string) => item}
      onFilterUpdate={(values) => {
        setSelectedOrderNumbers(values);
      }}
      selectedOptions={filterValues[MY_ORDERS_FILTERS.BOM_ID].values}
    />
  );
}

export default BOMIDFilters;
