import { useMemo } from "react";

import { CircularProgress } from "@mui/material";

import { MY_ORDERS_FILTERS } from "~/constants/constants";

import { FilterTypes } from "~/helpers/kontent-ai-helpers";

import { useAppDispatch, useAppSelector } from "~/store";
import { useGetAllOEMOrderNosQuery } from "~/store/endpoints/quotes/quotes";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "~/components/shared/mui-box/mui-box";

import CheckboxFilterWithSearchAndRecent from "../checkbox-filter-with-search-and-recent";

const orderNoFieldName = "formattedId";
type ResponseObjectType = {
  id: string | number;
  orderNo?: string;
  [orderNoFieldName]?: string;
};

function OEMOrderFilters() {
  const { filterValues } = useAppSelector(myOrdersSelector);
  const { user, role } = useAuthContextValue();
  const userEmailDomain = user?.user ? user?.user?.email.split("@")[1] : "";

  // const orderNoSearch = useAppSelector((state: RootState) =>
  //   orderNoSearchTextSelector(state)
  // );
  // const { orderNos: filteredOrderNos, isLoading } =
  // 	useOrderNumberQuery(orderNoSearch);

  const roleFilters = [];

  if (role !== "admin") {
    roleFilters.push({
      filterType: FilterTypes.EQUALS_FILTER,
      filterElement: "elements.user_email_domain",
      filterValue: userEmailDomain,
    });
  }

  const orderNoQueryState = useGetAllOEMOrderNosQuery(
    {
      filters: roleFilters,
    },
    {
      refetchOnMountOrArgChange: false,
    },
  );

  const searchText = filterValues[MY_ORDERS_FILTERS.OEM_NO].searchText || "";

  const filteredOrderNos: (string | undefined)[] = useMemo(
    () => [
      ...new Set(
        (orderNoQueryState?.data?.data as string[])?.filter(
          (item) => item.includes(searchText) && item !== "",
        ),
      ),
    ],
    [orderNoQueryState?.data?.data, searchText],
  );

  console.log("filters", orderNoQueryState?.data?.data, filteredOrderNos);

  const dispatch = useAppDispatch();

  const setOEMNumberSearchText = (search: string) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.QUOTE_NO,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.OEM_NO],
          searchText: search,
        },
      }),
    );
  };

  const setSelectedOrderNumbers = (values: string[]) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.OEM_NO,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.OEM_NO],
          values,
          recentValues: Array.from(
            new Set([
              ...(filterValues[MY_ORDERS_FILTERS.OEM_NO]
                .recentValues as string[]),
              ...values,
            ]),
          ),
        },
      }),
    );
  };
  return orderNoQueryState?.isLoading ? (
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
        search: filterValues[MY_ORDERS_FILTERS.OEM_NO].searchText || "",
        onSearch: (search: string) => {
          setOEMNumberSearchText(search);
        },
        placeholder: "Search for Order#",
        // autocompleteItems: filteredOrderNos as string[],
        autocompleteItems: filteredOrderNos as string[], // needs to be replaced by above value once apis are completed
        getAutocompleteItemLabel: (item: string) => item,
      }}
      recentSearched={
        filterValues[MY_ORDERS_FILTERS.OEM_NO].recentValues as string[]
      }
      getRecentItemLabel={(item: string) => item}
      onFilterUpdate={(values) => {
        setSelectedOrderNumbers(values);
      }}
      selectedOptions={filterValues[MY_ORDERS_FILTERS.OEM_NO].values}
    />
  );
}

export default OEMOrderFilters;
