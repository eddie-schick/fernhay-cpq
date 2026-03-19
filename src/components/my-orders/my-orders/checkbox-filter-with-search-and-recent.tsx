import {
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  Typography,
  styled,
} from "@mui/material";

// import Searchbar from "../searchbar/searchbar";
import MuiBox from "../shared/mui-box/mui-box";

import SearchbarWithCheckboxAutocomplete from "./search-bar-with-autocomplete";
import { StyledFilterSection } from "./shared-styles";

interface CheckboxFilterWithSearchAndRecentProps<T> {
  searchbar: {
    search: string;
    onSearch: (search: string) => void;
    placeholder: string;
    autocompleteItems: T[];
    getAutocompleteItemLabel: (item: T) => string;
  };
  selectedOptions: T[];
  recentSearched: T[];
  getRecentItemLabel?: (item: T) => string;
  onFilterUpdate: (filters: T[]) => void;
}

function CheckboxFilterWithSearchAndRecent<T>({
  searchbar,
  selectedOptions,
  onFilterUpdate,
  recentSearched,
  getRecentItemLabel = (item) => item as string,
}: CheckboxFilterWithSearchAndRecentProps<T>) {
  return (
    <>
      <StyledFilterSection>
        <SearchbarWithCheckboxAutocomplete
          {...searchbar}
          autocompleteItems={(searchbar.autocompleteItems || []).map(
            searchbar.getAutocompleteItemLabel
          )}
          onSelectedChange={(values) => onFilterUpdate(values as T[])}
          selectedOptions={selectedOptions as string[]}
        />
      </StyledFilterSection>
      <Divider />
      <StyledFilterSection>
        <RecentFilterValuesContainer>
          <Typography className="recent-title">Recent</Typography>
          {!recentSearched.length && (
            <Typography className="no-searches">No recent searches</Typography>
          )}
          <FormGroup>
            {recentSearched.map((item) => (
              <FormControlLabel
                key={getRecentItemLabel(item)}
                label={getRecentItemLabel(item)}
                control={
                  <Checkbox
                    className="checkbox"
                    disableRipple
                    onChange={(event) => {
                      if (event.target.checked) {
                        onFilterUpdate([...selectedOptions, item]);
                        return;
                      }
                      onFilterUpdate(
                        selectedOptions.filter(
                          (i) =>
                            getRecentItemLabel(i) !== getRecentItemLabel(item)
                        )
                      );
                    }}
                    checked={selectedOptions.includes(item)}
                  />
                }
              />
            ))}
          </FormGroup>
        </RecentFilterValuesContainer>
      </StyledFilterSection>
    </>
  );
}

export default CheckboxFilterWithSearchAndRecent;

const RecentFilterValuesContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "flex-start",
  gap: "1rem",

  ".recent-title": {
    fontSize: "1rem",
    color: theme.palette.primary.main,
  },

  ".no-searches": {
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
  },

  ".recent-filter-item": {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",

    ".label": {
      fontSize: "1rem",
      color: theme.palette.secondary.main,
    },
  },

  ".MuiFormControlLabel-label": {
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
  },

  ".MuiCheckbox-root": {
    paddingTop: 0,
    paddingBottom: 0,
    svg: {
      fontSize: "1.6rem",
    },
  },

  ".MuiFormGroup-root": {
    gap: "0.75rem",
  },
}));
