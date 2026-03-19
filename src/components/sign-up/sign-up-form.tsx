import axios from "axios";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SubmitHandler, Controller, useFormContext } from "react-hook-form";
import { useNavigate } from "react-router";

import {
  Autocomplete,
  Box,
  Grid,
  TextField,
  Typography,
  styled,
} from "@mui/material";

import {
  PHONE_NUMBER_MINIMUM_LENGTH_LIMIT,
  Regexs,
} from "~/constants/constants";
import LocalStorageKeys from "~/constants/local-storage-keys";
import RoutePaths from "~/constants/route-paths";

import {
  fileNameFormatter,
  formatPhoneNumber,
  toSentenceCase,
} from "~/utils/misc";

import useGoogleAddress from "~/global/custom-hooks/useGoogleAddress/useGoogleAddress";

import { submitDatadogCountMetric } from "~/helpers/datadog-helpers";

import { useAppSelector } from "~/store";
import {
  useGetSignedUrlMutation,
  useUpdateUserMutation,
} from "~/store/endpoints/auth/auth";
import { useGetDealerShipNamesQuery } from "~/store/endpoints/dealership/dealership";
import { rootSelector } from "~/store/slices/root/slice";

import {
  AuthContextFactory,
  UserSchema,
} from "~/context/auth-context/auth-context";

import { SignUpFormInputs } from "~/pages/sign-up/sign-up";

import CButton from "~/components/common/cbutton/cbutton";
import MuiBox from "~/components/shared/mui-box/mui-box";

import CircularLoader from "../shared/circular-loader/circular-loader";
import FileDetails from "../shared/ui/file-dropzone/file-details";
import FileDropzone from "../shared/ui/file-dropzone/file-dropzone";
import CustomPhoneInput from "../shared/ui/phone-input.tsx/phone-input";
import useCustomToast from "../shared/use-custom-toast/use-custom-toast";

import { axiosAuthInstance, axiosSignedUrlInstance } from "~/lib/axios";

interface RegistrationResponse {
  token: string;
  user: UserSchema;
}
interface ApiResponse {
  response: {
    data: {
      message: string;
    };
  };
}

export default function SignUpForm() {
  const rootSlice = useAppSelector(rootSelector);

  const {
    formState,
    watch,
    handleSubmit,
    register,
    setValue,
    resetField,
    control,
  } = useFormContext<SignUpFormInputs>();
  const [loading, setLoading] = useState<boolean>(false);
  const [companyLogoUploadLoading, setCompanyLogoUploadLoading] =
    useState<boolean>(false);
  const navigate = useNavigate();
  const { errors } = formState;
  const { onAuthUsertoLogin } = useContext(AuthContextFactory);
  const { triggerToast } = useCustomToast();
  const [fileUploadProgress, setFileUploadProgress] = useState<number>(0);
  const values = watch();
  const [updateUser, updateUserMutationState] = useUpdateUserMutation();

  const isSSOSignup = localStorage.getItem(LocalStorageKeys.IS_SSO_SIGNUP);
  const userEmail = useRef<string | null>(null);
  const userName = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [getSignedUrl] = useGetSignedUrlMutation();

  const handleAddressChange = (
    address: string,
    zipCode: string,
    city: string,
    state: string,
  ) => {
    setValue("dealerAddress", address);
    setValue("zipCode", zipCode);
    setValue("city", city);
    setValue("state", state);
  };
  const { initAutocomplete } = useGoogleAddress({
    handleAddressChange,
  });

  const dealerShipNamesQueryState = useGetDealerShipNamesQuery({
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        LocalStorageKeys.TEMP_TOKEN,
      )}`,
    },
  });

  useEffect(() => {
    if (inputRef.current) {
      initAutocomplete(inputRef);
    }
  }, [initAutocomplete]);

  const dealerShipNames = useMemo(() => {
    let names: string[] | { label: string }[] = [{ label: "" }];

    if (dealerShipNamesQueryState?.isSuccess) {
      names = (dealerShipNamesQueryState?.data as string[]) || [{ label: "" }];
      names =
        names.length > 0
          ? names
              .filter((filterName) => filterName !== null)
              .map((name) => ({
                label: name,
              }))
          : [{ label: "" }];
    }

    return names;
  }, [dealerShipNamesQueryState?.data, dealerShipNamesQueryState?.isSuccess]);

  const userJSON = localStorage.getItem(LocalStorageKeys.DEALER_DETAILS);
  if (userJSON !== null) {
    const details = JSON.parse(userJSON) as UserSchema;
    userEmail.current = details?.user?.email;
    userName.current = details?.user?.name;
  }
  // const userDetails = useMemo(() => {
  //   if (userJSON !== null) {
  //     const details = JSON.parse(userJSON) as UserSchema;

  //     return details;
  //   }
  //   return "";
  // }, [userJSON]);

  const requiredFieldsFilled = useMemo(() => {
    const requiredFields = [
      "fullName",
      "dealershipName",
      "jobTitle",
      "email",
      "phoneNumber",
      "dealerAddress",
      "city",
      "state",
      "zipCode",
    ];

    return requiredFields.every((field) => {
      const value = values[field as keyof SignUpFormInputs];
      if (field === "phoneNumber") {
        const digitMatches = values?.phoneNumber?.match(/\d/g);
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

  const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
    console.log("%conFormSubmit:", "background-color:pink;", data);

    let logoUrl = {
      origin: "",
      pathname: "",
    };

    if (data?.companyLogoUrl) {
      logoUrl = new URL(data.companyLogoUrl);
    }

    try {
      setLoading(true);
      const metadataDetails = {
        dealer_address: data.dealerAddress,
        dealership_name: data.dealershipName,
        dealer_city: data.city,
        dealer_state: data.state,
        dealer_zip_code: data.zipCode,
        job_title: data.jobTitle,
        ...(data.companyLogoUrl && {
          company_logo_url: `${logoUrl.origin}${logoUrl.pathname}`,
        }),
      };

      const tempToken = localStorage.getItem(LocalStorageKeys.TEMP_TOKEN);

      if (isSSOSignup) {
        const updatedUserProfileRes = await updateUser({
          data: {
            name: data.fullName,
            username: data.email,
            email: data.email,
            phone: data.phoneNumber,
            metadata: metadataDetails,
          },
          headers: { Authorization: `Bearer ${tempToken}` },
        }).unwrap();

        handleSuccess({ user: { ...updatedUserProfileRes } }, tempToken);
      } else {
        const response = await axiosAuthInstance.post<RegistrationResponse>(
          `/users/register?token=${tempToken}`,
          {
            name: data.fullName,
            username: data.email,
            email: data.email,
            phone: data.phoneNumber,
            metadata: metadataDetails,
          },
        );

        if (response.status >= 200 && response.status < 300) {
          handleSuccess(
            response.data.user || response.data,
            response.data.token,
          );
        }
      }
    } catch (error) {
      const errorMessage =
        (error as ApiResponse)?.response?.data?.message ||
        "Request failed! Some error occurred";
      console.error("Error submitting form:", error);
      triggerToast({ variant: "error", message: toSentenceCase(errorMessage) });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (userProfile: UserSchema, _token: string | null) => {
    triggerToast({ variant: "success", message: "Registration successful!" });
    clearLocalStorage();
    saveToLocalStorage(userProfile, _token !== null ? _token : "");
    onAuthUsertoLogin(_token !== null ? _token : "");

    const decodedToken = JSON.parse(
      atob(_token?.split(".")?.[1] || ""),
    ) as UserSchema;
    submitDatadogCountMetric({
      metric: `${(
        rootSlice?.appSettings?.name || ""
      )?.toLowerCase()}_cpq.login_count`,
      tags: [`user.email:${decodedToken?.user?.email}`],
    });

    navigate(RoutePaths.BUILD_MY_VEHICLE_PAGE);
    setFileUploadProgress(0);
  };

  const clearLocalStorage = () => {
    localStorage.removeItem(LocalStorageKeys.TEMP_TOKEN);
    localStorage.removeItem(LocalStorageKeys.IS_SSO_SIGNUP);
    localStorage.removeItem(LocalStorageKeys.DEALER_DETAILS);
    localStorage.removeItem(LocalStorageKeys.SIGNUP_ACTIVE_STEP_TEMP_FLAG);
  };

  const saveToLocalStorage = (userProfile: UserSchema, _token: string) => {
    localStorage.setItem(LocalStorageKeys.TOKEN, _token);
    if (isSSOSignup) {
      localStorage.setItem(
        LocalStorageKeys.USER,
        JSON.stringify({ ...userProfile }),
      );
    } else {
      localStorage.setItem(
        LocalStorageKeys.USER,
        JSON.stringify({ user: { ...userProfile } }),
      );
    }
  };

  const abortController = new AbortController();

  const signal = abortController.signal;

  const uploadFile = useCallback(
    async (file: File, fileName: string) => {
      const formattedFileName = fileNameFormatter(fileName);
      setCompanyLogoUploadLoading(true);
      try {
        const res = await getSignedUrl({
          data: { fileName: formattedFileName },
        }).unwrap();

        await axiosSignedUrlInstance.put(res.url, file, {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percent = total ? Math.floor((loaded * 100) / total) : 0;
            if (percent < 100) {
              setFileUploadProgress(percent);
            }
          },
          signal,
        });

        setFileUploadProgress(100);
        setValue("companyLogoUrl", res.url);
        setCompanyLogoUploadLoading(false);

        return { signed_url: res.url };
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Upload request canceled:", error.message);
        } else {
          console.error("Error uploading file:", error);
        }
        setCompanyLogoUploadLoading(false);
      }
    },
    [getSignedUrl, setValue, signal],
  );

  const handleCancelUpload = () => {
    abortController.abort();
  };

  const handleRemoveFile = () => {
    resetField("companyLogo");
  };

  const currentFile = watch("companyLogo");

  return (
    <SignUpFormStyled>
      <MuiBox className="main-container">
        <MuiBox
          component="form"
          className="form"
          id="form-id"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(onSubmit)();
          }}
        >
          <Grid container maxWidth="26.5rem" columnGap="1.5rem">
            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-fullname"
                  className="form-label form-label--required"
                >
                  Full Name
                </label>
                <input
                  id="input-fullname"
                  placeholder="Enter full name"
                  className="input--text"
                  type="text"
                  {...register("fullName", {
                    required: true,
                    value:
                      userName.current !== null ? userName.current : undefined,
                    pattern: {
                      value: Regexs.ALPHABET_WITH_SPACES_ONLY,
                      message: "Only alphabet and spaces are allowed",
                    },
                  })}
                />
                <Typography className="form-error-text">
                  {errors?.fullName?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control" sx={{ gap: "5px" }}>
                <label
                  htmlFor="input-dealership"
                  className="form-label form-label--required"
                >
                  Dealership Name
                </label>
                <Autocomplete
                  freeSolo
                  options={[...dealerShipNames]}
                  onChange={(e, val) => {
                    const { label } = (val || {}) as { label: string };

                    setValue("dealershipName", label);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="input-dealership"
                      placeholder="Enter dealership name"
                      className="input--text autocomplete-input"
                      type="text"
                      onChange={(e) =>
                        setValue("dealershipName", e.target.value)
                      }
                    />
                  )}
                />

                <Typography className="form-error-text">
                  {errors?.dealershipName?.message}
                </Typography>
              </MuiBox>
            </Grid>

            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-job-title"
                  className="form-label form-label--required"
                >
                  Job Title
                </label>
                <input
                  id="input-job-title"
                  placeholder="Enter job title"
                  className="input--text"
                  type="text"
                  {...register("jobTitle")}
                />
                <Typography className="form-error-text">
                  {errors?.jobTitle?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-email"
                  className="form-label form-label--required"
                >
                  Email
                </label>
                <input
                  id="input-email"
                  placeholder="Enter email"
                  className="input--text"
                  type="email"
                  {...register("email", {
                    value:
                      userEmail.current !== null
                        ? userEmail.current
                        : undefined,
                  })}
                  disabled={userEmail ? true : false}
                />
                <Typography className="form-error-text">
                  {errors?.email?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-phone-number"
                  className="form-label form-label--required"
                >
                  Phone Number
                </label>
                <Controller
                  control={control}
                  name="phoneNumber"
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
                      placeholder="Enter phone number"
                      name={name}
                    />
                  )}
                />
                <Typography className="form-error-text">
                  {errors?.phoneNumber?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-dealer-address"
                  className="form-label form-label--required"
                >
                  Dealer Address
                </label>

                <Controller
                  name="dealerAddress"
                  control={control}
                  render={({ field }) => (
                    <StyledTextfield
                      id="input-dealer-address"
                      placeholder="Enter dealer address"
                      inputRef={inputRef}
                      {...field}
                    />
                  )}
                />
                <Typography className="form-error-text">
                  {errors?.dealerAddress?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-city"
                  className="form-label form-label--required"
                >
                  City
                </label>
                <input
                  id="input-city"
                  placeholder="Enter city"
                  className="input--text"
                  type="text"
                  {...register("city")}
                />
                <Typography className="form-error-text">
                  {errors?.city?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={5.6}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-state"
                  className="form-label form-label--required"
                >
                  State
                </label>
                <input
                  id="input-state"
                  placeholder="Enter state"
                  className="input--text"
                  type="text"
                  {...register("state")}
                />
                <Typography className="form-error-text">
                  {errors?.state?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={5.7}>
              <MuiBox className="form-control">
                <label
                  htmlFor="input-zip-code"
                  className="form-label form-label--required"
                >
                  Zip Code
                </label>
                <input
                  id="input-zip-code"
                  placeholder="Enter zip code"
                  className="input--text"
                  type="text"
                  {...register("zipCode")}
                />
                <Typography className="form-error-text">
                  {errors?.zipCode?.message}
                </Typography>
              </MuiBox>
            </Grid>
            <Grid item xs={12}>
              <MuiBox className="form-control">
                {!currentFile ? (
                  <Controller
                    name="companyLogo"
                    control={control}
                    render={({ field }) => (
                      <FileDropzone
                        id="logo-file-input"
                        onFileUploaded={(file) => {
                          field.onChange(file);
                        }}
                        allowedFileMimeTypes={["image/png, image/jpeg"]}
                        uploadFile={uploadFile}
                      />
                    )}
                  />
                ) : (
                  <FileDetails
                    progress={fileUploadProgress}
                    currentFile={currentFile}
                    handleCancelUpload={handleCancelUpload}
                    handleRemoveFile={handleRemoveFile}
                    shouldDisplayLogo={true}
                  />
                )}
                <Typography className="form-error-text">
                  {errors?.companyLogo?.message}
                </Typography>
              </MuiBox>
            </Grid>
          </Grid>
        </MuiBox>

        <MuiBox className="button-container">
          <CButton
            id="login-button"
            form="form-id"
            type="submit"
            className="login-button"
            disabled={
              !requiredFieldsFilled ||
              loading ||
              companyLogoUploadLoading ||
              updateUserMutationState.isLoading
            }
          >
            {loading ? (
              <CircularLoader size={16} color="white" />
            ) : (
              `Get Started`
            )}
          </CButton>
        </MuiBox>
      </MuiBox>
    </SignUpFormStyled>
  );
}

const SignUpFormStyled = styled(Box)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  ".main-container": {
    padding: "1.5rem",
  },

  ".form": {
    ".form-control": {
      display: "flex",
      flexDirection: "column",
      label: {
        marginTop: "0.25rem",
      },
      input: {
        marginTop: "0.25rem",
      },
    },

    // autocomplete styles begin
    ".MuiAutocomplete-root .MuiOutlinedInput-root": {
      padding: "0px",
    },
    ".MuiAutocomplete-root .MuiOutlinedInput-root .MuiAutocomplete-input": {
      padding: "7.5px 4px 7.5px 10px",
      marginTop: "0px",

      "&:focus": {
        borderColor: theme.palette.primary.main,
      },
    },
    ".MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${theme.palette.custom.tertiary}`,
    },

    ".MuiOutlinedInput-notchedOutline:focus": {
      border: `1px solid ${theme.palette.primary.main}`,
    },

    ".MuiInputBase-root-MuiOutlinedInput-root.Mui-focused.MuiOutlinedInput-notchedOutline":
      {
        borderColor: theme.palette.primary.main,
      },

    // autocomplete styles end

    ".input--text:focus": {
      borderColor: theme.palette.primary.main,
    },

    ".form-label--required": {
      "&::after": {
        color: theme.palette.primary.main,
      },
    },
  },

  ".button-container": {
    display: "grid",
    marginTop: "1.5rem",

    "#login-button,#signup-button": {
      backgroundColor: theme.palette.primary.main,

      "&:hover": {
        backgroundColor: theme.palette.custom.mainHover,
      },
    },
  },
}));

const StyledTextfield = styled(TextField)(({ theme }) => ({
  ".MuiInputBase-root": {
    borderRadius: "0.3125rem",
  },
  input: {
    padding: "8px 12px",
  },
  fieldset: {
    border: `1px solid ${theme.palette.custom.tertiary} !important`,
  },
}));
