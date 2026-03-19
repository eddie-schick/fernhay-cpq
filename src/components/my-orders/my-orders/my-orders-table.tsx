// @ts-nocheck - Row data has dynamic fields (paint, upfits, shelving, etc.) from demo/API data
import React, { useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useNavigate } from "react-router";

import { CircularProgress, Typography, styled, useTheme } from "@mui/material";

import { QUOTE_ORDER_STATUSES, MY_ORDERS_QUOTE_EXPIRY_DAYS } from "~/constants/constants";
import RoutePaths from "~/constants/route-paths";

import { getLocaleFormattedNumber } from "~/utils/misc";

import {
  OrderStatus,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { ORDER_PIPELINE_STAGES } from "~/data/demo-orders";
import { pipelineStageToStatus } from "~/services/order-service";

import { useAppDispatch, useAppSelector } from "~/store";
import { GetQuotesResultType } from "~/store/endpoints/quotes/quotes";
import { myOrdersSelector } from "~/store/slices/my-orders/slice";
import { setEditedQuote } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import { useAuthContextValue } from "~/context/auth-context";
import { useMyOrdersPageContextValue } from "~/context/my-orders-page-context";

import MuiBox from "~/components/shared/mui-box/mui-box";
import PdfModal from "~/components/shared/pdf-modal/pdf-modal";
import StatusBadge from "~/components/shared/status-badge/status-badge";
import UpdateOrCancelOrderModal from "~/components/shared/update-or-cancel-order-modal/update-or-cancel-order-modal";

import TableRowDetails from "./table-row-details/table-row-details";

dayjs.extend(utc);

const MyOrdersTable = ({
  getOrdersQueryState,
  orders,
  fuzzySearchedOrders,
}: {
  getOrdersQueryState: GetQuotesResultType | null;
  orders: QuoteOrder200ResponseSchema[];
  fuzzySearchedOrders: QuoteOrder200ResponseSchema[];
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const storeDispatch = useAppDispatch();
  const [activeModal, setActiveModal] = useState<boolean>(false);
  const [orderToUpdate, setOrderToUpdate] =
    useState<QuoteOrder200ResponseSchema | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | string | null>(null);
  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<Blob | string | null>(null);

  const { quoteStatuses } = useAppSelector(myOrdersSelector);
  const myOrdersSlice = useAppSelector(myOrdersSelector);
  const { orders: stateOrders } = myOrdersSlice;
  const { paginationData, mainTableSearchText } = useAppSelector(myOrdersSelector);
  const { user } = useAuthContextValue();
  const { allVinsQueryState } = useMyOrdersPageContextValue();

  const userDealerName = user?.user ? user?.user?.name : "";

  const handleStatusChange = (
    from: OrderStatus | OrderStatusValue,
    to: OrderStatusValue,
    orderBeingUpdated: QuoteOrder200ResponseSchema,
  ) => {
    const fromStatus = typeof from === "string" ? from : from?.status;
    if (fromStatus === to) return;
    setOrderToUpdate(orderBeingUpdated);
    setNewStatus(
      (quoteStatuses.find((status) => status?.status === to) as OrderStatus) ||
        ({} as OrderStatus),
    );
    setActiveModal(true);
  };

  const allVins: { vin: string; id: string }[] | null = (() => {
    let vins: { vin: string; id: string }[] | null = null;
    if (allVinsQueryState?.isSuccess) {
      vins = allVinsQueryState?.data?.data;
      const allOrders = stateOrders;
      if (allOrders) {
        vins = vins.map((vinObj) => {
          const matchingObj = allOrders.filter(
            (orderObj) => orderObj?.id === vinObj?.id,
          )[0];
          if (matchingObj) {
            return { ...vinObj, vin: matchingObj?.vin };
          } else {
            return vinObj;
          }
        });
        const idsSet = new Set();
        const resultArray: typeof vins = [];
        for (let i = vins.length - 1; i >= 0; i--) {
          const currentId = vins[i].id;
          if (!idsSet.has(currentId)) {
            resultArray.unshift(vins[i]);
            idsSet.add(currentId);
          }
        }
        vins = resultArray;
      }
    }
    return vins;
  })();

  const currentRows: QuoteOrder200ResponseSchema[] =
    mainTableSearchText.length > 0
      ? fuzzySearchedOrders
      : (getOrdersQueryState && orders) || [];

  const isExpiredFunc = (createdAt: string) => {
    const expiryDate = dayjs.utc().subtract(MY_ORDERS_QUOTE_EXPIRY_DAYS, "days");
    return dayjs.utc(createdAt).isBefore(expiryDate);
  };

  const handleQuoteClick = (row: QuoteOrder200ResponseSchema) => {
    const quoteItemIds = currentRows
      ?.filter((r) => r?.formattedId === row?.formattedId)
      ?.map((v) => String(v?.id));

    const quoteId = row?.timestampId;

    const transformRowToNewQuoteShape = {
      customerDetailsForm: {
        ...row?.customer,
        name: row?.customer?.buyerName,
        representativeName: row?.customer?.coBuyerName,
      },
      dealerDetailsForm: {
        ...row?.dealer,
      },
    };

    // Build configurationSections from demo order data so PDF specs render correctly
    const buildConfigSections = () => {
      const sections: any[] = [];
      // Per-unit price from the order (sale price after $3k chassis discount)
      const unitPrice = typeof row?.price === "object"
        ? Number(row?.price?.value) || 0
        : Number(row?.price) || 0;

      // Model section
      sections.push({
        title: "Model",
        is_section_hidden: false,
        options: [{ title: row?.model || row?.vehicleModel || "", is_selected: true, price: 0, price_unit: "$" }],
      });
      // Paint / Color
      if (row?.paint?.name) {
        sections.push({
          title: "Paint",
          is_section_hidden: false,
          options: [{ title: row.paint.name, is_selected: true, price: 0, price_unit: "$" }],
        });
      }
      // Chassis — this is the base MSRP component; the $3k discount is applied automatically
      if (row?.upfits?.[0]?.title) {
        sections.push({
          title: "Chassis",
          is_section_hidden: false,
          is_part_of_base_msrp: true,
          options: [{
            title: row.upfits[0].title,
            is_selected: true,
            is_part_of_base_msrp: true,
            price: unitPrice,
            price_unit: "$",
            option_category: "chassis",
          }],
        });
      }
      // Battery
      if (row?.battery?.title) {
        sections.push({
          title: "Battery",
          is_section_hidden: false,
          options: [{ title: row.battery.title, is_selected: true, price: 0, price_unit: "$" }],
        });
      }
      // Body / Door variant
      if (row?.upfits?.[1]?.title) {
        sections.push({
          title: "Body Configuration",
          is_section_hidden: false,
          options: [{ title: row.upfits[1].title, is_selected: true, price: 0, price_unit: "$" }],
        });
      }
      // Shelving
      if (row?.shelving?.title) {
        sections.push({
          title: "Interior Upfit",
          is_section_hidden: false,
          options: [{ title: row.shelving.title, is_selected: true, price: 0, price_unit: "$" }],
        });
      }
      // Charger
      if (row?.charger?.title) {
        sections.push({
          title: "Charger",
          is_section_hidden: false,
          options: [{ title: row.charger.title, is_selected: true, price: 0, price_unit: "$", option_category: "charger" }],
        });
      }
      // Accessories
      if (row?.accessories?.length > 0) {
        sections.push({
          title: "Accessories",
          is_section_hidden: false,
          options: row.accessories.map((acc: any) => ({
            title: acc?.title || "",
            is_selected: true,
            price: acc?.price || 0,
            price_unit: "$",
          })),
        });
      }
      return sections;
    };

    //@ts-ignore - row has additional fields from demo data
    const finalNewQuoteData: Partial<NewQuoteShape> = {
      ...transformRowToNewQuoteShape,
      id: quoteId || "",
      kontentAi__quoteId: row.id.toString(),
      kontentAi__quoteIds: quoteItemIds,
      isOrdered: true,
      quotationId: row.formattedId,
      vehicle__kontentAi__id: row?.vehicle?.vehicle__kontentAi__id || "",
      vehicle__kontentAi__codename: row?.vehicle?.vehicle__kontentAi__codename || "",
      vehicleModel__kontentAi__codename: "",
      customer: {
        sourceId: undefined,
        wan: undefined,
        deposited: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        customer__kontentAi__codename: undefined,
        ...transformRowToNewQuoteShape.customerDetailsForm,
      },
      vehicleId: "",
      vehicleMake: "",
      vehicleModel: row?.model || "",
      vehicleName: "",
      vehicleImage: "",
      totalQuantity: row?.quantity || 0,
      vehiclePaint: row?.paint?.name || "White (Standard)",
      vehicleBatteryEngine: row?.battery?.title || "",
      vehicleUpfit: row?.upfits?.[0]?.title || "",
      shelving: row?.shelving?.title,
      charger: row?.charger?.title,
      groups: [
        {
          id: row?.groupId,
          quantity: row?.quantity,
          name: row?.group,
          isSelected: true,
          configurationSections: buildConfigSections(),
          paintType: {
            id: "dummy",
            price: 0,
            price_unit: "$",
            title: row?.paint?.name,
            hexCode: row?.paint?.colorCode,
            is_included: true,
            kontentAi__item__codename: row?.paint?.kontentAi__item__codename,
          },
          ...(row?.upfits?.length > 1 && { upfit: row?.upfits[1] }),
          batteryCapacity: row?.battery,
          chassis: row?.upfits?.[0],
          charger: row?.charger,
          accessories: row?.accessories,
          shelving: row?.shelving,
        },
      ],
      destinationAddressForm: {
        address: row?.destinationAddress?.address || "",
        city: row?.destinationAddress?.city || "",
        state: row?.destinationAddress?.state || "",
        zipCode: row?.destinationAddress?.zipCode || "",
        country: row?.destinationAddress?.country || "",
      },
      shipThruDetailsForm: {
        upfit: {
          providerName: row?.shipThruAddresses?.upfit?.providerName || "",
          shipThruCode: row?.shipThruAddresses?.upfit?.shipThruCode || "",
          address: row?.shipThruAddresses?.upfit?.address || "",
          city: row?.shipThruAddresses?.upfit?.city || "",
          state: row?.shipThruAddresses?.upfit?.state || "",
          zipCode: row?.shipThruAddresses?.upfit?.zipCode || "",
          country: row?.shipThruAddresses?.upfit?.country || "",
        },
        accessories: {
          providerName: row?.shipThruAddresses?.accessories?.providerName || "",
          shipThruCode: row?.shipThruAddresses?.accessories?.shipThruCode || "",
          address: row?.shipThruAddresses?.accessories?.address || "",
          city: row?.shipThruAddresses?.accessories?.city || "",
          state: row?.shipThruAddresses?.accessories?.state || "",
          zipCode: row?.shipThruAddresses?.accessories?.zipCode || "",
          country: row?.shipThruAddresses?.accessories?.country || "",
        },
        charger: {
          providerName: row?.shipThruAddresses?.charger?.providerName || "",
          shipThruCode: row?.shipThruAddresses?.charger?.shipThruCode || "",
          address: row?.shipThruAddresses?.charger?.address || "",
          city: row?.shipThruAddresses?.charger?.city || "",
          state: row?.shipThruAddresses?.charger?.state || "",
          zipCode: row?.shipThruAddresses?.charger?.zipCode || "",
          country: row?.shipThruAddresses?.charger?.country || "",
        },
      },
      depositDetailsForm: { depositPercentage: null },
      discountApplied: 0,
    };

    storeDispatch(
      setEditedQuote({
        //@ts-ignore
        data: finalNewQuoteData,
      }),
    );
    navigate(
      `${RoutePaths.QUOTATION_SUMMARY}?quoteId=${quoteId}&createdQuoteId=${row?.id}&navigation=edit${
        transformRowToNewQuoteShape?.customerDetailsForm?.name !== undefined
          ? "&mode=preview"
          : ""
      }`,
      { replace: true },
    );
  };

  const closeModal = () => setActiveModal(false);

  const onClosePDFModal = () => {
    setPdfLink(null);
    setShowPDFModal(false);
  };

  const isLoading = getOrdersQueryState?.isLoading || getOrdersQueryState?.isFetching;

  if (isLoading) {
    return (
      <MuiBox sx={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <CircularProgress />
      </MuiBox>
    );
  }

  if (getOrdersQueryState?.isError) {
    return (
      <Typography sx={{ textAlign: "center", color: "red", padding: "2rem" }}>
        Error fetching data
      </Typography>
    );
  }

  if (getOrdersQueryState?.data?.data?.length === 0 && currentRows.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", padding: "2rem", color: theme.palette.custom.lightGray }}>
        No orders found
      </Typography>
    );
  }

  return (
    <>
      <StyledTableContainer>
        <table>
          <thead>
            <tr>
              <th>Date Created</th>
              <th>Quote #</th>
              <th>OEM Order #</th>
              <th>Customer</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row) => {
              const isClickable = true; // Quote ID is always clickable to view the full quote
              const quantityText = String(row?.quantity || 1);
              // Handle both demo orders (price is a number) and API orders (price is { value, currency })
              const unitPrice = typeof row?.price === "number"
                ? row.price
                : parseInt(row?.price?.value?.toString() || "0");
              const totalPrice = unitPrice * (row?.quantity || 1);
              const priceFormatted = totalPrice > 0 ? `$${getLocaleFormattedNumber(totalPrice)}` : "-";

              return (
                <React.Fragment key={row?.id}>
                  <tr
                    className={
                      row?.customer?.buyerName === undefined &&
                      userDealerName === row?.dealer?.name &&
                      row?.status?.status !== QUOTE_ORDER_STATUSES.CANCELLED
                        ? "no-customer-row"
                        : ""
                    }
                    onClick={() =>
                      setExpandedRowId(
                        expandedRowId === row?.id ? null : row?.id,
                      )
                    }
                  >
                    <td>
                      {row?.createdAt
                        ? dayjs(row.createdAt).format("MM-DD-YYYY")
                        : "-"}
                    </td>
                    <td>
                      <span
                        className={isClickable ? "quote-link" : ""}
                        onClick={(e) => {
                          if (isClickable) {
                            e.stopPropagation();
                            handleQuoteClick(row);
                          }
                        }}
                      >
                        {row?.formattedId || "-"}
                      </span>
                    </td>
                    <td>{row?.orderNo || "-"}</td>
                    <td>{row?.customer?.buyerName || "-"}</td>
                    <td>{quantityText}</td>
                    <td>{priceFormatted}</td>
                    <td>
                      <StatusBadge
                        status={
                          (row as any).pipelineStage
                            ? (ORDER_PIPELINE_STAGES[(row as any).pipelineStage - 1]?.name || pipelineStageToStatus((row as any).pipelineStage)) as any
                            : typeof row?.status === "string"
                              ? row?.status
                              : row?.status?.status || row?.statusV2 || "Quote Generated"
                        }
                        onStatusChange={(from, to) =>
                          handleStatusChange(from, to, row)
                        }
                        row={row}
                        readOnly={!!(row as any).pipelineStage}
                        isExpired={
                          // Pipeline-managed orders should never show as "Expired" — their status comes from the timeline
                          (row as any).pipelineStage
                            ? false
                            : isExpiredFunc(row?.createdAt)
                        }
                      />
                    </td>
                  </tr>
                  {expandedRowId === row?.id && (
                    <tr className="detail-row">
                      <td colSpan={7}>
                        <TableRowDetails
                          //@ts-ignore
                          row={row}
                          allVins={allVins || []}
                          allVinsQueryState={allVinsQueryState}
                          onViewQuote={() => handleQuoteClick(row)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </StyledTableContainer>

      <UpdateOrCancelOrderModal
        open={activeModal}
        onClose={closeModal}
        details={{
          customerName: orderToUpdate?.customer.buyerName || "-",
          status: {
            from: orderToUpdate?.status,
            to: newStatus,
          },
        }}
        order={orderToUpdate}
      />
      {showPDFModal && pdfLink && (
        <PdfModal
          pdfBlobOrString={pdfLink}
          isSecuredString
          isOpen={showPDFModal}
          onClose={onClosePDFModal}
        />
      )}
    </>
  );
};

const StyledTableContainer = styled(MuiBox)(({ theme }) => ({
  flex: 1,
  overflow: "auto",
  paddingInline: "1.25rem",

  "&::-webkit-scrollbar": {
    width: "0.25rem",
    height: "0.5rem",
  },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: "10px",
    backgroundColor: "#D6D6D6",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto",
  },

  thead: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.palette.background.default || "#fff",

    th: {
      textAlign: "left",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: theme.palette.custom.accentBlack,
      padding: "0.75rem 1rem",
      borderBottom: `2px solid ${theme.palette.custom.tertiary}`,
      whiteSpace: "nowrap",
    },
  },

  tbody: {
    tr: {
      cursor: "pointer",
      transition: "background-color 0.15s ease",

      "&:hover": {
        backgroundColor: theme.palette.custom.blueBackground || "#f5f8ff",
      },

      td: {
        fontSize: "0.875rem",
        color: theme.palette.custom.accentBlack,
        padding: "0.875rem 1rem",
        borderBottom: `1px solid ${theme.palette.custom.tertiary}`,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        maxWidth: "200px",
      },
    },

    "tr.no-customer-row": {
      backgroundColor: theme.palette.custom.errorLight,
    },

    "tr.detail-row": {
      cursor: "default",
      "&:hover": {
        backgroundColor: "transparent",
      },
      td: {
        padding: 0,
        maxWidth: "none",
      },
    },
  },

  ".quote-link": {
    color: theme.palette.primary.main,
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: 500,

    "&:hover": {
      opacity: 0.8,
    },
  },
}));

export default MyOrdersTable;
