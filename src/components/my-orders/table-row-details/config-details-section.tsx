import { Box, Divider, Typography, styled } from "@mui/material";

import { SheadLogoPng27x32 } from "~/global/icons";
import {
  ColorPickerSectionOptionSchema,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import MuiBox from "~/components/shared/mui-box/mui-box";

interface ConfigDetailsSectionProps {
  config: {
    // paint: QuoteOrder200ResponseSchema["paint"];
    configurationSections: QuoteOrder200ResponseSchema["configurationSections"];
  };
}

function ConfigDetailsSection({ config }: ConfigDetailsSectionProps) {
  const { configurationSections } = config;
  //@ts-ignore
  const paintOption = configurationSections?.paintType
    ?.options?.[0] as ColorPickerSectionOptionSchema;
  const configurationSectionsExceptPaint = Object.values(
    configurationSections || {},
  )?.filter((configSection) => configSection?.title?.toLowerCase() !== "paint");

  return (
    <ConfigDetailsContainer>
      <Typography className="title">Configuration Details:</Typography>
      <MuiBox className="config-details-list">
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Paint</p>
          <MuiBox className="paint-box">
            {paintOption?.title && (
              <ColorContainer paint={paintOption?.hexCode}>
                {String(paintOption?.kontentAi__item__codename)?.startsWith(
                  "shaed_wrapper",
                ) && <img src={SheadLogoPng27x32} alt="" />}
              </ColorContainer>
            )}
            <p className="config-details-list-item-value">
              {paintOption?.title || "-"}
            </p>
          </MuiBox>
        </MuiBox>
        {/* <Divider orientation="horizontal" flexItem /> */}

        {configurationSectionsExceptPaint?.map((configSection) => {
          const sectionTitle = configSection?.title;
          const optionValues = configSection?.options
            ?.map((configOption) => configOption?.title)
            ?.join(", ");

          return (
            <>
              <Divider orientation="horizontal" flexItem />
              <MuiBox className="config-details-list-item">
                <p className="config-details-list-item-label">{sectionTitle}</p>
                <p className="config-details-list-item-value">
                  {optionValues || "-"}
                </p>
              </MuiBox>
            </>
          );
        })}
        {/* <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">
            Powertrain/Battery Capacity
          </p>
          <p className="config-details-list-item-value">
            {battery?.title || "-"}
          </p>
        </MuiBox>
        {dashboard?.title && (
          <>
            <Divider orientation="horizontal" flexItem />
            <MuiBox className="config-details-list-item">
              <p className="config-details-list-item-label">Dashboard</p>
              <p className="config-details-list-item-value">
                {dashboard?.title || "-"}
              </p>
            </MuiBox>
          </>
        )}
        <Divider orientation="horizontal" flexItem />
        <MuiBox className="config-details-list-item">
          <p className="config-details-list-item-label">Upfit</p>
          <p className="config-details-list-item-value">
            {upfitOrChassisTitle || "-"}
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
        </MuiBox> */}
      </MuiBox>
    </ConfigDetailsContainer>
  );
}

export default ConfigDetailsSection;

const ConfigDetailsContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "1.95rem", // 3rem * 0.65 = 1.95rem

  ".title": {
    color: theme.palette.custom.accentBlack,
    fontSize: "0.91rem", // 14px * 0.65 = 0.91rem
    fontWeight: 600,
  },

  ".config-details-list": {
    display: "flex",
    flexDirection: "column",
    gap: "0.65rem", // 1rem * 0.65 = 0.65rem
    alignItems: "flex-start",
    flexShrink: 0,
    width: "100%",
    fontSize: "0.91rem", // 1.4rem * 0.65 = 0.91rem
    [theme.breakpoints.down("md")]: {
      minWidth: "38.35rem", // 59rem * 0.65 = 38.35rem
    },

    ".config-details-list-item": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      gap: "1.3rem", // 2rem * 0.65 = 1.3rem
    },
  },
  ".paint-box": {
    display: "flex",
    gap: "0.52rem", // 0.8rem * 0.65 = 0.52rem
    alignItems: "center",
  },
  ".config-details-list-item-value": {
    fontWeight: 500,
    textAlign: "right",
    maxWidth: "32.5rem", // 50rem * 0.65 = 32.5rem
    [theme.breakpoints.down("md")]: {
      width: "50%",
    },
  },
  ".config-details-list-item-label": {
    color: theme.palette.primary.main,
    fontSize: "0.91rem", // 1.4rem * 0.65 = 0.91rem
    fontWeight: 600,
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
  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  img: {
    height: "80%",
    width: "80%",
    objectFit: "contain",
  },
}));
