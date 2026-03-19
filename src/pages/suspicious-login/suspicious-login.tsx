import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Box, Button, Typography, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import { useAppSelector } from "~/store";
import { useLazyReportSuspiciousLoginQuery } from "~/store/endpoints/auth/auth";
import { rootSelector } from "~/store/slices/root/slice";

import CSpinner from "~/components/shared/circular-loader/circular-loader";
import useCustomToast from "~/components/shared/use-custom-toast/use-custom-toast";

interface DecodedReportToken {
  email: string;
}

type SuspiciousLoginError = { response: { data: { expired: boolean } } };

function SuspiciousLoginPage() {
  const { appSettings } = useAppSelector(rootSelector);
  const logoImage =
    appSettings?.headerLogoSvg?.url || appSettings?.headerLogoPng?.url;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [token] = useState<string>(searchParams.get("token") as string);
  const decodedToken: DecodedReportToken | null = token?.split(".")?.at(1)
    ? (JSON.parse(atob(token?.split(".")?.at(1) || "")) as DecodedReportToken)
    : null;
  const isFirstMount = useRef(true);
  const [reported, setReported] = useState<boolean>(false);
  const { triggerToast } = useCustomToast();

  const [reportSuspiciousLogin, { isLoading }] =
    useLazyReportSuspiciousLoginQuery();

  const handleReportSuspiciousLogin: () => object = async () => {
    try {
      const response = await reportSuspiciousLogin({ token }).unwrap();
      if (response?.success) {
        setReported(true);
      }
    } catch (error) {
      const isTokenExpired = (error as SuspiciousLoginError)?.response?.data
        ?.expired;
      if (isTokenExpired) {
        navigate(RoutePaths.LOGIN_PAGE);
        triggerToast({
          message: "Failed to report suspicious login, token is expired",
          variant: "error",
        });
        return;
      }

      triggerToast({
        message: "Some error occurred! Please try again.",
        variant: "error",
      });
    }
  };

  useEffect(() => {
    const preventDirectNavigation = () => {
      if (!token && isFirstMount.current) {
        navigate(RoutePaths.LOGIN_PAGE);
      } else if (isFirstMount.current) {
        isFirstMount.current = false;

        searchParams.delete("token");
        setSearchParams(searchParams);
      }
    };

    preventDirectNavigation();
  }, [token, navigate, searchParams, setSearchParams]);

  return (
    <SuspiciousLoginPageStyled>
      <Box className="content-container">
        <ImgStyled
          src={logoImage }
          alt={`${appSettings?.name} logo`}
        />
        {!reported ? (
          <Box className="report-container">
            <Box className="report-description-container">
              <Typography className="title">
                Report a suspicious login
              </Typography>
              <Typography className="report-description">
                Check your email and click &apos;Submit&apos; to help us
                investigate any suspicious login activity on your account.
              </Typography>
            </Box>
            <Box className="report-form-container">
              <InputStyled
                type="email"
                placeholder="Email"
                value={decodedToken?.email}
                disabled
              />

              <ButtonStyled
                id="submit-button"
                onClick={() => {
                  void handleReportSuspiciousLogin();
                }}
                disabled={isLoading}
              >
                {isLoading ? <CSpinner color="white" size={19} /> : "Submit"}
              </ButtonStyled>
            </Box>
          </Box>
        ) : (
          <Box className="success-container">
            <Typography className="title" component="h2">
              Security Report Confirmation
            </Typography>
            <Typography className="report-description">
              Thank you for reporting the suspicious login attempt. Your report
              has been successfully recorded and will be reviewed by our
              security team.
            </Typography>
          </Box>
        )}
      </Box>
    </SuspiciousLoginPageStyled>
  );
}

const InputStyled = styled("input")(({ theme }) => ({
  maxWidth: "27.75rem",
  borderRadius: "0.3125rem",
  background: theme.palette.custom.surfaceTertiary,
  color: theme.palette.custom.subHeadlines,
  fontSize: "1rem",
  fontWeight: "500",
  border: `1px solid ${theme.palette.custom.tertiary}`,
  height: "3.25rem",
  paddingInline: "1rem",
}));

const ImgStyled = styled("img")(() => ({
  width: "6.9049rem",
  objectFit: "contain",
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  maxWidth: "27.75rem",
  borderRadius: "0.3125rem",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.custom.white,
  ":hover": {
    backgroundColor: theme.palette.primary.main,
  },
  height: "3.25rem",
  paddingInline: "1rem",
  fontSize: "1rem",
  fontWeight: 600,
  textTransform: "none",
}));

const SuspiciousLoginPageStyled = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.custom.white,
  padding: "2.5rem",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100vh",
  fontFamily: theme.typography.fontFamily,

  ".content-container": {
    boxShadow: "0px 0.5px 35px 1px rgba(171, 171, 171, 0.14)",
    padding: "2.5rem",
    borderRadius: "0.625rem",
    maxWidth: "103.2rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "1rem",
  },

  ".report-container": {
    display: "flex",
    flexDirection: "column",
    gap: "2rem",
  },

  ".report-form-container": {
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },

  ".report-description": {
    color: theme.palette.custom.subHeadlines,
    fontSize: "1.25rem",
  },

  ".title": {
    color: theme.palette.custom.charcoal,
    fontSize: "1.5rem",
    fontWeight: 600,
  },

  ".report-description-container": {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },

  ".success-container": {
    display: "flex",
    flexDirection: "column",
    gap: "0.8rem",
    ".report-description": {
      maxWidth: "48.625rem",
    },
  },
}));

export default SuspiciousLoginPage;
