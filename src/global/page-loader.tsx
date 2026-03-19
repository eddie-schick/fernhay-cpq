import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import CircularLoader from "~/components/shared/circular-loader/circular-loader";
import MuiBox from "~/components/shared/mui-box/mui-box";

export default function PageLoader({
  loadingText,
  useOverlay,
}: {
  loadingText?: string;
  useOverlay?: boolean;
}) {
  const { appSettings } = useAppSelector(rootSelector);

  const logoImage =
    appSettings?.splashScreenLogoSvg?.url ||
    appSettings?.splashScreenLogoPng?.url;

  const renderContent = () => {
    if (!logoImage) {
      return <CircularLoader size={36} />;
    }

    return (
      <>
        {/* <MuiBox className="page-loader__logo-container"> */}
        <img src={logoImage} className="page-loader__logo" />

        <MuiBox className="dots-container">
          <MuiBox className="dot dot--1" />
          <MuiBox className="dot dot--2" />
          <MuiBox className="dot dot--3" />
        </MuiBox>
        {/* </MuiBox> */}
        {loadingText && <p>{loadingText}</p>}
      </>
    );
  };

  return (
    <PageLoaderStyled useOverlay={useOverlay}>
      {renderContent()}
    </PageLoaderStyled>
  );
}

const PageLoaderStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== "useOverlay",
})<{ useOverlay?: boolean }>(({ theme, useOverlay }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "2.5rem",
  minHeight: "100vh",
  zIndex: 99999,
  backgroundColor: "#ffffff",
  position: useOverlay ? "fixed" : "relative",
  top: 0,
  left: 0,
  width: "100%",

  ".page-loader__logo": {
    maxWidth: "200px",
    maxHeight: "60px",
    objectFit: "contain",
  },

  ".dots-container": {
    display: "flex",
    alignItems: "center",
    gap: "0.625rem",
  },

  ".dot": {
    borderRadius: "100%",
    height: "1rem",
    width: "1rem",
  },

  ".dot--1": {
    transform: "scale(1)",
    backgroundColor: theme.palette.custom.splashScreenColor1,
    animation: "animate-dot-1 1.5s linear infinite",
  },

  ".dot--2": {
    transform: "scale(0.8)",
    backgroundColor: theme.palette.custom.splashScreenColor2,
    animation: "animate-dot-2 1.5s linear infinite",
  },

  ".dot--3": {
    transform: "scale(0.6)",
    backgroundColor: theme.palette.custom.splashScreenColor3,
    animation: "animate-dot-3 1.5s linear infinite",
  },

  "@keyframes animate-dot-1": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
    "100%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
  },
  "@keyframes animate-dot-2": {
    "12.5%": {
      transform: "scale(0.8)",
    },
    "25%": {
      backgroundColor: theme.palette.custom.splashScreenColor1,
      transform: "scale(1)",
    },
    "37.5%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.8)",
    },
    "50%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
    "100%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
  },
  "@keyframes animate-dot-3": {
    "25%": {
      transform: "scale(0.6)",
    },
    "50%": {
      backgroundColor: theme.palette.custom.splashScreenColor1,
      transform: "scale(1)",
    },
    "62.5%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
    "100%": {
      backgroundColor: theme.palette.custom.splashScreenColor2,
      transform: "scale(0.6)",
    },
  },
}));
