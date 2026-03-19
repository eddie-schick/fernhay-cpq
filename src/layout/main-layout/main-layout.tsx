import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import {
  CSSObject,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
  styled,
  useMediaQuery,
} from "@mui/material";

import { DRAWER_WIDTH } from "~/constants/constants";
import navLinks from "~/constants/nav-links";
import RoutePaths from "~/constants/route-paths";

import { ContactUsIcon } from "~/global/icons";

import { useAppDispatch, useAppSelector } from "~/store";
import { rootSelector, setDrawerState } from "~/store/slices/root/slice";

import CModal from "~/components/common/c-modal/c-modal";
import ContactUs from "~/components/contact-us/contact-us";
import ContactUsSuccess from "~/components/contact-us/contact-us-success";
import Footer from "~/components/shared/footer/Footer";
import Header from "~/components/shared/header/Header";
import MuiBox from "~/components/shared/mui-box/mui-box";

interface IMainLayout {
  children: React.ReactNode;
  headerTitle?: string;
}

export default function MainLayout({ children, headerTitle }: IMainLayout) {
  const { drawerState: drawerOpen, appSettings } = useAppSelector(rootSelector);
  const dispatch = useAppDispatch();

  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm"),
  );

  const navigate = useNavigate();

  const [contactUsModal, setContactUsModal] = useState<boolean>(false);
  const [contactSuccessModal, setContactSuccessModal] =
    useState<boolean>(false);

  const contactListItem = navLinks.find((link) => link.title === "Contact Us");

  const renderLogo = () => {
    const image =
      appSettings?.sidebarLogoSvg?.url || appSettings?.sidebarLogoPng?.url;

    return (
      <img
        style={{ cursor: "pointer", maxHeight: "36px", width: "auto" }}
        onClick={() => navigate(RoutePaths.BUILD_MY_VEHICLE_PAGE)}
        src={image}
      />
    );
  };

  return (
    <MainLayoutStyled drawerOpen={drawerOpen}>
      {!isTablet && (
        <DrawerStyled variant="permanent" open={drawerOpen}>
          <DrawerHeaderStyled drawerOpen={drawerOpen}>
            <IconButton
              color="inherit"
              id="desktop-drawer-toggle-button"
              aria-label="open drawer"
              edge="start"
              className="icon-btn"
              onClick={() => dispatch(setDrawerState(!drawerOpen))}
            >
              <MenuIcon />
            </IconButton>
            {drawerOpen && renderLogo()}
          </DrawerHeaderStyled>

          <ListStyled id="navlinks-container" open={drawerOpen}>
            {navLinks.map((item) => {
              const isRouteAvailable = item?.noPath || false;

              if (isRouteAvailable) return;
              const isLinkActive = window.location.pathname.includes(
                item?.path,
              );

              return (
                <ListItem
                  key={item.id}
                  id={`desktop-nav-list-item-${item.id}`}
                  disablePadding
                  className="list-item"
                  component={Link}
                  to={item.path}
                >
                  <ListItemButton
                    className={`list-item-btn ${
                      isLinkActive ? "list-item-btn--active" : ""
                    }`}
                  >
                    <ListItemIcon className="list-item-icon">
                      {isLinkActive && <item.activeIcon />}
                      {!isLinkActive && <item.icon />}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      className="list-item-text"
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </ListStyled>
          <ContactBoxStyled>
            <ListStyled open={drawerOpen}>
              <ListItem
                id="contact-us-button"
                disablePadding
                className="list-item"
                onClick={() => setContactUsModal(true)}
                key={contactListItem?.id}
              >
                <ListItemButton className={`list-item-btn`}>
                  <ListItemIcon className="list-item-icon">
                    <ContactUsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={contactListItem?.title || "Title"}
                    className="list-item-text"
                  />
                </ListItemButton>
              </ListItem>
            </ListStyled>
          </ContactBoxStyled>
        </DrawerStyled>
      )}

      {contactUsModal && (
        <CModal
          open={contactUsModal}
          title="Contact Us"
          handleClose={() => setContactUsModal(false)}
          content={
            <ContactUs
              onCancel={() => setContactUsModal(false)}
              onSuccess={() => {
                setContactUsModal(false);
                setContactSuccessModal(true);
              }}
            />
          }
        />
      )}

      {contactSuccessModal && (
        <CModal
          style={{
            width: isMobile ? 300 : 343,
          }}
          title=""
          open={contactSuccessModal}
          handleClose={() => setContactSuccessModal(false)}
          content={<ContactUsSuccess />}
        />
      )}
      <InnerLayoutStyled>
        <Header
          drawerOpen={drawerOpen}
          setDrawerOpen={(val: boolean) => dispatch(setDrawerState(val))}
          headerTitle={headerTitle}
        />
        <MuiBox sx={{ flexGrow: 1 }}>{children}</MuiBox>
        <Footer />
      </InnerLayoutStyled>
    </MainLayoutStyled>
  );
}

const MainLayoutStyled = styled(MuiBox, {
  shouldForwardProp(propName) {
    return propName !== "drawerOpen";
  },
})<{ drawerOpen: boolean }>(({ theme, drawerOpen }) => ({
  display: "flex",
  minHeight: "calc(100vh - 20px)",

  ".sidebar-layout__menu-text": {
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    opacity: drawerOpen ? "1" : "0",
    paddingLeft: "1.875rem",
    minHeight: "1.875rem",
    margin: "0 0 0.5rem 0",
    color: theme.palette.custom.accentBlack,
    fontWeight: "700",
    fontSize: "0.875rem",
  },

  ".misc-links-container": {
    marginTop: "auto",
    paddingBlock: "2rem",
    display: "flex",
    flexDirection: "column",
    rowGap: "1.5rem",
  },

  ".misc-link-container": {
    marginTop: "auto",
    paddingInline: "1.875rem",
  },

  ".misc-link-text": {
    color: theme.palette.custom.accentBlack,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
  },
}));

const openedMixin = (theme: Theme) => ({
  width: DRAWER_WIDTH,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: theme.palette.custom.white,
  color: theme.palette.custom.white,
});

const closedMixin = (theme: Theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 24px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 24px)`,
  },
  backgroundColor: theme.palette.custom.white,
  color: theme.palette.custom.white,
});

const DrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...(openedMixin(theme) as CSSObject),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...(closedMixin(theme) as CSSObject),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const DrawerHeaderStyled = styled(MuiBox, {
  shouldForwardProp(propName) {
    return propName !== "drawerOpen";
  },
})<{ drawerOpen: boolean }>(({ theme, drawerOpen }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  fontSize: "1.25rem",
  fontWeight: 700,
  lineHeight: "36px",
  padding: "1rem 1.875rem 2rem",
  width: "100%",
  gap: "0.5rem",
  color: theme.palette.custom.accentBlack,
  ...theme.mixins.toolbar,

  ".icon-btn": {
    padding: 0,
    marginLeft: 0,
  },

  ".menu-icon": {
    cursor: "pointer",
    color: theme.palette.primary.dark,
    marginRight: "18px",
  },

  ".prichard-text": {
    marginLeft: "8px",
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),

    opacity: drawerOpen ? "1" : "0",
    pointerEvents: drawerOpen ? "initial" : "none",
  },
}));

const ContactBoxStyled = styled(MuiBox)(() => ({
  display: "flex",
  flex: 1,
  flexDirection: "column",
  justifyContent: "flex-end",
  paddingBottom: "1.5rem",
}));

const ListStyled = styled(List, {
  shouldForwardProp(propName) {
    return propName !== "open";
  },
})<{ open: boolean }>(({ theme, open }) => ({
  ".list-item": {
    display: "block",
    color: theme.palette.custom.white,
  },

  ".list-item-btn": {
    padding: "1rem 1.875rem",
    paddingRight: 0,
  },

  ".list-item-btn--active": {
    color: theme.palette.custom.darker,
    position: "relative",
    background: theme.palette.custom.navLinkActiveColor,
  },
  ".list-item-btn--active::before": {
    content: '""',
    position: "absolute",
    left: 0,
    width: "4px",
    height: "100%",
    backgroundColor: theme.palette.primary.main,
  },

  ".list-item-btn--active .list-item-icon-2 path": {
    fill: theme.palette.custom.baseAccent,
  },
  ".list-item-btn--active .list-item-icon-3 path": {
    stroke: theme.palette.custom.baseAccent,
  },

  ".list-item-icon": {
    minWidth: "unset",
    marginRight: "1rem",
  },

  // .list-item-icon {
  //   min-width: 0;
  //   margin-right: ${({ open }) => (open ? "19px" : "auto")};
  //   display: flex;
  //   justify-content: center;
  //   svg {
  //     path {
  //       fill: ${({ theme }) => theme.primary.accentGrey};
  //     }
  //   }
  // }

  ".list-item-btn .list-item-text": {
    opacity: open ? 1 : 0,
    transition: theme.transitions.create("opacity", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  ".list-item-btn .list-item-text span": {
    color: theme.palette.custom.accentBlack,
    fontWeight: 400,
  },

  ".list-item-btn--active .list-item-text span": {
    fontWeight: 600,
    color: theme.palette.custom.accentBlack,
  },
}));

const InnerLayoutStyled = styled(MuiBox)(({ theme }) => ({
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  margin: "4.375rem 0 0 0",
  position: "relative",
  width: `calc(100% - ${DRAWER_WIDTH}px)`,

  [theme.breakpoints.down("sm")]: {
    margin: "3.5rem 0 0 0",
  },

  ".main-footer": {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: "24px",
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
}));
