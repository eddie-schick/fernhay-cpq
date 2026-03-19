import { useState } from "react";
import { useNavigate } from "react-router";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
  Toolbar,
  Typography,
  styled,
  useMediaQuery,
} from "@mui/material";

import { DRAWER_WIDTH, HEADER_Z_INDEX } from "~/constants/constants";
import navLinks from "~/constants/nav-links";
import RoutePaths from "~/constants/route-paths";

import CModal from "~/components/common/c-modal/c-modal";
import ContactUs from "~/components/contact-us/contact-us";
import ContactUsSuccess from "~/components/contact-us/contact-us-success";

import MuiBox from "../mui-box/mui-box";

import ProfileButton from "./profile-button";

interface IHeaderProps {
  drawerOpen: boolean;
  setDrawerOpen: (val: boolean) => void;
  headerTitle?: string;
}

const Header = ({
  drawerOpen = false,
  setDrawerOpen,
  headerTitle,
}: IHeaderProps) => {
  const isTablet = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("lg"),
  );
  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm"),
  );

  const [contactUsModal, setContactUsModal] = useState<boolean>(false);
  const [contactSuccessModal, setContactSuccessModal] =
    useState<boolean>(false);

  const navigate = useNavigate();

  const getTitle = () => {
    const path = window.location.pathname;
    let title = navLinks.find((item) => item.path === path)?.title;

    if (path.includes(RoutePaths.MY_ORDERS)) {
      title = `Manage Orders`;
    }

    if (path.includes(RoutePaths.MANAGE_INVENTORY)) {
      title = `Manage Inventory`;
    }

    if (path.includes(RoutePaths.BUILD_MY_VEHICLE_PAGE)) {
      title = `Build My Vehicle`;
    }

    return title;
  };

  return (
    <AppBarStyled elevation={0} drawerOpen={drawerOpen}>
      <Toolbar>
        <HeaderDesktopStyled>
          <MuiBox className="container">
            {isTablet && (
              <>
                <IconButton
                  id="tablet-drawer-toggle-button"
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  className="icon-btn"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                >
                  {drawerOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                <MobileDrawerStyled anchor="top" open={drawerOpen}>
                  <Typography className="menu-text">Menu</Typography>
                  <MobileListStyled>
                    {navLinks.map((navLink, index) => {
                      const isLinkActive =
                        window.location.pathname.includes(navLink.path) &&
                        !navLink.noPath;

                      return (
                        <ListItem
                          key={navLink.id}
                          id={`nav-list-item-${navLink.id}`}
                          className="list-item"
                          onClick={() => {
                            setDrawerOpen(false);
                            if (navLink.title === "Contact Us") {
                              setContactUsModal(true);
                            } else {
                              navigate(`${navLink.path}`);
                            }
                          }}
                        >
                          <ListItemButton
                            className={`list-item-btn ${
                              isLinkActive ? "list-item-btn--active" : ""
                            }`}
                          >
                            <ListItemIcon
                              className={`list-item-icon list-item-icon-${
                                index + 1
                              }`}
                            >
                              {isLinkActive && <navLink.activeIcon />}
                              {!isLinkActive && <navLink.icon />}
                            </ListItemIcon>
                            <ListItemText className="list-item-text">
                              {navLink.title}
                            </ListItemText>
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </MobileListStyled>
                </MobileDrawerStyled>
              </>
            )}
            <Typography component="h1" className="header-heading">
              {headerTitle || getTitle()}
            </Typography>
          </MuiBox>

          <ProfileButton showMenuHamburger={false} id="desktop" />
        </HeaderDesktopStyled>
      </Toolbar>
      {contactUsModal && (
        <CModal
          open={contactUsModal}
          title="Contact Us"
          handleClose={() => setContactUsModal(false)}
          content={
            <ContactUs
              onSuccess={() => {
                setContactUsModal(false);
                setContactSuccessModal(true);
              }}
              onCancel={() => setContactUsModal(false)}
            />
          }
        />
      )}

      {contactSuccessModal && (
        <CModal
          style={{
            width: isMobile ? 300 : 450,
          }}
          title=""
          open={contactSuccessModal}
          handleClose={() => setContactSuccessModal(false)}
          content={<ContactUsSuccess />}
        />
      )}
    </AppBarStyled>
  );
};

export default Header;

const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "drawerOpen",
})<{ drawerOpen: boolean }>(({ theme, drawerOpen }) => ({
  left: "88px",
  width: `calc(100% - 88px)`,
  backgroundColor: theme.palette.custom.white,
  borderBottom: `0.5px solid ${theme.palette.custom.tertiary}`,
  zIndex: HEADER_Z_INDEX,
  minHeight: "70px",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(drawerOpen && {
    marginLeft: DRAWER_WIDTH - 88,
    width: `calc(100% - ${DRAWER_WIDTH}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  [theme.breakpoints.down("lg")]: {
    backgroundColor: theme.palette.custom.white,
    left: "0",
    marginLeft: 0,
    width: "100%",
    ".MuiToolbar-root": {
      padding: "0 1.5rem",
    },
  },
  [theme.breakpoints.down(480)]: {
    minHeight: "3.125rem",
  },
}));

const HeaderDesktopStyled = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",

  [theme.breakpoints.down("md")]: {
    paddingLeft: "0px",
  },

  ".header-heading": {
    fontWeight: 700,
    fontSize: "1.5rem",
  },

  ".header__logo": {
    height: "30px",
    width: "30px",
  },

  ".user": {
    marginRight: "10px",
    fontWeight: 700,

    [theme.breakpoints.down("md")]: {
      display: "none",
    },
  },

  "#profile-details-cotainer": {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",

    svg: {
      path: {
        fill: theme.palette.primary.main,
      },
    },
  },

  ".container": {
    display: "flex",
    alignItems: "center",
  },

  ".icon-btn": {
    color: "black",
  },

  ".avatar": {
    height: "1.875rem",
    width: "1.875rem",
  },

  ".title": {
    color: theme.palette.custom.accentBlack,
    marginLeft: "16px",
    fontWeight: "500",
    [theme.breakpoints.down(480)]: {
      fontWeight: "bold",
    },
  },
  ".icon": {
    cursor: "pointer",
  },
  ".header-dropdown": {
    position: "absolute",
    top: "85%",
    right: 25,
    transition: "all 0.1s",
    fontSize: "2rem",
    boxShadow: "0px 0.5px 35px 1px rgba(171, 171, 171, 0.20)",
    border: `1px solid ${theme.palette.custom.boxShadow}`,
    borderRadius: 5,
  },
  ".header-dropdown--title": {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: theme.palette.custom.accentBlack,
  },

  ".profile-basic-details-container": {
    display: "flex",
    cursor: "pointer",
    gap: "0.75rem",
    alignItems: "center",
  },

  ".profile-basic-detail-user-name": {
    fontSize: "0.875rem",
    fontWeight: 500,
  },
  ".profile-basic-detail-user-email": {
    fontSize: "0.875rem",
    fontWeight: 400,
    color: theme.palette.custom.accentBlack,
  },
  ".MuiList-root": {
    padding: "0.75rem 1rem ",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  ".logout-button-container": {
    padding: "unset",
  },
}));

const MobileDrawerStyled = styled(Drawer)(({ theme }) => ({
  ".MuiPaper-root": {
    height: "100%",
    padding: "56px 0px 0 0px",
    backgroundColor: theme.palette.custom.white,
    color: theme.palette.custom.accentBlack,
    fontWeight: 500,
  },

  ".menu-text": {
    margin: 0,
    marginTop: "3.5rem",
    padding: "0 2rem",
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

const MobileListStyled = styled(List)(({ theme }) => ({
  display: "grid",

  ".list-item": {
    color: theme.palette.custom.accentBlack,
    paddingLeft: 0,
    paddingRight: 0,
  },

  ".list-item-btn": {
    minHeight: "48px",
    padding: "0 2rem",
  },

  ".list-item-btn .list-item-icon-1 path": {
    stroke: theme.palette.custom.accentBlack,
  },
  // ".list-item-btn .list-item-icon-2 path": {
  //   fill: theme.primary.accentBlack,
  // },

  ".list-item-btn--active": {
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

  ".list-item-btn--active .list-item-text span": {
    fontWeight: 700,
    color: theme.palette.custom.accentBlack,
  },

  // ".list-item-icon": {
  //   minWidth: "0px",
  //   display: "flex",
  //   justifyContent: "center",
  // },

  // ".list-item-btn svg path": {
  //   fill: theme.primary.accentBlack,
  // },

  ".list-item-text .MuiTypography-root": {
    fontWeight: 500,
  },

  // .list-item-btn .list-item-text span {
  //   color: ${({ theme }) => theme.primary.accentGrey};
  // }

  // .list-item-btn--active .list-item-text span {
  //   color: ${({ theme }) => theme.primary.baseAccent};
  // }
}));
