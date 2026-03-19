import { useMemo, useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import {
  Badge,
  Button,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { MY_ORDERS_FILTERS, MY_ORDERS_TABS } from "~/constants/constants";

import { FilterIcon, FilterLogoHoverIcon } from "~/global/icons";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  clearFilters,
  myOrdersSelector,
  setFilters,
} from "~/store/slices/my-orders/slice";
import { rootSelector } from "~/store/slices/root/slice";

import FilterPopover from "../shared/filter-popover/filter-popover";
import FilterPopoverMobile from "../shared/filter-popover-mobile/filter-popover-mobile";
import MuiBox from "../shared/mui-box/mui-box";

import CustomerNameFilter from "./filters-UI/customer-name-filter";
import OEMOrderFilters from "./filters-UI/oem-order-filters";
import QuoteNoFilters from "./filters-UI/quote-no-filter";
import StatusFilter from "./filters-UI/status-filter";

type MyOrderFilterChip = {
  filterId: string;
  title: string;
  value: string;
};

function MyOrdersFilters() {
  const [selectedFilter, setSelectedFilter] = useState<string>(
    MY_ORDERS_FILTERS.OEM_NO,
  );
  const [addFilterAnchorEl, setAddFilterAnchorEl] = useState<
    (EventTarget & HTMLButtonElement) | null
  >(null);
  const { selectedTab, filterValues } = useAppSelector(myOrdersSelector);
  const { drawerState: drawerOpen } = useAppSelector(rootSelector);

  console.log("drawer status", drawerOpen);

  const dispatch = useAppDispatch();
  const [isFilterBtnHover, setIsFilterBtnHover] = useState<boolean>(false);

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const activeFiltersForChips: MyOrderFilterChip[] = useMemo(() => {
    const filterList = [];

    if (filterValues[MY_ORDERS_FILTERS.OEM_NO].values.length > 0) {
      const filterChipObj = {
        filterId: MY_ORDERS_FILTERS.OEM_NO,
        title: "OEM No.",
        value:
          filterValues[MY_ORDERS_FILTERS.OEM_NO].values.length > 1
            ? `(${filterValues[
                MY_ORDERS_FILTERS.OEM_NO
              ].values.length.toString()})`
            : filterValues[MY_ORDERS_FILTERS.OEM_NO].values[0],
      };
      filterList.push(filterChipObj);
    }
    if (filterValues[MY_ORDERS_FILTERS.QUOTE_NO].values.length > 0) {
      const filterChipObj = {
        filterId: MY_ORDERS_FILTERS.QUOTE_NO,
        title: "Order No.",
        value:
          filterValues[MY_ORDERS_FILTERS.QUOTE_NO].values.length > 1
            ? `(${filterValues[
                MY_ORDERS_FILTERS.QUOTE_NO
              ].values.length.toString()})`
            : filterValues[MY_ORDERS_FILTERS.QUOTE_NO].values[0],
      };
      filterList.push(filterChipObj);
    }
    if (filterValues[MY_ORDERS_FILTERS.BOM_ID].values.length > 0) {
      const filterChipObj = {
        filterId: MY_ORDERS_FILTERS.BOM_ID,
        title: "BOL ID",
        value:
          filterValues[MY_ORDERS_FILTERS.BOM_ID].values.length > 1
            ? `(${filterValues[
                MY_ORDERS_FILTERS.BOM_ID
              ].values.length.toString()})`
            : filterValues[MY_ORDERS_FILTERS.BOM_ID].values[0],
      };
      filterList.push(filterChipObj);
    }

    if (filterValues[MY_ORDERS_FILTERS.STATUS].values.length > 0) {
      const filterChipObj = {
        filterId: MY_ORDERS_FILTERS.STATUS,
        title: "Status",
        value:
          filterValues[MY_ORDERS_FILTERS.STATUS].values.length > 1
            ? `(${filterValues[
                MY_ORDERS_FILTERS.STATUS
              ].values.length.toString()})`
            : filterValues[MY_ORDERS_FILTERS.STATUS].values[0],
      };
      filterList.push(filterChipObj);
    }

    if (filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values.length > 0) {
      const filterChipObj = {
        filterId: MY_ORDERS_FILTERS.CUSTOMER_NAME,
        title: "Customer",
        value:
          filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values.length > 1
            ? `(${filterValues[
                MY_ORDERS_FILTERS.CUSTOMER_NAME
              ].values.length.toString()})`
            : filterValues[MY_ORDERS_FILTERS.CUSTOMER_NAME].values[0],
      };
      filterList.push(filterChipObj);
    }

    return filterList;
  }, [filterValues]);
  console.log(
    "%cactiveFiltersForChips:",
    "background-color:blue;color:white;",
    { activeFiltersForChips, filterValues },
  );

  // const isTablet = useMediaQuery(thm.breakpoints.down("lg"));

  const handleChipDeletion = (chip: MyOrderFilterChip) => {
    dispatch(
      setFilters({
        filterId: chip.filterId,
        data: { values: [] },
      }),
    );
  };

  const ChipContainer = () => {
    if (isTablet) {
      return (
        <StyledChipContainer drawerOpen={drawerOpen}>
          {activeFiltersForChips.map((chip, index) => {
            return (
              <MuiBox key={index} className="chip-container">
                <Typography className="chip-title">
                  {chip?.title || "Title"} :
                </Typography>
                <Typography className="chip-title">
                  {chip?.value || "-"}
                </Typography>
                <MuiBox
                  className="chip-cross"
                  onClick={() => handleChipDeletion(chip)}
                >
                  <ClearIcon />
                </MuiBox>
              </MuiBox>
            );
          })}
        </StyledChipContainer>
      );
    }

    return (
      <StyledChipContainer drawerOpen={drawerOpen}>
        {activeFiltersForChips.length < 2 &&
          activeFiltersForChips.map((chip, index) => {
            return (
              <MuiBox key={index} className="chip-container">
                <Typography className="chip-title">
                  {chip?.title || "Title"} :
                </Typography>
                <Typography className="chip-title">
                  {chip?.value || "-"}
                </Typography>
                <MuiBox
                  className="chip-cross"
                  onClick={() => handleChipDeletion(chip)}
                >
                  <ClearIcon />
                </MuiBox>
              </MuiBox>
            );
          })}
      </StyledChipContainer>
    );
  };

  return (
    <StyledFilterContainer className="my-orders__filter-container">
      <Badge
        badgeContent={
          activeFiltersForChips.length > (isTablet ? 0 : 1)
            ? activeFiltersForChips.length
            : null
        }
        color="primary"
      >
        <Button
          id="my-orders__add-filter-button"
          className="my-orders__add-filter-button"
          onClick={(e) => setAddFilterAnchorEl(e.currentTarget)}
          aria-describedby="add-filter-popover"
          onMouseEnter={() => setIsFilterBtnHover(true)}
          onMouseLeave={() => setIsFilterBtnHover(false)}
        >
          {!isFilterBtnHover ? (
            <FilterIcon />
          ) : (
            <FilterLogoHoverIcon className="filter-logo-hover-icon" />
          )}
          <Typography className="add-filter-text">Add Filter</Typography>
        </Button>
      </Badge>

      <MuiBox className="active-filter-status-container">
        {activeFiltersForChips.length === 0 ? (
          <Typography className="filter-btn-text">
            No Filters Applied
          </Typography>
        ) : (
          <>
            <ChipContainer />
            <Typography
              onClick={() => dispatch(clearFilters())}
              className="reset-filters-text"
            >
              Reset Filters
            </Typography>
          </>
        )}
      </MuiBox>

      {!isTablet && (
        <FilterPopover
          minHeight="25.6rem"
          anchorEl={addFilterAnchorEl}
          onClose={() => {
            setAddFilterAnchorEl(null);
            setSelectedFilter(MY_ORDERS_FILTERS.OEM_NO);
          }}
          filters={[
            {
              id: MY_ORDERS_FILTERS.OEM_NO,
              name: "OEM Order #",
              content: <OEMOrderFilters />,
            },

            {
              id: MY_ORDERS_FILTERS.QUOTE_NO,
              name: "Quote #",
              content: <QuoteNoFilters />,
            },
            // {
            //   id: MY_ORDERS_FILTERS.BOM_ID,
            //   name: "BOM ID",
            //   content: <BOMIDFilters />,
            // },

            ...(selectedTab !== MY_ORDERS_TABS.CANCELLED
              ? [
                  {
                    id: MY_ORDERS_FILTERS.STATUS,
                    name: "Status",
                    // content: <PrimaryStatusFilters />,
                    content: <StatusFilter />,
                  },
                ]
              : []),
            {
              id: MY_ORDERS_FILTERS.CUSTOMER_NAME,
              name: "Customer Name",
              content: <CustomerNameFilter />,
            },
            // {
            //   id: MY_ORDERS_FILTERS.CUSTOMER_NAME,
            //   name: "Customer Name",
            //   content: <CustomerNameFilter />,
            // },
          ]}
          selectedFilter={selectedFilter}
          onFilterSelect={(filterObj) => setSelectedFilter(filterObj.id)}
        />
      )}

      {isTablet && (
        <FilterPopoverMobile
          minHeight="25.6rem"
          anchorEl={addFilterAnchorEl}
          chipContainer={<ChipContainer />}
          onClose={() => setAddFilterAnchorEl(null)}
          onClearFilters={() => dispatch(clearFilters())}
          chipsCount={activeFiltersForChips.length}
          filters={[
            {
              id: MY_ORDERS_FILTERS.OEM_NO,
              name: "Order No",
              content: <OEMOrderFilters />,
            },

            {
              id: MY_ORDERS_FILTERS.QUOTE_NO,
              name: "Quote No",
              content: <QuoteNoFilters />,
            },
            // {
            //   id: MY_ORDERS_FILTERS.BOM_ID,
            //   name: "BOM ID",
            //   content: <BOMIDFilters />,
            // },

            ...(selectedTab !== MY_ORDERS_TABS.CANCELLED
              ? [
                  {
                    id: MY_ORDERS_FILTERS.STATUS,
                    name: "Status",
                    // content: <PrimaryStatusFilters />,
                    content: <StatusFilter />,
                  },
                ]
              : []),
            {
              id: MY_ORDERS_FILTERS.CUSTOMER_NAME,
              name: "Customer Name",
              content: <CustomerNameFilter />,
            },
            // {
            //   id: MY_ORDERS_FILTERS.CUSTOMER_NAME,
            //   name: "Customer Name",
            //   content: <CustomerNameFilter />,
            // },
          ]}
          selectedFilter={selectedFilter}
          onFilterSelect={(filterObj) => setSelectedFilter(filterObj.id)}
        />
      )}
    </StyledFilterContainer>
  );
}

export default MyOrdersFilters;

const StyledFilterContainer = styled(MuiBox)(({ theme }) => ({
  "&.my-orders__filter-container": {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    padding: "0.75rem 0",
    position: "sticky",
    top: "2.8rem",
    [theme.breakpoints.down("sm")]: {
      gap: ".5rem",
    },

    ".add-filter-text": {
      fontSize: "0.875rem",
    },

    // backgroundColor: theme.primary.white,
    // zIndex: HEADER_Z_INDEX - 100,

    ".my-orders__filter-no-filters-message": {
      color: "#646464",
      fontSize: "10px",
      fontWeight: 400,
      [theme.breakpoints.down("sm")]: {
        fontSize: "8px",
        display: "none",
      },
    },

    ".active-filter-status-container": {
      paddingLeft: "0.75rem",
      color: theme.palette.custom.baseAccent,
      borderLeft: `1px solid ${theme.palette.custom.lightGray}`,
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      gap: "0.6rem",

      ".reset-filters-text": {
        color: [theme.palette.primary.main],
        fontSize: "1rem",
        cursor: "pointer",
      },

      [theme.breakpoints.down("md")]: {
        display: "none",
      },
    },

    ".divider": {
      [theme.breakpoints.down("sm")]: {
        display: "none",
      },
    },

    ".filter-drawer__filter-value": {
      backgroundColor: "#ddf0e9",
      color: "black !important",
      padding: "0.275rem 0.625rem",
      borderRadius: "0.275rem",
      fontSize: "1rem",
      display: "flex",
      alignItems: "center",
      columnGap: "0.5rem",
      margin: 0,
      flexShrink: 0,
    },

    ".filter-drawer__filter-value-clear-icon": {
      fontSize: "0.75rem",
      cursor: "pointer",
    },

    [theme.breakpoints.down("md")]: {
      top: "2.8rem",
    },
  },

  ".filter-btn-text": {
    fontSize: "0.875rem",
    color: theme.palette.custom.subHeadlines,
  },

  ".my-orders__add-filter-button": {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    columnGap: "0.3rem",
    fontSize: "0.85rem",
    // fontFamily: '"Helvetica Now Display", sans-serif',
    fontWeight: "400",
    // backgroundColor: theme.primary.white2,
    border: "none",
    padding: "0.5rem 0.875rem",
    borderRadius: "1.4rem",
    cursor: "pointer",
    width: "max-content",
    flexShrink: 0,
    lineHeight: 1.5,
    textTransform: "capitalize",
    backgroundColor: "rgb(247, 247, 247)",

    "&:disabled": {
      cursor: "auto",
    },

    ".filter-logo-hover-icon": {
      ".filter-icon-hover_svg__outline": {
        fill: theme.palette.primary.main,
      },
    },
  },

  ".filter-drawer__selected-filters": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    overflow: "auto",
    width: "calc(100vw - 12rem)",

    [theme.breakpoints.down("lg")]: {
      width: "calc(100vw - 7rem)",
    },
  },

  ".filter-drawer__selected-filters::-webkit-scrollbar": {
    display: "none",
  },
}));

const StyledChipContainer = styled(MuiBox)<{ drawerOpen?: boolean }>(
  ({ theme, drawerOpen = false }) => ({
    display: "flex",
    flexDirection: "row",
    gap: "0.8rem",
    alignItems: "center",
    overflowX: "auto",
    maxWidth: "24rem",

    [theme.breakpoints.down(1900)]: {
      maxWidth: "24rem",
    },
    [theme.breakpoints.down(1350)]: {
      maxWidth: drawerOpen ? "11rem" : "15rem",
    },
    [theme.breakpoints.down(1250)]: {
      maxWidth: drawerOpen ? "8rem" : "12rem",
    },
    [theme.breakpoints.down(1199)]: {
      maxWidth: "24rem",
    },
    [theme.breakpoints.down(1024)]: {
      maxWidth: "20rem",
    },
    [theme.breakpoints.down(930)]: {
      maxWidth: "15rem",
    },
    [theme.breakpoints.down("md")]: {
      maxWidth: "unset",
      marginBottom: "1.2rem",
    },

    "&::-webkit-scrollbar": {
      width: "0.2rem",
      height: "0.2rem",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.palette.primary.main,
      borderRadius: "0.4rem",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "#f1f1f1",
    },

    ".chip-container": {
      padding: "0.5rem 0.75rem",
      borderRadius: "0.5rem",
      background: theme.palette.custom.miscActiveColor,
      display: "flex",
      flexDirection: "row",
      gap: "0.4rem",
      alignItems: "center",
      whiteSpace: "nowrap",
      color: theme.palette.primary.main,

      ".chip-title": {
        fontSize: "0.875rem",

        [theme.breakpoints.down("md")]: {
          fontSize: "0.8rem",
        },
      },
      ".chip-cross": {
        display: "flex",
        alignItems: "center",
      },

      svg: {
        color: theme.palette.primary.main,
        cursor: "pointer",
      },
    },
  }),
);
