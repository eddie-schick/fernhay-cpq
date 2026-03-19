import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import EditOutlined from "@mui/icons-material/EditOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  styled,
} from "@mui/material";

import LocalStorageKeys from "~/constants/local-storage-keys";

import useGoogleAddress, {
  StyledTextfield,
} from "~/global/custom-hooks/useGoogleAddress";

import { useAppDispatch } from "~/store";
import { useUpdateCustomerMutation } from "~/store/endpoints/customers/customers";
import { useUpdateQuoteMutation } from "~/store/endpoints/quotes/quotes";
import { setQuoteById } from "~/store/slices/quotes/slice";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

type FormInputs = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
const FIELD_REQUIRED_MESSAGE = "This field is required";

export default function DestinationAddress({
  scrollToCustomerCard,
}: {
  scrollToCustomerCard: () => void;
}) {
  const storeDispatch = useAppDispatch();

  const [searchParams] = useSearchParams();
  const createdQuoteId = searchParams.get("createdQuoteId");

  const { triggerGenericErrorMessage, triggerToast } = useCustomToast();

  const { quoteId, newQuoteById, isDestinationAddressFormFilled } =
    useQuotationSummaryPageContextValue();

  const [updateQuote] = useUpdateQuoteMutation();

  const addressInputRef = useRef<HTMLInputElement>(null);

  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(
    isDestinationAddressFormFilled ? false : true,
  );
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const [updateCustomer, updateCustomerMutationState] =
    useUpdateCustomerMutation();

  const { register, handleSubmit, setValue, formState, control } =
    useForm<FormInputs>();
  const { errors } = formState;
  const handleAddressChange = (
    address: string,
    zipCode: string,
    city: string,
    state: string,
    country: string,
  ) => {
    setValue("address", address, { shouldValidate: true });
    setValue("zipCode", zipCode, { shouldValidate: true });
    setValue("city", city, { shouldValidate: true });
    setValue("state", state, { shouldValidate: true });
    setValue("country", country, { shouldValidate: true });
  };
  const { initAutocomplete } = useGoogleAddress({
    handleAddressChange,
  });
  console.log(
    "%cDestinationAddress:",
    "background-color:crimson;color:white;",
    {
      errors,
    },
  );

  useEffect(() => {
    if (addressInputRef.current) {
      initAutocomplete(addressInputRef);
    }
  }, [initAutocomplete]);

  const onEditIconClick = () => {
    setIsEditingDetails(true);
  };

  const performQuoteUpdate = async (data: {
    destinationAddressDetails: FormInputs;
  }) => {
    const addresses = [
      {
        street: newQuoteById?.customerDetailsForm?.address || "",
        city: newQuoteById?.customerDetailsForm?.city || "",
        state: newQuoteById?.customerDetailsForm?.state || "",
        zipCode: newQuoteById?.customerDetailsForm?.zipCode || "",
        type: "shipping",
        country: newQuoteById?.customerDetailsForm?.country || "",
        address: newQuoteById?.customerDetailsForm?.address || "",
      },
      {
        ...data.destinationAddressDetails,
        type: "billing",
        street: "",
      },
    ];

    await updateCustomer({
      id: parseInt(newQuoteById?.customer?.id as string),
      data: {
        addresses,
      },
      headers: {
        Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
      },
    }).unwrap();

    await updateQuote({
      customerId: parseInt(newQuoteById?.customer?.id as string),
      id: parseInt(createdQuoteId as string) || "",

      headers: {
        Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
      },
    }).unwrap();
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    // eslint-disable-next-line @typescript-eslint/require-await
    (async () => {
      if (!newQuoteById) return;

      if (!newQuoteById?.customer?.id) {
        triggerToast({
          variant: "error",
          message: "No customer found, please add a customer first",
        });
        scrollToCustomerCard();
        return;
      }
      const newData = {
        address: data?.address,
        city: data?.city,
        state: data?.state || "",
        zipCode: data?.zipCode,
        country: data?.country,
      };
      const previousData = {
        address: newQuoteById?.destinationAddressForm?.address,
        city: newQuoteById?.destinationAddressForm?.city,
        state: newQuoteById?.destinationAddressForm?.state,
        zipCode: newQuoteById?.destinationAddressForm?.zipCode,
        country: newQuoteById?.destinationAddressForm?.country,
      };

      if (JSON.stringify(newData) === JSON.stringify(previousData)) {
        setIsEditingDetails(false);

        return;
      }

      const updateDataInLocalForm = () => {
        storeDispatch(
          setQuoteById({
            quoteId: quoteId!,
            data: {
              ...newQuoteById,
              destinationAddressForm: {
                ...newQuoteById?.destinationAddressForm,
                ...newData,
              },
            },
          }),
        );
      };

      try {
        setIsUpdating(true);

        await performQuoteUpdate({
          destinationAddressDetails: newData,
        });

        triggerToast({
          variant: "success",
          message: "Destination address saved successfully!",
        });

        updateDataInLocalForm();
        setIsEditingDetails(false);
      } catch (error) {
        triggerGenericErrorMessage();

        console.log(
          "%csave destination address error:",
          "background-color:red;color:white;",
          { error },
        );
      } finally {
        setIsUpdating(false);
      }
    })();
  };

  return (
    <DestinationAddressStyled
      id="destination-address-accordion"
      disableGutters
      expanded={true}
      isEditingDetails={isEditingDetails}
    >
      <AccordionSummary>
        <Typography className="heading">
          Destination Address&nbsp;&nbsp;
          {!isEditingDetails && (
            <EditOutlined
              id="edit-destination-address-icon"
              onClick={onEditIconClick}
            />
          )}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <MuiBox
          className="form-container"
          component="form"
          onSubmit={(e) => {
            e.preventDefault();

            void handleSubmit(onSubmit)();
          }}
        >
          <MuiBox className="form-control address-input">
            <label
              htmlFor="input-address--destination-address-form"
              className="form-label form-label--required"
            >
              Address
            </label>
            {isEditingDetails ? (
              <>
                {/* <input
                  id="input-address--destination-address-form"
                  placeholder="Enter Address"
                  className={`input--text ${
                    errors?.address?.message ? "input--error" : ""
                  }`}
                  {...register("address", {
                    value: newQuoteById?.destinationAddressForm?.address,
                    required: FIELD_REQUIRED_MESSAGE,
                  })}
                /> */}
                <Controller
                  name="address"
                  control={control}
                  defaultValue={
                    newQuoteById?.destinationAddressForm?.address || ""
                  }
                  rules={{
                    required: FIELD_REQUIRED_MESSAGE,
                  }}
                  render={({ field }) => (
                    <StyledTextfield
                      id="input-destination-address"
                      placeholder="Enter address"
                      inputRef={addressInputRef}
                      className={errors?.address?.message ? "input--error" : ""}
                      {...field}
                      sx={(theme) => ({
                        input: {
                          [theme.breakpoints.down("sm")]: {
                            width: "unset !important",
                          },
                        },
                      })}
                    />
                  )}
                />

                <Typography className="error-text">
                  {errors?.address?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.address?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.destinationAddressForm?.address || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-city--destination-address-form"
              className="form-label form-label--required"
            >
              City
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-city--destination-address-form"
                  placeholder="Enter City"
                  className={`input--text ${
                    errors?.city?.message ? "input--error" : ""
                  }`}
                  {...register("city", {
                    value: newQuoteById?.destinationAddressForm?.city,
                    required: FIELD_REQUIRED_MESSAGE,
                  })}
                />
                <Typography className="error-text">
                  {errors?.city?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.city?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.destinationAddressForm?.city || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-state--destination-address-form"
              className="form-label form-label--required"
            >
              State
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-state--destination-address-form"
                  placeholder="Enter State"
                  className={`input--text ${
                    errors?.state?.message ? "input--error" : ""
                  }`}
                  {...register("state", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.destinationAddressForm?.state,
                  })}
                />
                <Typography className="error-text">
                  {errors?.state?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.state?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.destinationAddressForm?.state || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-zipCode--destination-address-form"
              className="form-label form-label--required"
            >
              Zip/Postal Code
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-zipCode--destination-address-form"
                  placeholder="Enter Zip/Postal Code"
                  className={`input--text ${
                    errors?.zipCode?.message ? "input--error" : ""
                  }`}
                  {...register("zipCode", {
                    value: String(
                      newQuoteById?.destinationAddressForm?.zipCode,
                    ),
                    required: FIELD_REQUIRED_MESSAGE,
                  })}
                />
                <Typography className="error-text">
                  {errors?.zipCode?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.zipCode?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.destinationAddressForm?.zipCode || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-country--destination-address-form"
              className="form-label form-label--required"
            >
              Country
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-country--destination-address-form"
                  placeholder="Enter Country"
                  className={`input--text ${
                    errors?.country?.message ? "input--error" : ""
                  }`}
                  {...register("country", {
                    value: newQuoteById?.destinationAddressForm?.country,
                    required: FIELD_REQUIRED_MESSAGE,
                  })}
                />
                <Typography className="error-text">
                  {errors?.country?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.country?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.destinationAddressForm?.country || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-footer-container">
            <CButton
              id="save-destination-address-button"
              disabled={!isEditingDetails || isUpdating}
              type="submit"
            >
              {isUpdating ? (
                <CircularLoader color="#ffffff" size={16} />
              ) : (
                "Save"
              )}
            </CButton>
          </MuiBox>
        </MuiBox>
      </AccordionDetails>
    </DestinationAddressStyled>
  );
}

const DestinationAddressStyled = styled(Accordion, {
  shouldForwardProp(propName) {
    return propName !== "isEditingDetails";
  },
})<{
  isEditingDetails?: boolean;
}>(({ theme, isEditingDetails }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "8px 4px",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },

  ".MuiAccordionSummary-root": {
    cursor: "default !important",
  },

  ".heading": {
    fontSize: "1rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
  },

  "#edit-destination-address-icon": {
    cursor: "pointer",
    fontSize: "0.875rem",
    color: theme.palette.custom.accentBlack,
  },

  ".form-container": {
    display: "grid",

    columnGap: "1.5rem",
    rowGap: isEditingDetails ? "0.25rem" : "1.25rem",

    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "1fr 1fr",
    },

    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flexWrap: "wrap",
    },
  },

  ".form-control": {
    display: "flex",
    flexDirection: "column",

    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flex: 1,
    },
  },

  ".address-input": {
    [theme.breakpoints.up("sm")]: {
      gridColumn: "1 / 3",
    },
    [theme.breakpoints.down("sm")]: {
      display: "flex",
      flex: 1,
    },
  },

  ".field-value": {
    fontSize: "0.875rem",
    fontWeight: 500,
  },

  ".form-label": {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.custom.subHeadlines,
    marginBottom: "0.5rem",
  },
  ".form-label--required": {
    position: "relative",

    "&::after": {
      content: "'*'",
      position: "absolute",
      top: "-0.25rem",
      right: "-0.425rem",
      color: theme.palette.custom.error,
      fontSize: "1rem",
    },
  },

  ".input--text": {
    fontSize: "0.875rem",
  },

  ".input--error": {
    borderColor: theme.palette.custom.error,
  },

  ".error-text": {
    color: theme.palette.custom.error,
    fontSize: "0.625rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: "0.25rem",
    minHeight: "1.375rem",
  },

  ".info-error-icon": {
    fontSize: "0.625rem",
  },

  ".form-footer-container": {
    gridColumn: "1 / 3",
  },

  "#save-destination-address-button": {
    fontSize: "0.875rem",
    paddingInline: "1.3125rem",
    paddingBlock: "0.4375rem",
    marginTop: "1.25rem",
  },
}));
