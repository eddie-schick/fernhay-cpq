import axios from "axios";
import { useContext, useRef, useState } from "react";

import { Avatar, Skeleton, Stack, Typography } from "@mui/material";

import LocalStorageKeys from "~/constants/local-storage-keys";

import appendUuidToFileName from "~/utils/append-uuid-to-filename";

import useProfileImageData from "~/global/custom-hooks/use-profile-image-data";
import { AddIcon, DeleteIcon, ProfileAvatar100x100Icon } from "~/global/icons";

import {
  useGetSignedUrlMutation,
  useUpdateUserMutation,
} from "~/store/endpoints/auth/auth";

import {
  AuthContextFactory,
  UserSchema,
} from "~/context/auth-context/auth-context";

import MuiBox from "../shared/mui-box/mui-box";
import useCustomToast from "../shared/use-custom-toast/use-custom-toast";

export default function ProfilePictureSection() {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const { triggerToast } = useCustomToast();
  const handleAddClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
  };
  const [getSignedUrl] = useGetSignedUrlMutation();
  const [updateUser] = useUpdateUserMutation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, token, setUser } = useContext(AuthContextFactory);

  const { isLoadingProfilePicture, profileImageUrl } = useProfileImageData();

  const setUserNewDetails = (newDetails: UserSchema["user"]) => {
    if (!user?.user) return;

    const latestUser = JSON.parse(
      localStorage.getItem(LocalStorageKeys.USER) || "",
    ) as UserSchema;
    const newUser = {
      ...(latestUser || {}),
      user: {
        ...(latestUser?.user || {}),
        metadata: {
          ...(latestUser?.user.metadata || {}),
          image: newDetails?.metadata?.image,
        },
      },
    };

    console.log("%cnewUser:", "background-color:green;color:white;", newUser);

    localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(newUser));

    if (typeof setUser === "function") {
      setUser(newUser as UserSchema);
    }
  };

  const isFileValid = (file: File) => {
    if (["image/png", "image/jpeg"].includes(file?.type)) return true;

    return false;
  };

  const handleProfilePictureChange = async (
    deletePicture: boolean,
    file: File | null,
  ) => {
    if (file && !isFileValid(file)) {
      triggerToast({
        variant: "error",
        message: "Invalid file type, only PNGs and JPGs are allowed",
      });
      return;
    }

    setIsLoading(true);

    try {
      const metadata = { ...user?.user?.metadata };
      if (!deletePicture && file) {
        const fileName = appendUuidToFileName(file?.name);
        const fileBlob = new Blob([file], { type: file.type });
        const { url: signedUrl } = await getSignedUrl({
          data: { fileName },
        }).unwrap();
        await axios.put(signedUrl, fileBlob);
        metadata.image = fileName;
      } else {
        metadata.image = "";
      }

      const updatedUserProfile = await updateUser({
        data: { metadata },
        headers: { Authorization: `Bearer ${token}` },
      }).unwrap();

      setUserNewDetails(updatedUserProfile);
      triggerToast({
        variant: "success",
        message: `Picture ${
          deletePicture ? "deleted" : "updated"
        } successfully!`,
      });
    } catch (error) {
      triggerToast({
        variant: "error",
        message: "Request failed! Some error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileImage = () => {
    if (isLoadingProfilePicture || isLoading) {
      return (
        <Skeleton
          sx={{
            height: "6.25rem",
            width: "6.25rem",
            transform: "unset",
            borderRadius: "100%",
            position: "relative",
          }}
        />
      );
    }

    if (!profileImageUrl) {
      return <ProfileAvatar100x100Icon />;
    }

    return (
      <Avatar
        alt="profile-picture"
        className="profile-picture"
        src={profileImageUrl}
      />
    );
  };

  return (
    <>
      {profileImageUrl ? (
        <Stack gap="1rem" flexDirection="row" alignItems="center">
          {renderProfileImage()}

          <DeleteIcon
            className="icon"
            id="delete-icon-1"
            style={{ cursor: "pointer" }}
            onClick={() => void handleProfilePictureChange(true, null)}
          />
        </Stack>
      ) : (
        <>
          {isLoading || isLoadingProfilePicture ? (
            <Skeleton variant="circular" width={100} height={100} />
          ) : (
            <MuiBox className="add-profile-picture-container">
              <label id="add-photo-button" style={{ cursor: "pointer" }}>
                <Stack
                  gap="0.75rem"
                  alignItems="center"
                  onClick={handleAddClick}
                >
                  <AddIcon />
                  <Typography
                    color="custom.accentBlack"
                    fontSize="0.75rem"
                    lineHeight={0.8}
                  >
                    Photo
                  </Typography>
                </Stack>
              </label>
              <input
                accept="image/*"
                ref={uploadInputRef}
                id="profile-upload-input"
                type="file"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleProfilePictureChange(false, file);
                }}
              />
            </MuiBox>
          )}
        </>
      )}
    </>
  );
}
