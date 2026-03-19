import { useState } from "react";

import Close from "@mui/icons-material/Close";
import { Button, Modal, Typography, styled } from "@mui/material";

import { muiModalBaseStyles } from "~/global/styles/mui-styles";

import MuiBox from "../mui-box/mui-box";

export default function useErrorModal() {
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );
  const [errorTitle, setErrorTitle] = useState<string | undefined>(undefined);

  const closeModal = () => setShowErrorModal(false);

  const showErrorMessage = (message: string, title?: string) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorModal(true);
  };

  return {
    ErrorModal: (
      <ErrorModal
        isOpen={showErrorModal}
        onClose={closeModal}
        title={errorTitle}
        message={errorMessage}
        cancelText="Go Back"
        onCancel={closeModal}
        shouldApplyMaxHeight={false}
      />
    ),
    showErrorMessage,
  };
}

type ErrorModalProps = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  onCancel?: () => void;
  shouldApplyMaxHeight?: boolean;
};
function ErrorModal(props: ErrorModalProps) {
  const {
    isOpen,
    onClose,
    title = "Error",
    message,
    cancelText = "Cancel",
    onCancel,
    shouldApplyMaxHeight = true,
  } = props;
  return (
    <ErrorModalStyled open={isOpen} onClose={onClose}>
      <MuiBox
        sx={{
          ...muiModalBaseStyles,
          borderRadius: "1rem",
          width: "95vw",
          maxWidth: "47rem",
          ...(shouldApplyMaxHeight && { maxHeight: "20rem" }),
        }}
      >
        <MuiBox component="header" className="modal-header">
          <Typography className="title">{title}</Typography>

          <Close className="close-icon" onClick={onClose} />
        </MuiBox>

        <MuiBox component="main" className="modal-main">
          <Typography className="message">{message}</Typography>
        </MuiBox>

        <MuiBox component="footer" className="modal-footer">
          <MuiBox className="action-buttons-container">
            <Button variant="outlined" onClick={onCancel}>
              {cancelText}
            </Button>
          </MuiBox>
        </MuiBox>
      </MuiBox>
    </ErrorModalStyled>
  );
}

const ErrorModalStyled = styled(Modal)(({ theme }) => ({
  ".modal-header": {
    padding: "1.6rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid #E6E6E6`,
  },

  ".title": {
    fontSize: "1.8rem",
    color: theme.palette.primary.main,
    fontWeight: 600,
  },

  ".close-icon": {
    cursor: "pointer",
    color: theme.palette.custom.greyAccent,
    height: "2rem",
    width: "2rem",
  },

  ".modal-main": {
    padding: "2rem",
  },

  ".message": {
    fontSize: "1.8rem",
    color: theme.palette.primary.main,
    fontWeight: 300,
  },

  ".modal-footer": {
    padding: "1.6rem 2rem",
    display: "flex",
    justifyContent: "flex-end",
    borderTop: `1px solid #E6E6E6`,
  },

  ".action-buttons-container": {
    display: "flex",
    gap: "1rem",

    button: {
      borderRadius: "0.5rem",
      fontSize: "1.6rem",
      padding: "0.6rem 1.6rem",
      textTransform: "unset",
    },
  },
}));
