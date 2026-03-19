import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  styled,
} from "@mui/material";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import MuiBox from "~/components/shared/mui-box/mui-box";

export default function BuildSummaryCard() {
  const { selectedGroup } = useQuotationSummaryPageContextValue();

  return (
    <BuildSummaryCardStyled disableGutters>
      <AccordionSummary
        id="build-summary-card-accordion-header"
        expandIcon={<ExpandMore />}
      >
        <Typography className="heading">Build Summary</Typography>
      </AccordionSummary>

      <AccordionDetails>
        {/* {Boolean(selectedGroup?.chassis) && (
          <>
            {selectedGroup?.chassis?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Chassis
                  {Number(selectedGroup?.quantity) > 1 && (
                    <span className="detail-title--app-color">
                      <br />x{selectedGroup.quantity}
                    </span>
                  )}
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Chassis</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.chassis?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.chassis?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.chassis?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )} */}

        {Boolean(selectedGroup?.paintType?.title) && (
          <>
            {selectedGroup?.paintType?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Paint <br />
                  <span>
                    {selectedGroup?.paintType?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </span>
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Paint</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.paintType?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.paintType?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.paintType?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )}

        {selectedGroup?.configurationSections
          ?.filter((configSection) => {
            const selectedOptions = configSection?.options?.filter(
              (configOption) => configOption?.is_selected,
            );

            return Boolean(selectedOptions?.length);
          })
          ?.map((configSection) => {
            const sectionTitle = configSection?.title;
            const isOptionIncluded = configSection?.options?.[0]?.is_included;

            return isOptionIncluded ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  {sectionTitle} <br />
                  <span>
                    {configSection?.options?.[0]?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </span>
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">{sectionTitle}</Typography>
                {configSection?.options
                  ?.filter((configOption) => configOption?.is_selected)
                  ?.map((configOption, index) => (
                    <Typography key={index} className="detail-row">
                      <Typography className="detail-title--app-color">
                        {configOption?.title}
                        {Number(selectedGroup?.quantity) > 1 && (
                          <>
                            <br />x{selectedGroup?.quantity || 1}
                          </>
                        )}
                      </Typography>
                      <Typography className="detail-value">
                        +{configOption?.price_unit}
                        {getLocaleFormattedNumber(configOption?.price)}
                      </Typography>
                    </Typography>
                  ))}
              </MuiBox>
            );
          })}

        {/* {selectedGroup?.batteryCapacity?.is_included ? (
          <MuiBox className="detail-row">
            <Typography className="detail-title">
              Battery <br />
              <span>
                {selectedGroup?.batteryCapacity?.title}{" "}
                {Number(selectedGroup?.quantity) > 1 && (
                  <>
                    <br />x{selectedGroup?.quantity || 1}
                  </>
                )}
              </span>
            </Typography>
            <Typography className="detail-value">Included</Typography>
          </MuiBox>
        ) : (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Battery</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.batteryCapacity?.title}
                {Number(selectedGroup?.quantity) > 1 && (
                  <>
                    <br />x{selectedGroup?.quantity || 1}
                  </>
                )}
              </Typography>
              <Typography className="detail-value">
                +{selectedGroup?.batteryCapacity?.price_unit}
                {getLocaleFormattedNumber(
                  selectedGroup?.batteryCapacity?.price,
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )}

        {Boolean(selectedGroup?.dashboard) && (
          <>
            {selectedGroup?.dashboard?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Dashboard <br />
                  <span>
                    {selectedGroup?.dashboard?.title}{" "}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </span>
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Dashboard</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.dashboard?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.dashboard?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.dashboard?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )}

        {selectedGroup?.upfit && (
          <>
            {selectedGroup?.upfit?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Upfit{" "}
                  {Number(selectedGroup?.quantity) > 1 && (
                    <>
                      <br />
                      <span className="detail-title--app-color">
                        x{selectedGroup?.quantity || 1}
                      </span>
                    </>
                  )}
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Upfit</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.upfit?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.upfit?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.upfit?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )}

        {selectedGroup?.shelving?.title && (
          <>
            {selectedGroup?.shelving?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Shelving{" "}
                  {Number(selectedGroup?.quantity) > 1 && (
                    <>
                      <br />
                      <span className="detail-title--app-color">
                        x{selectedGroup?.quantity || 1}
                      </span>
                    </>
                  )}
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Shelving</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.shelving?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.shelving?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.shelving?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )}

        {(selectedGroup?.accessories || [])?.length > 0 && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Accessories</Typography>
            {selectedGroup?.accessories?.map((accessory, index) => (
              <Typography key={index} className="detail-row">
                <Typography className="detail-title--app-color">
                  {accessory?.title}
                  {Number(selectedGroup?.quantity) > 1 && (
                    <>
                      <br />x{selectedGroup?.quantity || 1}
                    </>
                  )}
                </Typography>
                <Typography className="detail-value">
                  +{accessory?.price_unit}
                  {getLocaleFormattedNumber(accessory?.price)}
                </Typography>
              </Typography>
            ))}
          </MuiBox>
        )}

        {selectedGroup?.charger?.title && (
          <>
            {selectedGroup?.charger?.is_included ? (
              <MuiBox className="detail-row">
                <Typography className="detail-title">
                  Charger
                  {Number(selectedGroup?.quantity) > 1 && (
                    <>
                      <br />
                      <span className="detail-title--app-color">
                        x{selectedGroup?.quantity || 1}
                      </span>
                    </>
                  )}
                </Typography>
                <Typography className="detail-value">Included</Typography>
              </MuiBox>
            ) : (
              <MuiBox className="detail-row-container">
                <Typography className="detail-title">Charger</Typography>
                <Typography className="detail-row">
                  <Typography className="detail-title--app-color">
                    {selectedGroup?.charger?.title}
                    {Number(selectedGroup?.quantity) > 1 && (
                      <>
                        <br />x{selectedGroup?.quantity || 1}
                      </>
                    )}
                  </Typography>
                  <Typography className="detail-value">
                    +{selectedGroup?.charger?.price_unit}
                    {getLocaleFormattedNumber(selectedGroup?.charger?.price)}
                  </Typography>
                </Typography>
              </MuiBox>
            )}
          </>
        )} */}
      </AccordionDetails>
    </BuildSummaryCardStyled>
  );
}

const BuildSummaryCardStyled = styled(Accordion)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "8px 4px",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },

  ".heading": {
    fontSize: "0.875rem",
    fontWeight: 700,
  },

  ".detail-row-container": {
    marginTop: "1rem",

    ".detail-row": {
      marginTop: "0.25rem",
    },
  },

  ".detail-row": {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "1rem",
  },
  ".detail-row--top-border": {
    borderTop: `1px solid ${theme.palette.custom.greyAccent}`,
    paddingTop: "1rem",
  },

  ".detail-title": {
    fontSize: "0.875rem",
    fontWeight: 400,

    span: {
      color: theme.palette.primary.main,
      fontSize: "0.75rem",
      fontWeight: 500,
    },
  },
  ".detail-title--app-color": {
    fontSize: "0.75rem",
    fontWeight: 500,
    color: theme.palette.primary.main,
  },

  ".detail-value": {
    fontWeight: 500,
    fontSize: "0.875rem",
  },
}));
