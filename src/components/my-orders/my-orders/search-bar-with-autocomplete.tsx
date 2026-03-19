import React from "react";

import { Search } from "@mui/icons-material";
import {
  Autocomplete,
  AutocompleteInputChangeReason,
  Checkbox,
  InputAdornment,
  TextField,
  debounce,
  styled,
} from "@mui/material";

interface SearchbarWithCheckboxAutocompleteProps {
  search: string;
  onSearch: (search: string) => void;
  placeholder: string;
  autocompleteItems: string[];
  onSelectedChange: (value: string[]) => void;
  selectedOptions: string[];
}

function SearchbarWithCheckboxAutocomplete({
  search,
  autocompleteItems,
  onSearch,
  placeholder,
  onSelectedChange,
  selectedOptions,
}: SearchbarWithCheckboxAutocompleteProps) {
  const [searchText, setSearchText] = React.useState<string>(search || "");

  const debouncedSearch = React.useMemo(
    () => debounce((searchVal: string) => onSearch(searchVal), 500),
    [onSearch]
  );

  const onSearchChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    if (value === " " || reason === "reset") return;
    setSearchText(value);
    debouncedSearch(value.trim());
  };

  return (
    <div>
      <StyledAutocomplete
        multiple
        disableClearable
        disableCloseOnSelect
        inputValue={searchText}
        value={selectedOptions}
        onChange={(_, values) => onSelectedChange(values)}
        onInputChange={onSearchChange}
        options={autocompleteItems}
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox style={{ marginRight: 8 }} checked={selected} />
            {option}
          </li>
        )}
        clearOnBlur={false}
        openOnFocus={false}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            InputProps={{
              ...params.InputProps,
              // type: "search",
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: "1.6rem" }} />
                </InputAdornment>
              ),
            }}
          />
        )}
      />
    </div>
  );
}

export default SearchbarWithCheckboxAutocomplete;

const StyledAutocomplete = styled(Autocomplete<string, true, true>)(() => ({
  ".MuiAutocomplete-input": {
    fontSize: "1rem",
    padding: "0.2rem !important",
  },
  ".MuiAutocomplete-popupIndicator svg": {
    fontSize: "1.6rem",
  },

  ".MuiAutocomplete-tag, .MuiAutocomplete-noOptions": {
    fontSize: "1rem",
  },

  ".MuiAutocomplete-inputRoot": {
    borderRadius: "0.75rem",
  },
}));
