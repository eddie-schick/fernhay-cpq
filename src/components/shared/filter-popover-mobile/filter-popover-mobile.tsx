import { useMemo } from "react";

import {
  KeyboardArrowLeft,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from "@mui/icons-material";
import { Popover, Typography, styled } from "@mui/material";

import MuiBox from "../mui-box/mui-box";

interface FilterItem {
  id: string;
  name: string;
  content: React.ReactNode;
}

interface FilterPopoverMobileProps {
  onClose: () => void;
  anchorEl: (EventTarget & HTMLButtonElement) | null;
  filters: FilterItem[];
  minHeight?: string;
  selectedFilter: string;
  onFilterSelect: (filter: FilterItem) => void;
  onClearFilters: () => void;
  chipContainer?: JSX.Element;
  chipsCount?: number;
}

export default function FilterPopoverMobile(props: FilterPopoverMobileProps) {
  const {
    onClose,
    anchorEl,
    filters,
    minHeight = "unset",
    selectedFilter,
    onFilterSelect,
    chipContainer = <></>,
    onClearFilters = () => {},
    chipsCount = 0,
  } = props;

  const filtersList = useMemo(
    () =>
      filters.map((filterObj) => {
        const filterToRender = filters?.find(
          (filterObjRender) => filterObjRender?.id === selectedFilter,
        );
        return (
          <>
            <div
              key={filterObj.id}
              className={`filter-popover__filter ${
                filterObj.id === selectedFilter
                  ? "filter-popover__filter--selected"
                  : ""
              }`}
              role="button"
              tabIndex={0}
              onClick={() => onFilterSelect(filterObj)}
              onKeyDown={(e) => {
                if (e.key === "ENTER") {
                  onFilterSelect(filterObj);
                }
              }}
            >
              {filterObj.name}
              {filterObj.id === selectedFilter ? (
                <KeyboardArrowUp className="filter-popover__filter-right-arrow-icon" />
              ) : (
                <KeyboardArrowDown className="filter-popover__filter-right-arrow-icon" />
              )}
            </div>
            {filterObj.id === selectedFilter && (
              <div
                className="filter-popover__selected-filter"
                style={{ maxHeight: minHeight }}
              >
                {filterToRender?.content}
              </div>
            )}
          </>
        );
      }),
    [filters, minHeight, onFilterSelect, selectedFilter],
  );

  return (
    <PopOverStyled
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      className="popover-filter"
    >
      <FilterPopoverMobileStyled>
        <div className="filter-header">
          <KeyboardArrowLeft
            onClick={onClose}
            className="filter-header--icon"
          />
          <Typography variant="h6">Add Filter</Typography>
          <MuiBox></MuiBox>
        </div>

        {chipContainer}

        <div className="filters-subheadings-container">
          <Typography className="reset-filters-text-left">Filter By</Typography>
          {chipsCount > 0 && (
            <Typography onClick={onClearFilters} className="reset-filters-text">
              Clear All
            </Typography>
          )}
        </div>

        <div className="filter-popover__filters-list">{filtersList}</div>
        {/* <Divider
					style={{ minHeight: minHeight }}
					className="filter-popover__divider"
					orientation="vertical"
				/> */}
      </FilterPopoverMobileStyled>
    </PopOverStyled>
  );
}

const PopOverStyled = styled(Popover)(() => ({
  ".MuiPaper-root": {
    maxHeight: "unset !important",
    width: "100%",
    height: "100%",
    boxShadow: "none",
  },
}));

const FilterPopoverMobileStyled = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  // width: "60rem",
  width: "100%",
  flexDirection: "column",

  ".filters-subheadings-container": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "1rem",
  },

  ".reset-filters-text-left": {
    color: [theme.palette.primary.main],
    fontSize: "1rem",
    fontWeight: "600",
  },

  ".reset-filters-text": {
    color: [theme.palette.primary.main],
    fontSize: "0.875rem",
    cursor: "pointer",

    textDecoration: "underline",
    textUnderlineOffset: "0.4rem",
  },

  ".filter-header": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "24px  0 26px 0",
    h3: {
      margin: "auto",
    },

    [theme.breakpoints.down("md")]: {
      justifyContent: "space-between",
    },

    ".filter-header--icon": {
      marginLeft: "0.75rem",
      fontSize: "1.4rem",
      cursor: "pointer",
    },
  },

  ".filter-popover__filters-list": {
    padding: "0.85rem 0.7rem",
    color: theme.palette.custom.tertiary,
    backgroundColor: theme.palette.custom.lightGrayBg,
    display: "flex",
    flexDirection: "column",
    rowGap: "0.5rem",
    // width: "max-content",
    // minWidth: "20rem",
    width: "100%",
    // borderRight: ` 1px solid ${theme.palette.custom.mediumGrey}`,
  },

  ".filter-popover__selected-filter": {
    flex: 1,
    maxHeight: "40vh",
    overflowY: "auto",
  },

  ".filter-popover__divider": {
    borderColor: theme.palette.custom.tertiary,
  },

  ".filter-popover__filter": {
    padding: "0.9rem 1.2rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: "1rem",
    fontWeight: 400,
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
  },

  ".filter-popover__filter--selected": {
    backgroundColor: theme.palette.custom.miscActiveColor,
    border: `1px solid ${theme.palette.secondary.main}`,
    fontWeight: "700",
  },

  ".filter-popover__filter-right-arrow-icon": {
    fontSize: "1.2rem",
  },

  [theme.breakpoints.down("lg")]: {
    ".filter-popover__filters-list": {
      maxHeight: "60vh",
    },
  },
}));
