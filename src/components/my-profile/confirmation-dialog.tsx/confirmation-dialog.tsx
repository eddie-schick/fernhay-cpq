import * as React from "react";

import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import CButton from "~/components/common/cbutton/cbutton";
import CircularLoader from "~/components/shared/circular-loader/circular-loader";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

export default function ConfirmationDialog({
  open,
  setOpen,
  handleConfrimActionClick,
  title,
  content,
  confirmButtonText,
  cancelButtonText,
  isLoading,
}: {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  handleConfrimActionClick: () => Promise<void>;
  title: string;
  content: string;
  confirmButtonText: string;
  cancelButtonText?: string;
  isLoading: boolean;
}) {
  // const handleClickOpen = () => {
  //   setOpen(true);
  // };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <ConfirmationDialogStyled
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          <Typography fontSize="1rem" fontWeight={700}>
            {title}
          </Typography>
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Typography fontSize="0.875rem">{content}</Typography>
        </DialogContent>
        <DialogActions>
          <CButton
            sx={(theme) => ({
              padding: "0.625rem 1rem",
              fontWeight: 700,
              border: `1.5px solid ${theme.palette.primary.main}`,
            })}
            id="cancel-modal-button"
            variant="outlined"
            autoFocus
            onClick={handleClose}
          >
            {cancelButtonText ? cancelButtonText : "Cancel"}
          </CButton>
          <CButton
            sx={{
              padding: "0.625rem 1rem",
              minWidth: "5.881rem",
              fontWeight: 700,
            }}
            id="save-modal-button"
            variant="filled"
            autoFocus
            disabled={isLoading}
            onClick={() => {
              void handleConfrimActionClick();
            }}
          >
            {" "}
            {isLoading ? (
              <CircularLoader size={18} color="white" />
            ) : (
              <>{confirmButtonText}</>
            )}
          </CButton>
        </DialogActions>
      </ConfirmationDialogStyled>
    </React.Fragment>
  );
}

const ConfirmationDialogStyled = styled(BootstrapDialog)(({ theme }) => ({
  ".MuiPaper-root": {
    borderRadius: "0.625rem",
    maxWidth: "25rem",
  },
  ".MuiDialogTitle-root": {
    padding: "1rem 1.25rem",
  },
  ".MuiDialogContent-root": {
    padding: "1.25rem",
  },
  ".MuiDialogActions-root": {
    padding: "0.62rem 1.25rem",
  },
  ".form": { maxWidth: "25rem" },
  ".form-label": {
    marginBottom: "0.375rem",
    fontSize: "0.875rem",
    fontWeight: "500",
    color: theme.palette.custom.accentBlack,
  },
  input: {
    padding: "0.62rem",
  },
  fieldset: {
    border: `1px solid ${theme.palette.custom.tertiary} !important`,
  },
}));
