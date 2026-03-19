import { useMemo } from "react";

import { getLeadTimeInDays } from "~/utils/date-utils";
import getBuildLeadTimeFromTimeGivenInDays, {
  getLocaleFormattedNumber,
} from "~/utils/misc";

import { useAppSelector } from "~/store";
import { calculatedSingleGroupTotalPricePerVehicleSelector } from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import { BomPDFProps } from "~/components/shared/bom-pdf/types";

import {
  ChargerOptionSchema,
  ColorPickerSectionOptionSchema,
  ConfigurationSectionOptionSchema,
} from "../types/types";

type Props = {
  group: NewQuoteShape["groups"][number];
  order: NewQuoteShape;
};
type PdfCustomizationOptionType = BomPDFProps["customizationOptions"];
const useBomPdfData = (props: Props) => {
  const { group, order } = props;

  const singleGroupSingleVehicleTotalPrice = useAppSelector(() =>
    calculatedSingleGroupTotalPricePerVehicleSelector(group),
  );
  const singleVehicleOriginalMSRP = useMemo(() => {
    if (singleGroupSingleVehicleTotalPrice == null) return null;
    return {
      currency: singleGroupSingleVehicleTotalPrice.currency,
      value: (singleGroupSingleVehicleTotalPrice.value ?? 0) + 3000,
    };
  }, [singleGroupSingleVehicleTotalPrice]);
  // The $3k chassis discount is always applied (MSRP = sale price + $3,000)
  // Any additional percentage-based discount is layered on top
  const percentageDiscountAmount =
    order?.isDiscountApplied && order?.discountApplied
      ? (Number(singleVehicleOriginalMSRP?.value) * order.discountApplied) / 100
      : 0;
  // Total discount = $3k chassis discount + any percentage discount
  const chassisDiscount = 3000;
  const totalDiscountAmount = chassisDiscount + percentageDiscountAmount;
  const originalMSRPAfterDiscount = useMemo(() => {
    return {
      currency: singleVehicleOriginalMSRP?.currency,
      value: (singleVehicleOriginalMSRP?.value || 0) - totalDiscountAmount,
    };
  }, [
    totalDiscountAmount,
    singleVehicleOriginalMSRP?.currency,
    singleVehicleOriginalMSRP?.value,
  ]);
  const singleGroupSingleVehicleTotalPriceAfterDiscount = useMemo(() => {
    return {
      currency: singleGroupSingleVehicleTotalPrice?.currency,
      value:
        (singleGroupSingleVehicleTotalPrice?.value || 0) - percentageDiscountAmount,
    };
  }, [
    percentageDiscountAmount,
    singleGroupSingleVehicleTotalPrice,
  ]);
  const customizationOptionsForPdf: PdfCustomizationOptionType = useMemo(() => {
    const data: PdfCustomizationOptionType = [];

    type CustomizationOptionPossibleType =
      | ConfigurationSectionOptionSchema
      | ColorPickerSectionOptionSchema
      | ChargerOptionSchema
      | undefined;
    function getRequiredFieldsForPdfTable(
      option: CustomizationOptionPossibleType | null,
      title: string | null,
    ) {
      if (!option) return null;

      return {
        id: option?.id || "-",
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        title: option?.title || option?.name || "-",
        price: { value: option?.price, currency: option?.price_unit },
        quantity: Number(group?.quantity),
        lineTotal: {
          currency: option?.price_unit || "$",
          value: (option?.price ?? 0) * Number(group?.quantity),
        },
        leadtime:
          //@ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          getBuildLeadTimeFromTimeGivenInDays(
            getLeadTimeInDays(option?.leadtime || 0, option?.leadtime_unit),
          ) || undefined,
        sectionTitle: title,
      };
    }

    group?.configurationSections
      ?.filter((configSection) => {
        const selectedOptions = configSection?.options?.filter(
          (configOption) => configOption?.is_selected,
        );

        return Boolean(selectedOptions?.length);
      })
      ?.forEach((configSection) => {
        configSection?.options
          ?.filter((sectionOption) => sectionOption?.is_selected)
          ?.forEach((configOption) => {
            const isBaseMsrpSection =
              // configSection?.title?.toLowerCase() === "chassis";
              configSection?.is_part_of_base_msrp === true;
            const sectionTitle = isBaseMsrpSection
              ? null
              : configSection?.title;

            const optionDetails = getRequiredFieldsForPdfTable(
              configOption,
              sectionTitle,
            );

            insertDetailsInDataIfTruthy(optionDetails);
          });
      });

    function insertDetailsInDataIfTruthy(
      ...args: (PdfCustomizationOptionType[number] | null)[]
    ) {
      args.forEach((detail) => {
        if (detail) {
          data.push(detail);
        }
      });
    }

    function calculateTotalFields() {
      const allSelectedConfigOptions = group?.configurationSections?.flatMap(
        (configSection) =>
          configSection?.options?.filter((configOption) =>
            Boolean(configOption?.is_selected),
          ),
      );

      // const isUpfitTheDefault = !allSelectedConfigOptions?.find(
      //   (configOption) =>
      //     configOption?.option_category?.toLowerCase() === "chassis",
      // ); // There is no chassis, only upfit

      const dataForCalculationExceptCharger = allSelectedConfigOptions?.filter(
        (configOption) => {
          return configOption?.option_category?.toLowerCase() !== "charger";
        },
      );

      const dataForCalculationExceptBaseMSRPEntities =
        allSelectedConfigOptions?.filter((configOption) => {
          // const optionTitle = configOption?.option_category?.toLowerCase();
          // return isUpfitTheDefault
          //   ? optionTitle !== "upfit"
          //   : optionTitle !== "chassis";

          return !configOption.is_part_of_base_msrp;
        });

      const allDataForCalculation = allSelectedConfigOptions!;

      const totalLeadTime = dataForCalculationExceptCharger?.reduce(
        (acc, cur) => {
          //@ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (
            acc +
            (getLeadTimeInDays(cur?.leadtime || 0, cur?.leadtime_unit) || 0)
          );
        },
        0,
      );
      const totalMSRP = allDataForCalculation?.reduce((acc, cur) => {
        return acc + (cur?.price || 0);
      }, 0);

      // Total sales price (final price) is: total MSRP - discount amount on 'Base MSRP'
      const totalSalesPrice =
        ((originalMSRPAfterDiscount?.value || 0) +
          (dataForCalculationExceptBaseMSRPEntities?.reduce((acc, cur) => {
            return acc + (cur?.price || 0);
          }, 0) || 0)) *
        Number(group?.quantity);

      data.push({
        id: "Total",
        title: "",
        sectionTitle: "Total",
        leadtime: getBuildLeadTimeFromTimeGivenInDays(totalLeadTime) || "",
        quantity: 0,
        price: {
          currency: singleVehicleOriginalMSRP?.currency || "$",
          value: totalMSRP,
        },
        lineTotal: {
          currency: originalMSRPAfterDiscount?.currency || "$",
          value: totalSalesPrice,
        },
      });
    }

    calculateTotalFields();

    return data;
  }, [
    group?.configurationSections,
    group?.quantity,
    originalMSRPAfterDiscount?.value,
    originalMSRPAfterDiscount?.currency,
    singleVehicleOriginalMSRP?.currency,
  ]);

  //@ts-ignore
  const vehicleDetails: BomPDFProps["vehicleDetails"] = useMemo(() => {
    return {
      make: order?.vehicleMake,
      model: order?.vehicleModel,
      originalMSRP: `${
        singleVehicleOriginalMSRP?.currency
      }${getLocaleFormattedNumber(singleVehicleOriginalMSRP?.value)}`,
      originalMSRPAfterDiscount: `${
        originalMSRPAfterDiscount?.currency
      }${getLocaleFormattedNumber(
        originalMSRPAfterDiscount?.value * Number(group?.quantity),
      )}`,
      discountedAmount: `${
        originalMSRPAfterDiscount?.currency
      }${getLocaleFormattedNumber(
        (singleVehicleOriginalMSRP?.value || 0) -
          originalMSRPAfterDiscount?.value,
      )}`,
      quantity: group?.quantity,
      groupName: group?.name,
      isFleetOrder: order?.totalQuantity > 1,
    };
  }, [
    group?.name,
    group?.quantity,
    order?.totalQuantity,
    order?.vehicleMake,
    order?.vehicleModel,
    originalMSRPAfterDiscount?.currency,
    originalMSRPAfterDiscount?.value,
    singleVehicleOriginalMSRP?.currency,
    singleVehicleOriginalMSRP?.value,
  ]);
  const returnValue = useMemo(() => {
    return {
      customizationOptionsForPdf,
      vehicleDetails,
      originalMSRPAfterDiscount,
      singleVehicleOriginalMSRP,
      singleGroupSingleVehicleTotalPrice,
      singleGroupSingleVehicleTotalPriceAfterDiscount,
    };
  }, [
    customizationOptionsForPdf,
    originalMSRPAfterDiscount,
    singleGroupSingleVehicleTotalPrice,
    singleGroupSingleVehicleTotalPriceAfterDiscount,
    singleVehicleOriginalMSRP,
    vehicleDetails,
  ]);

  console.log(
    "%cuseBomPdfData returnValu:",
    "background-color:black;color:white;",
    {
      returnValue,
    },
  );

  return returnValue;
};

export default useBomPdfData;
