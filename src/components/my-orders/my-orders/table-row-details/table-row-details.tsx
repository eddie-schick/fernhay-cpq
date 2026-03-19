// @ts-nocheck - Row data has dynamic fields (paint, upfits, shelving, etc.) from demo/API data
import React, { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { Theme, styled, useMediaQuery, useTheme } from "@mui/material";

import { QUOTE_ORDER_STATUSES } from "~/constants/constants";

import { FrenhayVehiclePng } from "~/global/images";
import {
  LeadTimeUnit,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { ORDER_PIPELINE_STAGES } from "~/data/demo-orders";
import {
  pipelineStageToStatus,
  generateOemOrderNo,
  updateLocalOrder,
} from "~/services/order-service";
import { updateOrderById } from "~/store/slices/my-orders/slice";

import { GetVinsResultType } from "~/context/my-orders-page-context";

import MuiBox from "~/components/shared/mui-box/mui-box";

import ConfigDetailsSection from "./config-details-section";
import type { PipelineHistoryItem } from "./row-details-status-tracking";
import QuoteOrderDetailsSection from "./quote-order-details-section";
import RowDetailsStatusTracking from "./row-details-status-tracking";

export interface TableRowDetailsProps {
  row: QuoteOrder200ResponseSchema;
  allVins: { vin: string; id: string }[];
  allVinsQueryState: GetVinsResultType | null;
  onViewQuote?: () => void;
}

const TableRowDetails = ({
  row,
  allVins,
  allVinsQueryState,
  onViewQuote,
}: TableRowDetailsProps) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isCancelled = false;
  const storeDispatch = useDispatch();

  // Local state for pipeline stage so edits reflect immediately
  const [localPipelineStage, setLocalPipelineStage] = useState<number>(
    (row as any).pipelineStage || 1,
  );
  const [localPipelineHistory, setLocalPipelineHistory] = useState<PipelineHistoryItem[] | undefined>(
    (row as any).pipelineHistory,
  );
  const [localOrderNo, setLocalOrderNo] = useState<string | null>(row?.orderNo || null);

  const handleStageUpdate = useCallback(
    (newStage: number, updatedHistory: PipelineHistoryItem[]) => {
      setLocalPipelineStage(newStage);
      setLocalPipelineHistory(updatedHistory);

      // Auto-populate OEM Order # when reaching "Order Received" (stage >= 3)
      let orderNo = localOrderNo;
      if (newStage >= 3 && !orderNo) {
        orderNo = generateOemOrderNo(row?.formattedId || "FH-0000");
        setLocalOrderNo(orderNo);
      }
      // Clear OEM Order # if going back below stage 3
      if (newStage < 3) {
        orderNo = null;
        setLocalOrderNo(null);
      }

      const newStatus = pipelineStageToStatus(newStage);

      // Update Redux store
      storeDispatch(
        updateOrderById({
          id: row?.id,
          data: {
            pipelineStage: newStage,
            pipelineHistory: updatedHistory,
            status: { id: `status-${row?.id}`, group: "quote", status: newStatus },
            statusV2: newStatus,
            orderNo,
          },
        }),
      );

      // Persist to localStorage for user-created orders
      updateLocalOrder(row?.id, {
        pipelineStage: newStage,
        pipelineHistory: updatedHistory,
        status: { id: `status-${row?.id}`, group: "quote", status: newStatus },
        statusV2: newStatus,
        orderNo,
      } as any);
    },
    [localOrderNo, row?.formattedId, row?.id, storeDispatch],
  );

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

  // Use the final configured vehicle image (upfit body image > chassis image > fallback)
  const getVehicleImage = (() => {
    const upfitOrChassis = row?.upfits?.[1] || row?.upfits?.[0];
    if (row?.upfits?.[1]) {
      const imageWithMatchingColorCode =
        upfitOrChassis?.additional_images?.find((obj) => {
          const colorCodeInImageName = obj?.name
            ?.split("__")?.[1]
            ?.split(".")?.[0];

          return colorCodeInImageName === row?.paint?.colorCode;
        });

      return imageWithMatchingColorCode?.url || upfitOrChassis?.image?.url;
    }

    return upfitOrChassis?.image?.url;
  })();

  // Derive status from local pipeline stage name for consistency with the timeline
  const derivedStatus = (ORDER_PIPELINE_STAGES[localPipelineStage - 1]?.name || pipelineStageToStatus(localPipelineStage)) as OrderStatusValue;

  const renderQuoteDetailsSection = () => {
    return (
      <QuoteOrderDetailsSection
        details={{
          quoteLink,
          groupName: row.orderType === "Fleet" ? row.group : null,
          model: row.model,
          vehicleLeadTime: {
            value: row.leadTime?.value.toString() || "-",
            unit: (row.leadTime?.unit || "day") as LeadTimeUnit,
          },
          payload: {
            value: row.payload?.value.toString() || "-",
            unit: row.payload?.unit || "-",
          },
          chargerLeadTime: {
            value: row.charger?.leadtime
              ? row.charger?.leadtime.toString()
              : "-",
            unit: row.charger?.leadtime_unit || "day",
          },
          deliveryAddress: row.customer.address || "-",
          totalVehicles: row?.groupQuantity,
          vehicleNumber: row?.groupVehicleIndex,
        }}
        onViewQuote={onViewQuote}
      />
    );
  };

  return (
    <StyledTableRowDetails isCancelled={isCancelled}>
      {!isTablet && (
        <>
          <MuiBox className="vehicle-image-container">
            <img src={getVehicleImage || FrenhayVehiclePng} alt="vehicle" />
          </MuiBox>
          <MuiBox className="vehicle-details-top-container">
            {derivedStatus !== (QUOTE_ORDER_STATUSES.CANCELLED as OrderStatusValue) && (
              <RowDetailsStatusTracking
                status={derivedStatus}
                pipelineHistory={localPipelineHistory}
                pipelineStage={localPipelineStage}
                estimatedDeliveryDate={(row as any).estimatedDeliveryDate}
                onStageUpdate={handleStageUpdate}
              />
            )}
            {renderQuoteDetailsSection()}
          </MuiBox>
          <MuiBox></MuiBox>
          <ConfigDetailsSection
            config={{
              upfits: row.upfits,
              accessories: row.accessories,
              battery: row.battery,
              charger: row.charger,
              paint: row.paint,
              shelving: row.shelving,
            }}
          />
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
                <img
                  src={getVehicleImage || FrenhayVehiclePng}
                  alt="vehicle"
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
              {derivedStatus !== (QUOTE_ORDER_STATUSES.CANCELLED as OrderStatusValue) && (
                <RowDetailsStatusTracking
                  status={derivedStatus}
                  pipelineHistory={localPipelineHistory}
                  pipelineStage={localPipelineStage}
                  estimatedDeliveryDate={(row as any).estimatedDeliveryDate}
                  onStageUpdate={handleStageUpdate}
                />
              )}

              <MuiBox></MuiBox>
              <ConfigDetailsSection
                config={{
                  upfits: row.upfits,
                  accessories: row.accessories,
                  battery: row.battery,
                  charger: row.charger,
                  paint: row.paint,
                  shelving: row.shelving,
                }}
              />
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
      },

      img: {
        maxWidth: "16rem",
        objectFit: "cover",
        // width: "100%",
        width: "16rem",
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
