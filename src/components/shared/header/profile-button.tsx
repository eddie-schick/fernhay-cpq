import { useContext, useState } from "react";
import { useNavigate } from "react-router";

import {
  Avatar,
  ClickAwayListener,
  Divider,
  MenuItem,
  MenuList,
  Paper,
  Typography,
  Skeleton,
} from "@mui/material";


import Envs from "~/constants/envs";
import RoutePaths from "~/constants/route-paths";

import useProfileImageData from "~/global/custom-hooks/use-profile-image-data";
import {
  DropdownIcon,
  LogoutIcon,
  NotificationBellIcon,
  UserProfileIcon,
} from "~/global/icons";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

import MuiBox from "../mui-box/mui-box";

export default function ProfileButton({
  showMenuHamburger,
  id,
}: {
  showMenuHamburger?: boolean;
  id: string;
}) {
  const navigate = useNavigate();
  const { user, role, onAuthUsertoLogout } = useContext(AuthContextFactory);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const { isLoadingProfilePicture, profileImageUrl } = useProfileImageData();

  const onProfileClick = () => {
    navigate(RoutePaths.MY_PROFILE);
  };

  console.log("app name", Envs.APP_NAME);

  const renderProfileImage = ({ profileIconId }: { profileIconId: string }) => {
    if (isLoadingProfilePicture) {
      return (
        <Skeleton
          sx={{
            height: "1.875rem",
            width: "1.875rem",
            transform: "unset",
            borderRadius: "100%",
            position: "relative",
          }}
        />
      );
    }

    if (!profileImageUrl) {
      return (
        <UserProfileIcon
          className="icon"
          onClick={onProfileClick}
          id={profileIconId}
        />
      );
    }

    return (
      <Avatar
        alt="profile-picture"
        className="avatar icon"
        onClick={onProfileClick}
        src={profileImageUrl}
      />
    );
  };

  return (
    <div id="profile-details-cotainer" className="container">
      <NotificationBellIcon />
      <Typography className="user">{user?.user?.name}</Typography>
      {renderProfileImage({ profileIconId: `user-profile-button-${id}-1` })}

      {!showMenuHamburger && (
        <>
          <DropdownIcon
            id={`header-dropdown-button-${id}`}
            onClick={() => setShowDropdown(true)}
            className="icon"
          />

          {showDropdown && (
            <Paper className="header-dropdown">
              <ClickAwayListener
                onClickAway={() => {
                  setShowDropdown(false);
                }}
              >
                <MenuList
                  id="composition-menu"
                  aria-labelledby="composition-button"
                >
                  <MuiBox
                    className="profile-basic-details-container"
                    onClick={() => {
                      onProfileClick();
                      setShowDropdown(false);
                    }}
                    id={`user-profile-button-${id}-3`}
                  >
                    <MuiBox className="profile-avatar-container">
                      {renderProfileImage({
                        profileIconId: `user-profile-button-${id}-2`,
                      })}
                    </MuiBox>
                    <div>
                      <Typography className="profile-basic-detail-user-name">
                        {user?.user?.name}
                      </Typography>
                      <Typography className="profile-basic-detail-user-email">
                        {user?.user?.email}
                      </Typography>
                    </div>
                  </MuiBox>
                  <Divider variant="fullWidth" />
                  <MenuItem
                    className="header-dropdown--title logout-button-container"
                    onClick={onAuthUsertoLogout}
                    id={`user-logout-button-${id}`}
                  >
                    <LogoutIcon />
                    &nbsp; Logout
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          )}
        </>
      )}
    </div>
  );
}
