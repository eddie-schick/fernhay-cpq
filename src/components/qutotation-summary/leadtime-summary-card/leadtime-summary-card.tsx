import { useMemo } from "react";
import dayjs from "dayjs";

import { ExpandMore } from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  styled,
} from "@mui/material";

import { getLeadTimeInDays } from "~/utils/date-utils";
import getBuildLeadTimeFromTimeGivenInDays from "~/utils/misc";

import { RootState, useAppSelector } from "~/store";
import { getBuildLeadTimeForGroupPerVehicle } from "~/store/slices/quotes/slice";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import MuiBox from "~/components/shared/mui-box/mui-box";

export default function LeadtimeSummaryCard() {
  const { newQuoteById, selectedGroup } = useQuotationSummaryPageContextValue();

  const totalLeadTimePerVehicle = useAppSelector((state: RootState) =>
    getBuildLeadTimeForGroupPerVehicle(state, {
      orderId: newQuoteById?.id as number,
      groupId: selectedGroup?.id as string,
    }),
  ) as string;

  const totalLeadTimeDays = useAppSelector((state: RootState) =>
    getBuildLeadTimeForGroupPerVehicle(state, {
      orderId: newQuoteById?.id as number,
      groupId: selectedGroup?.id as string,
      dontReturnText: true,
    }),
  ) as { value: number; unit: string } | null;

  const estimatedDeliveryDate = useMemo(() => {
    const days = totalLeadTimeDays?.value;
    if (!days || days <= 0) return null;
    return dayjs().add(days, "day").format("MMMM D, YYYY");
  }, [totalLeadTimeDays?.value]);

  return (
    <LeadtimeSummaryCardStyled disableGutters>
      <AccordionSummary
        id="leadtime-summary-card-accordion-header"
        expandIcon={<ExpandMore />}
      >
        <Typography className="heading">Lead Time Summary</Typography>

        <Typography className="total-text">
          Total Est. Lead Time*:&nbsp;
          <span>{totalLeadTimePerVehicle}</span>
        </Typography>

        {estimatedDeliveryDate && (
          <Typography className="delivery-date-text">
            Est. Delivery Date:&nbsp;
            <span>{estimatedDeliveryDate}</span>
          </Typography>
        )}
      </AccordionSummary>

      <AccordionDetails>
        <Typography sx={{ fontSize: "0.75rem" }}>
          *This lead time is based on chassis arrival. Any delay in chassis
          delivery will also affect upfit time.
        </Typography>

        {selectedGroup?.configurationSections
          ?.filter((configSection) => {
            const selectedOptions = configSection?.options?.filter(
              (configOption) => configOption?.is_selected,
            );

            return Boolean(selectedOptions?.length);
          })
          ?.map((configSection, index) => {
            const sectionTitle = configSection?.title;
            const sectionOptions = configSection?.options?.filter(
              (sectionOption) => sectionOption?.is_selected,
            );

            return (
              <MuiBox key={index} className="detail-row-container">
                <Typography className="detail-title">{sectionTitle}</Typography>

                {sectionOptions?.map((sectionOption, index1) => {
                  return (
                    <Typography key={index1} className="detail-row">
                      <Typography className="detail-title--app-color">
                        {sectionOption?.title}
                      </Typography>
                      <Typography className="detail-value">
                        {!sectionOption?.leadtime ? (
                          "-"
                        ) : (
                          <>
                            +
                            {getBuildLeadTimeFromTimeGivenInDays(
                              getLeadTimeInDays(
                                sectionOption?.leadtime || 0,
                                sectionOption?.leadtime_unit,
                              ),
                            )}
                          </>
                        )}
                      </Typography>
                    </Typography>
                  );
                })}
              </MuiBox>
            );
          })}

        {/* {Boolean(selectedGroup?.chassis?.title) && (
          <MuiBox className="detail-row">
            <Typography className="detail-title">Chassis</Typography>
            <Typography className="detail-value">
              +
              {getBuildLeadTimeFromTimeGivenInDays(
                getLeadTimeInDays(
                  selectedGroup?.chassis?.leadtime || 0,
                  selectedGroup?.chassis?.leadtime_unit,
                ),
              )}
            </Typography>
          </MuiBox>
        )}

        {Boolean(selectedGroup?.batteryCapacity?.leadtime) && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Battery</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.batteryCapacity?.title}
              </Typography>
              <Typography className="detail-value">
                {!selectedGroup?.batteryCapacity?.leadtime ? (
                  "-"
                ) : (
                  <>
                    +
                    {getBuildLeadTimeFromTimeGivenInDays(
                      getLeadTimeInDays(
                        selectedGroup?.batteryCapacity?.leadtime || 0,
                        selectedGroup?.batteryCapacity?.leadtime_unit,
                      ),
                    )}
                  </>
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )}

        {Boolean(selectedGroup?.dashboard?.leadtime) && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Dashboard</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.dashboard?.title}
              </Typography>
              <Typography className="detail-value">
                {!selectedGroup?.dashboard?.leadtime ? (
                  "-"
                ) : (
                  <>
                    +
                    {getBuildLeadTimeFromTimeGivenInDays(
                      getLeadTimeInDays(
                        selectedGroup?.dashboard?.leadtime || 0,
                        selectedGroup?.dashboard?.leadtime_unit,
                      ),
                    )}
                  </>
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )}

        {Boolean(selectedGroup?.upfit?.leadtime) && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Upfit</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.upfit?.title}
              </Typography>
              <Typography className="detail-value">
                {!selectedGroup?.upfit?.leadtime ? (
                  "-"
                ) : (
                  <>
                    +
                    {getBuildLeadTimeFromTimeGivenInDays(
                      getLeadTimeInDays(
                        selectedGroup?.upfit?.leadtime || 0,
                        selectedGroup?.upfit?.leadtime_unit,
                      ),
                    )}
                  </>
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )}

        {Boolean(selectedGroup?.shelving?.leadtime) && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Shelving</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.shelving?.title}
              </Typography>
              <Typography className="detail-value">
                {!selectedGroup?.shelving?.leadtime ? (
                  "-"
                ) : (
                  <>
                    +
                    {getBuildLeadTimeFromTimeGivenInDays(
                      getLeadTimeInDays(
                        selectedGroup?.shelving?.leadtime || 0,
                        selectedGroup?.shelving?.leadtime_unit,
                      ),
                    )}
                  </>
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )}

        {(selectedGroup?.accessories || [])?.length > 0 && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Accessories</Typography>
            {selectedGroup?.accessories?.map((accessory, index) => (
              <Typography key={index} className="detail-row">
                <Typography className="detail-title--app-color">
                  {accessory?.title}
                </Typography>
                <Typography className="detail-value">
                  {!accessory?.leadtime ? (
                    "-"
                  ) : (
                    <>
                      +
                      {getBuildLeadTimeFromTimeGivenInDays(
                        getLeadTimeInDays(
                          accessory?.leadtime || 0,
                          accessory?.leadtime_unit,
                        ),
                      )}
                    </>
                  )}
                </Typography>
              </Typography>
            ))}
          </MuiBox>
        )}

        {Boolean(selectedGroup?.charger?.leadtime) && (
          <MuiBox className="detail-row-container">
            <Typography className="detail-title">Charger</Typography>
            <Typography className="detail-row">
              <Typography className="detail-title--app-color">
                {selectedGroup?.charger?.title}
              </Typography>
              <Typography className="detail-value">
                {!selectedGroup?.charger?.leadtime ? (
                  "-"
                ) : (
                  <>
                    +
                    {getBuildLeadTimeFromTimeGivenInDays(
                      getLeadTimeInDays(
                        selectedGroup?.charger?.leadtime || 0,
                        selectedGroup?.charger?.leadtime_unit,
                      ),
                    )}
                  </>
                )}
              </Typography>
            </Typography>
          </MuiBox>
        )} */}
      </AccordionDetails>
    </LeadtimeSummaryCardStyled>
  );
}

const LeadtimeSummaryCardStyled = styled(Accordion)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "8px 4px",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },

  ".MuiAccordionSummary-content": {
    display: "flex",
    flexDirection: "column",
  },

  ".heading": {
    fontSize: "0.875rem",
    fontWeight: 700,
  },

  ".total-text": {
    fontSize: "1rem",
    fontWeight: 700,
    marginTop: "0.375rem",

    span: {
      color: theme.palette.primary.main,
    },
  },

  ".delivery-date-text": {
    fontSize: "0.875rem",
    fontWeight: 600,
    marginTop: "0.25rem",

    span: {
      color: theme.palette.primary.main,
    },
  },

  ".MuiAccordionDetails-root": {
    paddingTop: 0,
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
