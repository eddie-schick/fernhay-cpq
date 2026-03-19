import React, { useContext } from "react";

import { Button, Stack, Typography, styled } from "@mui/material";

import { DeactivateAccountIcon, LogoutIcon } from "~/global/icons";

import { useDeleteUserMutation } from "~/store/endpoints/auth/auth";

import { AuthContextFactory } from "~/context/auth-context/auth-context";

import useCustomToast from "../shared/use-custom-toast/use-custom-toast";

import ConfirmationDialog from "./confirmation-dialog.tsx/confirmation-dialog";

export default function ActionButtons() {
  const { onAuthUsertoLogout, token } = useContext(AuthContextFactory);
  const [deleteUser, deleteUserMutationState] = useDeleteUserMutation();
  const [open, setOpen] = React.useState<boolean>(false);
  const { triggerToast } = useCustomToast();
  const onDeactivateAccountClick = async () => {
    try {
      await deleteUser({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).unwrap();

      triggerToast({
        variant: "success",
        message: "Account deactivated successfully!",
      });

      onAuthUsertoLogout();
    } catch (error) {
      triggerToast({
        variant: "error",
        message: "Request failed! Some error occurred",
      });
    }
  };
  return (
    <>
      <Stack className="button-container" flexDirection="row" gap="1rem">
        <StyledButton id="logout-button" onClick={onAuthUsertoLogout}>
          <LogoutIcon />
          <Typography
            sx={(theme) => ({
              color: theme.palette.custom.accentBlack,
            })}
            className="button-text"
          >
            Logout
          </Typography>
        </StyledButton>
        <StyledButton
          id="deactivate-account-button"
          sx={(theme) => ({
            minWidth: "10.698rem",
            "&:hover": {
              background: `${theme.palette.custom.redHover}`,
            },
          })}
          onClick={() => {
            setOpen(true);
          }}
        >
          <DeactivateAccountIcon />

          <Typography
            sx={(theme) => ({
              color: theme.palette.custom.error_400,
            })}
            className="button-text"
          >
            Deactivate Account
          </Typography>
        </StyledButton>
      </Stack>
      <ConfirmationDialog
        title="Deactivate Account"
        content="Are you sure you want to deactivate your account? You can always
        reactivate your account by logging in again."
        confirmButtonText="Yes, I’m sure."
        open={open}
        setOpen={setOpen}
        handleConfrimActionClick={onDeactivateAccountClick}
        isLoading={deleteUserMutationState.isLoading}
      />
    </>
  );
}

const StyledButton = styled(Button)(({ theme }) => ({
  padding: "0.62rem",
  borderRadius: "0.3125rem",
  border: `1px solid ${theme.palette.custom.gray_300}`,
  display: "flex",
  flexDirection: "row",
  gap: "0.25rem",
  boxShadow: `${theme.palette.custom.boxShadow1}`,
  textTransform: "none",
  ".button-text": {
    fontWeight: 700,
    fontSize: "0.875rem",
  },
}));
