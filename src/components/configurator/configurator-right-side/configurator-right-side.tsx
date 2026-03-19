import { useRef } from "react";
import { useNavigate } from "react-router";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { Box, styled } from "@mui/material";

import Envs from "~/constants/envs";
import LocalStorageKeys from "~/constants/local-storage-keys";
import RoutePaths from "~/constants/route-paths";

import { getLocaleFormattedNumber } from "~/utils/misc";

import {
  ColorPickerSectionOptionSchema,
  ConfigurationSectionOptionSchemaV2,
  ConfigurationSectionSchemaV2,
  KontentAiCreateQuoteRequestSchema,
  ValueAndUnit,
} from "~/global/types/types";

import { submitDatadogCountMetric } from "~/helpers/datadog-helpers";

import { useAppDispatch, useAppSelector } from "~/store";
import { usePushEventsLogsToDBMutation } from "~/store/endpoints/misc/misc";
import { useCreateQuoteMutation } from "~/store/endpoints/quotes/quotes";
import {
  calculatedSingleGroupGrossTotalPriceSelector,
  calculatedSingleGroupPayloadPerSingleVehicleSelector,
  calculatedSingleGroupTotalPricePerVehicleSelector,
  getBuildLeadTimeForGroupPerVehicle,
  setQuoteById,
} from "~/store/slices/quotes/slice";
import { rootSelector } from "~/store/slices/root/slice";

import { useAuthContextValue } from "~/context/auth-context";
import { useConfiguratorPageContextValue } from "~/context/configurator-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

import ConfigurationOptions from "./configuration-options/configuration-options";
import OptionsTabs from "./options-tabs/options-tabs";
import SummaryCard from "./summary-card/summary-card";

interface Vehicle {
  vin: string;
  vinConfirmed: boolean;
}

export default function ConfiguratorRightSide() {
  const storeDispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quoteId = searchParams.get("quoteId");

  const VIN_STRING_LENGTH = 17;

  const { triggerToast } = useCustomToast();

  const isTabSelectedManually = useRef<boolean>(false);

  const { user } = useAuthContextValue();
  const { newQuoteById, selectedGroup } = useConfiguratorPageContextValue();

  const [createQuote, createQuoteMutationState] = useCreateQuoteMutation();
  const [pushEventsLogsToDB] = usePushEventsLogsToDBMutation();

  const rootSlice = useAppSelector(rootSelector);
  const totalPricePerVehicle = useAppSelector(() =>
    calculatedSingleGroupTotalPricePerVehicleSelector(selectedGroup),
  );
  const totalPayloadPerVehicle = useAppSelector(() =>
    calculatedSingleGroupPayloadPerSingleVehicleSelector(
      selectedGroup,
      newQuoteById!,
    ),
  );
  // Base MSRP is always $3,000 above the per-vehicle total price
  const baseMsrpValue = (totalPricePerVehicle?.value || 0) + 3000;
  const baseMsrpCurrency = totalPricePerVehicle?.currency || "$";
  const totalPriceForPerVehicle = useAppSelector(() =>
    calculatedSingleGroupGrossTotalPriceSelector(selectedGroup),
  );
  const totalLeadtimePerVehicle = useAppSelector((state) =>
    getBuildLeadTimeForGroupPerVehicle(state, {
      orderId: newQuoteById?.id as number,
      groupId: String(selectedGroup?.id),
      dontReturnText: true,
    }),
  ) as ValueAndUnit;

  const calculatedTotalPayloadForSingleVehicle = useAppSelector(() =>
    calculatedSingleGroupPayloadPerSingleVehicleSelector(
      selectedGroup,
      newQuoteById!,
    ),
  );

  const generateRandomVin = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let vin = "";

    for (let i = 0; i < VIN_STRING_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      vin += chars[randomIndex];
    }

    return vin;
  };

  const vehiclesArrayOfTempVinsGeneratorBasedOnQuantity = (
    quantity: number,
  ): Vehicle[] => {
    const vehiclesArray: Vehicle[] = Array.from({ length: quantity }, () => ({
      vin: generateRandomVin(),
      vinConfirmed: false,
    }));
    return vehiclesArray;
  };

  // eslint-disable-next-line @typescript-eslint/require-await
  const onGenerateQuoteClick = async () => {
    if (!newQuoteById || !selectedGroup) return;

    const userEmailDomain = user?.user ? user?.user?.email.split("@")[1] : "";

    // try {
    //   let createdQuoteId;
    //   const createdQuoteIds = [];
    //   let quoteFormattedId;

    const createQuotePayload = {
      name: "", // autofill by BE
      vehicleModel: newQuoteById?.vehicleModel,
      description: selectedGroup?.description,
      msrp: {
        value: baseMsrpValue,
        currency: baseMsrpCurrency.toString(),
      },
      dealerPrice: {
        value: totalPriceForPerVehicle?.value,
        currency: (totalPriceForPerVehicle?.currency || "$").toString(),
      },
      payloadCapacity: {
        value: calculatedTotalPayloadForSingleVehicle?.value,
        unit: calculatedTotalPayloadForSingleVehicle?.unit,
      },
      leadTime: {
        value: totalLeadtimePerVehicle?.value,
        unit: "day",
      },

      upfitShipThroughAddress: newQuoteById?.shipThruDetailsForm?.upfit,
      chargerShipThroughAddress: newQuoteById?.shipThruDetailsForm?.charger,
      accessoriesShipThroughAddress:
        newQuoteById?.shipThruDetailsForm?.accessories,
      customizationOptions: (() => {
        const configSectionsWithSelectedOptions =
          newQuoteById?.groups[0]?.configurationSections
            ?.map((configSection) => {
              const modifiedConfigSection = {
                ...configSection,
                options: configSection?.options?.filter(
                  (configOption) => configOption?.is_selected,
                ),
              };

              return modifiedConfigSection;
            })
            .filter((configSection) => Boolean(configSection?.options?.length));

        const inEntriesForm = configSectionsWithSelectedOptions?.map(
          (configSection) => {
            return [configSection?.title?.toLowerCase(), configSection];
          },
        );
        //@ts-ignore
        let objectForm: {
          [key: string]: ConfigurationSectionSchemaV2;
          //@ts-ignore
        } = Object.fromEntries(inEntriesForm);
        objectForm = {
          paintType: {
            id: uuidv4(),
            hide: false,
            is_multi_select: false,
            title: "Paint",
            //@ts-ignore
            options: [selectedGroup?.paintType],
          },
          ...objectForm,
        };

        return objectForm;
      })(),
      vehicles: vehiclesArrayOfTempVinsGeneratorBasedOnQuantity(
        newQuoteById?.totalQuantity,
      ),
      // Pass full quote state so createQuote can save customer/dealer/config details
      quoteState: {
        customerDetailsForm: newQuoteById?.customerDetailsForm,
        dealerDetailsForm: newQuoteById?.dealerDetailsForm,
      },
    };

    try {
      const createQuoteRes = await createQuote({
        //@ts-ignore
        data: createQuotePayload,
        customerId: newQuoteById?.customer?.id as number,
        headers: {
          Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
        },
      }).unwrap();

      console.log("mega resp", createQuoteRes);

      void pushEventsLogsToDB({
        events: [
          {
            metric: `${(
              rootSlice?.appSettings?.name || ""
            )?.toLowerCase()}_cpq:quote_generation`,
            miscDetails: {
              userEmail: user?.user?.email,
              userName: user?.user?.name,
              vehicleName: newQuoteById?.vehicleName,
            },
          },
        ],
      });

      submitDatadogCountMetric({
        metric: `${(
          rootSlice?.appSettings?.name || ""
        )?.toLowerCase()}_cpq.quote_generation`,
        tags: [
          `user.email:${user?.user?.email}`,
          `user.name:${user?.user?.name}`,
          `vehicle.name:${newQuoteById?.vehicleName}`,
        ],
      });

      storeDispatch(
        setQuoteById({
          quoteId: newQuoteById?.id,
          data: {
            ...newQuoteById,
            isOrdered: true,
            //@ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            quotationId: createQuoteRes?.formattedId || "",
          },
        }),
      );

      navigate(
        //@ts-ignore
        `${RoutePaths.QUOTATION_SUMMARY}?quoteId=${quoteId}&createdQuoteId=${createQuoteRes?.id || "0"}&navigation=default`,
        { replace: true },
      );
    } catch (error) {
      triggerToast({
        variant: "error",
        message: "Request failed! Some error occurred",
      });
    }
  };

  return (
    <ConfiguratorRightSideStyled>
      <MuiBox className="summary-card-container">
        <SummaryCard />

        <OptionsTabs isTabSelectedManually={isTabSelectedManually} />
      </MuiBox>

      <MuiBox className="configuration-options-main-container">
        <ConfigurationOptions isTabSelectedManually={isTabSelectedManually} />

        <MuiBox className="generate-quote-button-container">
          <CButton
            id="generate-quote-button"
            onClick={() => void onGenerateQuoteClick()}
            disabled={createQuoteMutationState.isLoading}
          >
            {createQuoteMutationState.isLoading ? (
              <CircularLoader color="#ffffff" size={20} />
            ) : (
              "Generate Quote"
            )}
          </CButton>
        </MuiBox>
      </MuiBox>
    </ConfiguratorRightSideStyled>
  );
}

const ConfiguratorRightSideStyled = styled(Box)(({ theme }) => ({
  flex: 1,
  minWidth: "30rem",
  maxWidth: "30rem",
  marginTop: "-8rem",

  ".summary-card-container": {
    position: "sticky",
    top: 0,
    paddingTop: "6rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    backgroundColor: "#ffffff",
    zIndex: 1,
  },

  ".configuration-options-main-container": {
    marginTop: "2.075rem",
    position: "relative",
  },

  ".generate-quote-button-container": {
    marginTop: "1.5rem",
    display: "grid",
  },

  [theme.breakpoints.down("lg")]: {
    maxWidth: "unset",

    ".summary-card-container": {
      paddingTop: "2rem",
      top: "50px",
    },

    ".configuration-options-main-container": {
      marginTop: "0",
    },
  },
}));
