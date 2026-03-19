import { Typography, styled } from "@mui/material";

import { DRAWER_WIDTH, POWERED_BY_SHAED_TEXT } from "~/constants/constants";

import { SheadLogoPng27x32 } from "~/global/icons";

import { useAppSelector } from "~/store";
import { rootSelector } from "~/store/slices/root/slice";

import MuiBox from "~/components/shared/mui-box/mui-box";

const Footer = () => {
  const { drawerState } = useAppSelector(rootSelector);

  return (
    <FooterStyled drawerOpen={drawerState}>
      <img src={SheadLogoPng27x32} style={{ width: 27, height: 32, objectFit: "contain" }} />
      <Typography>{POWERED_BY_SHAED_TEXT}</Typography>
    </FooterStyled>
  );
};

const FooterStyled = styled(MuiBox)<{ drawerOpen?: boolean }>(
  ({ theme, drawerOpen = false }) => ({
    display: "flex",
    flexDirection: "row",
    gap: "1rem",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 0rem",
    width: drawerOpen
      ? `calc(100vw - ${DRAWER_WIDTH}px)`
      : `calc(100vw - 87px)`,
    borderTop: `1px solid ${theme.palette.custom.tertiary}`,
    position: "fixed",
    bottom: "0px",
    background: theme.palette.custom.white,
    transition: "width 0.3s ease-in-out",

    [theme.breakpoints.down("lg")]: {
      width: "100vw",
    },
  }),
);

export default Footer;
