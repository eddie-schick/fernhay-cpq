import { PropsWithChildren } from "react";
import { useNavigate } from "react-router";

import { Box, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import AlreadyHaveAccountText from "~/components/shared/already-have-account-text/already-have-account-text";
import MuiBox from "~/components/shared/mui-box/mui-box";
import NewToShaedText from "~/components/shared/new-to-shaed-text/new-to-shaed-text";

type AuthPagesLayoutProps = {
  isSignupPage?: boolean;
};
export default function AuthPagesLayout(
  props: PropsWithChildren & AuthPagesLayoutProps,
) {
  const { children, isSignupPage } = props;

  const navigate = useNavigate();
  const { appSettings } = useAppSelector(rootSelector);
  const logoImage =
    appSettings?.headerLogoSvg?.url || appSettings?.headerLogoPng?.url;

  const onLogoClick = () => {
    navigate(RoutePaths.LOGIN_PAGE);
  };

  const renderLogo = () => {
    return <img src={logoImage} className="app-logo" onClick={onLogoClick} />;
  };

  return (
    <AuthPagesLayoutStyled>
      <MuiBox component="header" className="header">
        {renderLogo()}

        {!isSignupPage ? <NewToShaedText /> : <AlreadyHaveAccountText />}
      </MuiBox>

      <MuiBox component="main" className="app-main">
        {children}
      </MuiBox>
    </AuthPagesLayoutStyled>
  );
}

const AuthPagesLayoutStyled = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",

  ".header": {
    padding: "16px 60px",
    borderBottom: `1px solid ${theme.palette.custom.tertiary}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ".app-logo": {
    cursor: "pointer",
    maxHeight: "40px",
    width: "auto",
  },

  ".app-main": {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
}));
