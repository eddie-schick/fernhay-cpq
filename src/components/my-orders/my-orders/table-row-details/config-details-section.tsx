// @ts-nocheck - Row data has dynamic fields (paint, upfits, shelving, etc.) from demo/API data
import { Box, Divider, Typography, styled } from "@mui/material";

import { QuoteOrder200ResponseSchema } from "~/global/types/types";

import MuiBox from "~/components/shared/mui-box/mui-box";

interface ConfigDetailsSectionProps {
  config: {
    upfits: QuoteOrder200ResponseSchema["upfits"];
    charger: QuoteOrder200ResponseSchema["charger"];
    shelving: QuoteOrder200ResponseSchema["shelving"];
    accessories: QuoteOrder200ResponseSchema["accessories"];
    paint: QuoteOrder200ResponseSchema["paint"];
    battery: QuoteOrder200ResponseSchema["battery"];
  };
}

function ConfigDetailsSection({ config }: ConfigDetailsSectionProps) {
  const { accessories, battery, charger, paint, upfits, shelving } = config;

  return (
    <ConfigDetailsContainer>
      <Typography className="title">Configuration Details:</Typography>
      <MuiBox className="config-details-list">
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Paint</p>
          <MuiBox className="paint-box">
            {paint?.name && (
              <ColorContainer paint={paint?.colorCode}></ColorContainer>
            )}
            <p className="config-details-list-item-value">
              {paint?.name || "-"}
            </p>
          </MuiBox>
        </MuiBox>
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">
            Powertrain/Battery Capacity
          </p>
          <p className="config-details-list-item-value">
            {battery?.title || "-"}
          </p>
        </MuiBox>
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Upfit</p>
          <p className="config-details-list-item-value">
            {upfits?.[0]?.title || "-"}
          </p>
        </MuiBox>
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Shelving</p>
          <p className="config-details-list-item-value">
            {shelving?.title || "-"}
          </p>
        </MuiBox>
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Charger</p>
          <p className="config-details-list-item-value">
            {charger?.title || "-"}
          </p>
        </MuiBox>
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Accessories</p>
          <p className="config-details-list-item-value">
            {accessories && accessories.length
              ? accessories.map((acc) => acc.title).join(", ")
              : "-"}
          </p>
        </MuiBox>
      </MuiBox>
    </ConfigDetailsContainer>
  );
}

export default ConfigDetailsSection;

const ConfigDetailsContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  maxWidth: "28rem",

  ".title": {
    color: theme.palette.custom.accentBlack,
    fontSize: "0.875rem",
    fontWeight: 600,
  },

  ".config-details-list": {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    alignItems: "flex-start",
    flexShrink: 0,
    width: "100%",
    fontSize: "0.8rem",

    ".config-details-list-item": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: "1rem",
    },
  },
  ".paint-box": {
    display: "flex",
    gap: "0.4rem",
    alignItems: "center",
  },
  ".config-details-list-item-value": {
    fontWeight: 500,
    textAlign: "right",
  },
  ".config-details-list-item-label": {
    color: theme.palette.primary.main,
    fontSize: "0.8rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
}));

const ColorContainer = styled(Box, {
  shouldForwardProp: (propName) => propName !== "paint",
})<{ paint: string }>(({ paint }) => ({
  backgroundColor: paint,
  borderRadius: "1.3rem", // 2rem * 0.65 = 1.3rem
  width: "1.3rem", // 2rem * 0.65 = 1.3rem
  height: "1.3rem", // 2rem * 0.65 = 1.3rem
  backgroundImage: "linear-gradient(to bottom, transparent, #00000030)",
}));
