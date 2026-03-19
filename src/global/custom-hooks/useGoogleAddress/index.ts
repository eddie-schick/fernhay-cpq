import { TextField, styled } from "@mui/material";

export { default } from "./useGoogleAddress";

export const StyledTextfield = styled(TextField)(({ theme }) => ({
  ".MuiInputBase-root": {
    borderRadius: "0.3125rem",
  },

  input: {
    padding: "8px 12px",
    fontSize: "0.875rem",

    "&::placeholder": {
      color: `${theme.palette.custom.lightGray} !important`,
      opacity: 1,
    },
  },
  fieldset: {
    border: `1px solid ${theme.palette.custom.tertiary} !important`,

    "&:focus": {
      borderColor: `${theme.palette.primary.main} !important`,
    },
  },

  ".Mui-focused": {
    fieldset: {
      borderColor: `${theme.palette.primary.main} !important`,
    },
  },

  "&.input--error": {
    fieldset: {
      borderColor: `${theme.palette.custom.error} !important`,
    },
  },
}));
