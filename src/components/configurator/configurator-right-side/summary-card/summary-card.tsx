import { Box, Typography, styled } from "@mui/material";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { RootState, useAppSelector } from "~/store";
import {
  calculatedSingleGroupPayloadPerSingleVehicleSelector,
  getBuildLeadTimeForGroupPerVehicle,
  calculatedSingleGroupTotalPricePerVehicleSelector,
  calculatedSingleGroupGrossTotalPriceSelector,
} from "~/store/slices/quotes/slice";

import { useConfiguratorPageContextValue } from "~/context/configurator-page-provider";

import MuiBox from "~/components/shared/mui-box/mui-box";

export default function SummaryCard() {
  const { newQuoteById, selectedGroup } = useConfiguratorPageContextValue();

  const totalPricePerVehicle = useAppSelector(() =>
    calculatedSingleGroupTotalPricePerVehicleSelector(selectedGroup),
  );
  const totalPriceForPerVehicle = useAppSelector(() =>
    calculatedSingleGroupGrossTotalPriceSelector(selectedGroup),
  );

  // Base MSRP is always $3,000 above the per-vehicle total price
  const baseMsrp = (totalPricePerVehicle?.value || 0) + 3000;
  const msrpCurrency = totalPricePerVehicle?.currency || "$";
  const calculatedTotalPayloadForSingleVehicle = useAppSelector(() =>
    calculatedSingleGroupPayloadPerSingleVehicleSelector(
      selectedGroup,
      newQuoteById!,
    ),
  );
  const totalLeadTimePerVehicle = useAppSelector((state: RootState) =>
    getBuildLeadTimeForGroupPerVehicle(state, {
      orderId: newQuoteById?.id as number,
      groupId: selectedGroup?.id as string,
    }),
  ) as string;

  return (
    <SummaryCardStyled>
      <MuiBox className="summary-row">
        <Typography className="detail-title">Base MSRP: </Typography>
        <Typography className="detail-value">
          {msrpCurrency}
          {getLocaleFormattedNumber(baseMsrp)}
        </Typography>
      </MuiBox>

      <MuiBox className="summary-row">
        <Typography className="detail-title">Total Price: </Typography>
        <Typography className="detail-value">
          {totalPriceForPerVehicle?.currency}
          {getLocaleFormattedNumber(totalPriceForPerVehicle?.value)}
        </Typography>
      </MuiBox>

      <MuiBox className="summary-row">
        <Typography className="detail-title">Payload: </Typography>
        <Typography className="detail-value">
          {getLocaleFormattedNumber(
            calculatedTotalPayloadForSingleVehicle?.value,
            0,
          )}{" "}
          {calculatedTotalPayloadForSingleVehicle?.unit}
        </Typography>
      </MuiBox>

      <MuiBox className="summary-row">
        <Typography className="detail-title">
          Est. Vehicle Lead Time:{" "}
        </Typography>
        <Typography className="detail-value">
          {totalLeadTimePerVehicle}
        </Typography>
      </MuiBox>
    </SummaryCardStyled>
  );
}

const SummaryCardStyled = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.custom.tertiary}`,
  borderRadius: "0.625rem",
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",

  ".summary-row": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },

  ".detail-title,.detail-value": {
    fontSize: "1rem",
    fontWeight: 700,
  },

  ".detail-title": {
    color: theme.palette.custom.accentBlack,
  },

  ".detail-value": {
    color: theme.palette.primary.main,
  },
}));
