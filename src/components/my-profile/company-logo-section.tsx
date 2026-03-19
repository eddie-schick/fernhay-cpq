import axios from "axios";
import { useCallback, useContext, useState } from "react";

import { Skeleton, Stack, Typography } from "@mui/material";

import LocalStorageKeys from "~/constants/local-storage-keys";

import { fileNameFormatter } from "~/utils/misc";

import useCompanyLogoData from "~/global/custom-hooks/use-company-logo-data";
import { DeleteIcon } from "~/global/icons";

import {
  useGetSignedUrlMutation,
  useUpdateUserMutation,
} from "~/store/endpoints/auth/auth";

import {
  AuthContextFactory,
  UserSchema,
} from "~/context/auth-context/auth-context";

import MuiBox from "../shared/mui-box/mui-box";
import FileDetails from "../shared/ui/file-dropzone/file-details";
import FileDropzone from "../shared/ui/file-dropzone/file-dropzone";
import useCustomToast from "../shared/use-custom-toast/use-custom-toast";

import { axiosSignedUrlInstance } from "~/lib/axios";

export default function CompanyLogoSection() {
  const { triggerToast } = useCustomToast();

  const { user, token, setUser } = useContext(AuthContextFactory);

  const [fileUploadProgress, setFileUploadProgress] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const { companyLogoImageUrl, isLoadingCompanyLogo } = useCompanyLogoData();

  const abortController = new AbortController();
  const [updateUser, updateUserMutationState] = useUpdateUserMutation();
  const signal = abortController.signal;
  const [getSignedUrl] = useGetSignedUrlMutation();

  const setUserNewDetails = useCallback(
    (newDetails: UserSchema["user"]) => {
      if (!user?.user) return;

      const latestUser = JSON.parse(
        localStorage.getItem(LocalStorageKeys.USER) || "",
      ) as UserSchema;
      const newUser = {
        ...(latestUser || {}),
        user: {
          ...(latestUser?.user || {}),
          metadata: {
            ...(latestUser?.user?.metadata || {}),
            company_logo_url: newDetails?.metadata?.company_logo_url || "",
          },
        },
      };

      console.log("%cnewUser:", "background-color:green;color:white;", newUser);

      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(newUser));

      if (typeof setUser === "function") {
        setUser(newUser as UserSchema);
      }
    },
    [user, setUser],
  );

  const uploadLogo = useCallback(
    async (file: File, fileName: string) => {
      const formattedFileName = fileNameFormatter(fileName); //this was done to avoid unintentional filenames special characters messing with url routes

      try {
        const { url: signedUrl } = await getSignedUrl({
          data: { fileName: formattedFileName },
        }).unwrap();
        await axiosSignedUrlInstance.put(signedUrl, file, {
          headers: {
            "Content-Type": file.type,
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percent = total ? Math.floor((loaded * 100) / total) : 0;
            if (percent < 100) {
              setFileUploadProgress(percent);
            }
          },
          signal,
        });

        setFileUploadProgress(100);
        const updatedUserProfileRes = await updateUser({
          data: {
            metadata: {
              ...user?.user?.metadata,
              company_logo_url: formattedFileName,
            },
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).unwrap();
        setUserNewDetails(updatedUserProfileRes);
        triggerToast({
          variant: "success",
          message: "Logo uploaded successfully",
        });
        setCurrentFile(null);
        return { signed_url: signedUrl };
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Upload request canceled:", error.message);
        } else {
          console.error("Error uploading file:", error);
        }
      }
    },
    [
      getSignedUrl,
      setUserNewDetails,
      signal,
      token,
      triggerToast,
      updateUser,
      user?.user?.metadata,
    ],
  );

  const onDeleteLogoClick = async () => {
    try {
      setIsDeleting(true);

      const updatedUserProfileRes = await updateUser({
        data: {
          metadata: { ...user?.user?.metadata, company_logo_url: null },
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();
      triggerToast({
        variant: "success",
        message: "Logo deleted successfully",
      });
      setUserNewDetails(updatedUserProfileRes);
    } catch (error) {
      triggerToast({
        variant: "error",
        message: "Request failed! Some error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelUpload = () => {
    abortController.abort();
  };

  const renderCompanyLogo = () => {
    if (isLoadingCompanyLogo || isDeleting) {
      return <Skeleton width={96} height={96} variant="rounded" />;
    }

    if (currentFile) {
      if (updateUserMutationState.isLoading) {
        return (
          <FileDetails
            progress={fileUploadProgress}
            currentFile={currentFile}
            handleCancelUpload={handleCancelUpload}
            handleRemoveFile={() => setCurrentFile(null)}
            shouldDisplayLogo={false}
          />
        );
      }

      return <Skeleton width={373} height={127} variant="rounded" />;
    }

    if (!companyLogoImageUrl) {
      return (
        <FileDropzone
          id="logo-file-input"
          uploadFile={uploadLogo}
          allowedFileMimeTypes={["image/png, image/jpeg"]}
          onFileUploaded={(file) => setCurrentFile(file)}
        />
      );
    }

    return (
      <Stack gap="1rem" flexDirection="row" alignItems="center">
        <MuiBox className="company-logo-image-container">
          <img
            src={companyLogoImageUrl}
            alt="company-logo"
            height="100%"
            width="100%"
          />
        </MuiBox>
        <DeleteIcon
          className="icon"
          id="delete-icon"
          style={{ cursor: "pointer" }}
          onClick={() => void onDeleteLogoClick()}
        />
      </Stack>
    );
  };

  return (
    <Stack gap="1.5rem" alignItems="flex-start">
      <Typography color="primary" fontWeight={500}>
        Company Logo
      </Typography>
      {renderCompanyLogo()}
    </Stack>
  );
}
