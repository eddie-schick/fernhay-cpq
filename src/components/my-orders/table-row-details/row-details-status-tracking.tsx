import { Check } from "@mui/icons-material";
import { styled } from "@mui/material";

import { QUOTE_ORDER_STATUS_OPTIONS } from "~/constants/constants";

import { OrderStatusValue } from "~/global/types/types";

import MuiBox from "~/components/shared/mui-box/mui-box";

interface RowDetailsStatusTrackingProps {
  status: OrderStatusValue;
}

function RowDetailsStatusTracking({
  status = "Cancelled",
}: RowDetailsStatusTrackingProps) {
  const isActive = (step: OrderStatusValue) => {
    return (
      QUOTE_ORDER_STATUS_OPTIONS.indexOf(step) <=
      QUOTE_ORDER_STATUS_OPTIONS.indexOf(status)
    );
  };

  return (
    <Steps>
      {QUOTE_ORDER_STATUS_OPTIONS.slice(
        0,
        QUOTE_ORDER_STATUS_OPTIONS.length - 1
      ).map((label) => (
        <Step active={isActive(label)} key={label}>
          {label}
          <div className="step-icon">{isActive(label) && <Check />}</div>
        </Step>
      ))}
    </Steps>
  );
}

export default RowDetailsStatusTracking;

const Steps = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",

  [theme.breakpoints.down("md")]: {
    padding: "0 1rem",
  },
}));

const Step = styled(MuiBox)<{ active: boolean }>(({ theme, active }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  gap: "0.85rem",
  fontWeight: 500,
  minWidth: "7.15rem",

  "&:not(:first-child) .step-icon::before": {
    content: "''",
    position: "absolute",
    left: -110,
    width: 110,
    height: "2px",
    backgroundColor: active
      ? theme.palette.primary.main
      : theme.palette.custom.greyAccent,
    zIndex: -1,
    color: "#3C3C3C",
  },

  ".step-icon": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem", // 1.4rem * 0.65 = 0.91
    height: "1rem", // 1.4rem * 0.65 = 0.91
    borderRadius: "50%",
    color: active ? theme.palette.custom.baseWhite : undefined,
    backgroundColor: active
      ? theme.palette.primary.main
      : theme.palette.custom.greyAccent,
    position: "relative",
    svg: {
      fontSize: "1rem !important", // 0.85rem * 0.65 = 0.5525
    },
  },
}));
