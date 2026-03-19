import { ChangeEvent } from "react";
import { Noop, RefCallBack } from "react-hook-form";
import PhoneInput, { CountryData } from "react-phone-input-2";

import { styled } from "@mui/material";

import "react-phone-input-2/lib/style.css";

interface PhoneInputProps {
  placeholder: string;
  name: string;
  id: string;
  onChange: (
    value: string,
    data: CountryData,
    event: ChangeEvent<HTMLInputElement>,
    formattedValue: string
  ) => void;
  onBlur: Noop;
  value: string;
  ref: RefCallBack;
  isError?: boolean;
}

export default function CustomPhoneInput({
  placeholder,
  name,
  id,
  value,
  onChange,
  onBlur,
  ref,
  isError,
}: PhoneInputProps) {
  return (
    <StyledPhoneInput
      inputProps={{
        id: id,
        name: name,
        ref: ref,
      }}
      onChange={onChange}
      onBlur={onBlur}
      value={value}
      placeholder={placeholder}
      country={"us"}
      isError={isError}
    />
  );
}

const StyledPhoneInput = styled(PhoneInput)<{
  isError?: boolean;
}>(({ theme, isError }) => ({
  height: "100% !important",
  maxHeight: 54,

  ".form-control": {
    width: "100% !important",
    display: "flex !important",
    height: "100% !important",
    borderRadius: "0.3125rem !important",
    border: `1px solid ${
      isError ? theme.palette.custom.error : theme.palette.custom.tertiary
    } !important`,
    paddingLeft: "82px !important",
    padding: "0.75rem",
    fontWeight: 400,

    [theme.breakpoints.down("md")]: {
      padding: "18px 18px 16.5px !important",
      paddingLeft: "82px !important",
    },
  },

  ".selected-flag": {
    paddingRight: "unset !important",
    "&:hover,&:focus": {
      backgroundColor: "transparent !important",
    },
  },

  ".flag-dropdown": {
    padding: "0px 15px 0px 12px !important",
    borderRadius: "unset !important",
    backgroundColor: "unset !important",
    border: "unset !important",
    height: "50%",
    borderRight: "1px solid #C4C4C4 !important",
    top: "11.5px !important",
    "&.open": {
      background: "unset !important",
    },
    [theme.breakpoints.down("md")]: {
      top: "14px !important",
    },
  },

  ".flag-dropdown.open .selected-flag": {
    background: "unset !important",
    borderRadius: "unset !important",
  },

  ".arrow": {
    marginLeft: "3px !important",
  },
}));
