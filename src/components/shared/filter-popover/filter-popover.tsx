import { useMemo } from "react";

import { ArrowForwardIos } from "@mui/icons-material";
import { Divider, Popover, styled } from "@mui/material";

import MuiBox from "../mui-box/mui-box";

interface FilterItem {
  id: string;
  name: string;
  content: React.ReactNode;
}

interface FilterPopoverProps {
  onClose: () => void;
  anchorEl: (EventTarget & HTMLButtonElement) | null;
  filters: FilterItem[];
  minHeight?: string;
  selectedFilter: string;
  onFilterSelect: (filter: FilterItem) => void;
}

export default function FilterPopover(props: FilterPopoverProps) {
  const {
    onClose,
    anchorEl,
    filters,
    minHeight = "unset",
    selectedFilter,
    onFilterSelect,
  } = props;

  const filtersList = useMemo(
    () =>
      filters.map((filterObj) => (
        <div
          key={filterObj.id}
          id={`filter-popover__filter--${filterObj?.id}`}
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

          <ArrowForwardIos className="filter-popover__filter-right-arrow-icon" />
        </div>
      )),
    [filters, onFilterSelect, selectedFilter],
  );

  const filterContent = useMemo(() => {
    const filterToRender = filters?.find(
      (filterObj) => filterObj?.id === selectedFilter,
    );

    return filterToRender?.content;
  }, [filters, selectedFilter]);

  return (
    <Popover
      open={Boolean(anchorEl)}
      onClose={onClose}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      sx={{
        ".MuiPaper-root": {
          maxHeight: "unset !important",
          minHeight: minHeight,
        },
      }}
    >
      <FilterPopoverStyled>
        <div className="filter-popover__filters-list">{filtersList}</div>
        <Divider
          style={{ minHeight: minHeight }}
          className="filter-popover__divider"
          orientation="vertical"
        />
        <div
          className="filter-popover__selected-filter"
          style={{ maxHeight: minHeight }}
        >
          {filterContent}
        </div>
      </FilterPopoverStyled>
    </Popover>
  );
}

const FilterPopoverStyled = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  width: "42rem",

  ".filter-popover__filters-list": {
    padding: "0.85rem 0.7rem",
    color: theme.palette.custom.tertiary,
    backgroundColor: theme.palette.custom.lightGrayBg,
    display: "flex",
    flexDirection: "column",
    rowGap: "0.5rem",
    width: "max-content",
    minWidth: "14rem",
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
    padding: "0.5rem 1.2rem",
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
    border: `1px solid ${theme.palette.primary.main}`,
    fontWeight: "700",
  },

  ".filter-popover__filter-right-arrow-icon": {
    fontSize: "0.8rem",
  },
}));
