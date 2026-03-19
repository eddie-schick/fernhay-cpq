import { useEffect, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import EditOutlined from "@mui/icons-material/EditOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
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
import { useUpdateQuoteMutation } from "~/store/endpoints/quotes/quotes";
import { setQuoteById } from "~/store/slices/quotes/slice";

import { useQuotationSummaryPageContextValue } from "~/context/quotation-summary-page-provider";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

type FormInputs = {
  providerName?: string;
  shipThruCode?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};
const FIELD_REQUIRED_MESSAGE = "This field is required";

export default function ShipThruDetailsCard() {
  const storeDispatch = useAppDispatch();

  const [searchParams] = useSearchParams();

  const createdQuoteId = searchParams.get("createdQuoteId");

  const { triggerGenericErrorMessage, triggerToast } = useCustomToast();

  const {
    quoteId,
    newQuoteById,
    isUpfitShipThruFormFilled,
    isAccessoriesShipThruFormFilled,
    isChargerShipThruFormFilled,
  } = useQuotationSummaryPageContextValue();

  const [updateQuote] = useUpdateQuoteMutation();

  const [isEditingUpfitFormDetails, setIsEditingUpfitFormDetails] =
    useState<boolean>(!isUpfitShipThruFormFilled ? true : false);
  const [isEditingAccessoriesFormDetails, setIsEditingAccessoriesFormDetails] =
    useState<boolean>(!isAccessoriesShipThruFormFilled ? true : false);
  const [isEditingChargerFormDetails, setIsEditingChargerFormDetails] =
    useState<boolean>(!isChargerShipThruFormFilled ? true : false);
  const [loadingStates, setLoadingStates] = useState<{
    upfit: boolean;
    accessories: boolean;
    charger: boolean;
  }>({
    upfit: false,
    accessories: false,
    charger: false,
  });
  const [keysForFormComp, setKeysForFormComp] = useState<{
    upfit: string;
    accessories: string;
    charger: string;
  }>({
    upfit: uuidv4(),
    accessories: uuidv4(),
    charger: uuidv4(),
  });
  const [isAccordionExpanded, setIsAccordionExpanded] = useState<{
    upfit: boolean;
    accessories: boolean;
    charger: boolean;
  }>({
    upfit: false,
    accessories: false,
    charger: false,
  });

  const onEditUpfitFormIconClick = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    e?.stopPropagation();

    setIsEditingUpfitFormDetails(true);

    if (!isAccordionExpanded?.upfit) {
      setIsAccordionExpanded((prev) => ({
        ...prev,
        upfit: true,
      }));
    }
  };
  const onEditAccessoriesFormIconClick = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    e?.stopPropagation();

    setIsEditingAccessoriesFormDetails(true);

    if (!isAccordionExpanded?.accessories) {
      setIsAccordionExpanded((prev) => ({
        ...prev,
        accessories: true,
      }));
    }
  };
  const onEditChargerFormIconClick = (
    e: React.MouseEvent<SVGSVGElement, MouseEvent>,
  ) => {
    e?.stopPropagation();

    setIsEditingChargerFormDetails(true);

    if (!isAccordionExpanded?.charger) {
      setIsAccordionExpanded((prev) => ({
        ...prev,
        charger: true,
      }));
    }
  };

  const performQuoteUpdate = async (
    data:
      | { upfitShipThroughAddress: FormInputs }
      | { accessoriesShipThroughAddress: FormInputs }
      | { chargerShipThroughAddress: FormInputs },
  ) => {
    // Multiple quotes can have same `formattedId`, which happens in case of quote having quantity greater than 1
    // So, update all quotes having same `formattedId`

    await updateQuote({
      id: createdQuoteId || "",
      data,
      headers: {
        Authorization: `Bearer ${localStorage.getItem(LocalStorageKeys.TOKEN)}`,
      },
    }).unwrap();
  };

  const onUpfitFormSubmit: SubmitHandler<FormInputs> = (data) => {
    (async () => {
      if (!newQuoteById) return;

      const updateDataInLocalForm = () => {
        storeDispatch(
          setQuoteById({
            quoteId: quoteId!,
            data: {
              ...newQuoteById,
              shipThruDetailsForm: {
                ...newQuoteById?.shipThruDetailsForm,
                upfit: {
                  ...newQuoteById?.shipThruDetailsForm?.upfit,
                  address: data?.address,
                  city: data?.city,
                  state: data?.state || "",
                  zipCode: data?.zipCode,
                  country: data?.country,
                  providerName: data?.providerName,
                  shipThruCode: data?.shipThruCode,
                },
              },
            },
          }),
        );
      };

      try {
        setLoadingStates((prev) => ({
          ...prev,
          upfit: true,
        }));

        await performQuoteUpdate({
          upfitShipThroughAddress: {
            ...data,
          },
        });

        triggerToast({
          variant: "success",
          message: "Ship-Thru upfit details saved successfully!",
        });

        updateDataInLocalForm();

        setIsEditingUpfitFormDetails(false);
      } catch (error) {
        triggerGenericErrorMessage();

        console.log(
          "%csave ship-thru upfit address error:",
          "background-color:red;color:white;",
          { error },
        );
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          upfit: false,
        }));
      }
    })();
  };

  const onAccessoriesFormSubmit: SubmitHandler<FormInputs> = (data) => {
    (async () => {
      if (!newQuoteById) return;

      const updateDataInLocalForm = () => {
        storeDispatch(
          setQuoteById({
            quoteId: quoteId!,
            data: {
              ...newQuoteById,
              shipThruDetailsForm: {
                ...newQuoteById?.shipThruDetailsForm,
                accessories: {
                  ...newQuoteById?.shipThruDetailsForm?.accessories,
                  address: data?.address,
                  city: data?.city,
                  state: data?.state || "",
                  zipCode: data?.zipCode,
                  country: data?.country,
                  providerName: data?.providerName,
                  shipThruCode: data?.shipThruCode,
                },
              },
            },
          }),
        );
      };

      try {
        setLoadingStates((prev) => ({
          ...prev,
          accessories: true,
        }));

        await performQuoteUpdate({
          accessoriesShipThroughAddress: {
            ...data,
          },
        });

        triggerToast({
          variant: "success",
          message: "Ship-Thru accessories details saved successfully!",
        });

        updateDataInLocalForm();

        setIsEditingAccessoriesFormDetails(false);
      } catch (error) {
        triggerGenericErrorMessage();

        console.log(
          "%csave ship-thru accessories address error:",
          "background-color:red;color:white;",
          { error },
        );
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          accessories: false,
        }));
      }
    })();
  };

  const onChargerFormSubmit: SubmitHandler<FormInputs> = (data) => {
    (async () => {
      if (!newQuoteById) return;

      const updateDataInLocalForm = () => {
        storeDispatch(
          setQuoteById({
            quoteId: quoteId!,
            data: {
              ...newQuoteById,
              shipThruDetailsForm: {
                ...newQuoteById?.shipThruDetailsForm,
                charger: {
                  ...newQuoteById?.shipThruDetailsForm?.charger,
                  address: data?.address,
                  city: data?.city,
                  state: data?.state || "",
                  zipCode: data?.zipCode,
                  country: data?.country,
                  providerName: data?.providerName,
                  shipThruCode: data?.shipThruCode,
                },
              },
            },
          }),
        );
      };

      try {
        setLoadingStates((prev) => ({
          ...prev,
          charger: true,
        }));

        await performQuoteUpdate({
          chargerShipThroughAddress: {
            ...data,
          },
        });

        triggerToast({
          variant: "success",
          message: "Ship-Thru charger details saved successfully!",
        });

        updateDataInLocalForm();

        setIsEditingChargerFormDetails(false);
      } catch (error) {
        triggerGenericErrorMessage();

        console.log(
          "%csave ship-thru charger address error:",
          "background-color:red;color:white;",
          { error },
        );
      } finally {
        setLoadingStates((prev) => ({
          ...prev,
          charger: false,
        }));
      }
    })();
  };

  const [isShipThruAccordionOpen, setIsShipThruAccordionOpen] =
    useState<boolean>(true);

  return (
    <ShipThruDetailsCardStyled
      disableGutters
      expanded={isShipThruAccordionOpen}
      onChange={(event, isExpanded) => setIsShipThruAccordionOpen(isExpanded)}
    >
      <AccordionSummary
        id="ship-thru-accordion-header"
        expandIcon={<ExpandMore />}
      >
        <Typography className="heading">{"Ship-Thru (Optional)"}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Accordion
          expanded={isAccordionExpanded?.upfit}
          disableGutters
          className="nested-accordion"
        >
          <AccordionSummary
            id="ship-thru-upfit-accordion-header"
            expandIcon={
              <ExpandMore
                onClick={(e) => {
                  e?.stopPropagation(); // Clicking on arrow-down icon doesn't work without this

                  setIsAccordionExpanded((prev) => ({
                    ...prev,
                    upfit: !prev?.upfit,
                  }));
                }}
              />
            }
            onClick={() => {
              setIsAccordionExpanded((prev) => ({
                ...prev,
                upfit: !prev?.upfit,
              }));
            }}
          >
            <Typography className="nested-accordion-heading">
              Upfit&nbsp;&nbsp;
              {!isEditingUpfitFormDetails && (
                <EditOutlined
                  id="edit-upfit-form-icon"
                  className="edit-form-icon"
                  onClick={onEditUpfitFormIconClick}
                />
              )}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <ShipThruEntityForm
              key={keysForFormComp?.upfit}
              entityName="upfit"
              formFields={{
                providerName:
                  newQuoteById?.shipThruDetailsForm?.upfit?.providerName || "",
                shipThruCode:
                  newQuoteById?.shipThruDetailsForm?.upfit?.shipThruCode,
                address:
                  newQuoteById?.shipThruDetailsForm?.upfit?.address || "",
                city: newQuoteById?.shipThruDetailsForm?.upfit?.city || "",
                state: newQuoteById?.shipThruDetailsForm?.upfit?.state || "",
                zipCode:
                  newQuoteById?.shipThruDetailsForm?.upfit?.zipCode || "",
                country:
                  newQuoteById?.shipThruDetailsForm?.upfit?.country || "",
              }}
              onSubmit={onUpfitFormSubmit}
              isEditingDetails={isEditingUpfitFormDetails}
              cancelEditing={() => {
                setIsEditingUpfitFormDetails(false);
                setKeysForFormComp((prev) => ({
                  ...prev,
                  upfit: uuidv4(),
                }));
              }}
              isSaving={loadingStates?.upfit}
            />
          </AccordionDetails>
        </Accordion>

        <br />

        <Accordion
          expanded={isAccordionExpanded?.accessories}
          disableGutters
          className="nested-accordion"
        >
          <AccordionSummary
            id="ship-thru-accessories-accordion-header"
            expandIcon={
              <ExpandMore
                onClick={(e) => {
                  e?.stopPropagation(); // Clicking on arrow-down icon doesn't work without this

                  setIsAccordionExpanded((prev) => ({
                    ...prev,
                    accessories: !prev?.accessories,
                  }));
                }}
              />
            }
            onClick={() => {
              setIsAccordionExpanded((prev) => ({
                ...prev,
                accessories: !prev?.accessories,
              }));
            }}
          >
            <Typography className="nested-accordion-heading">
              Accessories&nbsp;&nbsp;
              {!isEditingAccessoriesFormDetails && (
                <EditOutlined
                  id="edit-accessories-form-icon"
                  className="edit-form-icon"
                  onClick={onEditAccessoriesFormIconClick}
                />
              )}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <ShipThruEntityForm
              key={keysForFormComp?.accessories}
              entityName="accessories"
              formFields={{
                providerName:
                  newQuoteById?.shipThruDetailsForm?.accessories
                    ?.providerName || "",
                shipThruCode:
                  newQuoteById?.shipThruDetailsForm?.accessories?.shipThruCode,
                address:
                  newQuoteById?.shipThruDetailsForm?.accessories?.address || "",
                city:
                  newQuoteById?.shipThruDetailsForm?.accessories?.city || "",
                state:
                  newQuoteById?.shipThruDetailsForm?.accessories?.state || "",
                zipCode:
                  newQuoteById?.shipThruDetailsForm?.accessories?.zipCode || "",
                country:
                  newQuoteById?.shipThruDetailsForm?.accessories?.country || "",
              }}
              onSubmit={onAccessoriesFormSubmit}
              isEditingDetails={isEditingAccessoriesFormDetails}
              cancelEditing={() => {
                setIsEditingAccessoriesFormDetails(false);
                setKeysForFormComp((prev) => ({
                  ...prev,
                  accessories: uuidv4(),
                }));
              }}
              isSaving={loadingStates?.accessories}
            />
          </AccordionDetails>
        </Accordion>
        <br />

        <Accordion
          expanded={isAccordionExpanded?.charger}
          disableGutters
          className="nested-accordion"
        >
          <AccordionSummary
            id="ship-thru-charger-accordion-header"
            expandIcon={
              <ExpandMore
                onClick={(e) => {
                  e?.stopPropagation(); // Clicking on arrow-down icon doesn't work without this

                  setIsAccordionExpanded((prev) => ({
                    ...prev,
                    charger: !prev?.charger,
                  }));
                }}
              />
            }
            onClick={() => {
              setIsAccordionExpanded((prev) => ({
                ...prev,
                charger: !prev?.charger,
              }));
            }}
          >
            <Typography className="nested-accordion-heading">
              Charger&nbsp;&nbsp;
              {!isEditingChargerFormDetails && (
                <EditOutlined
                  id="edit-charger-form-icon"
                  className="edit-form-icon"
                  onClick={onEditChargerFormIconClick}
                />
              )}
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
            <ShipThruEntityForm
              key={keysForFormComp?.charger}
              entityName="charger"
              formFields={{
                providerName:
                  newQuoteById?.shipThruDetailsForm?.charger?.providerName ||
                  "",
                shipThruCode:
                  newQuoteById?.shipThruDetailsForm?.charger?.shipThruCode,
                address:
                  newQuoteById?.shipThruDetailsForm?.charger?.address || "",
                city: newQuoteById?.shipThruDetailsForm?.charger?.city || "",
                state: newQuoteById?.shipThruDetailsForm?.charger?.state || "",
                zipCode:
                  newQuoteById?.shipThruDetailsForm?.charger?.zipCode || "",
                country:
                  newQuoteById?.shipThruDetailsForm?.charger?.country || "",
              }}
              onSubmit={onChargerFormSubmit}
              isEditingDetails={isEditingChargerFormDetails}
              cancelEditing={() => {
                setIsEditingChargerFormDetails(false);
                setKeysForFormComp((prev) => ({
                  ...prev,
                  charger: uuidv4(),
                }));
              }}
              isSaving={loadingStates?.charger}
            />
          </AccordionDetails>
        </Accordion>
      </AccordionDetails>
    </ShipThruDetailsCardStyled>
  );
}

type ShipThruEntityFormProps = {
  entityName: "upfit" | "accessories" | "charger";
  formFields: FormInputs;
  onSubmit: SubmitHandler<FormInputs>;
  isEditingDetails?: boolean;
  cancelEditing?: () => void;
  isSaving?: boolean;
};
function ShipThruEntityForm(props: ShipThruEntityFormProps) {
  const {
    entityName,
    formFields,
    onSubmit,
    cancelEditing,
    isEditingDetails,
    isSaving,
  } = props;

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

  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addressInputRef.current) {
      initAutocomplete(addressInputRef);
    }
  }, [initAutocomplete]);

  const onCancelClick = () => {
    if (typeof cancelEditing === "function") {
      cancelEditing();
    }
  };

  return (
    <MuiBox
      className="form-container"
      component="form"
      onSubmit={(e) => {
        e.preventDefault();

        void handleSubmit(onSubmit)();
      }}
      sx={{
        rowGap: isEditingDetails ? "0.25rem" : "1.25rem",
      }}
    >
      <MuiBox className="form-control">
        <label
          htmlFor={`input-provider-name--${entityName}-form`}
          className="form-label form-label--required"
        >
          Provider Name
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-provider-name--${entityName}-form`}
              placeholder="Enter Name"
              className={`input--text ${
                errors?.providerName?.message ? "input--error" : ""
              }`}
              {...register("providerName", {
                value: formFields?.providerName,
                required: FIELD_REQUIRED_MESSAGE,
              })}
            />
            <Typography className="error-text">
              {errors?.providerName?.message && (
                <>
                  <InfoOutlined className="info-error-icon" />
                  {errors?.providerName?.message}
                </>
              )}
            </Typography>
          </>
        ) : (
          <Typography className="field-value">
            {formFields?.providerName || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control">
        <label
          htmlFor={`input-ship-thru-code--${entityName}-form`}
          className="form-label form-label--required"
        >
          Ship-Thru Code
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-ship-thru-code--${entityName}-form`}
              placeholder="Enter Code"
              className={`input--text ${
                errors?.shipThruCode?.message ? "input--error" : ""
              }`}
              {...register("shipThruCode", {
                value: formFields?.shipThruCode,
                required: FIELD_REQUIRED_MESSAGE,
              })}
            />
            <Typography className="error-text">
              {errors?.shipThruCode?.message && (
                <>
                  <InfoOutlined className="info-error-icon" />
                  {errors?.shipThruCode?.message}
                </>
              )}
            </Typography>
          </>
        ) : (
          <Typography className="field-value">
            {formFields?.shipThruCode || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control address-input">
        <label
          htmlFor={`input-address--${entityName}-form`}
          className="form-label form-label--required"
        >
          Address
        </label>
        {isEditingDetails ? (
          <>
            {/* <input
              id={`input-address--${entityName}-form`}
              placeholder="Enter Address"
              className={`input--text ${
                errors?.address?.message ? "input--error" : ""
              }`}
              {...register("address", {
                value: formFields?.address,
                required: FIELD_REQUIRED_MESSAGE,
              })}
            /> */}
            <Controller
              name="address"
              control={control}
              defaultValue={formFields?.address || ""}
              rules={{
                required: FIELD_REQUIRED_MESSAGE,
              }}
              render={({ field }) => (
                <StyledTextfield
                  id={`input-${entityName}-address`}
                  placeholder="Enter address"
                  inputRef={addressInputRef}
                  className={`${
                    errors?.address?.message ? "input--error" : ""
                  }`}
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
            {formFields?.address || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control">
        <label
          htmlFor={`input-city--${entityName}-form`}
          className="form-label form-label--required"
        >
          City
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-city--${entityName}-form`}
              placeholder="Enter City"
              className={`input--text ${
                errors?.city?.message ? "input--error" : ""
              }`}
              {...register("city", {
                value: formFields?.city,
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
            {formFields?.city || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control">
        <label
          htmlFor={`input-state--${entityName}-form`}
          className="form-label form-label--required"
        >
          State
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-state--${entityName}-form`}
              placeholder="Enter State"
              className={`input--text ${
                errors?.state?.message ? "input--error" : ""
              }`}
              {...register("state", {
                value: formFields?.state,
                required: FIELD_REQUIRED_MESSAGE,
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
            {formFields?.state || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control">
        <label
          htmlFor={`input-zipCode--${entityName}-form`}
          className="form-label form-label--required"
        >
          Zip/Postal Code
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-zipCode--${entityName}-form`}
              placeholder="Enter Zip/Postal Code"
              className={`input--text ${
                errors?.zipCode?.message ? "input--error" : ""
              }`}
              {...register("zipCode", {
                value: String(formFields?.zipCode),
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
            {formFields?.zipCode || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="form-control">
        <label
          htmlFor={`input-country--${entityName}-form`}
          className="form-label form-label--required"
        >
          Country
        </label>
        {isEditingDetails ? (
          <>
            <input
              id={`input-country--${entityName}-form`}
              placeholder="Enter Country"
              className={`input--text ${
                errors?.country?.message ? "input--error" : ""
              }`}
              {...register("country", {
                value: formFields?.country,
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
            {formFields?.country || "-"}
          </Typography>
        )}
      </MuiBox>

      <MuiBox className="save-button-container">
        {isEditingDetails && (
          <CButton
            id={`cancel-button--${entityName}--form`}
            variant="outlined"
            onClick={onCancelClick}
          >
            Cancel
          </CButton>
        )}
        <CButton
          id={`save-button--${entityName}--form`}
          disabled={!isEditingDetails || isSaving}
          type="submit"
        >
          {isSaving ? <CircularLoader color="#ffffff" size={16} /> : "Save"}
        </CButton>
      </MuiBox>
    </MuiBox>
  );
}

const ShipThruDetailsCardStyled = styled(Accordion)<{
  isEditingDetails?: boolean;
}>(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  padding: "8px 4px",
  boxShadow: "none",
  "&::before": {
    display: "none",
  },

  // ".MuiAccordionSummary-root": {
  //   cursor: "default !important",
  // },

  ".heading": {
    fontSize: "1rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
  },

  ".edit-form-icon": {
    cursor: "pointer",
    fontSize: "1rem",
    color: theme.palette.custom.accentBlack,
  },

  ".nested-accordion": {
    borderRadius: "0.625rem",
    border: `1px solid ${theme.palette.custom.tertiary}`,
    padding: "8px 4px",
    boxShadow: "none",
    "&::before": {
      display: "none",
    },

    ".MuiAccordionSummary-root": {
      cursor: "pointer !important",
    },
  },

  ".nested-accordion-heading": {
    fontSize: "0.875rem",
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },

  ".form-container": {
    display: "grid",
    columnGap: "1.5rem",
    rowGap: "1.25rem",

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

  ".save-button-container": {
    gridColumn: "1 / 3",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",

    button: {
      fontSize: "0.875rem",
      paddingInline: "1.3125rem",
      paddingBlock: "0.4375rem",
      marginTop: "1.25rem",
    },
  },
}));
