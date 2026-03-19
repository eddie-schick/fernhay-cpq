import { useMemo } from "react";

import { CircularProgress } from "@mui/material";

import { MY_ORDERS_FILTERS } from "~/constants/constants";

import { FilterTypes } from "~/helpers/kontent-ai-helpers";

import { useAppDispatch, useAppSelector } from "~/store";
import { useGetAllQuoteNosQuery } from "~/store/endpoints/quotes/quotes";
import { myOrdersSelector, setFilters } from "~/store/slices/my-orders/slice";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "~/components/shared/mui-box/mui-box";

import CheckboxFilterWithSearchAndRecent from "../checkbox-filter-with-search-and-recent";

function QuoteNoFilters() {
  const { filterValues } = useAppSelector(myOrdersSelector);
  const { user, role } = useAuthContextValue();
  const userEmailDomain = user?.user ? user?.user?.email.split("@")[1] : "";

  const roleFilters = [];

  if (role !== "admin") {
    roleFilters.push({
      filterType: FilterTypes.EQUALS_FILTER,
      filterElement: "elements.user_email_domain",
      filterValue: userEmailDomain,
    });
  }

  const quoteNoQueryState = useGetAllQuoteNosQuery(
    {
      filters: roleFilters,
    },
    {
      refetchOnMountOrArgChange: false,
    }
  );

  const searchText = filterValues[MY_ORDERS_FILTERS.QUOTE_NO].searchText || "";

  const filteredQuoteNos: (string | undefined)[] = useMemo(
    () => [
      ...new Set(
        (quoteNoQueryState?.data?.data as string[])?.filter(
          (item) => item.includes(searchText) && item !== ""
        )
      ),
    ],
    [quoteNoQueryState?.data?.data, searchText]
  );

  const dispatch = useAppDispatch();

  const setQuoteNumberSearchText = (search: string) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.QUOTE_NO,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.QUOTE_NO],
          searchText: search,
        },
      })
    );
  };

  const setSelectedQuoteNumbers = (values: string[]) => {
    dispatch(
      setFilters({
        filterId: MY_ORDERS_FILTERS.QUOTE_NO,
        data: {
          ...filterValues[MY_ORDERS_FILTERS.QUOTE_NO],
          values,
          recentValues: Array.from(
            new Set([
              ...(filterValues[MY_ORDERS_FILTERS.QUOTE_NO]
                .recentValues as string[]),
              ...values,
            ])
          ),
        },
      })
    );
  };
  return quoteNoQueryState?.isLoading ? (
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
        search: filterValues[MY_ORDERS_FILTERS.QUOTE_NO].searchText || "",
        onSearch: (search: string) => {
          setQuoteNumberSearchText(search);
        },
        placeholder: "Search for Quote#",
        // autocompleteItems: filteredOrderNos as string[],
        autocompleteItems: filteredQuoteNos as string[], // needs to be replaced by above value once apis are completed
        getAutocompleteItemLabel: (item: string) => item,
      }}
      recentSearched={
        filterValues[MY_ORDERS_FILTERS.QUOTE_NO].recentValues as string[]
      }
      getRecentItemLabel={(item: string) => item}
      onFilterUpdate={(values) => {
        setSelectedQuoteNumbers(values);
      }}
      selectedOptions={filterValues[MY_ORDERS_FILTERS.QUOTE_NO].values}
    />
  );
}

export default QuoteNoFilters;
