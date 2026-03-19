import { Typography, styled } from "@mui/material";

import { QUOTE_ORDER_STATUSES } from "~/constants/constants";

import MuiBox from "../mui-box/mui-box";
import { ORDER_STATUS_COLORS } from "../status-badge/status-badge";
interface StatusPopoverItemProps {
  id?: string;
  label: string;
  value: string;
  isDisabled?: boolean;
  isActive?: boolean;
  onClick?: (status: string) => void;
}

export default function StatusPopoverItem(props: StatusPopoverItemProps) {
  const { id, label, value, isDisabled, isActive, onClick } = props;

  return (
    <PopoverItemStyled
      id={id}
      onClick={() => onClick && onClick(value)}
      isDisabled={isDisabled}
      isActive={isActive}
    >
      <div
        className="status-indicator"
        style={{
          backgroundColor: getStatusIndicatorColor(value),
        }}
      ></div>
      <Typography className="status-text">{label}</Typography>
    </PopoverItemStyled>
  );
}

const PopoverItemStyled = styled(MuiBox, {
  shouldForwardProp: (prop) => prop !== "isDisabled",
})<{ isDisabled?: boolean; isActive?: boolean }>(
  ({ theme, isDisabled, isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    padding: "0.5rem 1rem",

    cursor: !isDisabled ? "pointer" : "not-allowed",

    ".status-indicator": {
      width: "0.6rem",
      height: "0.6rem",
      borderRadius: "50%",
    },

    ".status-text": {
      fontSize: "0.875rem",
      fontWeight: isActive ? 700 : 400,
      color: isDisabled
        ? theme.palette.custom.greyAccent
        : theme.palette.custom.subHeadlines,
      lineHeight: "normal",
    },

    "&:hover": {
      backgroundColor: "#efefef",
    },
  }),
);

function getStatusIndicatorColor(status: string) {
  switch (status) {
    case QUOTE_ORDER_STATUSES.QUOTE_GENERATED:
      return ORDER_STATUS_COLORS.QUOTE_GENERATED.color;
    case QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED:
      return ORDER_STATUS_COLORS.QUOTE_ACCEPTED.color;
    case QUOTE_ORDER_STATUSES.ORDER_PROCESSING:
      return ORDER_STATUS_COLORS.ORDER_PROCESSING.color;
    case QUOTE_ORDER_STATUSES.IN_PRODUCTION:
      return ORDER_STATUS_COLORS.IN_PRODUCTION.color;
    case QUOTE_ORDER_STATUSES.IN_TRANSIT:
      return ORDER_STATUS_COLORS.IN_TRANSIT.color;
    case QUOTE_ORDER_STATUSES.DELIVERED:
      return ORDER_STATUS_COLORS.DELIVERED.color;
    case QUOTE_ORDER_STATUSES.CANCELLED:
      return ORDER_STATUS_COLORS.CANCELLED.color;
    default:
      return undefined;
  }
}
