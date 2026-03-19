import { Box, Typography, styled } from "@mui/material";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import AuthPagesLayout from "~/layout/auth-pages-layout/auth-pages-layout";

import EmailLoginCard from "~/components/auth/email-login-card/email-login-card";
import NewToShaedText from "~/components/shared/new-to-shaed-text/new-to-shaed-text";

export default function LoginPage() {
  const rootSlice = useAppSelector(rootSelector);

  return (
    <AuthPagesLayout>
      <LoginPageStyled>
        <Typography component="h1" className="welcome-text">
          Welcome Back
        </Typography>

        <Typography className="login-message-text">
          Login to your {rootSlice?.appSettings?.name || "-"} account
        </Typography>

        <EmailLoginCard footerSlot={<NewToShaedText />} />
      </LoginPageStyled>
    </AuthPagesLayout>
  );
}

const LoginPageStyled = styled(Box)(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  // justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.custom.shaedBrand2_25,
  paddingBottom: "3rem",
  paddingTop: "5.6rem",

  ".welcome-text": {
    fontSize: "3rem",
    fontWeight: 700,
    lineHeight: "3.375rem",
  },

  ".login-message-text": {
    fontSize: "1.125rem",
    fontWeight: 400,
    lineHeight: "normal",
    marginBottom: "2rem",
    marginTop: "0.25rem",
    color: theme.palette.custom.subHeadlines,
  },
}));
