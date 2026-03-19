import {
  IContentItem,
  IContentItemElements,
  MultipleItemsQuery,
} from "@kontent-ai/delivery-sdk";

const FilterTypes = {
  EQUALS_FILTER: "equalsFilter",
  IN_FILTER: "inFilter",
  GREATER_THAN_FILTER: "greaterThanFilter",
  GREATER_THAN_OR_EQUAL_FILTER: "greaterThanOrEqualFilter",
  LESS_THAN_FILTER: "lessThanFilter",
  LESS_THAN_OR_EQUAL_FILTER: "lessThanOrEqualFilter",
  RANGE_FILTER: "rangeFilter",
  CONTAINS_FILTER: "containsFilter",
  ALL_FILTER: "allFilter",
  ANY_FILTER: "anyFilter",
  NOT_EMPTY_FILTER: "notEmptyFilter",
  NOT_EQUALS_FILTER: "notEqualsFilter",
  NOT_IN_FILTER: "notInFilter",
} as const;

export type FilterObjType = {
  filterType?: (typeof FilterTypes)[keyof typeof FilterTypes];
  filterElement: string;
  filterValue: string | string[] | number;
};

export type OrderByType = {
  orderElement: string;
  sortOrder: "asc" | "desc";
};

export type PaginationObjType = {
  skip: number;
  limit: number;
};

export type KontentAiApiParams = {
  filters?: FilterObjType[];
  orderBy?: OrderByType;
  paginationData?: PaginationObjType;
  elements?: string[];
  depth?: number;
};

function getKontentAiFiltersAppliedToQuery<
  T extends IContentItem<IContentItemElements>,
>(
  multipleItemsQuery: MultipleItemsQuery<T>,
  filterObj: FilterObjType,
): MultipleItemsQuery<T> {
  let query = multipleItemsQuery;

  switch (filterObj.filterType) {
    case "equalsFilter":
      query = query.equalsFilter(
        filterObj?.filterElement,
        String(filterObj?.filterValue),
      );
      break;
    case "inFilter":
      query = query.inFilter(
        filterObj?.filterElement,
        filterObj?.filterValue as string[],
      );
      break;
    case "containsFilter":
      query = query.containsFilter(
        filterObj?.filterElement,
        filterObj?.filterValue as string[],
      );
      break;
    case "allFilter":
      query = query.allFilter(
        filterObj?.filterElement,
        filterObj?.filterValue as string[],
      );
      break;
    case "anyFilter":
      query = query.anyFilter(
        filterObj?.filterElement,
        filterObj?.filterValue as string[],
      );
      break;
    default:
      throw new Error("Invalid filter type provided!");
  }

  return query;
}

export { FilterTypes, getKontentAiFiltersAppliedToQuery };
