import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import { useNavigate } from "react-router";

import {
  IconButton,
  Theme,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GridColDef } from "@mui/x-data-grid-pro";

import {
  MY_ORDERS_QUOTE_EXPIRY_DAYS,
  QUOTE_ORDER_STATUSES,
} from "~/constants/constants";
import RoutePaths from "~/constants/route-paths";

import { getLocaleFormattedNumber } from "~/utils/misc";

import { ExclamationIcon, PencilIcon } from "~/global/icons";
import {
  ColorPickerSectionOptionSchema,
  OrderStatus,
  OrderStatusValue,
  QuoteOrder200ResponseSchema,
} from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import { setIsCustomerInfoFormSaved } from "~/store/slices/quotation-summary/slice";
import { setEditedQuote } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";
import { rootSelector } from "~/store/slices/root/slice";

import { useAuthContextValue } from "~/context/auth-context";

import MuiBox from "~/components/shared/mui-box/mui-box";
import StatusBadge from "~/components/shared/status-badge/status-badge";
import TooltipWrapper from "~/components/shared/tooltip-wrapper/tooltip-wrapper";

dayjs.extend(utc);

type UseMyOrdersDataProps = {
  rows: QuoteOrder200ResponseSchema[];
  handleStatusChange: (
    from: OrderStatusValue,
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

  const userDealerEmail = user?.user ? user?.user?.email : "";

  console.log("compatible4", user);

  const storeDispatch = useAppDispatch();

  const theme = useTheme();

  const { appSettings } = useAppSelector(rootSelector);
  console.log("%cappSettings:", "background-color:purple;color:white;", {
    appSettings,
  });

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

  const getDataForNewQuote = (row: QuoteOrder200ResponseSchema) => {
    console.log("compatible rows", row);

    const configurationSections = Object.values(
      row?.configurationSections || {},
    );

    const quoteItemIds = rows
      ?.filter((r) => r?.formattedId === row?.formattedId)
      ?.map((v) => String(v?.id));

    const quoteId = row?.timestampId;

    const transformRowToNewQuoteShape = {
      customerDetailsForm: {
        ...row?.customer,
        name: row?.customer?.buyerName || row?.customer?.name,
        representativeName:
          row?.customer?.coBuyerName || row?.customer?.representativeName,
      },
      dealerDetailsForm: {
        ...row?.dealer,
      },
    };

    //@ts-ignore
    const paintItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "paint",
    )?.options?.[0] as ColorPickerSectionOptionSchema;
    const upfitItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "upfit",
    )?.options?.[0];
    const chassisItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "chassis",
    )?.options?.[0];
    const shelvingItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "shelving",
    )?.options?.[0];
    const chargerItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "charger",
    )?.options?.[0];
    const powertrainItem = configurationSections?.find(
      (configSection) => configSection?.title?.toLowerCase() === "powertrain",
    )?.options?.[0];

    //@ts-ignore
    const returnValue: Partial<
      Omit<
        NewQuoteShape,
        | "id"
        | "customer"
        | "vehicleId"
        | "vehicleMake"
        | "vehicleModel"
        | "vehicleName"
        | "vehicleImage"
        | "totalQuantity"
        | "groups"
        | "customerDetailsForm"
        | "dealerDetailsForm"
        | "destinationAddressForm"
        | "shipThruDetailsForm"
        | "depositDetailsForm"
        | "discountApplied"
        | "vehicle__kontentAi__id"
        | "vehicle__kontentAi__codename"
        | "vehicleModel__kontentAi__codename"
      >
    > & {
      id: NewQuoteShape["id"];
      customer: NewQuoteShape["customer"];
      vehicleId: NewQuoteShape["vehicleId"];
      vehicleMake: NewQuoteShape["vehicleMake"];
      vehicleModel: NewQuoteShape["vehicleModel"];
      vehicleName: NewQuoteShape["vehicleName"];
      vehicleImage: NewQuoteShape["vehicleImage"];
      totalQuantity: NewQuoteShape["totalQuantity"];
      groups: NewQuoteShape["groups"];
      customerDetailsForm: NewQuoteShape["customerDetailsForm"];
      dealerDetailsForm: NewQuoteShape["dealerDetailsForm"];
      destinationAddressForm: NewQuoteShape["destinationAddressForm"];
      shipThruDetailsForm: NewQuoteShape["shipThruDetailsForm"];
      depositDetailsForm: NewQuoteShape["depositDetailsForm"];
      discountApplied: NewQuoteShape["discountApplied"];
      vehicle__kontentAi__id: NewQuoteShape["vehicle__kontentAi__id"];
      vehicle__kontentAi__codename: NewQuoteShape["vehicle__kontentAi__codename"];
      vehicleModel__kontentAi__codename: NewQuoteShape["vehicleModel__kontentAi__codename"];
    } = {
      ...transformRowToNewQuoteShape,
      id: quoteId || "",
      vehicleOEMLogoPng: appSettings?.logoPng?.url,

      kontentAi__quoteId: row.id.toString(),
      kontentAi__quoteIds: quoteItemIds,
      isOrdered: true,
      quotationId: row.formattedId,
      vehicle__kontentAi__id: row?.vehicle?.vehicle__kontentAi__id || "",
      vehicle__kontentAi__codename:
        row?.vehicle?.vehicle__kontentAi__codename || "",
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
      vehiclePaint: paintItem?.title || "",
      vehicleBatteryEngine: powertrainItem?.title || "",
      vehicleUpfit: upfitItem?.title || "",
      shelving: shelvingItem?.title,
      charger: chargerItem?.title,
      groups: [
        {
          id: row?.groupId || "A",
          quantity: row?.quantity,
          name: row?.group,
          isSelected: true,
          paintType: {
            id: "dummy",
            price: 0,
            price_unit: "$",
            title: paintItem?.title || "",
            hexCode: paintItem?.hexCode,
            is_included: true,
            is_selected: true,
          },
          configurationSections,
          // ...(chassisItem && {
          //   chassis: chassisItem,
          // }),
          // ...(upfitItem && {
          //   upfit: upfitItem,
          // }),
          // batteryCapacity: row?.battery,
          // charger: row?.charger,
          // accessories: row?.accessories,
          // shelving: row?.shelving,
          model3dDetails: {
            baseModel: (() => {
              if (!upfitItem?.model_3d?.url && !chassisItem?.model_3d?.url)
                return undefined;

              // Prioritized upfit model means there will be only upfit's 3D model, instead of there being both chassis' and upfit's 3D model
              if (upfitItem?.model_3d?.prioritizeModel) {
                return { url: upfitItem?.model_3d?.url };
              }
              if (chassisItem?.model_3d?.url) {
                return { url: chassisItem?.model_3d?.url };
              }

              return undefined;
            })(),
            upfit: (() => {
              if (
                upfitItem?.model_3d?.url &&
                !upfitItem?.model_3d?.prioritizeModel
              ) {
                return {
                  url: upfitItem?.model_3d?.url,
                };
              }

              return undefined;
            })(),
          },
          //other optional group details are above the group obj
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
      depositDetailsForm: {
        depositPercentage: null,
      },
      discountApplied: 0,
    };

    return returnValue;
  };
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
          userDealerEmail === params?.row?.dealer?.email &&
          params?.row?.statusV2 !== QUOTE_ORDER_STATUSES.CANCELLED ? (
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
      valueGetter: (params) => params?.row?.formattedId,
      renderCell: (params) => {
        console.log("%cparams here:", "background-color:black;color:white;", {
          params,
        });

        return (
          <TooltipWrapper title={(params.value as string) || "-"}>
            <Typography
              sx={{
                ...commonStyles,
                cursor:
                  params?.row?.customer?.buyerName !== undefined &&
                  userDealerEmail === params?.row?.dealer?.email
                    ? "pointer"
                    : "auto",
                ...(params?.row?.customer?.buyerName !== undefined &&
                  userDealerEmail === params?.row?.dealer?.email && {
                    textDecoration: "underline",
                    color: theme.palette.primary.main,
                  }),
              }}
              onClick={() => {
                // the logged in person can only edit his/her orders and only if the customer is left empty
                if (
                  params?.row?.customer?.buyerName === undefined ||
                  userDealerEmail !== params?.row?.dealer?.email
                ) {
                  return;
                }

                // if there is no customer attached to the quote then redirect it to build summary

                const finalNewQuoteData = getDataForNewQuote(params?.row);
                const quoteId = finalNewQuoteData?.id;

                // remember here the quoteid is actually the time stamp epotch of date create which would be slightly different from the quote id that was available during order creation
                storeDispatch(
                  setEditedQuote({
                    // due to the nature of the app we need to make this data obj as close as the shape of newquotes
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
                    finalNewQuoteData?.customerDetailsForm?.name !== undefined
                      ? "&mode=preview"
                      : ""
                  }`,
                  // { replace: true },
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
          userDealerEmail === params?.row?.dealer?.email &&
          params?.row?.statusV2 !== QUOTE_ORDER_STATUSES.CANCELLED ? (
            <MuiBox
              sx={{ cursor: "pointer" }}
              onClick={() => {
                // if there is no customer attached to the quote then redirect it to build summary

                const finalNewQuoteData = getDataForNewQuote(params?.row);
                const quoteId = finalNewQuoteData?.id;

                // remember here the quoteid is actually the time stamp epotch of date create which would be slightly different from the quote id that was available during order creation
                storeDispatch(
                  setEditedQuote({
                    // due to the nature of the app we need to make this data obj as close as the shape of newquotes
                    data: finalNewQuoteData,
                  }),
                );
                storeDispatch(setIsCustomerInfoFormSaved(false));
                navigate(
                  `${
                    RoutePaths.QUOTATION_SUMMARY
                  }?quoteId=${quoteId}&createdQuoteId=${
                    params?.row?.id
                  }&navigation=edit${
                    //condition to send a user directly to quote or to build summary
                    finalNewQuoteData?.customerDetailsForm?.name !== undefined
                      ? "&mode=preview"
                      : ""
                  }`,
                  // { replace: true },
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
        const textToRender = `${params.row.quantityIndex.toLocaleString(
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
              <span style={{ fontSize: "0.875rem" }}>
                {textToRender || "-"}
              </span>
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
      valueGetter: (params) => parseInt(params?.row?.price?.value.toString()),
      renderCell: (params) => (
        <TooltipWrapper
          title={`${params?.row?.price?.currency || "$"}${getLocaleFormattedNumber(
            params.value as number,
          )}`}
        >
          <Typography sx={{ ...commonStyles }}>
            {`${params?.row?.price?.currency || "$"}${getLocaleFormattedNumber(
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
      valueGetter: (params) => (params.row.status ? params.row.statusV2 : ""),
      renderCell: (params) => {
        return (
          <StatusBadge
            status={params.row.statusV2 || "Quote Generated"}
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
      headerName: "Quote ID",
      disableColumnMenu: true,
      maxWidth: 200,
      minWidth: isTablet ? 140 : 160,
      valueGetter: (params) => params.row?.bom?.name,
      flex: isTablet ? 0 : 1,

      renderCell: (params) =>
        params.value ? (
          <TooltipWrapper title={params.value as string}>
            <Typography
              id={`bom-file-link--${params?.row?.formattedId}`}
              onClick={() => {
                console.log("file linked", params?.row);
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
