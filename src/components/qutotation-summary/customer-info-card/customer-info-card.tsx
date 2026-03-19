import { AxiosError } from "axios";
import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";

import EditOutlined from "@mui/icons-material/EditOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  FormControlLabel,
  Typography,
  styled,
} from "@mui/material";

import {
  PHONE_NUMBER_MINIMUM_LENGTH_LIMIT,
  Regexs,
} from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";

import { formatPhoneNumber } from "~/utils/misc";

import useGoogleAddress, {
  StyledTextfield,
} from "~/global/custom-hooks/useGoogleAddress";
import { CustomerSchema } from "~/global/types/types";

import { useAppDispatch, useAppSelector } from "~/store";
import {
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
} from "~/store/endpoints/customers/customers";
import { useUpdateQuoteMutation } from "~/store/endpoints/quotes/quotes";
import { addCustomer } from "~/store/slices/customers/slice";
import {
  quotationSummarySelector,
  setIsCustomerInfoFormSaved,
  setIsSameAsDestinationAddressSelected,
} from "~/store/slices/quotation-summary/slice";
import {
  NEW_QUOTE_DEFAULT_VALUES,
  quotesSelector,
  setCustomerDetailsInQuote,
  setCustomerFormDetailsInQuote,
  setQuoteById,
} from "~/store/slices/quotes/slice";
import { NewQuoteShape } from "~/store/slices/quotes/types";

import { useAuthContextValue } from "~/context/auth-context";
import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import CustomPhoneInput from "~/components/shared/ui/phone-input.tsx/phone-input";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

type AddressFormType = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
type FormInputs = AddressFormType & {
  customerName: string;
  customerRepresentativeName: string;
  email: string;
  phone: string;
};
const FIELD_REQUIRED_MESSAGE = "This field is required";

export default function CustomerInfoCard({
  customerCardRef,
}: {
  customerCardRef: RefObject<HTMLDivElement>;
}) {
  const storeDispatch = useAppDispatch();

  const { triggerGenericErrorMessage, triggerToast } = useCustomToast();

  const { user } = useAuthContextValue();

  const [searchParams] = useSearchParams();

  const createdQuoteId = searchParams.get("createdQuoteId");
  const quoteId = searchParams.get("quoteId");

  const {
    // quoteId,
    newQuoteById,
    isCustomerFormFilled,
    shouldUpdateQuoteAndBomLinksInQuote,
    setShouldUpdateQuoteAndBomLinksInQuote,
  } = useQuotationSummaryPageContextValue();

  const { isSameAsDestinationAddressSelected, isCustomerInfoFormSaved } =
    useAppSelector(quotationSummarySelector);

  const [createCustomer, createCustomerMutationState] =
    useCreateCustomerMutation();
  const [updateCustomer, updateCustomerMutationState] =
    useUpdateCustomerMutation();
  const [updateNewFormatQuote] = useUpdateQuoteMutation();

  const { newQuotes } = useAppSelector(quotesSelector);

  const addressInputRef = useRef<HTMLInputElement>(null);

  const hasCustomerBeenCreated = Boolean(newQuoteById?.customer?.id);
  const [isEditingDetails, setIsEditingDetails] = useState<boolean>(
    (isCustomerInfoFormSaved || isCustomerFormFilled) && hasCustomerBeenCreated ? false : true,
  );
  const [isCustomerUpdating, setIsCustomerUpdating] = useState<boolean>(false);
  const [originalSameAsDestinationValue, setOriginalSameAsDestinationValue] =
    useState<boolean>(isSameAsDestinationAddressSelected);
  const isCustomerApiLoading =
    createCustomerMutationState.isLoading ||
    updateCustomerMutationState.isLoading ||
    isCustomerUpdating ||
    shouldUpdateQuoteAndBomLinksInQuote;

  // temporarily disabling the above when timestamp id is available from BE we have to integrate that and open this, this basically updates pdf files with new info

  console.log(
    "loaders",
    createCustomerMutationState.isLoading,
    updateCustomerMutationState.isLoading,
    isCustomerUpdating,
    shouldUpdateQuoteAndBomLinksInQuote,
  );

  const { register, handleSubmit, watch, setValue, formState, control } =
    useForm<FormInputs>();

  const values = watch();

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

  useEffect(() => {
    if (addressInputRef.current) {
      initAutocomplete(addressInputRef);
    }
  }, [initAutocomplete]);

  const onEditIconClick = () => {
    setIsEditingDetails(true);
  };

  const requiredFieldsFilled = useMemo(() => {
    const requiredFields = ["phone"]; // currenly only phone number has special instructions

    return requiredFields.every((field) => {
      const value = values[field as keyof typeof values];
      if (field === "phone") {
        const digitMatches = values?.phone?.match(/\d/g);
        if (
          !digitMatches ||
          digitMatches?.length < PHONE_NUMBER_MINIMUM_LENGTH_LIMIT
        ) {
          return false;
        } else {
          return true;
        }
      }
      return (
        typeof value === "string" && value.trim() !== "" && value !== undefined
      );
    });
  }, [values]);

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    (async () => {
      if (!newQuoteById) {
        alert("No Quote Attached with customer");
        return;
      }

      const newData = {
        name: data?.customerName,
        representativeName: data?.customerRepresentativeName,
        email: data?.email,
        phone: data?.phone,
        address: data?.address || "",
        city: data?.city,
        state: data?.state || "",
        zipCode: data?.zipCode,
        country: data?.country || "",
      };
      const previousData = {
        name: newQuoteById?.customerDetailsForm?.name || "",
        representativeName:
          newQuoteById?.customerDetailsForm?.representativeName || "",
        email: newQuoteById?.customerDetailsForm?.email || "",
        phone: newQuoteById?.customerDetailsForm?.phone || "",
        address: newQuoteById?.customerDetailsForm?.address || "",
        city: newQuoteById?.customerDetailsForm?.city || "",
        state: newQuoteById?.customerDetailsForm?.state || "",
        zipCode: newQuoteById?.customerDetailsForm?.zipCode || "",
        country: newQuoteById?.customerDetailsForm?.country || "",
      };

      const isDataEqual =
        JSON.stringify(newData) === JSON.stringify(previousData) &&
        (isSameAsDestinationAddressSelected === false
          ? true
          : isSameAsDestinationAddressSelected ===
            originalSameAsDestinationValue);

      if (isDataEqual) {
        setIsEditingDetails(false);
        setOriginalSameAsDestinationValue(isSameAsDestinationAddressSelected);

        return;
      }

      const updateCustomerForm = () => {
        storeDispatch(
          setCustomerFormDetailsInQuote({
            quoteId: quoteId!,
            data: newData,
          }),
        );
      };

      const updateCustomerInLocalState = (
        customerData: Partial<CustomerSchema>,
      ) => {
        storeDispatch(
          setCustomerDetailsInQuote({
            quoteId: quoteId!,
            data: customerData,
          }),
        );
      };

      const addCustomerInAllCustomers = (dataToAdd: CustomerSchema) => {
        storeDispatch(addCustomer(dataToAdd));
      };

      const addNewOrExistingCustomerToQuoteAfterCreation = async (
        id: number,
      ) => {
        await updateNewFormatQuote({
          customerId: id,
          id: parseInt(createdQuoteId as string) || "",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
          },
        }).unwrap();
      };

      try {
        setIsCustomerUpdating(true);

        const name =
          newQuoteById?.customer?.buyerName || newQuoteById?.customer?.name;

        const isNewCustomer =
          newQuoteById?.customer?.buyerName?.toLowerCase() === "new customer" ||
          [null, "", undefined].includes(name);

        if (isNewCustomer) {
          const createdCustomerRes = await createCustomer({
            data: {
              // userId: String(user?.user?.id),
              name: data?.customerName,
              representativeName: data?.customerRepresentativeName,
              email: data?.email,
              phone: data?.phone,
              addresses: [
                {
                  street: data?.address || "",
                  city: data?.city || "",
                  state: data?.state || "",
                  zipCode: data?.zipCode || "",
                  type: "shipping",
                  country: data?.country || "",
                  address: data?.address || "",
                },
                ...(isSameAsDestinationAddressSelected
                  ? [
                      {
                        street: data?.address || "",
                        city: data?.city || "",
                        state: data?.state || "",
                        zipCode: data?.zipCode || "",
                        type: "billing",
                        country: data?.country || "",
                        address: data?.address || "",
                      },
                    ]
                  : [
                      {
                        street: "",
                        city: "",
                        state: "",
                        zipCode: "",
                        type: "billing",
                        country: "",
                        address: "",
                      },
                    ]),
              ],

              wan: "",
              deposited: "",
              sameAsDestination: isSameAsDestinationAddressSelected,
              // buyerName: data?.customerName,
              // coBuyerName: data?.customerRepresentativeName,
              // address: data?.address,
              // city: data?.city,
              // state: data?.state || "",
              // zipCode: data?.zipCode,
              // country: data?.country,
              // userEmailDomain: user?.user?.email?.split("@")[1] || "",
              // customerCreatorEmail: user?.user?.email || "",
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
            },
          }).unwrap();

          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          await addNewOrExistingCustomerToQuoteAfterCreation(
            createdCustomerRes.data.id as number,
          );

          // const customer__kontentAi__codename =
          //   createdCustomerRes?.data?.customer__kontentAi__codename;

          addCustomerInAllCustomers(createdCustomerRes?.data);

          if (typeof setShouldUpdateQuoteAndBomLinksInQuote === "function") {
            setShouldUpdateQuoteAndBomLinksInQuote(true);
          }

          updateCustomerInLocalState(createdCustomerRes?.data);
          updateCustomerForm();

          setOriginalSameAsDestinationValue(isSameAsDestinationAddressSelected);
          setIsCustomerUpdating(false);
          setIsEditingDetails(false);
        } else {
          const payloadForUpdateCustomer: Partial<FormInputs> = {};
          Object.entries(data).forEach(([key, value]) => {
            if (value) {
              Object.assign(payloadForUpdateCustomer, {
                [key]: value,
              });
            }
          });

          console.log(
            "%cpayloadForUpdateCustomer:",
            "background-color:yellow;",
            {
              payloadForUpdateCustomer,
            },
          );
          const { customerName, customerRepresentativeName, ...rest } =
            payloadForUpdateCustomer;

          const {
            phone: customerPhone,
            email: customerEmail,
            ...remaining
          } = rest;

          const finalPayload = {
            name: customerName,
            representativeName: customerRepresentativeName,
            email: customerEmail,
            phone: customerPhone,
            wan: "",
            deposited: "",
            sameAsDestination: isSameAsDestinationAddressSelected,
            addresses: [
              { ...remaining, type: "shipping", street: "" },

              ...(isSameAsDestinationAddressSelected
                ? [
                    {
                      ...remaining,
                      type: "billing",
                      street: "",
                    },
                  ]
                : [
                    {
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      type: "billing",
                      country: "",
                      address: "",
                    },
                  ]),
            ],
          };

          const compatiblePayload = {
            ...rest,
            buyerName: customerName,
            coBuyerName: customerRepresentativeName,
          };

          await updateCustomer({
            id: newQuoteById?.customer?.id,
            data: finalPayload,
            headers: {
              Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
            },
          }).unwrap();

          await addNewOrExistingCustomerToQuoteAfterCreation(
            newQuoteById?.customer?.id as number,
          );
          triggerToast({
            variant: "success",
            message: "Customer information saved successfully!",
          });

          setIsCustomerUpdating(false);
          setIsEditingDetails(false);
          setOriginalSameAsDestinationValue(isSameAsDestinationAddressSelected);

          updateCustomerInLocalState(compatiblePayload);
          updateCustomerForm();
        }

        if (!isCustomerInfoFormSaved) {
          storeDispatch(setIsCustomerInfoFormSaved(true));
        }
      } catch (error) {
        const errorMessage = //@ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (error as AxiosError)?.response?.data?.message?.[0] as string;
        if (errorMessage) {
          triggerToast({
            variant: "error",
            message: errorMessage,
          });
        } else {
          triggerGenericErrorMessage();
        }

        setIsCustomerUpdating(false);

        console.log(
          "%ccreateOrUpdateCustomer error:",
          "background-color:red;color:white;",
          { error, errorMessage },
        );
      }
    })();
  };

  return (
    <CustomerInfoCardStyled
      disableGutters
      expanded={true}
      isEditingDetails={isEditingDetails}
      ref={customerCardRef}
    >
      <AccordionSummary>
        <Typography className="heading">
          Customer Information&nbsp;&nbsp;
          {!isEditingDetails && (
            <EditOutlined id="edit-customer-icon" onClick={onEditIconClick} />
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
          <MuiBox className="form-control">
            <label
              htmlFor="input-customerName"
              className="form-label form-label--required"
            >
              Customer Name
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-customerName"
                  placeholder="Enter Customer Name"
                  className={`input--text ${
                    errors?.customerName?.message ? "input--error" : ""
                  }`}
                  {...register("customerName", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.name,
                    pattern: {
                      value: Regexs.ALPHABET_WITH_SPACES_ONLY,
                      message: "Only alphabet and spaces are allowed",
                    },
                  })}
                />
                <Typography className="error-text">
                  {errors?.customerName?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.customerName?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.customerDetailsForm?.name || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-customerRepresentativeName"
              className="form-label form-label--required"
            >
              Customer Representative
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-customerRepresentativeName"
                  placeholder="Enter Full Name"
                  className={`input--text ${
                    errors?.customerRepresentativeName?.message
                      ? "input--error"
                      : ""
                  }`}
                  {...register("customerRepresentativeName", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value:
                      newQuoteById?.customerDetailsForm?.representativeName,
                    pattern: {
                      value: Regexs.ALPHABET_WITH_SPACES_ONLY,
                      message: "Only alphabet and spaces are allowed",
                    },
                  })}
                />
                <Typography className="error-text">
                  {errors?.customerRepresentativeName?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.customerRepresentativeName?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.customerDetailsForm?.representativeName || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-email"
              className="form-label form-label--required"
            >
              Email address
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-email"
                  placeholder="Enter Email Address"
                  className={`input--text ${
                    errors?.email?.message ? "input--error" : ""
                  }`}
                  {...register("email", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.email,
                    pattern: {
                      value:
                        /^(?!.*\.{2})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
                <Typography className="error-text">
                  {errors?.email?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.email?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.customerDetailsForm?.email || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-phone"
              className="form-label form-label--required"
            >
              Phone Number
            </label>
            {isEditingDetails ? (
              <>
                {/* <input
                  id="input-phone"
                  placeholder="Enter Phone Number"
                  className={`input--text ${
                    errors?.phone?.message ? "input--error" : ""
                  }`}
                  {...register("phone", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.phone,
                  })}
                /> */}
                <Controller
                  control={control}
                  name="phone"
                  rules={{
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.phone,
                    pattern: {
                      value: Regexs.PHONE_NUMBER,
                      message: "Please enter in correct format",
                    },
                  }}
                  defaultValue={newQuoteById?.customerDetailsForm?.phone}
                  render={({
                    field: { onChange, ref, value, name, onBlur },
                  }) => (
                    <CustomPhoneInput
                      onChange={(e, countryData) =>
                        onChange(formatPhoneNumber(e, countryData.format))
                      }
                      value={value}
                      onBlur={onBlur}
                      ref={ref}
                      id="input-phone-number"
                      placeholder="Enter your phone number"
                      name={name}
                      isError={Boolean(errors?.phone?.message)}
                    />
                  )}
                />

                <Typography className="error-text">
                  {errors?.phone?.message && (
                    <>
                      <InfoOutlined className="info-error-icon" />
                      {errors?.phone?.message}
                    </>
                  )}
                </Typography>
              </>
            ) : (
              <Typography className="field-value">
                {newQuoteById?.customerDetailsForm?.phone || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control address-input">
            <label
              htmlFor="input-address"
              className="form-label form-label--required"
            >
              Address
            </label>
            {isEditingDetails ? (
              <>
                {/* <input
                  id="input-address"
                  placeholder="Enter Address"
                  className={`input--text ${
                    errors?.address?.message ? "input--error" : ""
                  }`}
                  {...register("address", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.address,
                  })}
                /> */}
                <Controller
                  name="address"
                  control={control}
                  defaultValue={
                    newQuoteById?.customerDetailsForm?.address || ""
                  }
                  rules={{
                    required: FIELD_REQUIRED_MESSAGE,
                  }}
                  render={({ field }) => (
                    <StyledTextfield
                      id="input-customer-address"
                      placeholder="Enter customer address"
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
                {newQuoteById?.customerDetailsForm?.address || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-city"
              className="form-label form-label--required"
            >
              City
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-city"
                  placeholder="Enter City"
                  className={`input--text ${
                    errors?.city?.message ? "input--error" : ""
                  }`}
                  {...register("city", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.city,
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
                {newQuoteById?.customerDetailsForm?.city || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-state"
              className="form-label form-label--required"
            >
              State
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-state"
                  placeholder="Enter State"
                  className={`input--text ${
                    errors?.state?.message ? "input--error" : ""
                  }`}
                  {...register("state", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.state,
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
                {newQuoteById?.customerDetailsForm?.state || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-zipCode"
              className="form-label form-label--required"
            >
              Zip/Postal Code
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-zipCode"
                  placeholder="Enter Zip/Postal Code"
                  className={`input--text ${
                    errors?.zipCode?.message ? "input--error" : ""
                  }`}
                  {...register("zipCode", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: String(
                      newQuoteById?.customerDetailsForm?.zipCode || "",
                    ),
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
                {newQuoteById?.customerDetailsForm?.zipCode || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-control">
            <label
              htmlFor="input-country"
              className="form-label form-label--required"
            >
              Country
            </label>
            {isEditingDetails ? (
              <>
                <input
                  id="input-country"
                  placeholder="Enter Country"
                  className={`input--text ${
                    errors?.country?.message ? "input--error" : ""
                  }`}
                  {...register("country", {
                    required: FIELD_REQUIRED_MESSAGE,
                    value: newQuoteById?.customerDetailsForm?.country,
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
                {newQuoteById?.customerDetailsForm?.country || "-"}
              </Typography>
            )}
          </MuiBox>

          <MuiBox className="form-footer-container">
            <CButton
              id="save-customer-info-button"
              disabled={
                !isEditingDetails ||
                isCustomerApiLoading ||
                !requiredFieldsFilled
              }
              type="submit"
            >
              {isCustomerApiLoading ? (
                <CircularLoader color="#ffffff" size={16} />
              ) : (
                "Save"
              )}
            </CButton>

            <br />
            <FormControlLabel
              id="input-same-as-destination-checkbox"
              label="Same as destination address"
              control={
                <Checkbox
                  checked={isSameAsDestinationAddressSelected}
                  onChange={(e) => {
                    const newValue = e?.target?.checked;
                    storeDispatch(
                      setIsSameAsDestinationAddressSelected(newValue),
                    );

                    console.log({ newValue });
                    if (newValue === false) {
                      if (newQuoteById) {
                        storeDispatch(
                          setQuoteById({
                            quoteId: quoteId!,
                            data: {
                              ...newQuoteById,
                              destinationAddressForm:
                                NEW_QUOTE_DEFAULT_VALUES.destinationAddressForm,
                            },
                          }),
                        );
                      }

                      setTimeout(() => {
                        const destinationAddressAccordion =
                          document.getElementById(
                            "destination-address-accordion",
                          );
                        destinationAddressAccordion?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }, 0);
                    }
                  }}
                />
              }
              disabled={!isEditingDetails || isCustomerApiLoading}
            />
          </MuiBox>
        </MuiBox>
      </AccordionDetails>
    </CustomerInfoCardStyled>
  );
}

const CustomerInfoCardStyled = styled(Accordion, {
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

  "#edit-customer-icon": {
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

  "#save-customer-info-button": {
    fontSize: "0.875rem",
    paddingInline: "1.3125rem",
    paddingBlock: "0.4375rem",
    marginTop: "1.25rem",
  },

  "#input-same-as-destination-checkbox": {
    marginTop: "1.25rem",

    ".MuiFormControlLabel-label": {
      fontSize: "0.875rem",
    },
  },
}));
