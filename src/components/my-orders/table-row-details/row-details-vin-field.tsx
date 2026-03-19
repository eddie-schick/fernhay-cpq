import React from "react";

import {
  Button,
  InputAdornment,
  TextField,
  styled,
  CircularProgress,
} from "@mui/material";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "~/components/shared/mui-box/mui-box";

interface RowDetailsVinFieldProps {
  vin: string;
  handleSave: (vin: string, cb: () => void) => void;
  isLoading?: boolean;
  isCancelled?: boolean;
}

function RowDetailsVinField({
  vin,
  handleSave,
  isLoading,
  isCancelled,
}: RowDetailsVinFieldProps) {
  const [vinLocalState, setVinLocalState] = React.useState<string>(vin);
  const [editing, setEditing] = React.useState<boolean>(!vin?.length || false);
  const { role } = useAuthContextValue();

  // const { triggerToast } = useCustomToast();

  if (isCancelled) return <VinContainer></VinContainer>;

  console.log("local vin state", vinLocalState);

  return (
    <>
      {role !== "admin" ? (
        <TextContainer>
          <MuiBox className="order-detail-item-label">VIN:</MuiBox>
          <MuiBox className="order-detail-item-value">
            {vinLocalState || "-"}
          </MuiBox>
        </TextContainer>
      ) : (
        <VinContainer>
          <TextField
            className={`textfield ${vinLocalState && !editing && " has-value"}`}
            placeholder="Add VIN No."
            value={vinLocalState}
            onChange={(e) => {
              if (!e.target.value.match(/^[a-zA-Z0-9]*$/)) return;
              if (e.target.value.length <= 17)
                setVinLocalState(e.target.value.toLocaleUpperCase());
            }}
            InputProps={{
              startAdornment: !editing ? (
                <InputAdornment
                  position="start"
                  sx={{
                    ".MuiTypography-root": {
                      fontSize: "0.875rem",
                      fontWeight: 500,
                    },
                  }}
                >
                  VIN #
                </InputAdornment>
              ) : undefined,
            }}
          />
          {!editing ? (
            <EditButton
              disableRipple
              variant="text"
              onClick={() => setEditing(true)}
            >
              Edit
            </EditButton>
          ) : (
            <SaveButton
              disabled={!vinLocalState?.length || isLoading}
              variant="contained"
              disableElevation
              onClick={() => {
                handleSave(vinLocalState, () => {
                  setEditing(false);
                  // triggerToast({
                  // 	message: "VIN No. saved successfully",
                  // 	variant: "success",
                  // 	autoHideDuration: 3000,
                  // 	anchorOrigin: { vertical: "top", horizontal: "right" },
                  // });
                });
              }}
            >
              {isLoading && <CircularProgress size={12} />}&nbsp;Save
            </SaveButton>
          )}
        </VinContainer>
      )}
    </>
  );
}

export default RowDetailsVinField;

const TextContainer = styled(MuiBox)(() => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  fontSize: "0.875rem",
  justifyContent: "center",
  height: "3rem",

  ".order-detail-item-label": {
    minWidth: "2rem",
  },
  ".order-detail-item-value": {
    fontWeight: 600,
  },
}));

const VinContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  maxWidth: "17.188rem", // 35rem * 0.65 = 22.75
  width: "100%",
  minHeight: "2.34rem", // 3.6rem * 0.65 = 2.34

  [theme.breakpoints.down("lg")]: {
    maxWidth: "16rem", // 30rem * 0.65 = 19.5
  },

  ".textfield": {
    flexGrow: 1,
    input: {
      padding: "0.52rem 1.04rem", // 0.8rem * 0.65 = 0.52, 1.6rem * 0.65 = 1.04
      fontSize: "0.91rem", // 1.4rem * 0.65 = 0.91

      [theme.breakpoints.down("lg")]: {
        fontSize: "0.78rem", // 1.2rem * 0.65 = 0.78
        paddingRight: "0.52rem", // 0.8rem * 0.65 = 0.52
      },
    },
    ".MuiInputBase-root": {
      borderRadius: "0.325rem 0 0 0.325rem", // 0.5rem * 0.65 = 0.325
    },

    "&.has-value .MuiInputBase-root": {
      pointerEvents: "none",
      borderRadius: "0.325rem",
      fieldset: {
        borderColor: theme.palette.primary.main,
      },
    },
    "&.has-value input": { paddingLeft: "0" },
  },
}));

const EditButton = styled(Button)(({ theme }) => ({
  textDecoration: "underline",
  fontWeight: 500,
  fontSize: "0.91rem", // 1.4rem * 0.65 = 0.91
  textTransform: "none",
  padding: "0.39rem 1.04rem", // 0.6rem * 0.65 = 0.39, 1.6rem * 0.65 = 1.04

  ":hover": {
    textDecoration: "underline",
    color: theme.palette.secondary.main,
    background: "transparent",
  },
}));

const SaveButton = styled(Button)(() => ({
  border: 0,
  background: "var(--Charcoal, #303030)",
  color: "white",
  textTransform: "none",
  fontWeight: 500,
  fontSize: "0.91rem", // 1.4rem * 0.65 = 0.91
  borderRadius: "0 0.325rem 0.325rem 0", // 0.5rem * 0.65 = 0.325
}));
