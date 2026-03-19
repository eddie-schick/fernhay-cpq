import { useMemo } from "react";

import {
  Theme,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { QUOTE_ORDER_STATUSES } from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import {
  ColorPickerSectionOptionSchema,
  LeadTimeUnit,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { useUpdateQuoteMutation } from "~/store/endpoints/quotes/quotes";

import { GetVinsResultType } from "~/context/my-orders-page-context";

import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

import ConfigDetailsSection from "./config-details-section";
import QuoteOrderDetailsSection from "./quote-order-details-section";
import RowDetailsStatusTracking from "./row-details-status-tracking";
import RowDetailsVinField from "./row-details-vin-field";

export interface TableRowDetailsProps {
  row: QuoteOrder200ResponseSchema;
}

const TableRowDetails = ({ row }: TableRowDetailsProps) => {
  const configurationSections = Object.values(row?.configurationSections || {});
  //@ts-ignore
  const paintOption = Object.values(configurationSections || {})?.find(
    (configSection) => configSection?.title?.toLowerCase() === "paint",
  )?.options?.[0] as ColorPickerSectionOptionSchema;
  const chargerOption = Object.values(configurationSections || {})?.find(
    (configSection) => configSection?.title?.toLowerCase() === "charger",
  )?.options?.[0];

  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isCancelled = false;
  const { triggerToast } = useCustomToast();

  const [updateQuote, { isLoading }] = useUpdateQuoteMutation();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function isWithErrorCode(error: any): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error;
  }

  const handleVinUpdate = async (
    vin: string,
    quoteId: string | number,
    vehicleQuoteId: string | number,
    cb: () => void,
    // eslint-disable-next-line @typescript-eslint/require-await
  ) => {
    if (vin.length === 17) {
      try {
        const response = await updateQuote({
          id: quoteId,
          data: {
            vehicles: [
              {
                id: vehicleQuoteId,
                vin: vin,
                vinConfirmed: true,
              },
            ],
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
          },
        }).unwrap();

        console.log("resp", response);

        if (response) {
          triggerToast({
            variant: "success",
            message: "VIN Updated Successfully",
          });

          cb();
        } else {
          triggerToast({
            variant: "error",
            message: "An Error occured",
          });
        }
      } catch (error: unknown) {
        if (isWithErrorCode(error) && error.code === "ERR_BAD_REQUEST") {
          triggerToast({
            variant: "error",
            message: "VIN already exists for another vehicle",
          });
        } else {
          triggerToast({
            variant: "error",
            message: "An Error occured",
          });
        }
      }

      return;
    }

    triggerToast({
      message: `VIN No. should consist of 17 characters`,
      variant: "error",
    });
  };

  const quoteLink = useMemo(() => {
    if (isCancelled) return null;
    if (row.quote?.signedFileLink) {
      return row.quote?.signedFileLink;
    }
    if (row.quote?.fileLink) {
      return row.quote?.fileLink;
    }
    return null;
  }, [isCancelled, row.quote?.fileLink, row.quote?.signedFileLink]);

  console.log("%cvec img", "background-color:purple;color:hwhite", {
    image: row?.vehicle?.vehicleImage,
    paint: paintOption,
    row,
  });

  const getVehicleImage = (() => {
    const chassisOption = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "chassis",
    )?.options?.[0];
    const upfitOption = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "upfit",
    )?.options?.[0];
    const upfitOrChassis = upfitOption || chassisOption;

    const imageWithMatchingColorCode = upfitOrChassis?.additional_images?.find(
      (obj) => {
        const colorCodeInImageName = obj?.name
          ?.split("__")?.[1]
          ?.split(".")?.[0];

        const doesItemColorCodeMatch =
          colorCodeInImageName === paintOption?.hexCode;
        const checksToPass = [doesItemColorCodeMatch];

        if (
          String(paintOption?.kontentAi__item__codename)?.startsWith(
            "shaed_wrapper",
          )
        ) {
          checksToPass.push(
            Boolean(obj?.name?.toLowerCase()?.startsWith("shaed-wrapper")),
          );
        } else {
          checksToPass.push(
            !obj?.name?.toLowerCase()?.startsWith("shaed-wrapper"),
          );
        }

        return checksToPass?.every((val) => Boolean(val));
      },
    );

    console.log(
      "%cimageWithMatchingColorCode:",
      "background-color:purple;color:white;",
      {
        imageWithMatchingColorCode,
        upfitOrChassis,
      },
    );
    return imageWithMatchingColorCode?.url || upfitOrChassis?.image?.url;
  })();

  const renderQuoteDetailsSection = () => {
    return (
      <QuoteOrderDetailsSection
        details={{
          quoteFormattedId: row?.formattedId,
          quoteLink,
          groupName: row.orderType === "Fleet" ? row.group : null,
          model: row.model,
          vehicleLeadTime: {
            value: row.leadTime?.value?.toString() || "-",
            unit: (row.leadTime?.unit || "day") as LeadTimeUnit,
          },
          payload: {
            value: row.payload?.value?.toString() || "-",
            unit: row.payload?.unit || "-",
          },
          chargerLeadTime: {
            value: chargerOption?.leadtime
              ? chargerOption?.leadtime.toString()
              : "-",
            unit: chargerOption?.leadtime_unit || "day",
          },
          deliveryAddress: row.customer.address || "-",
          // totalVehicles: row?.groupQuantity,
          totalVehicles: row?.vehicles?.length || 0,
          vehicleNumber: row?.groupVehicleIndex,
        }}
      />
    );
  };

  const renderConfigDetailsSection = () => {
    return (
      <ConfigDetailsSection
        config={{
          configurationSections: row?.configurationSections,
          // paint: row?.paint,
          // upfits: row?.upfits,
          // accessories: row?.accessories,
          // battery: row?.battery,
          // charger: row?.charger,
          // shelving: row?.shelving,
          // dashboard: row?.dashboard,
        }}
      />
    );
  };

  return (
    <StyledTableRowDetails isCancelled={isCancelled}>
      {!isTablet && (
        <>
          <MuiBox className="vehicle-image-container">
            {getVehicleImage ? (
              <img src={getVehicleImage} alt="vehicle" />
            ) : (
              <Typography>No Image</Typography>
            )}
          </MuiBox>
          <MuiBox className="vehicle-details-top-container">
            <MuiBox className="vehicle-details-vin-and-status-container">
              <RowDetailsVinField
                vin={row?.vinConfirmed ? row?.vin : ""}
                handleSave={(vin, cb) =>
                  void handleVinUpdate(
                    vin,
                    row?.id,
                    row.vehicleQuoteId as number | string,
                    cb,
                  )
                }
                isLoading={isLoading}
                isCancelled={isCancelled}
              />

              {row.statusV2 &&
                row.statusV2 !==
                  (QUOTE_ORDER_STATUSES.CANCELLED as OrderStatusValue) && (
                  <RowDetailsStatusTracking
                    status={row.statusV2 || "Cancelled"}
                  />
                )}
            </MuiBox>
            {renderQuoteDetailsSection()}
          </MuiBox>
          <MuiBox></MuiBox>
          {renderConfigDetailsSection()}
        </>
      )}
      {isTablet && (
        <>
          <MuiBox
            sx={{
              display: "grid",
              gridTemplateColumns: "2.5fr 8fr",
              gap: "1.4rem",
            }}
          >
            <MuiBox
              sx={(thm: Theme) => ({
                display: "grid",
                gap: "0.875rem",

                [thm.breakpoints.down("sm")]: {
                  minWidth: "18.2rem",
                },
              })}
            >
              <MuiBox className="vehicle-image-container">
                {getVehicleImage ? (
                  <img src={getVehicleImage} alt="vehicle" />
                ) : (
                  <Typography>No Image</Typography>
                )}
              </MuiBox>

              <MuiBox className="vehicle-details-vin-and-status-container">
                <RowDetailsVinField
                  vin={row?.vinConfirmed ? row?.vin : ""}
                  handleSave={(vin, cb) =>
                    void handleVinUpdate(
                      vin,
                      row?.id,
                      row.vehicleQuoteId as number | string,
                      cb,
                    )
                  }
                  isLoading={isLoading}
                  isCancelled={isCancelled}
                />
              </MuiBox>
              {renderQuoteDetailsSection()}
            </MuiBox>
            <MuiBox
              sx={{
                display: "grid",
                gap: "1.4rem",
              }}
            >
              {row.statusV2 &&
                row.statusV2 !==
                  (QUOTE_ORDER_STATUSES.CANCELLED as OrderStatusValue) && (
                  <RowDetailsStatusTracking
                    status={row.statusV2 || "Cancelled"}
                  />
                )}

              <MuiBox></MuiBox>
              {renderConfigDetailsSection()}
            </MuiBox>
          </MuiBox>
        </>
      )}
    </StyledTableRowDetails>
  );
};

export default TableRowDetails;

const StyledTableRowDetails = styled(MuiBox)<{ isCancelled: boolean }>(
  ({ theme, isCancelled }) => ({
    display: "grid",
    gridTemplateColumns: "2fr 8fr",
    gridTemplateRows: "1fr auto",
    gridColumnGap: "1.8rem",
    gridRowGap: "4rem",
    padding: "4rem 3rem 6rem",
    fontSize: "1.4rem",
    lineHeight: 1.2,
    filter: isCancelled ? "grayscale(100%)" : "none",
    opacity: isCancelled ? 0.7 : 1,

    [theme.breakpoints.down("lg")]: {
      gridTemplateColumns: "1fr",
      padding: "4rem 2rem",
    },

    ".vehicle-image-container": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.5rem",
      border: "1px solid #E8E8E8",
      background: theme.palette.custom.white,
      padding: "0 0.75rem",
      maxHeight: "15.4rem",
      maxWidth: "18.4rem",

      [theme.breakpoints.down("lg")]: {
        maxWidth: "22rem",
        minHeight: "15rem",
      },

      img: {
        maxWidth: "16rem",
        objectFit: "contain",
        height: "100%",
        width: "100%",
      },
    },

    ".vehicle-details-top-container": {
      gap: "1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },

    ".vehicle-details-vin-and-status-container": {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
    },
  }),
);
