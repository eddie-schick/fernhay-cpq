import { Box, styled } from "@mui/material";

import MuiBox from "../shared/mui-box/mui-box";

export const StyledFilterSection = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.75rem",
  padding: "1.75rem",
  fontSize: "1rem",

  ".checkbox": {
    "& .MuiSvgIcon-root": { fontSize: 20 },
  },
  ".checkbox.Mui-checked": {
    color: `${theme.palette.primary.main} !important`,
  },
}));

export const StyledCheckBoxFilterSection = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: "1.4rem",
  flexDirection: "column",
  gap: "0.75rem",
  fontSize: "1rem",

  ".MuiFormControlLabel-label": {
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
  },

  ".MuiCheckbox-root": {
    paddingTop: 0,
    paddingBottom: 0,
  },
  ".checkbox.Mui-checked": {
    color: `${theme.palette.primary.main} !important`,
  },
}));
