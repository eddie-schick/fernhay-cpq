import dayjs from "dayjs";
import { useMemo } from "react";

import { MY_ORDERS_QUOTE_EXPIRY_DAYS } from "~/constants/constants";

import { getLocaleFormattedNumber } from "~/utils/misc";

import useBomPdfData from "~/global/custom-hooks/useBomPdfData";

import { useAppSelector } from "~/store";
import { NewQuoteShape } from "~/store/slices/quotes/types";
import { rootSelector } from "~/store/slices/root/slice";

import { BomPDFProps } from "~/components/shared/bom-pdf/types";

import { UserSchema } from "../auth-context/auth-context";

type Props = {
  order: NewQuoteShape;
  group: NewQuoteShape["groups"][number];
  user: UserSchema;
};
export default function useBomPdfProps(props: Props) {
  const { order, group, user } = props;

  const { customerDetailsForm, dealerDetailsForm } = order || {};

  const rootSlice = useAppSelector(rootSelector);

  const bomPdfData = useBomPdfData({ order, group });

  const configOptionsForIntroPagePdf = useMemo(
    () => {
      const sections = group?.configurationSections;
      if (!sections || !Array.isArray(sections)) return {};
      return Object.fromEntries(
        //@ts-ignore
        sections.map((configSection) => {
          const sectionTitle =
            configSection?.title?.toLowerCase() === "paint"
              ? "Color"
              : configSection?.title;
          const selectedOptions = configSection?.options?.filter(
            (configOption) => Boolean(configOption?.is_selected),
          );

          return [
            sectionTitle?.toLowerCase(),
            selectedOptions?.map((option) => option?.title),
          ];
        }),
      );
    },
    [group?.configurationSections],
  );

  const bomPdfCommonProps: BomPDFProps = useMemo(() => {
    return {
      customizationOptions: bomPdfData.customizationOptionsForPdf,
      orderCustomer: String(
        order?.customerDetailsForm?.name || order?.customer?.buyerName,
      ),
      orderDiscount: order?.discountApplied,
      vehicleDetails: bomPdfData.vehicleDetails,
      vin: "-",
      logoOEM: order?.vehicleOEMLogoPng,
      introPageDetails: {
        appName: rootSlice?.appSettings?.name || "",
        customerDetails: {
          name: customerDetailsForm?.name || order?.customer?.buyerName,
          address: customerDetailsForm?.address || order?.customer?.address,
          city: customerDetailsForm?.city || order?.customer?.city,
          state: customerDetailsForm?.state || order?.customer?.state,
          country: customerDetailsForm?.country || order?.customer?.country,
          postalCode: customerDetailsForm?.zipCode
            ? `${customerDetailsForm.zipCode}`
            : order?.customer?.zipCode,
          phone: String(customerDetailsForm?.phone || order?.customer?.phone),
          email: customerDetailsForm?.email || order?.customer?.email,
        },
        date: dayjs().format("YYYY-MM-DD"),
        dealerDetails: {
          name:
            dealerDetailsForm?.name || user?.user?.metadata?.dealership_name,
          email: dealerDetailsForm?.email || user?.user?.email,
          phone: `${dealerDetailsForm?.phone || user?.user?.phone}`,
          address:
            dealerDetailsForm?.address || user?.user?.metadata?.dealer_address,
          justAddress: user?.user?.metadata?.dealer_address,
          city: user?.user?.metadata?.dealer_city,
          state: user?.user?.metadata?.dealer_state,
          postalCode: user?.user?.metadata?.dealer_zip_code,
          logo: user?.user?.metadata?.company_logo_url,
          dealership: user?.user?.metadata?.dealership_name || "dealership",
        },
        salesTeamDetails: {
          representativeName: dealerDetailsForm?.name || user?.user?.name,
          representativeJobTitle: user?.user?.metadata?.job_title,
          email: dealerDetailsForm?.email || user?.user?.email,
          phone: `${dealerDetailsForm?.phone || user?.user?.phone}`,
        },
        vehicleDetails: {
          configOptions: {
            model: order?.vehicleModel,
            // color: group?.paintType?.title || order?.vehiclePaint || "",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            color:
              configOptionsForIntroPagePdf?.color?.[0] ||
              group?.paintType?.title ||
              order?.vehiclePaint ||
              "White (Standard)",
            ...configOptionsForIntroPagePdf,
          },
          // engine: group?.batteryCapacity?.title || order?.vehicleBatteryEngine,
          // dashboard: group?.dashboard?.title,
          // upfit: group?.upfit?.title || order?.vehicleUpfit,
          // shelving: group?.shelving?.title || order?.shelving,
          // accessories: group?.accessories?.map((accessory) => accessory?.title),
          // charger: group?.charger?.title || order?.charger,
          // additionalFeatures: (() => {
          //   const areAccessoriesSelected =
          //     group?.accessories && group?.accessories?.length !== 0
          //       ? true
          //       : false;

          //   const additionalUpfit = group?.upfit;
          //   const isUpfitSelected = !!additionalUpfit?.id;

          //   const list = [];

          //   if (areAccessoriesSelected) {
          //     list.push(...(group?.accessories?.map((v) => v?.title) || []));
          //   }
          //   if (isUpfitSelected) {
          //     list.push(additionalUpfit?.title);
          //   }
          //   if (group?.charger?.title) {
          //     list.push(group?.charger?.title);
          //   }

          //   // let text =
          //   // 	areAccessoriesSelected || isUpfitSelected
          //   // 		? `${
          //   // 				additionalUpfit?.title
          //   // 					? `${additionalUpfit.title}${
          //   // 							areAccessoriesSelected ? "," : ""
          //   // 					  }`
          //   // 					: ""
          //   // 		  } ${
          //   // 				group?.accessories?.map(v => v?.title).join(", ") ||
          //   // 				""
          //   // 		  }`
          //   // 		: "";

          //   // if (group?.charger?.title) {
          //   // 	text += `${text ? ", " : ""}${group?.charger?.title}`;
          //   // }

          //   return list;
          // })(),
          unitPrice: `${
            bomPdfData?.singleVehicleOriginalMSRP?.currency
          }${getLocaleFormattedNumber(
            bomPdfData?.singleVehicleOriginalMSRP?.value,
          )}`,
          quantity: `${group?.quantity}`,
          grandTotal: `${
            bomPdfData?.singleGroupSingleVehicleTotalPriceAfterDiscount
              ?.currency
          }${getLocaleFormattedNumber(
            bomPdfData?.singleGroupSingleVehicleTotalPriceAfterDiscount?.value,
          )}`,
        },
        paymentDetails: {
          requiredDepositPercentage: `${
            order?.depositDetailsForm?.depositPercentage || 0
          }%`,
        },
        quotationValidityDate: dayjs()
          .add(MY_ORDERS_QUOTE_EXPIRY_DAYS, "days")
          .format("MMMM DD, YYYY"),
        warrantyDetails: {
          specificationLink: order?.vehicleWarrantySpecification?.file?.url,
        },
      },
      quotationId: order?.quotationId,
    };
  }, [
    bomPdfData.customizationOptionsForPdf,
    bomPdfData.vehicleDetails,
    bomPdfData?.singleVehicleOriginalMSRP?.currency,
    bomPdfData?.singleVehicleOriginalMSRP?.value,
    bomPdfData?.singleGroupSingleVehicleTotalPriceAfterDiscount?.currency,
    bomPdfData?.singleGroupSingleVehicleTotalPriceAfterDiscount?.value,
    order?.customerDetailsForm?.name,
    order?.customer?.buyerName,
    order?.customer?.address,
    order?.customer?.city,
    order?.customer?.state,
    order?.customer?.country,
    order?.customer?.zipCode,
    order?.customer?.phone,
    order?.customer?.email,
    order?.discountApplied,
    order?.vehicleOEMLogoPng,
    order?.vehicleModel,
    order?.depositDetailsForm?.depositPercentage,
    order?.vehicleWarrantySpecification?.file?.url,
    order?.quotationId,
    rootSlice?.appSettings?.name,
    customerDetailsForm?.name,
    customerDetailsForm?.address,
    customerDetailsForm?.city,
    customerDetailsForm?.state,
    customerDetailsForm?.country,
    customerDetailsForm.zipCode,
    customerDetailsForm?.phone,
    customerDetailsForm?.email,
    dealerDetailsForm?.name,
    dealerDetailsForm?.email,
    dealerDetailsForm?.phone,
    dealerDetailsForm?.address,
    user?.user?.metadata?.dealership_name,
    user?.user?.metadata?.dealer_address,
    user?.user?.metadata?.dealer_city,
    user?.user?.metadata?.dealer_state,
    user?.user?.metadata?.dealer_zip_code,
    user?.user?.metadata?.company_logo_url,
    user?.user?.metadata?.job_title,
    user?.user?.email,
    user?.user?.phone,
    user?.user?.name,
    configOptionsForIntroPagePdf,
    group?.paintType?.title,
    group?.quantity,
  ]);
  console.log(
    "%cconfigOptionsForIntroPagePdf:",
    "background-color:black;color:white;",
    { configOptionsForIntroPagePdf, bomPdfCommonProps, group },
  );

  return { bomPdfCommonProps };
}
