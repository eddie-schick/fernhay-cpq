import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import React, { useState } from "react";
import { useNavigate } from "react-router";

import {
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef, GridValidRowModel } from "@mui/x-data-grid-pro";

import {
  MY_ORDERS_QUOTE_EXPIRY_DAYS,
  QUOTE_ORDER_STATUSES,
} from "~/constants/constants";
import RoutePaths from "~/constants/route-paths";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { ExclamationIcon, PencilIcon } from "~/global/icons";

import { useAppDispatch } from "~/store";
import { setEditedQuoteById, setQuoteById } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "~/components/shared/mui-box/mui-box";
import StatusBadge from "~/components/shared/status-badge/status-badge";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";

import {
  OrderStatus,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "../../../global/types/types";

dayjs.extend(utc);

type UseMyOrdersDataProps = {
  rows: QuoteOrder200ResponseSchema[];
  handleStatusChange: (
    from: OrderStatus,
    to: OrderStatusValue,
    orderBeingUpdated: QuoteOrder200ResponseSchema,
  ) => void;
};

const useMyOrdersData = ({
  rows,
  handleStatusChange,
}: UseMyOrdersDataProps) => {
  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );

  const { user } = useAuthContextValue();

  const userDealerName = user?.user ? user?.user?.name : "";

  console.log("compatible4", user);

  const storeDispatch = useAppDispatch();

  const theme = useTheme();

  const commonStyles = {
    color: theme.palette.custom.accentBlack,
    fontSize: "0.875rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const [showPDFModal, setShowPDFModal] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<Blob | string | null>(null);

  const onClosePDFModal = () => {
    setPdfLink(null);
    setShowPDFModal(false);
  };

  const isExpiredFunc = (createdAt: string) => {
    const expiryDate = dayjs
      .utc()
      .subtract(MY_ORDERS_QUOTE_EXPIRY_DAYS, "days");

    const isExpired = dayjs.utc(createdAt).isBefore(expiryDate);

    return isExpired;
  };
  const navigate = useNavigate();

  const columnData: GridColDef<QuoteOrder200ResponseSchema>[] = [
    {
      field: "",
      headerName: "",
      maxWidth: 1,
      minWidth: 1,
      headerClassName: "exclamation-header-class",
      disableColumnMenu: true,
      renderCell: (params) => (
        <>
          {params?.row?.customer?.buyerName === undefined &&
          userDealerName === params?.row?.dealer?.name &&
          params?.row?.status?.status !== QUOTE_ORDER_STATUSES.CANCELLED ? (
            <TooltipWrapper
              placement="top-end"
              title="Customer information incomplete. Click the edit icon under the customer column to complete missing details"
            >
              <IconButton
                sx={{ position: "absolute", left: "8px", marginTop: "-5px" }}
              >
                <MuiBox
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  <ExclamationIcon />
                </MuiBox>
              </IconButton>
            </TooltipWrapper>
          ) : null}
        </>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date Created",
      disableColumnMenu: true,
      maxWidth: 200,
      minWidth: 120,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => new Date(params?.row?.createdAt),
      renderCell: (params) => (
        <TooltipWrapper
          title={
            params?.value
              ? dayjs(params.value as Date).format("MM-DD-YYYY")
              : "-"
          }
        >
          <Typography sx={{ ...commonStyles }}>
            {params?.value
              ? dayjs(params.value as Date).format("MM-DD-YYYY")
              : "-"}
          </Typography>
        </TooltipWrapper>
      ),
    },
    {
      field: "quoteNo",
      headerName: "Quote #",
      disableColumnMenu: true,
      minWidth: isTablet ? 130 : 150,
      maxWidth: 170,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => params.row.formattedId,
      renderCell: (params) => {
        console.log("%cparams here:", "background-color:black;color:white;", {
          params,
        });

        const quoteItemIds = rows
          ?.filter((row) => row?.formattedId === params?.row?.formattedId)
          ?.map((v) => String(v?.id));

        return (
          <TooltipWrapper title={(params.value as string) || "-"}>
            <Typography
              sx={{
                ...commonStyles,
                cursor:
                  params?.row?.customer?.buyerName !== undefined &&
                  userDealerName === params?.row?.dealer?.name
                    ? "pointer"
                    : "auto",
                ...(params?.row?.customer?.buyerName !== undefined &&
                  userDealerName === params?.row?.dealer?.name && {
                    textDecoration: "underline",
                    color: theme.palette.primary.main,
                  }),
              }}
              onClick={() => {
                // the logged in person can only edit his/her orders and only if the customer is left empty
                if (
                  params?.row?.customer?.buyerName === undefined ||
                  userDealerName !== params?.row?.dealer?.name
                ) {
                  return;
                }

                // if there is no customer attached to the quote then redirect it to build summary
                const quoteId = params?.row?.timestampId;

                const transformRowToNewQuoteShape = {
                  customerDetailsForm: {
                    ...params?.row?.customer,
                    name: params?.row?.customer?.buyerName,
                    representativeName: params?.row?.customer?.coBuyerName,
                  },
                  dealerDetailsForm: {
                    ...params?.row?.dealer,
                  },
                };

                const finalNewQuoteData: Partial<NewQuoteShape> = {
                  ...transformRowToNewQuoteShape,
                  id: quoteId || "",

                  kontentAi__quoteId: params.row.id.toString(),
                  kontentAi__quoteIds: quoteItemIds,
                  isOrdered: true,
                  quotationId: params.row.formattedId,
                  vehicle__kontentAi__id:
                    params?.row?.vehicle?.vehicle__kontentAi__id || "",
                  vehicle__kontentAi__codename:
                    params?.row?.vehicle?.vehicle__kontentAi__codename || "",
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
                  vehicleModel: params?.row?.model || "",
                  vehicleName: "",
                  vehicleImage: "",
                  totalQuantity: params?.row?.quantity || 0,
                  vehiclePaint: params?.row?.paint?.name || "",
                  vehicleBatteryEngine: params?.row?.battery?.title || "",
                  vehicleUpfit: params?.row?.upfits[0]?.title || "",
                  shelving: params?.row?.shelving?.title,
                  charger: params?.row?.charger?.title,
                  groups: [
                    {
                      id: params?.row?.groupId,
                      quantity: params?.row?.quantity,
                      name: params?.row?.group,
                      isSelected: true,
                      paintType: {
                        id: "dummy",
                        price: 0,
                        price_unit: "$",
                        title: params?.row?.paint?.name,
                        hexCode: params?.row?.paint?.colorCode,
                        is_included: true,

                        kontentAi__item__codename:
                          params?.row?.paint?.kontentAi__item__codename,
                      },
                      ...(params?.row?.upfits.length > 1 && {
                        upfit: params?.row?.upfits[1],
                      }),
                      batteryCapacity: params?.row?.battery,
                      chassis: params?.row?.upfits[0],
                      charger: params?.row?.charger,
                      accessories: params?.row?.accessories,
                      shelving: params?.row?.shelving,
                      //other optional group details are above the group obj
                    },
                  ],
                  destinationAddressForm: {
                    address: params?.row?.destinationAddress?.address || "",
                    city: params?.row?.destinationAddress?.city || "",
                    state: params?.row?.destinationAddress?.state || "",
                    zipCode: params?.row?.destinationAddress?.zipCode || "",
                    country: params?.row?.destinationAddress?.country || "",
                  },
                  shipThruDetailsForm: {
                    upfit: {
                      providerName:
                        params?.row?.shipThruAddresses?.upfit?.providerName ||
                        "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.upfit?.shipThruCode ||
                        "",
                      address:
                        params?.row?.shipThruAddresses?.upfit?.address || "",
                      city: params?.row?.shipThruAddresses?.upfit?.city || "",
                      state: params?.row?.shipThruAddresses?.upfit?.state || "",
                      zipCode:
                        params?.row?.shipThruAddresses?.upfit?.zipCode || "",
                      country:
                        params?.row?.shipThruAddresses?.upfit?.country || "",
                    },
                    accessories: {
                      providerName:
                        params?.row?.shipThruAddresses?.accessories
                          ?.providerName || "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.accessories
                          ?.shipThruCode || "",
                      address:
                        params?.row?.shipThruAddresses?.accessories?.address ||
                        "",
                      city:
                        params?.row?.shipThruAddresses?.accessories?.city || "",
                      state:
                        params?.row?.shipThruAddresses?.accessories?.state ||
                        "",
                      zipCode:
                        params?.row?.shipThruAddresses?.accessories?.zipCode ||
                        "",
                      country:
                        params?.row?.shipThruAddresses?.accessories?.country ||
                        "",
                    },
                    charger: {
                      providerName:
                        params?.row?.shipThruAddresses?.charger?.providerName ||
                        "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.charger?.shipThruCode ||
                        "",
                      address:
                        params?.row?.shipThruAddresses?.charger?.address || "",
                      city: params?.row?.shipThruAddresses?.charger?.city || "",
                      state:
                        params?.row?.shipThruAddresses?.charger?.state || "",
                      zipCode:
                        params?.row?.shipThruAddresses?.charger?.zipCode || "",
                      country:
                        params?.row?.shipThruAddresses?.charger?.country || "",
                    },
                  },
                  depositDetailsForm: {
                    depositPercentage: null,
                  },
                  discountApplied: 0,
                };

                // remember here the quoteid is actually the time stamp epotch of date create which would be slightly different from the quote id that was available during order creation
                storeDispatch(
                  setEditedQuoteById({
                    quoteId: quoteId || "",
                    // due to the nature of the app we need to make this data obj as close as the shape of newquotes
                    //@ts-nocheck
                    //@ts-ignore
                    data: finalNewQuoteData,
                  }),
                );
                navigate(
                  `${
                    RoutePaths.QUOTATION_SUMMARY
                  }?quoteId=${quoteId}&createdQuoteId=${
                    params?.row?.id
                  }&navigation=edit${
                    //condition to send a user directly to quote or to build summary
                    transformRowToNewQuoteShape?.customerDetailsForm?.name !==
                    undefined
                      ? "&mode=preview"
                      : ""
                  }`,
                  { replace: true },
                );
              }}
            >
              {params.value || "-"}
            </Typography>
          </TooltipWrapper>
        );
      },
    },
    {
      field: "orderNo",
      headerName: "OEM Order #",
      disableColumnMenu: true,
      minWidth: isTablet ? 130 : 160,
      maxWidth: 200,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => params.row.orderNo ?? "-",
      renderCell: (params) => (
        <TooltipWrapper title={(params.value as string) || "-"}>
          <Typography sx={{ ...commonStyles }}>
            {params.value || "-"}
          </Typography>
        </TooltipWrapper>
      ),
    },
    {
      field: "customerName",
      headerName: "Customer",
      disableColumnMenu: true,
      minWidth: isTablet ? 110 : 130,
      maxWidth: 170,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => params.row.customer?.buyerName,
      renderCell: (params) => (
        <MuiBox
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: "0.5rem",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {!params?.value &&
          userDealerName === params?.row?.dealer?.name &&
          params?.row?.status?.status !== QUOTE_ORDER_STATUSES.CANCELLED ? (
            <MuiBox
              sx={{ cursor: "pointer" }}
              onClick={() => {
                const quoteItemIds = rows
                  ?.filter(
                    (row) => row?.formattedId === params?.row?.formattedId,
                  )
                  ?.map((v) => String(v?.id));
                // if there is no customer attached to the quote then redirect it to build summary
                const quoteId = params?.row?.timestampId;

                const transformRowToNewQuoteShape = {
                  customerDetailsForm: {
                    ...params?.row?.customer,
                    name: params?.row?.customer?.buyerName,
                    representativeName: params?.row?.customer?.coBuyerName,
                  },
                  dealerDetailsForm: {
                    ...params?.row?.dealer,
                  },
                };

                const finalNewQuoteData: Partial<NewQuoteShape> = {
                  ...transformRowToNewQuoteShape,
                  id: quoteId || "",

                  kontentAi__quoteId: params.row.id.toString(),
                  kontentAi__quoteIds: quoteItemIds,
                  isOrdered: true,
                  quotationId: params.row.formattedId,
                  vehicle__kontentAi__id:
                    params?.row?.vehicle?.vehicle__kontentAi__id || "",
                  vehicle__kontentAi__codename:
                    params?.row?.vehicle?.vehicle__kontentAi__codename || "",
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
                  vehicleModel: params?.row?.model || "",
                  vehicleName: "",
                  vehicleImage: "",
                  totalQuantity: params?.row?.quantity || 0,
                  vehiclePaint: params?.row?.paint?.name || "",
                  vehicleBatteryEngine: params?.row?.battery?.title || "",
                  vehicleUpfit: params?.row?.upfits[0]?.title || "",
                  shelving: params?.row?.shelving?.title,
                  charger: params?.row?.charger?.title,
                  groups: [
                    {
                      id: params?.row?.groupId,
                      quantity: params?.row?.quantity,
                      name: params?.row?.group,
                      isSelected: true,
                      paintType: {
                        id: "dummy",
                        price: 0,
                        price_unit: "$",
                        title: params?.row?.paint?.name,
                        hexCode: params?.row?.paint?.colorCode,
                        is_included: true,

                        kontentAi__item__codename:
                          params?.row?.paint?.kontentAi__item__codename,
                      },
                      ...(params?.row?.upfits.length > 1 && {
                        upfit: params?.row?.upfits[1],
                      }),
                      batteryCapacity: params?.row?.battery,
                      chassis: params?.row?.upfits[0],
                      charger: params?.row?.charger,
                      accessories: params?.row?.accessories,
                      shelving: params?.row?.shelving,
                      //other optional group details are above the group obj
                    },
                  ],
                  destinationAddressForm: {
                    address: params?.row?.destinationAddress?.address || "",
                    city: params?.row?.destinationAddress?.city || "",
                    state: params?.row?.destinationAddress?.state || "",
                    zipCode: params?.row?.destinationAddress?.zipCode || "",
                    country: params?.row?.destinationAddress?.country || "",
                  },
                  shipThruDetailsForm: {
                    upfit: {
                      providerName:
                        params?.row?.shipThruAddresses?.upfit?.providerName ||
                        "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.upfit?.shipThruCode ||
                        "",
                      address:
                        params?.row?.shipThruAddresses?.upfit?.address || "",
                      city: params?.row?.shipThruAddresses?.upfit?.city || "",
                      state: params?.row?.shipThruAddresses?.upfit?.state || "",
                      zipCode:
                        params?.row?.shipThruAddresses?.upfit?.zipCode || "",
                      country:
                        params?.row?.shipThruAddresses?.upfit?.country || "",
                    },
                    accessories: {
                      providerName:
                        params?.row?.shipThruAddresses?.accessories
                          ?.providerName || "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.accessories
                          ?.shipThruCode || "",
                      address:
                        params?.row?.shipThruAddresses?.accessories?.address ||
                        "",
                      city:
                        params?.row?.shipThruAddresses?.accessories?.city || "",
                      state:
                        params?.row?.shipThruAddresses?.accessories?.state ||
                        "",
                      zipCode:
                        params?.row?.shipThruAddresses?.accessories?.zipCode ||
                        "",
                      country:
                        params?.row?.shipThruAddresses?.accessories?.country ||
                        "",
                    },
                    charger: {
                      providerName:
                        params?.row?.shipThruAddresses?.charger?.providerName ||
                        "",
                      shipThruCode:
                        params?.row?.shipThruAddresses?.charger?.shipThruCode ||
                        "",
                      address:
                        params?.row?.shipThruAddresses?.charger?.address || "",
                      city: params?.row?.shipThruAddresses?.charger?.city || "",
                      state:
                        params?.row?.shipThruAddresses?.charger?.state || "",
                      zipCode:
                        params?.row?.shipThruAddresses?.charger?.zipCode || "",
                      country:
                        params?.row?.shipThruAddresses?.charger?.country || "",
                    },
                  },
                  depositDetailsForm: {
                    depositPercentage: null,
                  },
                  discountApplied: 0,
                };

                // remember here the quoteid is actually the time stamp epotch of date create which would be slightly different from the quote id that was available during order creation
                storeDispatch(
                  setEditedQuoteById({
                    quoteId: quoteId || "",
                    // due to the nature of the app we need to make this data obj as close as the shape of newquotes
                    //@ts-nocheck
                    //@ts-ignore
                    data: finalNewQuoteData,
                  }),
                );
                navigate(
                  `${
                    RoutePaths.QUOTATION_SUMMARY
                  }?quoteId=${quoteId}&createdQuoteId=${
                    params?.row?.id
                  }&navigation=edit${
                    //condition to send a user directly to quote or to build summary
                    transformRowToNewQuoteShape?.customerDetailsForm?.name !==
                    undefined
                      ? "&mode=preview"
                      : ""
                  }`,
                  { replace: true },
                );
              }}
            >
              {" "}
              <PencilIcon />
            </MuiBox>
          ) : (
            <TooltipWrapper title={(params.value as string) || "-"}>
              <Typography sx={{ ...commonStyles }}>
                {params.value || "-"}
              </Typography>
            </TooltipWrapper>
          )}
        </MuiBox>
      ),
    },
    {
      field: "orderType",
      headerName: "Quantity",
      disableColumnMenu: true,
      maxWidth: 130,
      minWidth: isTablet ? 90 : 100,
      flex: isTablet ? 0 : 1,
      renderCell: (params) => {
        const textToRender = `${(params?.row?.quantityIndex + 1).toLocaleString(
          undefined,
          {
            minimumIntegerDigits: 2,
          },
        )}/${(params?.row?.quantity || 0).toLocaleString(undefined, {
          minimumIntegerDigits: 2,
        })}`;

        return (
          <MuiBox
            sx={{
              display: "grid",
              // gridTemplateColumns:
              //   params.row.orderType === "Fleet"
              //     ? "auto auto 3.5rem auto auto"
              //     : "auto auto auto",
              // columnGap: "0.75rem",
            }}
          >
            <TooltipWrapper title={textToRender}>
              <span style={{ fontSize: "0.875rem" }}>{textToRender}</span>
            </TooltipWrapper>
          </MuiBox>
        );
      },
    },
    {
      field: "price",
      headerName: "Price",
      disableColumnMenu: true,
      maxWidth: 180,
      minWidth: isTablet ? 110 : 130,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => parseInt(params.row.price?.value.toString()),
      renderCell: (params) => (
        <TooltipWrapper
          title={`${params.row.price.currency || "$"}${getLocaleFormattedNumber(
            params.value as number,
          )}`}
        >
          <Typography sx={{ ...commonStyles }}>
            {`${params.row.price.currency || "$"}${getLocaleFormattedNumber(
              params.value as number,
            )}`}
          </Typography>
        </TooltipWrapper>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      disableColumnMenu: true,
      minWidth: isTablet ? 180 : 200,
      maxWidth: 180,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) =>
        params.row.status ? params.row.status.status : "",
      renderCell: (params) => {
        return (
          <StatusBadge
            status={params.row.status}
            onStatusChange={(from, to) =>
              handleStatusChange(from, to, params.row)
            }
            row={params.row}
            isExpired={isExpiredFunc(params.row.createdAt)}
          />
        );
      },
    },
    {
      field: "bom",
      headerName: "BOM ID #",
      disableColumnMenu: true,
      maxWidth: 200,
      minWidth: isTablet ? 140 : 160,
      valueGetter: (params) => params.row?.bom?.name,
      flex: isTablet ? 0 : 1,

      renderCell: (params) =>
        params.value ? (
          <TooltipWrapper title={params.value as string}>
            <Typography
              onClick={() => {
                if (params?.row?.bom?.fileLink) {
                  setPdfLink(params.row.bom?.fileLink);
                  setShowPDFModal(true);
                }
              }}
              // className={`link`}
              sx={{
                fontSize: "0.875rem",
                color: !params?.row?.bom?.fileLink
                  ? theme.palette.custom.greyAccent
                  : theme.palette.primary.main,

                textDecoration: "underline",
                cursor: !params?.row?.bom?.fileLink ? "auto" : "pointer",
              }}
            >
              {params.value}
            </Typography>
          </TooltipWrapper>
        ) : (
          "-"
        ),
    },
    {
      field: "dealership",
      headerName: "Dealership",
      disableColumnMenu: true,
      minWidth: isTablet ? 110 : 160,
      maxWidth: 200,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => params.row?.dealer?.dealershipName,
      renderCell: (params) => (
        <TooltipWrapper title={(params.value as string) || "-"}>
          <Typography sx={{ ...commonStyles }}>
            {params.value || "-"}
          </Typography>
        </TooltipWrapper>
      ),
    },
    {
      field: "salesRep",
      headerName: "Sales Manager",
      disableColumnMenu: true,
      minWidth: isTablet ? 110 : 160,
      maxWidth: 200,
      flex: isTablet ? 0 : 1,
      valueGetter: (params) => params.row?.dealer?.name,
      renderCell: (params) => (
        <TooltipWrapper title={(params.value as string) || "-"}>
          <Typography sx={{ ...commonStyles }}>
            {params.value || "-"}
          </Typography>
        </TooltipWrapper>
      ),
    },
  ];

  return { columnData, pdfLink, showPDFModal, onClosePDFModal };
};

export default useMyOrdersData;
