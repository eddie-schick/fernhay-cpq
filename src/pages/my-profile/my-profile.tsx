import { useContext } from "react";

import { Divider, Stack, styled } from "@mui/material";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

import ActionButtons from "~/components/my-profile/action-buttons";
import CompanyLogoSection from "~/components/my-profile/company-logo-section";
import InfoContainer from "~/components/my-profile/info-container";
import ProfilePictureSection from "~/components/my-profile/profile-picture-section";

export default function MyProfile() {
  const { user } = useContext(AuthContextFactory);

  const { metadata, email = "-", name = "-", phone = "-" } = user?.user || {};

  const personalDetails = {
    dealerName: {
      value: name,
      editable: false,
    },
    dealershipName: {
      value: metadata?.dealership_name || "-",
      editable: true,
    },
    jobTitle: {
      value: metadata?.job_title || "-",
      editable: true,
    },
    emailAddress: {
      value: email,
      editable: false,
    },
  };

  const contactInformation = {
    phoneNumber: {
      value: phone,
      editable: true,
    },
    address: {
      value:
        `${metadata?.dealer_address}${
          metadata?.dealer_city ? `, ${metadata?.dealer_city}` : ""
        }${metadata?.dealer_state ? `, ${metadata?.dealer_state}` : ""}${
          metadata?.dealer_zip_code ? `, ${metadata?.dealer_zip_code}` : ""
        }` || "-",
      editable: true,
    },
    city: {
      value: metadata?.dealer_city || "-",
      editable: false,
    },
    state: {
      value: metadata?.dealer_state || "-",
      editable: false,
    },
    zipCode: {
      value: metadata?.dealer_zip_code || "-",
      editable: false,
    },
  };

  return (
    <MyProfilePageStyled>
      <Stack gap="1.5rem" alignItems="flex-start">
        {/* Profile Picture Section */}
        <ProfilePictureSection />

        {/* Personal and Contact Information */}
        <Stack gap="2rem" width="100%">
          <InfoContainer
            title="Personal Information"
            details={personalDetails}
          />
          <Divider flexItem />
          <InfoContainer
            title="Contact Information"
            details={contactInformation}
          />
          <Divider flexItem />
          <CompanyLogoSection />
        </Stack>
      </Stack>

      {/* Logout and Deactivate Account Buttons */}
      <ActionButtons />
    </MyProfilePageStyled>
  );
}

const MyProfilePageStyled = styled("div")(({ theme }) => ({
  padding: "2.5rem 1.5rem 5rem 1.5rem",
  display: "flex",
  justifyContent: "space-between",
  gap: "2rem",
  flexDirection: "column",
  height: "100%",
  ".info-value-truncate": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "8rem",
  },
  ".info-value-underlined": {
    textDecoration: "underline",
  },
  ".company-logo-image-container": {
    width: "6rem",
    height: "6rem",
    marginLeft: "0.5rem",

    img: {
      objectFit: "cover",
    },
  },
  ".add-profile-picture-container": {
    padding: "1.75rem 2.125rem 1.75rem 2.1875rem",
    alignItems: "center",
    borderRadius: "3.125rem",
    display: "flex",
    gap: "0.75rem",
    flexDirection: "column",
    border: `1px solid ${theme.palette.custom.tertiary}`,
  },
  ".profile-picture": {
    width: "6.25rem",
    height: "6.25rem",
  },
  ".icon": {
    cursor: "pointer",
  },
}));
