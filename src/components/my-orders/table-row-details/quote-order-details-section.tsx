import { useMemo, useState } from "react";

import { Typography, styled } from "@mui/material";

import { getLeadTimeInDays } from "~/utils/date-utils";
import getBuildLeadTimeFromTimeGivenInDays from "~/utils/misc";

import { LeadTimeUnit } from "~/global/types/types";

import MuiBox from "~/components/shared/mui-box/mui-box";
import PdfModal from "~/components/shared/pdf-modal/pdf-modal";

interface QuoteOrderDetailsSectionProps {
  details: {
    quoteFormattedId: string;
    quoteLink: string | null;
    groupName: string | null;
    model: string;
    vehicleLeadTime: {
      value: string;
      unit: LeadTimeUnit;
    };
    payload: {
      value: string;
      unit: string;
    };
    chargerLeadTime: {
      value: string;
      unit: LeadTimeUnit;
    };
    deliveryAddress: string;
    totalVehicles: number;
    vehicleNumber: number;
  };
}

const minimumTwoIntegerDigitsFormatter = new Intl.NumberFormat("en-US", {
  minimumIntegerDigits: 2,
});
function QuoteOrderDetailsSection({ details }: QuoteOrderDetailsSectionProps) {
  const {
    quoteFormattedId,
    quoteLink,
    groupName,
    model,
    vehicleLeadTime,
    chargerLeadTime,
    payload,
    deliveryAddress,
    totalVehicles,
    vehicleNumber,
  } = details;

  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const chargerLeadTimeRoundedCeil = useMemo(
    () =>
      Number(chargerLeadTime.value)
        ? getBuildLeadTimeFromTimeGivenInDays(
            getLeadTimeInDays(
              Number(chargerLeadTime?.value) || 0,
              chargerLeadTime?.unit,
            ),
          )
        : "-",
    [chargerLeadTime?.unit, chargerLeadTime.value],
  );

  return (
    <MainContainer>
      <MuiBox className="quote-and-order-details">
        <Typography
          id={`view-quote-link--${quoteFormattedId}`}
          onClick={() => quoteLink && setIsPdfModalOpen(true)}
          className={`quote-link${!quoteLink ? " disabled" : ""}`}
        >
          View Quote
        </Typography>
        <MuiBox className="order-details">
          {groupName && (
            <MuiBox className="order-detail-item">
              <MuiBox className="order-detail-item-label">
                Group Details:
              </MuiBox>
              <MuiBox className="order-detail-item-value">
                {groupName}&nbsp;&nbsp;|&nbsp;&nbsp;
                {minimumTwoIntegerDigitsFormatter.format(vehicleNumber)}/
                {minimumTwoIntegerDigitsFormatter.format(totalVehicles)}
              </MuiBox>
            </MuiBox>
          )}
          <MuiBox className="order-detail-item">
            <MuiBox className="order-detail-item-label">Model:</MuiBox>
            <MuiBox className="order-detail-item-value">{model}</MuiBox>
          </MuiBox>
          <MuiBox className="order-detail-item">
            <MuiBox className="order-detail-item-label">
              Est. Vehicle Lead Time:
            </MuiBox>
            <MuiBox className="order-detail-item-value">
              {vehicleLeadTime?.value
                ? getBuildLeadTimeFromTimeGivenInDays(
                    getLeadTimeInDays(
                      Number(vehicleLeadTime?.value),
                      vehicleLeadTime?.unit,
                    ),
                  )
                : "-"}
            </MuiBox>
          </MuiBox>
          <MuiBox className="order-detail-item">
            <MuiBox className="order-detail-item-label">
              Est. Charger Lead Time:
            </MuiBox>
            <MuiBox className="order-detail-item-value">
              {chargerLeadTimeRoundedCeil}
            </MuiBox>
          </MuiBox>
          <MuiBox className="order-detail-item">
            <MuiBox className="order-detail-item-label">Payload:</MuiBox>
            <MuiBox className="order-detail-item-value">
              {Number(payload.value).toLocaleString()} {payload.unit}
            </MuiBox>
          </MuiBox>
        </MuiBox>
      </MuiBox>
      <MuiBox className="order-detail-item">
        <MuiBox className="order-detail-item-label">Delivery Address:</MuiBox>
        <MuiBox className="order-detail-item-value">{deliveryAddress}</MuiBox>
      </MuiBox>
      {quoteLink && (
        <PdfModal
          pdfBlobOrString={quoteLink}
          isSecuredString
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
        />
      )}
    </MainContainer>
  );
}

export default QuoteOrderDetailsSection;

const MainContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "20px",

  ".quote-and-order-details": {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "20px",

    ".order-details": {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "10px",
    },

    ".quote-link": {
      color: theme.palette.primary.main,
      fontSize: "0.875rem",
      fontWeight: 700,
      textDecoration: "underline",
      cursor: "pointer",

      "&.disabled": {
        color: theme.palette.custom.greyAccent,
        cursor: "default",
      },
    },
  },

  ".order-detail-item": {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    fontSize: "0.875rem",

    ".order-detail-item-label": {
      minWidth: "12rem",
    },
    ".order-detail-item-value": {
      fontWeight: 600,
    },
  },
}));
