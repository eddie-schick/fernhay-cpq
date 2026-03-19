import React from "react";

import { TextField, debounce, styled } from "@mui/material";

import { SearchIcon } from "~/global/icons";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import MuiBox from "../mui-box/mui-box";

interface SearchbarProps {
  search: string;
  onSearch: (searchVal: string) => void;
  placeholder: string;
  styles?: object;
  id?: string;
}

function Searchbar(props: SearchbarProps) {
  const { search, onSearch, placeholder, styles, id } = props;

  const { drawerState: drawerOpen } = useAppSelector(rootSelector);

  const [searchText, setSearchText] = React.useState<string>(search || "");

  const debouncedSearch = React.useMemo(
    () => debounce((searchVal: string) => onSearch(searchVal), 500),
    [onSearch]
  );

  const onSearchChange: React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    if (e.target.value === " ") return;
    setSearchText(e.target.value);
    debouncedSearch(e.target.value.trim());
  };

  return (
    <SearchContainer drawerOpen={drawerOpen} className="search-container">
      <SearchIcon className="search-icon" />

      <TextField
        className="search-input"
        id={id}
        style={styles || {}}
        placeholder={placeholder}
        value={searchText}
        onChange={onSearchChange}
        tabIndex={0}
        InputProps={{
          inputProps: {
            tabIndex: 0,
          },
        }}
      />
    </SearchContainer>
  );
}

export default Searchbar;

const SearchContainer = styled(MuiBox)<{ drawerOpen?: boolean }>(
  ({ theme, drawerOpen = false }) => ({
    [theme.breakpoints.down("lg")]: {
      width: "100%",
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
    [theme.breakpoints.down(375)]: {
      width: "70%",
    },

    "&.search-container": {
      position: "relative",
    },

    ".search-icon": {
      position: "absolute",
      left: "0.8rem",
      top: "50%",
      transform: "translateY(-50%)",
    },

    ".search-input": {
      position: "relative",

      [theme.breakpoints.down("lg")]: {
        width: "100%",
      },

      input: {
        fontSize: "0.875rem",
        paddingLeft: "2.8rem",
      },

      ".MuiOutlinedInput-root": {
        borderRadius: "10px",
        width: drawerOpen ? "14rem" : "17.5rem",
        height: "2.5rem",

        [theme.breakpoints.down("lg")]: {
          width: "100%",
        },
      },

      ".MuiOutlinedInput-notchedOutline": {
        border: `1px solid ${theme.palette.custom.tertiary}`,
      },
    },
  })
);
