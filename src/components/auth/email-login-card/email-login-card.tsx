import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";

import { Box, Typography, styled } from "@mui/material";

import { ENDPOINT } from "~/constants/endpoints";
import LocalStorageKeys from "~/constants/local-storage-keys";
import RoutePaths from "~/constants/route-paths";

import { RegistrationPageVehiclesImagePng } from "~/global/icons";

import { submitDatadogCountMetric } from "~/helpers/datadog-helpers";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import {
  AuthContextFactory,
  UserSchema,
} from "~/context/auth-context/auth-context";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

import SSOLogin from "../sso-login/sso-login";

interface ApiResponse {
  response: {
    data: {
      message: string;
    };
  };
}
interface DealerDetails {
  email: string;
  iat: number;
  exp: number;
}
type FormInputs = {
  email: string;
};
type EmailLoginCardProps = {
  footerSlot: React.ReactNode;
  isSignupPage?: boolean;
  setActiveStep?: React.Dispatch<React.SetStateAction<number>>;
};

const schema = yup
  .object({
    email: yup.string().required("Email is required"),
  })
  .required();

function isUserSchema(tokenPayload: object): tokenPayload is UserSchema {
  return (
    typeof tokenPayload === "object" &&
    tokenPayload !== null &&
    "email" in tokenPayload &&
    "iat" in tokenPayload &&
    "exp" in tokenPayload
  );
}
export default function EmailLoginCard(props: EmailLoginCardProps) {
  const { footerSlot, isSignupPage, setActiveStep } = props;

  const { appSettings } = useAppSelector(rootSelector);

  const [loading, setLoading] = useState<boolean>(false);
  const { register, handleSubmit, resetField, formState } = useForm<FormInputs>(
    {
      resolver: yupResolver(schema),
    },
  );
  const { errors } = formState;
  console.log({ formState });
  const { triggerToast } = useCustomToast();
  const [params, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { onAuthUsertoLogin } = useContext(AuthContextFactory);

  const advanceSignUpStep = useCallback(() => {
    setActiveStep?.((prev) => prev + 1);
    navigate(RoutePaths.SIGN_UP_PAGE);
    localStorage.setItem(LocalStorageKeys.SIGNUP_ACTIVE_STEP_TEMP_FLAG, "true");
  }, [setActiveStep, navigate]);

  const authenticateAndNavigate = useCallback(
    (token: string) => {
      if (!token) return;

      onAuthUsertoLogin(token);

      const decodedToken = JSON.parse(
        atob(token?.split(".")?.[1]),
      ) as UserSchema;
      submitDatadogCountMetric({
        metric: `${(appSettings?.name || "")?.toLowerCase()}_cpq.login_count`,
        tags: [`user.email:${decodedToken?.user?.email}`],
      });

      navigate(RoutePaths.BUILD_MY_VEHICLE_PAGE);
    },
    [onAuthUsertoLogin, appSettings?.name, navigate],
  );

  useEffect(
    () => {
      // Handle expired from search params
      const isMagicLinkExpired = params.get("expired");
      if (isMagicLinkExpired === "true") {
        console.log("got it");
      }

      // Handle error from search params
      const error = params.get("error");
      if (error) {
        triggerToast({ variant: "error", message: error });
        params.delete("error");
        setSearchParams(params);
        return;
      }

      // Clear sign-up step flag if not on sign-up page
      if (!isSignupPage) {
        localStorage.removeItem(LocalStorageKeys.SIGNUP_ACTIVE_STEP_TEMP_FLAG);
      }

      const isNewUser = params?.get("newUser");
      const tokenFromParams = params?.get("token");

      console.log("temp token here: >>>>>>>>>>>>>>", {
        tokenFromParams,
      });

      if (tokenFromParams) {
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const tokenPayload = JSON.parse(atob(tokenFromParams.split(".")[1]));
        // Case 1: When there are both `token` and `newUser` params
        if (isNewUser && tokenFromParams) {
          let dealerDetails: UserSchema | DealerDetails;

          // Determine if the token payload matches the expected user schema
          if (!isUserSchema(tokenPayload as object)) {
            dealerDetails = tokenPayload as UserSchema;
            localStorage.setItem(
              LocalStorageKeys.DEALER_DETAILS,
              JSON.stringify(dealerDetails),
            );

            // Set SSO signup flag if user metadata is missing
            if (!dealerDetails?.user?.metadata) {
              localStorage.setItem(LocalStorageKeys.IS_SSO_SIGNUP, "true");
            } else {
              localStorage.removeItem(LocalStorageKeys.IS_SSO_SIGNUP);
            }
          } else {
            // When signing up through magic link, remove SSO flag if it exists
            localStorage.removeItem(LocalStorageKeys.IS_SSO_SIGNUP);

            dealerDetails = tokenPayload as DealerDetails;
            localStorage.setItem(
              LocalStorageKeys.DEALER_DETAILS,
              JSON.stringify({ user: { email: dealerDetails.email } }),
            );
          }

          localStorage.setItem(
            LocalStorageKeys.TEMP_TOKEN,
            tokenFromParams !== null ? tokenFromParams : "",
          );

          advanceSignUpStep();

          return;
        }
        // Case 2: When there is only `newUser` param
        else if (isNewUser) {
          // Handle logic for new users without token
          advanceSignUpStep();
          return;
        }
        // Case 3: When there is only `token` param
        else {
          // Authenticate and navigate based on token presence in params for existing user
          const userFromParams = tokenPayload as UserSchema;
          localStorage.setItem(
            LocalStorageKeys.DEALER_DETAILS,
            JSON.stringify(userFromParams),
          );
          if (userFromParams?.user?.metadata !== null) {
            authenticateAndNavigate(
              tokenFromParams !== null ? tokenFromParams : "",
            );

            return;
          } else {
            // Set temp token for the case when there is no `newUser` flag in params
            localStorage.setItem(
              LocalStorageKeys.TEMP_TOKEN,
              tokenFromParams !== null ? tokenFromParams : "",
            );

            if (!isUserSchema(tokenPayload as object)) {
              // Set SSO signup flag if the schema doesn't match
              localStorage.setItem(LocalStorageKeys.IS_SSO_SIGNUP, "true");
            } else {
              // When signing up through magic link, remove SSO flag if it exists
              localStorage.removeItem(LocalStorageKeys.IS_SSO_SIGNUP);
            }

            advanceSignUpStep();
          }
        }
      }

      // Advance sign-up step if the temporary flag exists
      const tempSignupFlagExists = localStorage.getItem(
        LocalStorageKeys.SIGNUP_ACTIVE_STEP_TEMP_FLAG,
      );
      if (tempSignupFlagExists) {
        setActiveStep?.((prev) => prev + 1);
      }

      const tokenFromLocalStorage: string | null = localStorage.getItem(
        LocalStorageKeys.TOKEN,
      );
      const userFromLocalStorageJSON: string | null = localStorage.getItem(
        LocalStorageKeys.DEALER_DETAILS,
      );
      // Check for existing token in local storage
      if (tokenFromLocalStorage && !tokenFromParams) {
        if (userFromLocalStorageJSON !== null) {
          const userFromLocalStorage = JSON.parse(
            userFromLocalStorageJSON,
          ) as UserSchema;

          if (
            tokenFromLocalStorage &&
            userFromLocalStorage?.user?.metadata !== null
          ) {
            authenticateAndNavigate(tokenFromLocalStorage);
          } else {
            const tokenPayload = JSON.parse(
              atob(tokenFromLocalStorage.split(".")[1]),
            ) as UserSchema;

            if (!isUserSchema(tokenPayload as object)) {
              // Set SSO signup flag if the schema doesn't match
              localStorage.setItem(LocalStorageKeys.IS_SSO_SIGNUP, "true");
            } else {
              // When signing up through magic link, remove SSO flag if it exists
              localStorage.removeItem(LocalStorageKeys.IS_SSO_SIGNUP);
            }
            advanceSignUpStep();
          }
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // authenticateAndNavigate,
      // isSignupPage,
      // navigate,
      // onAuthUsertoLogin,
      // params,
      // setActiveStep,
      // setSearchParams,
      // triggerToast,
      // user,
    ],
  );

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log("%conFormSubmit:", "background-color:yellow;", { data });

    // DEMO BYPASS: Skip auth service and log in directly with a fake JWT
    // Always active — this app is a self-contained frontend demo
    if (true) {
      const devPayload: UserSchema = {
        user: {
          id: "dev-user-001",
          email: data.email || "dev@shaed.ai",
          name: data.email?.split("@")[0] || "Dev User",
          metadata: {
            dealer_address: "1234 Commerce Dr",
            dealership_name: "Fernhay Direct",
            dealer_city: "Denver",
            dealer_state: "CO",
            dealer_zip_code: "80202",
            job_title: "VP of Sales",
            role: "admin",
          },
        },
      };
      // Build a fake JWT: header.payload.signature
      const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
      const payload = btoa(JSON.stringify(devPayload));
      const fakeToken = `${header}.${payload}.dev-signature`;

      onAuthUsertoLogin(fakeToken);
      navigate(RoutePaths.BUILD_MY_VEHICLE_PAGE);
      return;
    }

    setLoading(true);
    axios
      .post(
        ENDPOINT.AUTH_SERVICE_URI + "/auth/magic-link",
        {
          email: data.email,
          signUpUri: isSignupPage
            ? `${ENDPOINT.BASE_URL}/sign-up?newUser=true&email=${data.email}`
            : null,
          loginPageUri: `${ENDPOINT.BASE_URL}/login`,
          failureUri: `${ENDPOINT.BASE_URL}/expired`,
          reportUri: `${ENDPOINT.BASE_URL}/report`,
          customReportHandle: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            "x-api-key": ENDPOINT.AUTH_SERVICE_API_KEY,
          },
        },
      )
      .then((response) => {
        setLoading(false);
        console.log(response);
        if (response.status >= 400) {
          throw new Error("Request failed! Some error occurred");
        }
        triggerToast({
          variant: "success",
          message: "Email has been sent successfully!",
        });
        console.log(response);
        resetField("email");
      })
      .catch((err: ApiResponse) => {
        setLoading(false);
        console.log(err);
        const errorMessage = err?.response?.data?.message;
        triggerToast({
          variant: "error",
          message:
            errorMessage && errorMessage === "User not found"
              ? "We couldn't locate your user profile. To get started, please sign up."
              : errorMessage || "Request failed! Some error occurred",
        });
      });
  };

  return (
    <EmailLoginCardStyled>
      <img
        src={
          appSettings?.loginBannerImageSvg?.url ||
          appSettings?.loginBannerImagePng?.url ||
          RegistrationPageVehiclesImagePng
        }
        alt="vehicles"
        className="login-card-main-image"
      />

      <MuiBox className="main-container">
        <SSOLogin />

        <MuiBox className="separator-line">
          <Typography className="or-login-with-text">
            {isSignupPage ? `or sign up with` : `or login with`}
          </Typography>
        </MuiBox>

        <MuiBox
          component="form"
          className="form"
          id="form-id"
          onSubmit={(e) => {
            e.preventDefault();

            void handleSubmit(onSubmit)();
          }}
        >
          <MuiBox className="form-control">
            <label
              htmlFor="input-email"
              className="form-label form-label--required"
            >
              Email
            </label>
            <input
              id="input-email"
              placeholder="Enter your email"
              className="input--text"
              type="email"
              {...register("email")}
            />
            <Typography className="form-error-text">
              {errors?.email?.message}
            </Typography>
          </MuiBox>
        </MuiBox>

        <MuiBox className="button-container">
          <CButton
            id={isSignupPage ? "signup-button" : "login-button"}
            form="form-id"
            type="submit"
            className={isSignupPage ? "signup-button" : "login-button"}
            disabled={loading}
          >
            {loading ? (
              <CircularLoader size={18} color="white" />
            ) : (
              <>{isSignupPage ? "Sign Up" : "Login"}</>
            )}
          </CButton>
        </MuiBox>

        <MuiBox className="footer-container">{footerSlot}</MuiBox>
      </MuiBox>
    </EmailLoginCardStyled>
  );
}

const EmailLoginCardStyled = styled(Box)(({ theme }) => ({
  borderRadius: "0.625rem",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  overflow: "hidden",

  ".login-card-main-image": {
    maxWidth: "26.5rem",
    maxHeight: "13.4375rem",
    height: "100%",
    width: "100%",
    objectFit: "contain",
  },

  ".main-container": {
    padding: "24px",
  },

  ".social-icons-container": {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
  },

  ".social-icon-button": {
    padding: "8px 12px",
    borderRadius: "0.3125rem",
    border: `1px solid ${theme.palette.custom.greyAccent}`,
    backgroundColor: "#ffffff",
    color: theme.palette.custom.accentBlack,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    width: "10.9375rem",
    fontSize: "1rem",
    fontWeight: 400,
  },

  ".separator-line": {
    height: "1px",
    width: "100%",
    backgroundColor: theme.palette.custom.tertiary,
    position: "relative",
    marginBlock: "2rem",
  },

  ".or-login-with-text": {
    fontSize: "1rem",
    fontWeight: 400,
    lineHeight: "normal",
    color: theme.palette.custom.subHeadlines,
    position: "absolute",
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#ffffff",
    paddingInline: "1rem",
  },

  ".form": {
    ".form-control": {
      display: "grid",

      label: {
        marginBottom: "0.25rem",
      },
    },

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
    marginTop: "0.5rem",
    marginBottom: "1.5rem",

    "#login-button,#signup-button": {
      backgroundColor: theme.palette.primary.main,

      "&:hover": {
        backgroundColor: theme.palette.custom.mainHover,
      },
    },
  },

  ".footer-container": {
    textAlign: "center",
  },
}));
