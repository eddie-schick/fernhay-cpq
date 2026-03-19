import { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Autocomplete,
  Box,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
  styled,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

import RoutePaths from "~/constants/route-paths";

import { DropdownIcon } from "~/global/icons";
import {
  CustomerSchema,
  NewAddressShape,
  VehicleSchema,
} from "~/global/types/types";

import { persistor, useAppDispatch, useAppSelector } from "~/store";
import { useGetVehiclesQuery } from "~/store/endpoints/vehicles/vehicles";
import { resetSelectedGroupByValue } from "~/store/slices/configurator/slice";
import { customersSelector } from "~/store/slices/customers/slice";
import { setIsCustomerInfoFormSaved } from "~/store/slices/quotation-summary/slice";
import {
  getNewQuoteDefaults,
  createNewQuote,
  quotesSelector,
} from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";
import { rootSelector } from "~/store/slices/root/slice";

import { AuthContextFactory } from "~/context/auth-context/auth-context";
import { useCatalog } from "~/context/catalog-provider/catalog-provider";

import VehicleCard from "~/components/build-vehicle/vehicle-card";
import MuiBox from "~/components/shared/mui-box/mui-box";

import bodyVariantsData from "~/data/body-variants.json";

type BodyVariant = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  image: string;
  leadtime: string;
  price: number;
};

export default function BuildMyVehiclePage() {
  const { user } = useContext(AuthContextFactory);
  const { data: vehicles, isLoading } = useGetVehiclesQuery();
  const { chassis: catalogChassis, bodies: catalogBodies } = useCatalog();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { newQuotes } = useAppSelector(quotesSelector);

  const { appSettings } = useAppSelector(rootSelector);
  const customersSlice = useAppSelector(customersSelector);
  const { customers } = customersSlice;

  const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const showBodySelection = searchParams.get("step") === "body";

  // Derive selectedChassis from the vehicles list when in body selection step
  const selectedChassis: VehicleSchema | null = showBodySelection && vehicles?.length
    ? vehicles[0] as VehicleSchema
    : null;

  const bodyVariants: BodyVariant[] = bodyVariantsData;

  const NEW_CUSTOMER_OBJECT = {
    id: 0,
    buyerName: "New Customer",
    coBuyerName: "",
    name: "New Customer",
    representativeName: "",
    addresses: [],
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    country: "",
    wan: "",
    userId: user?.user.id as string,
    creatorName: "",
  };

  const [selectedCustomer, setSelectedCustomer] =
    useState<null | CustomerSchema>(NEW_CUSTOMER_OBJECT);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const onCustomerChangeHandler = (
    _: React.SyntheticEvent<Element, Event>,
    value: CustomerSchema | null,
  ) => {
    setSelectedCustomer(value);
  };

  const onChassisClick = (vehicleData: VehicleSchema) => {
    if (vehicleData.isBuildEnabled) {
      setSearchParams({ step: "body" });
    }
  };

  const onBodyVariantClick = async (variant: BodyVariant) => {
    if (!selectedChassis) return;

    const isNewCustomer =
      selectedCustomer?.buyerName?.toLowerCase().split(" ").join("") ===
      "newcustomer";
    let customerPreviousDetails;
    if (!isNewCustomer) {
      customerPreviousDetails = customers?.find(
        (v) => String(v?.id) === String(selectedCustomer?.id),
      );
    }

    const quoteId = Date.now();
    const groupId = "A";

    //@ts-ignore
    const newQuotePayload: NewQuoteShape = {
      ...getNewQuoteDefaults(),
      ...(!isNewCustomer &&
        customerPreviousDetails && {
          customerDetailsForm: {
            name: customerPreviousDetails?.buyerName || "",
            representativeName: customerPreviousDetails?.coBuyerName || "",
            email: customerPreviousDetails?.email || "",
            address: customerPreviousDetails.address || null,
            city: customerPreviousDetails?.city || "",
            state: customerPreviousDetails?.state || "",
            phone: customerPreviousDetails?.phone || "",
            zipCode: customerPreviousDetails?.zipCode || "",
            country: customerPreviousDetails?.country || "",
            wan: String(customerPreviousDetails?.wan || ""),
            deposited: customerPreviousDetails?.deposited || "",
          },
        }),
      dealerDetailsForm: {
        name: user?.user?.name || "",
        email: user?.user?.email || "",
        address: user?.user?.metadata?.dealer_address || "",
        city: user?.user?.metadata?.dealer_city || "",
        state: user?.user?.metadata?.dealer_state || "",
        zipCode: user?.user?.metadata?.dealer_zip_code || "",
        phone: user?.user?.phone || "",
        dealershipName: user?.user?.metadata?.dealership_name || "",
        jobTitle: user?.user?.metadata?.job_title || "",
      },
      id: quoteId,
      customer: selectedCustomer as CustomerSchema,
      vehicleId: variant.id,
      vehicleMake: selectedChassis.make || "Fernhay",
      vehicleModel: `eAV ${variant.name}`,
      vehicleName: `eAV ${variant.name}`,
      vehicleImage: variant.image || selectedChassis.image?.[0]?.url || "",
      vehicleOEMLogoPng: appSettings?.logoPng?.url,
      totalQuantity: 1,
      groups: [
        {
          id: groupId,
          quantity: 1,
          name: `Group ${groupId?.slice(0, 4)}`,
          isSelected: true,
        },
      ],
      gvwr: selectedChassis.gvwr,

      vehicle__kontentAi__id: variant.id,
      vehicle__kontentAi__codename: variant.id,
      vehicleModel__kontentAi__codename: variant.id,
    };

    await persistor.purge();

    dispatch(resetSelectedGroupByValue());
    dispatch(createNewQuote(newQuotePayload));
    dispatch(setIsCustomerInfoFormSaved(false));
    navigate(`${RoutePaths.CONFIGURATOR_PAGE}?quoteId=${quoteId}`);
  };

  const renderVehicles = () => {
    if (isLoading) {
      return (
        <MuiBox className="vehicle-cards-loader-container">
          <Skeleton width={278} height={368} />
        </MuiBox>
      );
    }

    if (vehicles?.length === 0) {
      return (
        <Typography sx={{ fontSize: "1.25rem" }}>No vehicles found!</Typography>
      );
    }

    return (
      <div className="customer-card--container">
        {vehicles &&
          vehicles.length > 0 &&
          vehicles.map((vehicle, index) => (
            <VehicleCard
              key={index}
              title={vehicle.name || ""}
              description={vehicle.description}
              imageSrc={
                vehicle.image && vehicle.image[0] && vehicle.image[0].url
                  ? vehicle.image[0].url
                  : ""
              }
              model={vehicle?.model || ""}
              isCustomerSelected={Boolean(selectedCustomer)}
              isBuildEnabled={vehicle?.isBuildEnabled}
              isPoolInventoryEnabled={vehicle?.isPoolInventoryEnabled}
              buttonText={
                vehicle?.isBuildEnabled ? "Select Chassis" : "Coming Soon..."
              }
              onBuildClick={() => onChassisClick(vehicle as VehicleSchema)}
              price={catalogChassis?.[0]?.msrp}
              infoText={`${catalogChassis?.[0]?.description || "All-electric cutaway chassis platform for urban commercial applications."}\n\nType: ${catalogChassis?.[0]?.typeClass || "Light-Duty EV"}\nGVWR: ${catalogChassis?.[0]?.gvwr?.value?.toLocaleString() || "1,500"} ${catalogChassis?.[0]?.gvwr?.unit || "lbs"}\nPayload Capacity: ${catalogChassis?.[0]?.payloadCapacity?.value?.toLocaleString() || "800"} ${catalogChassis?.[0]?.payloadCapacity?.unit || "lbs"}\nLead Time: ${catalogChassis?.[0]?.leadTime || 8} weeks`}
            />
          ))}
      </div>
    );
  };

  const renderBodyVariants = () => {
    return (
      <div className="body-variants-section">
        <MuiBox className="body-variants-header">
          <MuiBox
            className="back-button"
            onClick={() => setSearchParams({})}
          >
            <ArrowBack fontSize="small" />
            <Typography className="back-text">Back to Chassis</Typography>
          </MuiBox>
          <Typography className="select-model-container--heading">
            Select a body type to start customizing
          </Typography>
        </MuiBox>

        <div className="customer-card--container">
          {bodyVariants.map((variant) => (
            <VehicleCard
              key={variant.id}
              title={variant.name}
              imageSrc={variant.image || ""}
              model={variant.id}
              isCustomerSelected={Boolean(selectedCustomer)}
              isBuildEnabled={true}
              buttonText="Start Your Build"
              onBuildClick={() => void onBodyVariantClick(variant)}
              infoText={`${variant.description}\n\nLead time: ${variant.leadtime}`}
              price={variant.price}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <BuildMyVehiclePageStyled>
      <div className="customer-select">
        <Typography className="customer-select--description">
          This Quote is for:
        </Typography>
        <Autocomplete
          disablePortal
          open={autoCompleteOpen}
          onOpen={() => setAutoCompleteOpen(true)}
          onClose={() => setAutoCompleteOpen(false)}
          id="customer-select-dropdown"
          options={[NEW_CUSTOMER_OBJECT, ...(customers || [])]}
          value={selectedCustomer}
          onChange={onCustomerChangeHandler}
          getOptionLabel={(option) => option?.buyerName || option?.name || ""}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select Customer"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end">
                    <DropdownIcon
                      style={{ cursor: "pointer" }}
                      onClick={() => setAutoCompleteOpen((prev) => !prev)}
                    />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </div>

      {!showBodySelection ? (
        <>
          <Typography className="select-model-container--heading">
            Select a base model to start customizing
          </Typography>
          <div className="select-model-container">{renderVehicles()}</div>
        </>
      ) : (
        renderBodyVariants()
      )}
    </BuildMyVehiclePageStyled>
  );
}

const BuildMyVehiclePageStyled = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.custom.baseWhite,
  padding: "1.5rem 2.5rem 5rem 2.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",

  ".customer-select": {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
    flexWrap: "wrap",

    ".MuiInputBase-root": {
      padding: "0.65rem",
      paddingRight: "0.65rem !important",
      "&:focus-visible": {
        outline: "none",
      },
    },
    ".MuiInputBase-input": {
      color: theme.palette.custom.subHeadlines,
      fontSize: "1rem",
      fontWeight: 500,
      "::placeholder": {
        opacity: 1,
      },
    },
    svg: {
      fontSize: "1.25rem",
    },

    ".MuiAutocomplete-option": {
      fontSize: "1rem",
      fontWeight: "500",
      lineHeight: "2rem",
      textTransform: "capitalize",
    },
  },

  ".customer-select--description": {
    fontSize: "1.25rem",
    fontWeight: "500",
  },

  "#customer-select-dropdown": {
    fontSize: "1rem",
    width: "9.75rem",
  },
  ".MuiOutlinedInput-root .MuiAutocomplete-input": {
    padding: "unset !important",
  },

  ".MuiInputBase-root": {
    fontSize: "1.8rem !important",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    background: theme.palette.custom.baseWhite,
  },

  ".customer-card--container": {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.5rem",
  },

  ".select-model-container--heading": {
    fontSize: "1.25rem",
    fontWeight: 400,
  },

  ".vehicle-cards-loader-container": {
    display: "flex",
    flexDirection: "row",
    gap: "1.5rem",

    ".MuiSkeleton-root": {
      transform: "unset",
    },
  },

  ".body-variants-section": {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },

  ".body-variants-header": {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
  },

  ".back-button": {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    color: theme.palette.primary.main,
    marginBottom: "0.5rem",
    width: "fit-content",

    "&:hover": {
      opacity: 0.8,
    },
  },

  ".back-text": {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.primary.main,
  },

  ".body-variants-heading": {
    fontSize: "1.5rem",
    fontWeight: 700,
  },

  ".body-variants-subheading": {
    fontSize: "1rem",
    color: theme.palette.text.secondary,
  },

  ".footer-text-container": {
    marginTop: "auto",
  },

  ".footer-text": {
    fontSize: "1.8rem",
    fontWeight: "500",
    color: theme.palette.custom.lightGray,
    cursor: "pointer",
    textDecoration: "underline",
    width: "fit-content",
  },

  [theme.breakpoints.down("lg")]: {
    ".vehicle-cards-loader-container": {
      ".MuiSkeleton-root:nth-of-type(3)": {
        display: "none",
      },
    },
  },

  [theme.breakpoints.down("sm")]: {
    ".vehicle-cards-loader-container": {
      gridTemplateColumns: "1fr",

      ".MuiSkeleton-root:nth-of-type(1)": {
        width: "100% !important",
      },

      ".MuiSkeleton-root:nth-of-type(2)": {
        display: "none",
      },
    },
  },
}));
