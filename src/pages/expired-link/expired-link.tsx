import { useNavigate } from "react-router";

import { Stack, Typography, styled } from "@mui/material";

import RoutePaths from "~/constants/route-paths";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import CButton from "~/components/common/cbutton/cbutton";
import Footer from "~/components/shared/footer/Footer";

export default function ExpiredLink() {
  const navigate = useNavigate();

  const rootSlice = useAppSelector(rootSelector);

  const handleClick = () => {
    navigate(RoutePaths.LOGIN_PAGE);
  };

  const renderLogo = () => {
    return (
      <img
        src={
          rootSlice?.appSettings?.headerLogoSvg?.url ||
          rootSlice?.appSettings?.headerLogoPng?.url
        }
        alt={`${rootSlice?.appSettings?.name} logo`}
      />
    );
  };

  return (
    <>
      <Stack alignItems="center" justifyContent="center" height="100vh">
        <StyledDiv>
          <Stack gap="3rem" alignItems={"flex-start"}>
            <Stack gap="1rem">
              {renderLogo()}
              <Stack gap="0.5rem">
                <Typography className="text">
                  Link is not valid anymore
                </Typography>
                <Typography className="sub-text">
                  Oops! Looks like your magic link has expired.
                </Typography>
              </Stack>
            </Stack>
            <CButton id="back-to-login-button" onClick={handleClick}>
              Go back to login
            </CButton>
          </Stack>
        </StyledDiv>
      </Stack>
      <Footer />
    </>
  );
}

const StyledDiv = styled("div")(({ theme }) => ({
  padding: "2.5rem",
  borderRadius: "0.625rem",
  width: "57rem",
  boxShadow: "0px 0.5px 35px 1px rgba(171, 171, 171, 0.14)",
  ".text": {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.custom.accentBlack,
  },
  ".sub-text": {
    fontSize: "1.25rem",
    color: theme.palette.custom.subHeadlines,
  },
}));
