/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";

import { Popover, styled } from "@mui/material";

import {
  QUOTE_ORDER_STATUSES,
  QUOTE_ORDER_STATUS_OPTIONS,
} from "~/constants/constants";

import { BadgeDropdownIcon } from "~/global/icons";
import {
  OrderStatus,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "../mui-box/mui-box";
import StatusPopoverItem from "../status-popover-item/status-popover-item";

interface StatusBadgeProps {
  status: OrderStatusValue;
  onStatusChange?: (
    fromStatus: OrderStatusValue,
    toStatus: OrderStatusValue,
  ) => void;
  row: QuoteOrder200ResponseSchema;
  readOnly?: boolean;
  isExpired?: boolean;
}

function StatusBadge(props: StatusBadgeProps) {
  const { status, onStatusChange, row, readOnly = false, isExpired } = props;
  const [badgeAnchorEl, setBadgeAnchorEl] = useState<
    (EventTarget & HTMLDivElement) | null
  >(null);

  const { role, user } = useAuthContextValue();
  const userDealerEmail = user?.user ? user?.user?.email : "";

  /*show dropdown conditions
   if user is not admin then the dealer should only be able to update his/her orders only and regularly the dealer can only change status to cancel or quote accepted
  */
  const showDropdown =
    (role !== "admin" &&
      status &&
      status === QUOTE_ORDER_STATUSES.QUOTE_GENERATED &&
      row?.dealer?.email === userDealerEmail &&
      !isExpired &&
      !readOnly) ||
    (role === "admin" &&
      status &&
      status !== QUOTE_ORDER_STATUSES.CANCELLED &&
      status !== QUOTE_ORDER_STATUSES.DELIVERED &&
      (status !== QUOTE_ORDER_STATUSES.QUOTE_GENERATED ||
        row?.dealer?.email === userDealerEmail) &&
      !isExpired &&
      !readOnly);

  return (
    <>
      <StyledBadge
        id={`status-badge--${row?.formattedId}`}
        onClick={(e) => showDropdown && setBadgeAnchorEl(e.currentTarget)}
        sx={
          status
            ? {
                ...getBadgeStyles(status, isExpired),
                backgroundColor: "white",
                color: "#3C3C3C",
              }
            : {}
        }
        showDropdown={showDropdown}
      >
        <MuiBox
          sx={
            status
              ? {
                  ...getBadgeStyles(status, isExpired),
                  height: "0.5rem",
                  width: "0.5rem",
                  borderRadius: "50%",
                }
              : {}
          }
        ></MuiBox>
        {isExpired ? "Expired" : status ? getShortStatusLabel(status) : "Draft"}
        {showDropdown && <BadgeDropdownIcon />}
      </StyledBadge>
      <StyledPopover
        open={Boolean(badgeAnchorEl)}
        onClose={() => setBadgeAnchorEl(null)}
        anchorEl={badgeAnchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        {QUOTE_ORDER_STATUS_OPTIONS.filter((item) =>
          role !== "admin"
            ? ["Quote Generated", "Quote Accepted", "Cancelled"].includes(item)
            : [
                row?.dealer?.email === userDealerEmail
                  ? "Quote Generated"
                  : null,
                "Quote Accepted",
                "Order Processing",
                "In Production",
                "In Transit",
                "Delivered",
                row?.dealer?.email === userDealerEmail ? "Cancelled" : null,
              ].includes(item),
        )?.map((statusItem) => (
          <StatusPopoverItem
            id={`status-item--${statusItem}`}
            onClick={() => {
              console.log("disabled", shoudlDisable(status, statusItem, row));

              if (onStatusChange && !shoudlDisable(status, statusItem, row))
                onStatusChange(status, statusItem);
              setBadgeAnchorEl(null);
            }}
            key={statusItem}
            isDisabled={shoudlDisable(status, statusItem, row)}
            isActive={statusItem === status}
            label={statusItem}
            value={statusItem}
          />
        ))}
      </StyledPopover>
    </>
  );
}

export default StatusBadge;

const StyledBadge = styled(MuiBox)<{ showDropdown?: boolean }>(
  ({ theme, showDropdown = false }) => ({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.15rem 0.5rem",
    height: "auto",
    fontSize: "11px",
    borderRadius: "1rem",
    fontWeight: 600,
    cursor: showDropdown ? "pointer" : "auto",
    background: "white",
    whiteSpace: "nowrap",

    color: theme.palette.custom.accentBlack,
    svg: {
      fontSize: "1rem",
    },

    [theme.breakpoints.down("md")]: {
      padding: "0.15rem 0.5rem",
    },
  }),
);

const StyledPopover = styled(Popover)(() => ({
  ".MuiPaper-root": {
    display: "flex",
    flexDirection: "column",
    borderRadius: "0.5rem",
    boxShadow: "0px 2px 8px 0px rgba(171, 171, 171, 0.35)",
  },
}));

export const ORDER_STATUS_COLORS = {
  QUOTE_GENERATED: {
    background: "#A269DB",
    border: "2px solid #A269DB",
    color: "#A269DB",
  },
  QUOTE_ACCEPTED: {
    background: "#90D26D",
    border: "2px solid #90D26D",
    color: "#90D26D",
  },
  ORDER_PROCESSING: {
    background: "#FF9393",
    border: "2px solid #FF9393",
    color: "#FF9393",
  },
  IN_PRODUCTION: {
    background: "#0D99FF",
    border: "2px solid #0D99FF",
    color: "#0D99FF",
  },
  IN_TRANSIT: {
    background: "#FFA629",
    border: "2px solid #FFA629",
    color: "#FFA629",
  },
  DELIVERED: {
    background: "#47A580",
    border: "2px solid #47A580",
    color: "#47A580",
  },
  CANCELLED: {
    background: "#909090",
    border: "2px solid #909090",
    color: "#909090",
  },
  EXPIRED: {
    background: "#D32F2F",
    border: "2px solid #D32F2F",
    color: "#D32F2F",
  },
  DRAFT: {
    background: "#BDBDBD",
    border: "2px solid #BDBDBD",
    color: "#BDBDBD",
  },
};

function shoudlDisable(
  activeStatus: OrderStatusValue,
  status: OrderStatusValue,
  row: QuoteOrder200ResponseSchema,
) {
  if (
    QUOTE_ORDER_STATUS_OPTIONS.indexOf(activeStatus) ===
      QUOTE_ORDER_STATUS_OPTIONS.indexOf(status) ||
    QUOTE_ORDER_STATUS_OPTIONS.indexOf(activeStatus) + 1 ===
      QUOTE_ORDER_STATUS_OPTIONS.indexOf(status) ||
    (activeStatus === QUOTE_ORDER_STATUSES.QUOTE_GENERATED &&
      status === QUOTE_ORDER_STATUSES.CANCELLED)
  ) {
    if (
      activeStatus === QUOTE_ORDER_STATUSES.QUOTE_GENERATED &&
      status === QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED &&
      row?.customer?.buyerName === undefined
    ) {
      return true;
    }
    return false;
  }

  return true;
}

/** Maps for pipeline stage names → short labels & color categories */
const PIPELINE_STAGE_LABELS: Record<string, string> = {
  "Quote Received": "Quote Received",
  "Quote Accepted": "Quote Accepted",
  "Order Received": "Order Received",
  "OEM Allocated": "OEM Allocated",
  "OEM Production": "OEM Production",
  "OEM In Transit": "OEM In Transit",
  "Received at Upfitter": "At Upfitter",
  "Upfit In Progress": "Upfit In Progress",
  "Quality Inspection": "QC Inspection",
  "Ready for Delivery": "Ready for Delivery",
  "In Transit to Customer": "In Transit",
  "Delivered": "Delivered",
};

const PIPELINE_STAGE_COLORS: Record<string, keyof typeof ORDER_STATUS_COLORS> = {
  "Quote Received": "QUOTE_GENERATED",
  "Quote Accepted": "QUOTE_ACCEPTED",
  "Order Received": "ORDER_PROCESSING",
  "OEM Allocated": "ORDER_PROCESSING",
  "OEM Production": "IN_PRODUCTION",
  "OEM In Transit": "IN_PRODUCTION",
  "Received at Upfitter": "IN_PRODUCTION",
  "Upfit In Progress": "IN_PRODUCTION",
  "Quality Inspection": "IN_PRODUCTION",
  "Ready for Delivery": "IN_TRANSIT",
  "In Transit to Customer": "IN_TRANSIT",
  "Delivered": "DELIVERED",
};

function getShortStatusLabel(status: OrderStatusValue): string {
  // Check pipeline stage names first
  if (PIPELINE_STAGE_LABELS[status]) return PIPELINE_STAGE_LABELS[status];

  switch (status) {
    case QUOTE_ORDER_STATUSES.QUOTE_GENERATED:
      return "Generated";
    case QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED:
      return "Accepted";
    case QUOTE_ORDER_STATUSES.ORDER_PROCESSING:
      return "Processing";
    case QUOTE_ORDER_STATUSES.IN_PRODUCTION:
      return "Production";
    case QUOTE_ORDER_STATUSES.IN_TRANSIT:
      return "In Transit";
    case QUOTE_ORDER_STATUSES.DELIVERED:
      return "Delivered";
    case QUOTE_ORDER_STATUSES.CANCELLED:
      return "Cancelled";
    default:
      return String(status) || "Draft";
  }
}

function getBadgeStyles(status: OrderStatusValue, isExpired?: boolean) {
  if (isExpired) return ORDER_STATUS_COLORS.EXPIRED;

  // Check pipeline stage names first
  const pipelineColor = PIPELINE_STAGE_COLORS[status];
  if (pipelineColor) return ORDER_STATUS_COLORS[pipelineColor];

  switch (status) {
    case QUOTE_ORDER_STATUSES.QUOTE_GENERATED:
      return ORDER_STATUS_COLORS.QUOTE_GENERATED;
    case QUOTE_ORDER_STATUSES.QUOTE_ACCEPTED:
      return ORDER_STATUS_COLORS.QUOTE_ACCEPTED;
    case QUOTE_ORDER_STATUSES.ORDER_PROCESSING:
      return ORDER_STATUS_COLORS.ORDER_PROCESSING;
    case QUOTE_ORDER_STATUSES.IN_PRODUCTION:
      return ORDER_STATUS_COLORS.IN_PRODUCTION;
    case QUOTE_ORDER_STATUSES.IN_TRANSIT:
      return ORDER_STATUS_COLORS.IN_TRANSIT;
    case QUOTE_ORDER_STATUSES.DELIVERED:
      return ORDER_STATUS_COLORS.DELIVERED;
    case QUOTE_ORDER_STATUSES.CANCELLED:
      return ORDER_STATUS_COLORS.CANCELLED;
    default:
      return ORDER_STATUS_COLORS.DRAFT;
  }
}
